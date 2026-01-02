import { Command } from "commander";
import chalk from "chalk";
import fs from "fs-extra";
import path from "node:path";
import Handlebars from "handlebars";
import { loadYamlFile } from "../lib/yaml.js";
import { renderTemplate } from "../lib/render.js";
import { mergeGeneratedBlock } from "../lib/merge.js";
import { findRepoRoot } from "../lib/repoRoot.js";

export const generateCommand = new Command("generate")
  .description("Generate docs from templates and company state")
  .option("--state <path>", "Path to company.yaml", "businessops/state/company.yaml")
  .option("--templates <path>", "Templates folder", "businessops/templates/docs")
  .option("--out <path>", "Docs output folder", "businessops/docs")
  .option("--force", "Overwrite entire files (ignores generated block merge)", false)
  .action(async (opts) => {
    const root = findRepoRoot();
    const statePath = path.join(root, opts.state);
    const templatesRoot = path.join(root, opts.templates);
    const outRoot = path.join(root, opts.out);

    console.log(chalk.cyan("Loading state:"), statePath);
    const state = await loadYamlFile(statePath);

    const langPref = state?.meta?.language_preference ?? "BILINGUAL";
    const langs =
      langPref === "BILINGUAL" ? ["en", "pt-br"] : [langPref.toLowerCase()];

    // Ensure country default based on country_mode
    if (!state?.company?.identity) state.company = { identity: {} };
    if (!state.company.identity.country) {
      state.company.identity.country = state.meta?.country_mode === "BR" ? "Brazil" : "Global";
    }

    Handlebars.registerHelper("json", (context) => JSON.stringify(context, null, 2));

    console.log(chalk.cyan("Generating docs for languages:"), langs.join(", "));

    for (const lang of langs) {
      const templateDir = path.join(templatesRoot, lang);
      const outDir = path.join(outRoot, lang);

      await fs.ensureDir(outDir);

      if (!(await fs.pathExists(templateDir))) {
        console.log(chalk.yellow("Template folder missing:"), templateDir);
        continue;
      }

      const files = (await fs.readdir(templateDir)).filter((f) => f.endsWith(".hbs"));

      for (const file of files) {
        const templatePath = path.join(templateDir, file);
        const outFile = file.replace(/\.hbs$/, "");
        const outPath = path.join(outDir, outFile);

        const templateContent = await fs.readFile(templatePath, "utf8");
        const rendered = renderTemplate(templateContent, state);

        if (opts.force || !(await fs.pathExists(outPath))) {
          await fs.writeFile(outPath, rendered, "utf8");
          console.log(chalk.green("Wrote:"), path.relative(root, outPath));
        } else {
          const current = await fs.readFile(outPath, "utf8");
          const merged = mergeGeneratedBlock(current, rendered);
          await fs.writeFile(outPath, merged, "utf8");
          console.log(chalk.green("Updated (generated block):"), path.relative(root, outPath));
        }
      }
    }

    // Optional: ensure diagrams folder exists
    const diagramsDir = path.join(root, "businessops/diagrams");
    await fs.ensureDir(diagramsDir);

    console.log(chalk.green("\nGeneration complete."));
    console.log(chalk.gray("Docs at:"), path.relative(root, outRoot));
  });

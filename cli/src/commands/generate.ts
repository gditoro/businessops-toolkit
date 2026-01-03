import { Command } from "commander";
import chalk from "chalk";
import fs from "fs-extra";
import path from "node:path";
import { findRepoRoot } from "../lib/repoRoot.js";
import { readYaml } from "../lib/yaml.js";

function fillGeneratedBlock(template: string, generated: string) {
  const begin = "<!-- BO:BEGIN GENERATED -->";
  const end = "<!-- BO:END GENERATED -->";

  if (template.includes(begin) && template.includes(end)) {
    const before = template.split(begin)[0] + begin;
    const after = end + template.split(end)[1];
    return `${before}\n${generated}\n${after}`;
  }

  // If markers missing, append safely
  return `${template}\n\n${begin}\n${generated}\n${end}\n`;
}

function makeOverview(lang: "en" | "pt-br", company: any) {
  const name = company?.company?.identity?.name || "Company";
  const one = company?.company?.identity?.one_liner || "";
  const pack = (company?.meta?.packs || []).join(", ");
  const mode = company?.meta?.country_mode || "BR";
  const stage = company?.company?.identity?.stage || "EARLY";

  if (lang === "en") {
    return `## ${name}

**One-liner:** ${one}

**Mode:** ${mode}
**Pack(s):** ${pack}
**Stage:** ${stage}

### Next recommended steps
- Run /structure in Copilot or use the VS Code Wizard
- Define ICP and customer pains
- Set 90-day goals and KPIs
`;
  }

  return `## ${name}

**Resumo:** ${one}

**Modo:** ${mode}
**Pack(s):** ${pack}
**Estágio:** ${stage}

### Próximos passos recomendados
- Rodar /structure no Copilot ou usar o Wizard do VS Code
- Definir ICP e dores do cliente
- Definir metas e KPIs de 90 dias
`;
}

export const generateCommand = new Command("generate")
  .description("Generate docs from templates + company.yaml (deterministic)")
  .action(async () => {
    const root = findRepoRoot();

    const companyPath = path.join(root, "businessops", "state", "company.yaml");
    const company = await readYaml<any>(companyPath);

    if (!company) {
      console.log(chalk.red("Missing company.yaml. Run init first:"));
      console.log(chalk.yellow("  npm run dev --prefix cli -- init"));
      process.exit(1);
    }

    const languagePref = company?.meta?.language_preference || "BILINGUAL";

    const templateBase = path.join(root, "businessops", "templates", "docs");
    const outBase = path.join(root, "businessops", "docs");

    const langs: Array<"en" | "pt-br"> =
      languagePref === "EN" ? ["en"] : languagePref === "PT-BR" ? ["pt-br"] : ["en", "pt-br"];

    for (const lang of langs) {
      const tplDir = path.join(templateBase, lang);
      const outDir = path.join(outBase, lang);

      await fs.ensureDir(outDir);

      // copy templates first (if they exist)
      if (await fs.pathExists(tplDir)) {
        await fs.copy(tplDir, outDir, { overwrite: true });
      }

      // ensure overview exists
      const overviewPath = path.join(outDir, "overview.md");
      const overviewTplExists = await fs.pathExists(overviewPath);

      const overviewTpl = overviewTplExists ? await fs.readFile(overviewPath, "utf8") : `# Overview\n\n<!-- BO:BEGIN GENERATED -->\n<!-- BO:END GENERATED -->\n`;
      const generated = makeOverview(lang, company);

      const next = fillGeneratedBlock(overviewTpl, generated);
      await fs.writeFile(overviewPath, next, "utf8");

      console.log(chalk.green("Generated:"), path.relative(root, overviewPath));
    }

    console.log(chalk.green("\nDocs generated ✅"));
    console.log(chalk.gray("Output folder:"), chalk.yellow("businessops/docs/"));
  });

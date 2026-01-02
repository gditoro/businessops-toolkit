import { Command } from "commander";
import chalk from "chalk";
import fs from "fs-extra";
import path from "node:path";
import prompts from "prompts";
import YAML from "yaml";

import { findRepoRoot } from "../lib/repoRoot.js";
import { loadWorkflow, shouldRunSection, WorkflowQuestion } from "../lib/workflow.js";
import { compileCompanyFromAnswers } from "../lib/compile.js";
import { generateDocs } from "./wizardGenerate.js";

export const wizardCommand = new Command("wizard")
  .description("Run the BusinessOps guided wizard and generate docs")
  .option("--workflow <path>", "Path to wizard workflow", "businessops/workflows/wizard.yaml")
  .option("--answers <path>", "Path to save raw wizard answers", "businessops/state/answers.yaml")
  .option("--state <path>", "Path to save compiled company state", "businessops/state/company.yaml")
  .option("--non-interactive", "Run without prompts using existing answers.yaml", false)
  .action(async (opts) => {
    const root = findRepoRoot();
    const workflowPath = path.join(root, opts.workflow);
    const answersPath = path.join(root, opts.answers);
    const statePath = path.join(root, opts.state);

    console.log(chalk.cyan("Loading workflow:"), path.relative(root, workflowPath));
    const wf = await loadWorkflow(workflowPath);

    let answers: any = {};

    // Non-interactive mode: load answers if exists
    if (opts.nonInteractive) {
      if (!(await fs.pathExists(answersPath))) {
        throw new Error(`Non-interactive mode requires answers file at ${answersPath}`);
      }
      answers = YAML.parse(await fs.readFile(answersPath, "utf8"))?.answers ?? {};
      console.log(chalk.gray("Loaded existing answers from:"), path.relative(root, answersPath));
    } else {
      console.log(chalk.green("\nBusinessOps Wizard (Robust)\n"));
      console.log(chalk.gray("Tip: You can press Ctrl+C to exit at any time.\n"));

      for (const section of wf.sections) {
        if (!shouldRunSection(section, answers)) continue;

        const title = section.title?.["en"] ?? section.id;
        console.log(chalk.yellow(`\n== ${title} ==\n`));

        for (const q of section.questions) {
          const result = await askQuestion(q, answers, wf.defaults?.language ?? "bilingual");
          if (result !== undefined) {
            answers[q.id] = result;
          }
        }

        // Save progress after each section (resumable)
        await saveAnswers(root, answersPath, wf, answers);
        console.log(chalk.gray("Saved progress to:"), path.relative(root, answersPath));
      }
    }

    // Compile answers → company.yaml
    console.log(chalk.cyan("\nCompiling company state..."));
    const compiled = compileCompanyFromAnswers(answers);

    await fs.ensureDir(path.dirname(statePath));
    await fs.writeFile(statePath, YAML.stringify(compiled), "utf8");
    console.log(chalk.green("Wrote:"), path.relative(root, statePath));

    // Generate docs
    console.log(chalk.cyan("\nGenerating docs..."));
    await generateDocs(root, statePath);
    console.log(chalk.green("Wizard complete ✅"));
  });

async function askQuestion(q: WorkflowQuestion, answers: any, language: string) {
  const lang = language === "bilingual" ? "pt-br" : language; // prefer PT-BR prompts for bilingual
  const message = q.prompt?.[lang] ?? q.prompt?.["en"] ?? q.id;

  // Skip if already answered (resume behavior)
  if (answers[q.id] !== undefined && answers[q.id] !== "") {
    return answers[q.id];
  }

  if (q.type === "text") {
    const res = await prompts({
      type: "text",
      name: "value",
      message,
      validate: (v: string) => (q.required && !v ? "Required" : true)
    });
    return res.value;
  }

  if (q.type === "confirm") {
    const res = await prompts({
      type: "confirm",
      name: "value",
      message,
      initial: true
    });
    return res.value;
  }

  if (q.type === "single_choice") {
    const choices =
      q.options?.map((o) => ({
        title: o.label?.[lang] ?? o.label?.["en"] ?? o.value,
        value: o.value
      })) ?? [];

    const res = await prompts({
      type: "select",
      name: "value",
      message,
      choices
    });

    if (res.value === undefined && q.required) return await askQuestion(q, answers, language);
    return res.value;
  }

  if (q.type === "multi_choice") {
    const choices =
      q.options?.map((o) => ({
        title: o.label?.[lang] ?? o.label?.["en"] ?? o.value,
        value: o.value
      })) ?? [];

    const res = await prompts({
      type: "multiselect",
      name: "value",
      message,
      choices,
      min: q.required ? 1 : 0
    });

    return res.value ?? [];
  }

  throw new Error(`Unsupported question type: ${q.type}`);
}

async function saveAnswers(root: string, answersPath: string, wf: any, answers: any) {
  const payload = {
    wizard: {
      workflow_id: wf.workflow_id,
      version: wf.version,
      mode: wf.defaults?.mode ?? "robust"
    },
    answers
  };

  await fs.ensureDir(path.dirname(answersPath));
  await fs.writeFile(answersPath, YAML.stringify(payload), "utf8");
}

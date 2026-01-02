import { Command } from "commander";
import chalk from "chalk";
import fs from "fs-extra";
import path from "node:path";

import { findRepoRoot } from "../lib/repoRoot.js";

const DEFAULT_DIRS = [
  ".github",
  ".vscode",

  // Main toolkit folders
  "businessops/workflows",
  "businessops/state",
  "businessops/templates/docs/en",
  "businessops/templates/docs/pt-br",
  "businessops/templates/commands",
  "businessops/packs/industry-neutral",
  "businessops/packs/health-import",
  "businessops/reports",
  "businessops/diagrams",

  // Copilot command folder (Spec Kit style)
  ".copilot/commands"
];

const DEFAULT_FILES: Array<{
  rel: string;
  content: string;
  force?: boolean;
}> = [
  {
    rel: "businessops/state/schema-version.yaml",
    content: "schema_version: 0.1\n"
  },
  {
    rel: "businessops/state/company.yaml",
    content: `company:
  lifecycle_mode: NEW

  identity:
    name: ""
    country: "Brazil"
    one_liner: ""
    stage: EARLY
    headcount_range: SMALL
    company_age: ""

  market:
    customer_type: ["B2B"]
    icp: ""
    customer_pains: ""
    positioning: ""
    acquisition_channels: ["OUTBOUND_SALES"]

  revenue:
    model: TRANSACTIONAL

  pricing:
    model: NEGOTIATED
    discounting: UNKNOWN

  ops:
    delivery_type: INVENTORY
    complexity: MEDIUM
    outsourcing_level: SOME
    bottleneck: ""
    outsourced_services: ["ACCOUNTING"]

  processes:
    order_to_cash_steps: ["LEAD", "QUOTE", "ORDER", "INVOICE", "DELIVERY", "COLLECTION", "SUPPORT"]

  finance:
    payment_terms: ""
    revenue_range: ""
    gross_margin_range: ""

  reporting:
    kpis_tracked_today: ""

  compliance:
    regulated: UNKNOWN

  risks:
    top: ""

  goals:
    days_90: ""
    days_180: ""
    days_365: ""

meta:
  country_mode: BR
  language_preference: BILINGUAL
  packs: ["industry-neutral"]
`
  },
  {
    rel: "businessops/state/answers.yaml",
    content: `wizard:
  workflow_id: businessops_wizard
  version: 0.1
  mode: robust

answers: {}
`
  },
  {
    rel: "businessops/AGENTS.md",
    content: `# BusinessOps Toolkit — Agent System (AGENTS.md)

You are operating inside a BusinessOps Toolkit repository.
Your mission is to help a founder build and maintain a Business Operating System for a company.

Canonical outputs:
- businessops/state/company.yaml
- businessops/state/answers.yaml
- businessops/docs/en/*.md
- businessops/docs/pt-br/*.md

This repo uses a Spec Kit–style command system:
- .copilot/commands/

If the user types /intake, load .copilot/commands/intake.md and follow it strictly.

Key rules:
1) Be practical. Avoid theory. Always produce actionable outputs.
2) If info is missing: use [ASSUMPTION] and continue; add “Questions to refine”.
3) Separate ESSENTIAL vs RECOMMENDED.
4) Don’t invent legal claims; mark as [VERIFY] when needed.
5) Friendly PT-BR by default when BILINGUAL.
6) Ask max 3 clarification questions at a time.
7) Update repo files; don’t keep important outputs only in chat.

Generated content must stay inside markers:
<!-- BO:BEGIN GENERATED -->
<!-- BO:END GENERATED -->
`
  }
];

async function writeFileIfMissing(
  absPath: string,
  content: string,
  force: boolean
) {
  const exists = await fs.pathExists(absPath);
  if (!exists || force) {
    await fs.ensureDir(path.dirname(absPath));
    await fs.writeFile(absPath, content, "utf8");
    return true;
  }
  return false;
}

async function copyCommandTemplatesToCopilot(
  repoRoot: string,
  force: boolean
) {
  const templatesDir = path.join(repoRoot, "businessops/templates/commands");
  const outDir = path.join(repoRoot, ".copilot/commands");

  await fs.ensureDir(outDir);

  if (!(await fs.pathExists(templatesDir))) {
    console.log(
      chalk.yellow("Command templates not found at:"),
      path.relative(repoRoot, templatesDir)
    );
    console.log(
      chalk.gray("Tip: add command templates in businessops/templates/commands/")
    );
    return;
  }

  // Copy all markdown files (overwrite controlled by force)
  await fs.copy(templatesDir, outDir, { overwrite: force, errorOnExist: false });

  console.log(
    chalk.green("Copied command prompts to:"),
    path.relative(repoRoot, outDir)
  );
}

export const initCommand = new Command("init")
  .description(
    "Initialize BusinessOps Toolkit folder structure + Copilot command prompts"
  )
  .option("--force", "Overwrite existing files if needed", false)
  .action(async (opts) => {
    const repoRoot = findRepoRoot();
    console.log(chalk.cyan("Initializing BusinessOps Toolkit in:"));
    console.log(chalk.gray(repoRoot));

    // Ensure base dirs
    for (const dir of DEFAULT_DIRS) {
      await fs.ensureDir(path.join(repoRoot, dir));
    }

    // Write default files if missing
    for (const f of DEFAULT_FILES) {
      const absPath = path.join(repoRoot, f.rel);
      const wrote = await writeFileIfMissing(absPath, f.content, opts.force);
      if (wrote) {
        console.log(chalk.green("Created:"), f.rel);
      }
    }

    // Copy Spec Kit–style command prompts to .copilot/commands
    await copyCommandTemplatesToCopilot(repoRoot, opts.force);

    console.log(chalk.green("\nDone ✅"));

    console.log(chalk.cyan("\nRecommended next step (AI-first):"));
    console.log(
      chalk.gray(
        "Open GitHub Copilot Chat in VS Code and run the command below:"
      )
    );
    console.log(chalk.yellow("\n  /intake\n"));
    console.log(
      chalk.gray(
        "This will guide you through a wizard with AI suggestions and will update:"
      )
    );
    console.log(chalk.gray("  - businessops/state/answers.yaml"));
    console.log(chalk.gray("  - businessops/state/company.yaml"));
    console.log(chalk.gray("  - businessops/docs/... (generated)"));

    console.log(chalk.cyan("\nCLI workflow (optional):"));
    console.log(chalk.gray("  businessops generate"));
    console.log(chalk.gray("  businessops wizard --terminal"));
  });

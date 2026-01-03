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
  "businessops/commands",
  "businessops/templates/docs/en",
  "businessops/templates/docs/pt-br",
  "businessops/packs/industry-neutral",
  "businessops/packs/health-import",
  "businessops/reports",
  "businessops/diagrams"
];

const DEFAULT_FILES: Array<{
  rel: string;
  content: string;
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
- businessops/commands/

If the user types /intake, load \`businessops/commands/intake.md\` and follow it strictly.
If the user types \`@businessops /intake\`, treat as \`/intake\`.

Key rules:
1) Be practical. Avoid theory. Always produce actionable outputs.
2) If info is missing: use [ASSUMPTION] and continue; add “Questions to refine”.
3) Separate ESSENTIAL vs RECOMMENDED.
4) Don’t invent legal claims; mark as [VERIFY] when needed.
5) Friendly PT-BR by default when BILINGUAL.
6) Ask max 3 clarification questions at a time.
7) Update repo files; don’t keep important outputs only in chat.

## Safe Mode (Copilot Chat Wizard) — DEFAULT & REQUIRED

Por padrão, no Copilot Chat Wizard:
- pergunte 1 pergunta por vez
- ofereça opções curtas com valores exatos (para virar botões quando possível)
- aceite resposta por texto como fallback
- valide resposta antes de avançar
- salve checkpoint (answers.yaml) após cada resposta

## Generate Policy (Policy A)
Antes de rodar /generate automaticamente, sempre peça permissão (YES/NO),
a menos que o usuário tenha pedido explicitamente.

Generated content must stay inside markers:
<!-- BO:BEGIN GENERATED -->
<!-- BO:END GENERATED -->
`
  }
];

async function writeFileIfMissing(absPath: string, content: string, force: boolean) {
  const exists = await fs.pathExists(absPath);
  if (!exists || force) {
    await fs.ensureDir(path.dirname(absPath));
    await fs.writeFile(absPath, content, "utf8");
    return true;
  }
  return false;
}

export const initCommand = new Command("init")
  .description("Initialize BusinessOps Toolkit folder structure + default state files")
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

    console.log(chalk.green("\nDone ✅"));

    console.log(chalk.cyan("\nRecommended next step (AI-first):"));
    console.log(chalk.gray("Open GitHub Copilot Chat in VS Code and run:"));
    console.log(chalk.yellow("\n  @businessops /intake\n"));

    console.log(chalk.gray("Command files are located at:"));
    console.log(chalk.yellow("  businessops/commands/\n"));

    console.log(chalk.cyan("CLI workflow (optional):"));
    console.log(chalk.gray("  businessops generate"));
    console.log(chalk.gray("  businessops wizard --terminal"));
  });

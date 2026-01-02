import { Command } from "commander";
import chalk from "chalk";
import fs from "fs-extra";
import path from "node:path";

const DEFAULT_DIRS = [
  ".github",
  ".vscode",
  "businessops/workflows",
  "businessops/state",
  "businessops/templates/docs/en",
  "businessops/templates/docs/pt-br",
  "businessops/packs/industry-neutral",
  "businessops/packs/health-import",
  "businessops/reports",
  "businessops/diagrams"
];

export const initCommand = new Command("init")
  .description("Initialize BusinessOps Toolkit folder structure")
  .option("--force", "Overwrite existing files if needed", false)
  .action(async (opts) => {
    const root = process.cwd();
    console.log(chalk.cyan("Initializing BusinessOps Toolkit in:"), root);

    for (const dir of DEFAULT_DIRS) {
      await fs.ensureDir(path.join(root, dir));
    }

    const schemaVersionPath = path.join(root, "businessops/state/schema-version.yaml");
    if (!(await fs.pathExists(schemaVersionPath)) || opts.force) {
      await fs.writeFile(schemaVersionPath, "schema_version: 0.1\n", "utf8");
      console.log(chalk.green("Created:"), "businessops/state/schema-version.yaml");
    }

    const companyPath = path.join(root, "businessops/state/company.yaml");
    if (!(await fs.pathExists(companyPath)) || opts.force) {
      await fs.writeFile(
        companyPath,
        `company:
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
    discounting: YES
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
`,
        "utf8"
      );
      console.log(chalk.green("Created:"), "businessops/state/company.yaml");
    }

    console.log(chalk.green("\nDone."));
    console.log(
      chalk.gray("Next steps:\n  1) edit businessops/state/company.yaml\n  2) run: businessops generate")
    );
  });

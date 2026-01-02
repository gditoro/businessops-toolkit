#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { generateCommand } from "./commands/generate.js";
import { initCommand } from "./commands/init.js";

const program = new Command();

program
  .name("businessops")
  .description("BusinessOps Toolkit CLI — wizard + doc generation for founders")
  .version("0.1.0");

program.addCommand(initCommand);
program.addCommand(generateCommand);

program.addHelpText(
  "after",
  `
Examples:
  businessops init
  businessops generate --state businessops/state/company.yaml
`
);

program.parseAsync(process.argv).catch((err) => {
  console.error(chalk.red("Error:"), err?.message ?? err);
  process.exit(1);
});

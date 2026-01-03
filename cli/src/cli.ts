#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";

import { initCommand } from "./commands/init.js";
import { generateCommand } from "./commands/generate.js";

const program = new Command();

program
  .name("businessops")
  .description("BusinessOps Toolkit CLI — init + generate deterministic docs")
  .version("0.1.0");

program.addCommand(initCommand);
program.addCommand(generateCommand);

program.on("command:*", () => {
  console.error(chalk.red("Unknown command:"), program.args.join(" "));
  program.help();
  process.exit(1);
});

program.parse(process.argv);

import * as vscode from "vscode";
import { runGenerate } from "../cli/runner";

export function registerRunGenerateCommand(context: vscode.ExtensionContext) {
  const cmd = vscode.commands.registerCommand("businessops.runGenerate", async () => {
    await runGenerate();
  });

  context.subscriptions.push(cmd);
}

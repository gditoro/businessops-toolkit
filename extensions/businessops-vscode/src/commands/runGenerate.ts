import * as vscode from "vscode";
import * as path from "path";
import { getRepoRoot } from "../state/paths";

const TERMINAL_NAME = "BusinessOps Generate";

async function runGenerateInTerminal() {
  const repoRoot = await getRepoRoot();
  const cliDir = path.join(repoRoot, "cli");

  // reuse terminal if exists
  let terminal = vscode.window.terminals.find(t => t.name === TERMINAL_NAME);
  if (!terminal) {
    terminal = vscode.window.createTerminal(TERMINAL_NAME);
  }

  terminal.show(true);

  // Run from cli folder
  terminal.sendText(`cd "${cliDir}"`);
  terminal.sendText(`npm run dev -- generate`);
}

export function registerRunGenerateCommand(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand("businessops.generateDocs", async () => {
    try {
      await runGenerateInTerminal();
      vscode.window.showInformationMessage("BusinessOps: geração de docs iniciada ✅");
    } catch (err: any) {
      vscode.window.showErrorMessage(`BusinessOps: falha ao gerar docs: ${err?.message || String(err)}`);
      console.error("[businessops] generateDocs error:", err);
    }
  });

  context.subscriptions.push(disposable);
}

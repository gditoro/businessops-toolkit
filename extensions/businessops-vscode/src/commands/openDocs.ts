import * as vscode from "vscode";
import { getRepoRoot } from "../state/paths";
import * as path from "node:path";

export function registerOpenDocsCommand(context: vscode.ExtensionContext) {
  const cmd = vscode.commands.registerCommand("businessops.openDocs", async () => {
    const root = await getRepoRoot();
    const docsPath = path.join(root, "businessops", "docs");
    const uri = vscode.Uri.file(docsPath);
    await vscode.commands.executeCommand("revealFileInOS", uri);
  });

  context.subscriptions.push(cmd);
}

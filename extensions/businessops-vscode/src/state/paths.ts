import * as vscode from "vscode";
import * as path from "node:path";
import * as fs from "node:fs/promises";

export async function getRepoRoot(): Promise<string> {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) {
    throw new Error("No workspace folder open.");
  }

  // pick first folder
  const root = folders[0].uri.fsPath;

  // sanity: ensure businessops folder exists
  const candidate = path.join(root, "businessops");
  try {
    await fs.stat(candidate);
    return root;
  } catch {
    // still return root; repo may not be initialized yet
    return root;
  }
}

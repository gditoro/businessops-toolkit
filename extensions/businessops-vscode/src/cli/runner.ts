import * as vscode from "vscode";
import * as path from "node:path";
import { getRepoRoot } from "../state/paths";
import { spawn } from "node:child_process";

export async function runGenerate() {
  const root = await getRepoRoot();

  const term = vscode.window.createTerminal({
    name: "BusinessOps Generate",
    cwd: root
  });

  term.show(true);

  // deterministic: always call the repo CLI
  term.sendText("npm run dev --prefix cli -- generate");

  vscode.window.showInformationMessage("Running BusinessOps generate… (see terminal logs)");
}

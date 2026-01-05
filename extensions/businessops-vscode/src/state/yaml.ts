import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as yaml from "js-yaml";
import * as vscode from "vscode";

const outputChannel = vscode.window.createOutputChannel("BusinessOps");

export async function readYaml<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return yaml.load(raw) as T;
  } catch (err: any) {
    // Log error but don't fail - file may not exist yet
    if (err?.code !== "ENOENT") {
      outputChannel.appendLine(`[WARN] Failed to read YAML: ${filePath}`);
      outputChannel.appendLine(`  Error: ${err?.message || String(err)}`);
    }
    return null;
  }
}

export async function writeYaml(filePath: string, data: any): Promise<void> {
  try {
    const raw = yaml.dump(data, { noRefs: true, lineWidth: 120 });

    // ✅ Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });

    await fs.writeFile(filePath, raw, "utf8");
  } catch (err: any) {
    outputChannel.appendLine(`[ERROR] Failed to write YAML: ${filePath}`);
    outputChannel.appendLine(`  Error: ${err?.message || String(err)}`);
    vscode.window.showErrorMessage(`BusinessOps: Failed to save ${path.basename(filePath)}: ${err?.message}`);
    throw err;
  }
}

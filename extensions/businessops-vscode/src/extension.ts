import * as vscode from "vscode";
import { registerOpenWizardCommand } from "./commands/openWizard";
import { registerRunGenerateCommand } from "./commands/runGenerate";
import { registerOpenDocsCommand } from "./commands/openDocs";

export function activate(context: vscode.ExtensionContext) {
  registerOpenWizardCommand(context);
  registerRunGenerateCommand(context);
  registerOpenDocsCommand(context);

  vscode.window.showInformationMessage("BusinessOps Toolkit extension activated ✅");
}

export function deactivate() {}

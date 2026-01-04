import * as vscode from "vscode";
import { registerOpenWizardCommand } from "./commands/openWizard";
import { registerRunGenerateCommand } from "./commands/runGenerate";
import { registerOpenDocsCommand } from "./commands/openDocs";
import { registerBusinessOpsChat } from "./chat/participant";

export function activate(context: vscode.ExtensionContext) {
  registerBusinessOpsChat(context);
  registerOpenWizardCommand(context);
  registerRunGenerateCommand(context);
  registerOpenDocsCommand(context);

  vscode.window.showInformationMessage("BusinessOps Toolkit extension activated ✅");
}

export function deactivate() {}

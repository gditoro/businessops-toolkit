import * as vscode from "vscode";
import { WizardPanel } from "../wizard/WizardPanel";

export function registerOpenWizardCommand(context: vscode.ExtensionContext) {
  const cmd = vscode.commands.registerCommand("businessops.openWizard", () => {
    WizardPanel.open(context.extensionUri);
  });

  context.subscriptions.push(cmd);
}

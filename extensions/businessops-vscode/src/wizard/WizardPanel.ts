import * as vscode from "vscode";
import * as path from "node:path";
import { getRepoRoot } from "../state/paths";
import { readYaml, writeYaml } from "../state/yaml";
import { resolveWizardLanguage } from "./i18n";
import { STEPS } from "./steps";
import { WizardState } from "./schema";

export class WizardPanel {
  private static panel: vscode.WebviewPanel | undefined;

  static async open(extensionUri: vscode.Uri) {
    if (WizardPanel.panel) {
      WizardPanel.panel.reveal();
      return;
    }

    WizardPanel.panel = vscode.window.createWebviewPanel(
      "businessopsWizard",
      "BusinessOps Wizard (Intake)",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, "media")]
      }
    );

    WizardPanel.panel.onDidDispose(() => {
      WizardPanel.panel = undefined;
    });

    const root = await getRepoRoot();
    const answersPath = path.join(root, "businessops", "state", "answers.yaml");
    const companyPath = path.join(root, "businessops", "state", "company.yaml");

    // Load current meta.language_preference
    const company = await readYaml<any>(companyPath);
    const pref = company?.meta?.language_preference as any;
    const lang = resolveWizardLanguage(pref);

    // Load wizard state (answers)
    const answers = await readYaml<any>(answersPath);
    const existingAnswers = (answers?.answers ?? {}) as Record<string, any>;

    const initialState: WizardState = {
      answers: existingAnswers
    };

    WizardPanel.panel.webview.html = this.renderHtml(extensionUri, lang, initialState);

    WizardPanel.panel.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === "save") {
        const newState: WizardState = msg.state;

        // Write answers.yaml
        const nextAnswersYaml = {
          wizard: {
            workflow_id: "businessops_wizard",
            version: 0.1,
            mode: "robust"
          },
          answers: newState.answers
        };

        await writeYaml(answersPath, nextAnswersYaml);

        // Also update company.yaml minimal fields
        const nextCompany = company ?? { company: {}, meta: {} };

        nextCompany.company = nextCompany.company ?? {};
        nextCompany.company.lifecycle_mode = newState.answers.lifecycle_mode ?? nextCompany.company.lifecycle_mode;

        nextCompany.company.identity = nextCompany.company.identity ?? {};
        nextCompany.company.identity.name = newState.answers.company_name ?? nextCompany.company.identity.name;
        nextCompany.company.identity.one_liner = newState.answers.one_liner ?? nextCompany.company.identity.one_liner;
        nextCompany.company.identity.stage = newState.answers.stage ?? nextCompany.company.identity.stage;
        nextCompany.company.identity.headcount_range =
          newState.answers.headcount_range ?? nextCompany.company.identity.headcount_range;

        nextCompany.meta = nextCompany.meta ?? {};
        nextCompany.meta.country_mode = newState.answers.country_mode ?? nextCompany.meta.country_mode;
        nextCompany.meta.language_preference = newState.answers.language_preference ?? nextCompany.meta.language_preference;
        nextCompany.meta.packs = [newState.answers.industry_pack ?? "industry-neutral"].filter(Boolean);

        await writeYaml(companyPath, nextCompany);

        vscode.window.showInformationMessage("BusinessOps Wizard: state saved ✅");
      }

      if (msg.type === "generate") {
        // Open terminal and run CLI generate
        await vscode.commands.executeCommand("businessops.runGenerate");
      }
    });
  }

  private static renderHtml(extensionUri: vscode.Uri, lang: string, initialState: WizardState): string {
    const webview = WizardPanel.panel!.webview;

    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "media", "wizard.js"));
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "media", "wizard.css"));

    const stepsJson = JSON.stringify(STEPS);
    const stateJson = JSON.stringify(initialState);
    const langJson = JSON.stringify(lang);

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="${styleUri}">
  <title>BusinessOps Wizard</title>
</head>
<body>
  <div id="app"></div>

  <script>
    window.BO_STEPS = ${stepsJson};
    window.BO_STATE = ${stateJson};
    window.BO_LANG = ${langJson};
  </script>

  <script src="${scriptUri}"></script>
</body>
</html>`;
  }
}

import * as vscode from "vscode";
import { md, Lang, ensureWizard, saveWizardOnly, isCoreIntakeComplete, isDeepIntakeComplete } from "./helpers";
import { refreshWizardQueue, refreshWizardQueueAdvanced } from "./orchestrator";

// -----------------------------
// Stage Definitions
// -----------------------------

export interface StageOption {
  id: string;
  emoji: string;
  label: Record<string, string>;
  description: Record<string, string>;
}

export const STAGES: StageOption[] = [
  {
    id: "CORE_INTAKE",
    emoji: "📋",
    label: { "pt-br": "Intake Básico", "en": "Basic Intake" },
    description: { "pt-br": "Perguntas essenciais", "en": "Essential questions" }
  },
  {
    id: "DEEP_INTAKE",
    emoji: "🔬",
    label: { "pt-br": "Intake Avançado", "en": "Advanced Intake" },
    description: { "pt-br": "Perguntas detalhadas", "en": "Detailed questions" }
  },
  {
    id: "SPECIALIST",
    emoji: "👨‍💼",
    label: { "pt-br": "Especialista", "en": "Specialist" },
    description: { "pt-br": "Consultar especialista", "en": "Consult specialist" }
  }
];

export const SPECIALISTS: StageOption[] = [
  {
    id: "finance",
    emoji: "💰",
    label: { "pt-br": "Finanças", "en": "Finance" },
    description: { "pt-br": "Questões financeiras", "en": "Financial matters" }
  },
  {
    id: "legal",
    emoji: "⚖️",
    label: { "pt-br": "Jurídico", "en": "Legal" },
    description: { "pt-br": "Questões legais", "en": "Legal matters" }
  },
  {
    id: "compliance",
    emoji: "📜",
    label: { "pt-br": "Compliance", "en": "Compliance" },
    description: { "pt-br": "Regulamentação", "en": "Regulations" }
  },
  {
    id: "ops",
    emoji: "⚙️",
    label: { "pt-br": "Operações", "en": "Operations" },
    description: { "pt-br": "Processos operacionais", "en": "Operational processes" }
  }
];

// -----------------------------
// Stage Selector
// -----------------------------

export function showStageSelector(
  stream: any,
  lang: Lang,
  answers: any,
  company: any
) {
  const coreComplete = isCoreIntakeComplete(answers, company);
  const deepComplete = isDeepIntakeComplete(answers, company);

  if (lang === "pt-br") {
    md(stream, `## 🎯 Escolha uma etapa\n\n`);

    for (const stage of STAGES) {
      const status = stage.id === "CORE_INTAKE" && coreComplete ? " ✅"
                   : stage.id === "DEEP_INTAKE" && deepComplete ? " ✅"
                   : "";
      md(stream, `**${stage.emoji} ${stage.label["pt-br"]}${status}**\n`);
      md(stream, `${stage.description["pt-br"]}\n`);
      md(stream, `→ Digite: \`${stage.id}\`\n\n`);
    }

    md(stream, `---\n\n💡 *Dica: Complete primeiro o intake básico.*\n`);
  } else {
    md(stream, `## 🎯 Choose a stage\n\n`);

    for (const stage of STAGES) {
      const status = stage.id === "CORE_INTAKE" && coreComplete ? " ✅"
                   : stage.id === "DEEP_INTAKE" && deepComplete ? " ✅"
                   : "";
      md(stream, `**${stage.emoji} ${stage.label["en"]}${status}**\n`);
      md(stream, `${stage.description["en"]}\n`);
      md(stream, `→ Type: \`${stage.id}\`\n\n`);
    }

    md(stream, `---\n\n💡 *Tip: Complete the basic intake first.*\n`);
  }
}

export async function handleStageChoice(
  choice: string,
  stream: any,
  lang: Lang,
  answers: any,
  company: any,
  saveAnswers: (data: any) => Promise<void>,
  callbacks: {
    onCoreIntake: () => void;
    onDeepIntake: () => void;
    onSpecialist: () => void;
    onInvalid: () => void;
  }
) {
  const wizard = ensureWizard(answers);
  const t = choice.toUpperCase().trim();

  // Check for stage keywords
  if (t === "CORE_INTAKE" || t === "BÁSICO" || t === "BASICO" || t === "BASIC" || t === "1") {
    wizard.active_stage = "CORE_INTAKE";
    await refreshWizardQueue(answers, company);
    await saveWizardOnly(answers, saveAnswers);

    md(stream, lang === "pt-br"
      ? `📋 Iniciando intake básico...\n\n`
      : `📋 Starting basic intake...\n\n`
    );

    callbacks.onCoreIntake();
    return;
  }

  if (t === "DEEP_INTAKE" || t === "AVANÇADO" || t === "AVANCADO" || t === "ADVANCED" || t === "2" || t === "APROFUNDAR") {
    // Check if core intake is complete
    if (!isCoreIntakeComplete(answers, company)) {
      md(stream, lang === "pt-br"
        ? `⚠️ Complete primeiro o intake básico.\n\nDigite \`CORE_INTAKE\` ou \`1\`.\n`
        : `⚠️ Please complete the basic intake first.\n\nType \`CORE_INTAKE\` or \`1\`.\n`
      );
      return;
    }

    wizard.active_stage = "DEEP_INTAKE";
    await refreshWizardQueueAdvanced(answers, company);
    await saveWizardOnly(answers, saveAnswers);

    md(stream, lang === "pt-br"
      ? `🔬 Iniciando intake avançado...\n\n`
      : `🔬 Starting advanced intake...\n\n`
    );

    callbacks.onDeepIntake();
    return;
  }

  if (t === "SPECIALIST" || t === "ESPECIALISTA" || t === "3") {
    callbacks.onSpecialist();
    return;
  }

  callbacks.onInvalid();
}

// -----------------------------
// Specialist Selector
// -----------------------------

export function showSpecialistSelector(stream: any, lang: Lang) {
  if (lang === "pt-br") {
    md(stream, `## 👨‍💼 Escolha um especialista\n\n`);

    for (const spec of SPECIALISTS) {
      md(stream, `**${spec.emoji} ${spec.label["pt-br"]}**\n`);
      md(stream, `${spec.description["pt-br"]}\n`);
      md(stream, `→ \`/${spec.id}\`\n\n`);
    }
  } else {
    md(stream, `## 👨‍💼 Choose a specialist\n\n`);

    for (const spec of SPECIALISTS) {
      md(stream, `**${spec.emoji} ${spec.label["en"]}**\n`);
      md(stream, `${spec.description["en"]}\n`);
      md(stream, `→ \`/${spec.id}\`\n\n`);
    }
  }
}

export function handleSpecialistChoice(
  choice: string,
  stream: any,
  lang: Lang,
  callbacks: {
    onFinance: () => void;
    onLegal: () => void;
    onCompliance: () => void;
    onOps: () => void;
    onInvalid: () => void;
  }
) {
  const t = choice.toLowerCase().trim();

  const matches: Record<string, () => void> = {
    "finance": callbacks.onFinance,
    "finanças": callbacks.onFinance,
    "financas": callbacks.onFinance,
    "1": callbacks.onFinance,
    "legal": callbacks.onLegal,
    "jurídico": callbacks.onLegal,
    "juridico": callbacks.onLegal,
    "2": callbacks.onLegal,
    "compliance": callbacks.onCompliance,
    "regulamentação": callbacks.onCompliance,
    "regulamentacao": callbacks.onCompliance,
    "3": callbacks.onCompliance,
    "ops": callbacks.onOps,
    "operations": callbacks.onOps,
    "operações": callbacks.onOps,
    "operacoes": callbacks.onOps,
    "4": callbacks.onOps,
  };

  const handler = matches[t];
  if (handler) {
    handler();
  } else {
    callbacks.onInvalid();
  }
}

// -----------------------------
// Auto Stage Detection
// -----------------------------

export function detectBestStage(answers: any, company: any): string {
  const coreComplete = isCoreIntakeComplete(answers, company);
  const deepComplete = isDeepIntakeComplete(answers, company);

  if (!coreComplete) {
    return "CORE_INTAKE";
  }

  if (!deepComplete) {
    return "DEEP_INTAKE";
  }

  return "COMPLETE";
}

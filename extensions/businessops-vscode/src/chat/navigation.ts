import * as vscode from "vscode";
import { md, Lang, ensureWizard, getProgressInfo, renderProgressBar, saveWizardOnly, hasAnyAnswers } from "./helpers";
import { refreshWizardQueue, refreshWizardQueueAdvanced } from "./orchestrator";
import { Question } from "./schema";

// -----------------------------
// Navigation Command Handlers
// -----------------------------

export async function handleBack(
  stream: any,
  lang: Lang,
  answers: any,
  saveAnswers: (data: any) => Promise<void>,
  onContinue: () => void
) {
  const wizard = ensureWizard(answers);

  if (wizard.asked.length === 0) {
    md(stream, lang === "pt-br"
      ? "⛔ Não há pergunta anterior.\n"
      : "⛔ No previous question.\n"
    );
    return;
  }

  // Pop the last asked question ID
  const lastKey = wizard.asked.pop()!;

  // Remove from answers if it exists
  if (answers.answers?.[lastKey]) {
    delete answers.answers[lastKey];
  }

  // Note: We don't re-add to queue here because it would need the full Question object
  // The askNext function will handle re-fetching

  await saveWizardOnly(answers, saveAnswers);

  md(stream, lang === "pt-br"
    ? `↩️ Voltando para: **${lastKey}**\n`
    : `↩️ Going back to: **${lastKey}**\n`
  );

  onContinue();
}

export async function handleSkip(
  stream: any,
  lang: Lang,
  answers: any,
  saveAnswers: (data: any) => Promise<void>,
  onContinue: () => void
) {
  const wizard = ensureWizard(answers);

  if (wizard.queue.length === 0) {
    md(stream, lang === "pt-br"
      ? "⛔ Nenhuma pergunta para pular.\n"
      : "⛔ No question to skip.\n"
    );
    return;
  }

  // Move current question to end of queue (queue contains Question objects)
  const skipped = wizard.queue.shift()!;
  wizard.queue.push(skipped);
  const skippedId = typeof skipped === 'string' ? skipped : skipped.id;

  await saveWizardOnly(answers, saveAnswers);

  md(stream, lang === "pt-br"
    ? `⏭️ Pulando: ${skippedId}\n`
    : `⏭️ Skipping: ${skippedId}\n`
  );

  onContinue();
}

export async function handleRestart(
  stream: any,
  lang: Lang,
  answers: any,
  company: any,
  saveAnswers: (data: any) => Promise<void>,
  onStageSelector: () => void
) {
  // Clear wizard state
  answers.wizard = {
    queue: [],
    asked: [],
    active_stage: null as string | null,
    active_specialist: null as string | null,
  };

  // Clear all answers
  answers.answers = {};

  await saveAnswers(answers);

  md(stream, lang === "pt-br"
    ? "🔄 Reiniciando questionário...\n\n"
    : "🔄 Restarting questionnaire...\n\n"
  );

  onStageSelector();
}

export function showStatus(
  stream: any,
  lang: Lang,
  answers: any,
  company: any
) {
  const wizard = ensureWizard(answers);
  const { answered, total, percent } = getProgressInfo(answers);
  const progressBar = renderProgressBar(percent);

  const stage = wizard.active_stage || (lang === "pt-br" ? "Nenhum" : "None");
  // Cast to any to access specialist field which may not be in type
  const specialist = (wizard as any).active_specialist || (lang === "pt-br" ? "Nenhum" : "None");

  if (lang === "pt-br") {
    md(stream, `## 📊 Status do Questionário\n\n`);
    md(stream, `${progressBar}\n\n`);
    md(stream, `- **Respondidas:** ${answered}/${total}\n`);
    md(stream, `- **Estágio atual:** ${stage}\n`);
    md(stream, `- **Especialista:** ${specialist}\n`);
    md(stream, `- **Na fila:** ${wizard.queue.length} perguntas\n\n`);

    if (wizard.queue.length > 0) {
      md(stream, `**Próximas perguntas:**\n`);
      wizard.queue.slice(0, 5).forEach((q: Question, i: number) => {
        const qId = typeof q === 'string' ? q : q.id;
        md(stream, `${i + 1}. \`${qId}\`\n`);
      });
      if (wizard.queue.length > 5) {
        md(stream, `... e mais ${wizard.queue.length - 5}\n`);
      }
    }

    md(stream, `\n**Comandos:**\n`);
    md(stream, `- \`/intake\` → continuar\n`);
    md(stream, `- \`VOLTAR\` → pergunta anterior\n`);
    md(stream, `- \`RECOMEÇAR\` → reiniciar\n`);
  } else {
    md(stream, `## 📊 Questionnaire Status\n\n`);
    md(stream, `${progressBar}\n\n`);
    md(stream, `- **Answered:** ${answered}/${total}\n`);
    md(stream, `- **Current stage:** ${stage}\n`);
    md(stream, `- **Specialist:** ${specialist}\n`);
    md(stream, `- **In queue:** ${wizard.queue.length} questions\n\n`);

    if (wizard.queue.length > 0) {
      md(stream, `**Upcoming questions:**\n`);
      wizard.queue.slice(0, 5).forEach((q: Question, i: number) => {
        const qId = typeof q === 'string' ? q : q.id;
        md(stream, `${i + 1}. \`${qId}\`\n`);
      });
      if (wizard.queue.length > 5) {
        md(stream, `... and ${wizard.queue.length - 5} more\n`);
      }
    }

    md(stream, `\n**Commands:**\n`);
    md(stream, `- \`/intake\` → continue\n`);
    md(stream, `- \`BACK\` → previous question\n`);
    md(stream, `- \`RESTART\` → start over\n`);
  }
}

export async function handleDeepIntake(
  stream: any,
  lang: Lang,
  answers: any,
  company: any,
  saveAnswers: (data: any) => Promise<void>,
  onContinue: () => void
) {
  const wizard = ensureWizard(answers);

  // Check if deep intake is already complete
  const deepPrefixes = ["deep_", "adv_", "detailed_"];
  const hasDeepAnswers = Object.keys(answers.answers || {})
    .some(k => deepPrefixes.some(p => k.startsWith(p)));

  if (hasDeepAnswers && wizard.queue.length === 0) {
    md(stream, lang === "pt-br"
      ? "✅ O intake avançado já foi concluído!\n\nUse `/generate` para gerar documentos.\n"
      : "✅ Advanced intake is already complete!\n\nUse `/generate` to generate documents.\n"
    );
    return;
  }

  // Set stage to DEEP_INTAKE
  wizard.active_stage = "DEEP_INTAKE";

  // Load advanced questions
  await refreshWizardQueueAdvanced(answers, company);

  if (wizard.queue.length === 0) {
    md(stream, lang === "pt-br"
      ? "⚠️ Não há perguntas avançadas disponíveis.\n"
      : "⚠️ No advanced questions available.\n"
    );
    return;
  }

  await saveWizardOnly(answers, saveAnswers);

  md(stream, lang === "pt-br"
    ? `🔬 Iniciando intake avançado (${wizard.queue.length} perguntas)...\n\n`
    : `🔬 Starting advanced intake (${wizard.queue.length} questions)...\n\n`
  );

  onContinue();
}

// -----------------------------
// Navigation Keywords
// -----------------------------

export const NAVIGATION_KEYWORDS = {
  back: ["voltar", "back", "anterior", "previous", "desfazer", "undo"],
  skip: ["pular", "skip", "próximo", "proximo", "next", "depois", "later"],
  restart: ["recomeçar", "recomecar", "restart", "reiniciar", "reset", "limpar", "clear"],
  status: ["status", "progresso", "progress", "onde estou", "where am i"],
  deep: ["aprofundar", "deepen", "avançado", "avancado", "advanced", "detalhado", "detailed"],
};

export function detectNavigationCommand(input: string): keyof typeof NAVIGATION_KEYWORDS | null {
  const t = input.toLowerCase().trim();

  for (const [cmd, keywords] of Object.entries(NAVIGATION_KEYWORDS)) {
    if (keywords.some(kw => t === kw || t.includes(kw))) {
      return cmd as keyof typeof NAVIGATION_KEYWORDS;
    }
  }

  return null;
}

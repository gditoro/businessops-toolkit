import * as vscode from "vscode";
import { md, Lang, ensureWizard, saveWizardOnly, getProgressInfo, renderProgressBar, buildFollowup, isCoreIntakeComplete, isDeepIntakeComplete } from "./helpers";
import { refreshWizardQueue, refreshWizardQueueAdvanced } from "./orchestrator";
import { Question } from "./schema";

// -----------------------------
// Question Rendering
// -----------------------------

export interface QuestionContext {
  key: string;
  question: Question | null;
  lang: Lang;
  isRequired: boolean;
  currentValue?: any;
}

export function renderQuestion(
  stream: any,
  ctx: QuestionContext
) {
  const { key, question, lang, isRequired, currentValue } = ctx;

  // Simplified header
  const label = question?.text?.[lang] || question?.text?.["en"] || key;
  const placeholder = question?.placeholder?.[lang] || question?.placeholder?.["en"] || "";

  md(stream, `### ${label}\n`);

  if (placeholder) {
    md(stream, `*${placeholder}*\n\n`);
  }

  // Show options for enum/multiselect types
  if ((question?.type === "enum" || question?.type === "multiselect") && question.options) {
    const opts = question.options.map((o) => `\`${o.value}\``).join(" | ");
    md(stream, `**${lang === "pt-br" ? "Opções" : "Options"}:** ${opts}\n\n`);
  }

  // Show current value if editing
  if (currentValue !== undefined) {
    md(stream, lang === "pt-br"
      ? `*(Atual: ${currentValue})*\n\n`
      : `*(Current: ${currentValue})*\n\n`
    );
  }
}

export function renderQuestionWithProgress(
  stream: any,
  answers: any,
  ctx: QuestionContext
) {
  const { answered, total, percent } = getProgressInfo(answers);

  // Progress bar at top
  md(stream, `${renderProgressBar(percent)} ${answered}/${total}\n\n`);

  renderQuestion(stream, ctx);
}

// -----------------------------
// Answer Validation
// -----------------------------

export interface ValidationResult {
  valid: boolean;
  value: any;
  error?: string;
}

export function validateAnswer(
  input: string,
  question: Question | null,
  lang: Lang
): ValidationResult {
  const t = input.trim();

  if (!question) {
    // No question, accept as string
    return { valid: true, value: t };
  }

  const isRequired = question.validation?.required;

  switch (question.type) {
    case "text":
      if (isRequired && !t) {
        return {
          valid: false,
          value: null,
          error: lang === "pt-br" ? "Campo obrigatório." : "Required field."
        };
      }
      return { valid: true, value: t };

    case "enum":
      if (!question.options) {
        return { valid: true, value: t };
      }
      const normalized = t.toLowerCase();
      const match = question.options.find((opt) =>
        opt.value.toLowerCase() === normalized ||
        opt.label[lang]?.toLowerCase() === normalized
      );
      if (match) {
        return { valid: true, value: match.value };
      }
      // Check for numeric selection
      const idx = parseInt(t) - 1;
      if (!isNaN(idx) && idx >= 0 && idx < question.options.length) {
        return { valid: true, value: question.options[idx].value };
      }
      return {
        valid: false,
        value: null,
        error: lang === "pt-br"
          ? `Opções válidas: ${question.options.map(o => o.value).join(", ")}`
          : `Valid options: ${question.options.map(o => o.value).join(", ")}`
      };

    case "multiselect":
      // Split by comma
      const items = t.split(/[,]/).map(s => s.trim()).filter(Boolean);
      if (question.options) {
        // Validate each item
        const validItems: string[] = [];
        for (const item of items) {
          const itemMatch = question.options.find((opt) =>
            opt.value.toLowerCase() === item.toLowerCase() ||
            opt.label[lang]?.toLowerCase() === item.toLowerCase()
          );
          if (itemMatch) {
            validItems.push(itemMatch.value);
          }
        }
        return { valid: true, value: validItems };
      }
      return { valid: true, value: items };

    default:
      return { valid: true, value: t };
  }
}

// -----------------------------
// Completion Messages
// -----------------------------

export function showCoreComplete(stream: any, lang: Lang) {
  if (lang === "pt-br") {
    md(stream, `## ✅ Intake Básico Completo!\n\n`);
    md(stream, `**Próximos passos:**\n`);
    md(stream, `- \`APROFUNDAR\` → intake avançado\n`);
    md(stream, `- \`/generate\` → gerar documentos\n`);
    md(stream, `- \`/diagnose\` → diagnóstico\n`);
    md(stream, `- \`/plan\` → plano de ação\n`);
  } else {
    md(stream, `## ✅ Basic Intake Complete!\n\n`);
    md(stream, `**Next steps:**\n`);
    md(stream, `- \`DEEPEN\` → advanced intake\n`);
    md(stream, `- \`/generate\` → generate documents\n`);
    md(stream, `- \`/diagnose\` → diagnostic\n`);
    md(stream, `- \`/plan\` → action plan\n`);
  }
}

export function showDeepComplete(stream: any, lang: Lang) {
  if (lang === "pt-br") {
    md(stream, `## 🎉 Intake Completo!\n\n`);
    md(stream, `Você completou todas as perguntas.\n\n`);
    md(stream, `**Gere seus documentos:**\n`);
    md(stream, `- \`/generate\` → todos os documentos\n`);
    md(stream, `- \`/diagnose\` → diagnóstico detalhado\n`);
    md(stream, `- \`/plan\` → plano de 7/30/90 dias\n`);
    md(stream, `- \`/swot\` → análise SWOT\n`);
  } else {
    md(stream, `## 🎉 Intake Complete!\n\n`);
    md(stream, `You've completed all questions.\n\n`);
    md(stream, `**Generate your documents:**\n`);
    md(stream, `- \`/generate\` → all documents\n`);
    md(stream, `- \`/diagnose\` → detailed diagnostic\n`);
    md(stream, `- \`/plan\` → 7/30/90 day plan\n`);
    md(stream, `- \`/swot\` → SWOT analysis\n`);
  }
}

export function showAnswerConfirmation(stream: any, key: string, value: any, lang: Lang) {
  // Simple confirmation without clutter
  const displayValue = typeof value === "object" ? JSON.stringify(value) : String(value);
  md(stream, `✅ **${displayValue}**\n\n`);
}

import * as vscode from "vscode";
import { Question, Lang } from "./schema";

/**
 * AI Assist module for question explanation, reframing, and suggestions
 * Uses VS Code Language Model API when available, falls back to templates
 */

type AiAction = "EXPLICAR" | "REFORMULAR" | "SUGERIR";

interface AiAssistContext {
  question: Question;
  lang: Lang;
  answers: Record<string, any>;
  company: any;
}

/**
 * Check if VS Code Language Model API is available
 */
function isLmApiAvailable(): boolean {
  return typeof vscode.lm !== "undefined" && typeof vscode.lm.selectChatModels === "function";
}

/**
 * Get available language models
 */
async function getAvailableModel(): Promise<vscode.LanguageModelChat | null> {
  if (!isLmApiAvailable()) {
    return null;
  }

  try {
    const models = await vscode.lm.selectChatModels({
      vendor: "copilot",
      family: "gpt-4o"
    });

    if (models.length > 0) {
      return models[0];
    }

    // Try any available model
    const anyModels = await vscode.lm.selectChatModels();
    return anyModels.length > 0 ? anyModels[0] : null;
  } catch {
    return null;
  }
}

/**
 * Build context string from company/answers for LLM
 */
function buildContextString(ctx: AiAssistContext): string {
  const { answers, company, lang } = ctx;
  const parts: string[] = [];

  if (company?.company?.identity?.name) {
    parts.push(`Company: ${company.company.identity.name}`);
  }
  if (company?.company?.identity?.one_liner) {
    parts.push(`Description: ${company.company.identity.one_liner}`);
  }
  if (company?.meta?.country_mode) {
    parts.push(`Country mode: ${company.meta.country_mode}`);
  }
  if (company?.meta?.packs?.length) {
    parts.push(`Industry packs: ${company.meta.packs.join(", ")}`);
  }

  const answeredKeys = Object.keys(answers || {}).filter(k => answers[k]);
  if (answeredKeys.length > 0) {
    parts.push(`Already answered: ${answeredKeys.join(", ")}`);
  }

  return parts.length > 0 ? parts.join("\n") : "No context available yet.";
}

/**
 * Call the LLM with a prompt for AI assist
 */
async function callLm(
  model: vscode.LanguageModelChat,
  systemPrompt: string,
  userPrompt: string,
  token?: vscode.CancellationToken
): Promise<string> {
  const messages = [
    vscode.LanguageModelChatMessage.User(systemPrompt + "\n\n" + userPrompt)
  ];

  try {
    const response = await model.sendRequest(messages, {}, token ?? new vscode.CancellationTokenSource().token);

    let result = "";
    for await (const chunk of response.text) {
      result += chunk;
    }
    return result.trim();
  } catch (err: any) {
    console.error("[businessops] LM API error:", err);
    throw err;
  }
}

/**
 * Generate explanation for a question using LLM or fallback
 */
export async function explainQuestion(ctx: AiAssistContext): Promise<string> {
  const { question, lang } = ctx;
  const model = await getAvailableModel();

  if (model) {
    try {
      const systemPrompt = lang === "pt-br"
        ? `Você é um assistente de negócios ajudando um fundador a preencher um formulário de intake.
Explique de forma clara e concisa por que esta pergunta é importante e como responder.
Responda em português brasileiro. Seja direto e prático.`
        : `You are a business assistant helping a founder fill out an intake form.
Explain clearly and concisely why this question is important and how to answer it.
Be direct and practical.`;

      const context = buildContextString(ctx);
      const userPrompt = lang === "pt-br"
        ? `Contexto da empresa:\n${context}\n\nPergunta: "${question.text["pt-br"]}"\nTipo: ${question.type}\nOpções: ${(question.options || []).map(o => o.value).join(", ") || "texto livre"}\n\nExplique esta pergunta.`
        : `Company context:\n${context}\n\nQuestion: "${question.text["en"]}"\nType: ${question.type}\nOptions: ${(question.options || []).map(o => o.value).join(", ") || "free text"}\n\nExplain this question.`;

      const response = await callLm(model, systemPrompt, userPrompt);
      return `ℹ️ **${lang === "pt-br" ? "Explicação" : "Explanation"}**\n\n${response}`;
    } catch {
      // Fall through to template
    }
  }

  // Fallback to template
  return explainQuestionTemplate(question, lang);
}

/**
 * Reframe a question using LLM or fallback
 */
export async function reframeQuestion(ctx: AiAssistContext): Promise<string> {
  const { question, lang } = ctx;
  const model = await getAvailableModel();

  if (model) {
    try {
      const systemPrompt = lang === "pt-br"
        ? `Você é um assistente de negócios. Reformule a pergunta de forma mais clara e contextualizada para o fundador.
Responda em português brasileiro. Seja direto.`
        : `You are a business assistant. Reframe the question more clearly and contextually for the founder.
Be direct.`;

      const context = buildContextString(ctx);
      const userPrompt = lang === "pt-br"
        ? `Contexto da empresa:\n${context}\n\nPergunta original: "${question.text["pt-br"]}"\n\nReformule esta pergunta de forma mais clara e personalizada.`
        : `Company context:\n${context}\n\nOriginal question: "${question.text["en"]}"\n\nReframe this question more clearly and personalized.`;

      const response = await callLm(model, systemPrompt, userPrompt);
      return `🧠 **${lang === "pt-br" ? "Reformulação" : "Reframed"}**\n\n${response}`;
    } catch {
      // Fall through to template
    }
  }

  // Fallback to template
  return reframeQuestionTemplate(question, lang);
}

/**
 * Suggest an answer using LLM or fallback
 */
export async function suggestAnswer(ctx: AiAssistContext): Promise<string> {
  const { question, lang } = ctx;
  const model = await getAvailableModel();

  if (model) {
    try {
      const systemPrompt = lang === "pt-br"
        ? `Você é um assistente de negócios experiente. Com base no contexto da empresa, sugira uma resposta para a pergunta.
Se não houver contexto suficiente, dê uma sugestão genérica baseada em boas práticas.
Responda em português brasileiro. Seja direto e prático.
Formate a sugestão principal em **negrito**.`
        : `You are an experienced business assistant. Based on the company context, suggest an answer to the question.
If there's not enough context, give a generic suggestion based on best practices.
Be direct and practical.
Format the main suggestion in **bold**.`;

      const context = buildContextString(ctx);
      const optionsStr = (question.options || []).map(o => `${o.value} (${o.label[lang]})`).join(", ");
      const userPrompt = lang === "pt-br"
        ? `Contexto da empresa:\n${context}\n\nPergunta: "${question.text["pt-br"]}"\nTipo: ${question.type}\nOpções disponíveis: ${optionsStr || "texto livre"}\n\nSugira a melhor resposta.`
        : `Company context:\n${context}\n\nQuestion: "${question.text["en"]}"\nType: ${question.type}\nAvailable options: ${optionsStr || "free text"}\n\nSuggest the best answer.`;

      const response = await callLm(model, systemPrompt, userPrompt);
      return `💡 **${lang === "pt-br" ? "Sugestão" : "Suggestion"}**\n\n${response}`;
    } catch {
      // Fall through to template
    }
  }

  // Fallback to template
  return suggestAnswerTemplate(question, ctx.answers, lang);
}

/**
 * Main entry point for AI assist actions
 */
export async function handleAiAction(
  action: AiAction,
  ctx: AiAssistContext
): Promise<string> {
  switch (action) {
    case "EXPLICAR":
      return explainQuestion(ctx);
    case "REFORMULAR":
      return reframeQuestion(ctx);
    case "SUGERIR":
      return suggestAnswer(ctx);
    default:
      return ctx.lang === "pt-br" ? "Ação desconhecida." : "Unknown action.";
  }
}

// -----------------------------
// Fallback Templates
// -----------------------------

function explainQuestionTemplate(q: Question, lang: Lang): string {
  if (q.type === "text") {
    return lang === "pt-br"
      ? `ℹ️ **Explicação**: responda com texto livre. Use \`SKIP\` se não quiser responder agora.`
      : `ℹ️ **Explanation**: reply with free text. Use \`SKIP\` to skip for now.`;
  }

  if (q.type === "enum" || q.type === "multiselect") {
    const opts = (q.options || []).map(o => `- \`${o.value}\` — ${o.label[lang]}`).join("\n");
    return lang === "pt-br"
      ? `ℹ️ **Explicação**: escolha uma das opções abaixo.\n\n${opts}\n\nDica: você pode clicar em uma opção sugerida.`
      : `ℹ️ **Explanation**: choose one of the options below.\n\n${opts}\n\nTip: you can click a suggested option.`;
  }

  return lang === "pt-br" ? "ℹ️ Explicação indisponível." : "ℹ️ Explanation unavailable.";
}

function reframeQuestionTemplate(q: Question, lang: Lang): string {
  return lang === "pt-br"
    ? `🧠 **Reformulação**: ${q.text["pt-br"]}\n\n_(Se quiser, posso adaptar a pergunta ao seu contexto com mais detalhes.)_`
    : `🧠 **Reframed**: ${q.text["en"]}\n\n_(If you want, I can tailor the question further based on your context.)_`;
}

function suggestAnswerTemplate(q: Question, answers: any, lang: Lang): string {
  // Lightweight heuristic suggestions
  if (q.id === "country_mode") return lang === "pt-br" ? "💡 Sugestão: **BR**" : "💡 Suggestion: **BR**";
  if (q.id === "language_preference") return lang === "pt-br" ? "💡 Sugestão: **BILINGUAL**" : "💡 Suggestion: **BILINGUAL**";
  if (q.id === "industry_pack") return lang === "pt-br" ? "💡 Sugestão: **health-import**" : "💡 Suggestion: **health-import**";

  return lang === "pt-br"
    ? "💡 Sugestão: escolha a opção que melhor descreve seu cenário. Se estiver em dúvida, use `UNKNOWN`."
    : "💡 Suggestion: choose the option that best matches your scenario. If unsure, use `UNKNOWN`.";
}

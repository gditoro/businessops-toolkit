import * as vscode from "vscode";
import { md, Lang, ensureWizard, isDeepIntakeComplete } from "./helpers";

// -----------------------------
// Intent Detection
// -----------------------------

interface IntentMatch {
  intent: string;
  confidence: number;
  suggestion: string;
  command?: string;
  needsResponse?: boolean;
}

interface IntentPattern {
  keywords: string[];
  intent: string;
  command: string;
  suggestion: Record<string, string>;
}

const INTENT_PATTERNS: IntentPattern[] = [
  {
    keywords: ["start", "begin", "iniciar", "começar", "comecar", "intake", "questionário", "questionario", "perguntas"],
    intent: "start_intake",
    command: "/intake",
    suggestion: { "pt-br": "Quer iniciar o questionário?", "en": "Want to start the questionnaire?" }
  },
  {
    keywords: ["generate", "gerar", "criar", "docs", "documentos", "documentação", "documentacao", "render"],
    intent: "generate_docs",
    command: "/generate",
    suggestion: { "pt-br": "Quer gerar a documentação?", "en": "Want to generate documentation?" }
  },
  {
    keywords: ["status", "progresso", "progress", "onde", "where", "quanto", "how much"],
    intent: "check_status",
    command: "STATUS",
    suggestion: { "pt-br": "Quer ver o progresso?", "en": "Want to see progress?" }
  },
  {
    keywords: ["diagnose", "diagnostico", "diagnóstico", "análise", "analise", "analysis", "avaliar", "evaluate"],
    intent: "diagnose",
    command: "/diagnose",
    suggestion: { "pt-br": "Quer um diagnóstico organizacional?", "en": "Want an organizational diagnostic?" }
  },
  {
    keywords: ["plan", "plano", "planejamento", "roadmap", "próximos passos", "next steps", "7 dias", "30 dias", "90 dias"],
    intent: "plan",
    command: "/plan",
    suggestion: { "pt-br": "Quer criar um plano de execução?", "en": "Want to create an execution plan?" }
  },
  {
    keywords: ["swot", "forças", "fraquezas", "strengths", "weaknesses", "opportunities", "threats"],
    intent: "swot",
    command: "/swot",
    suggestion: { "pt-br": "Quer uma análise SWOT?", "en": "Want a SWOT analysis?" }
  },
  {
    keywords: ["method", "método", "metodo", "framework", "ferramenta", "tool", "porter", "bcg", "okr", "kpi", "kanban"],
    intent: "methods",
    command: "/methods",
    suggestion: { "pt-br": "Quer ver os métodos disponíveis?", "en": "Want to see available methods?" }
  },
  {
    keywords: ["help", "ajuda", "como", "how", "what", "o que", "comandos", "commands"],
    intent: "help",
    command: "/help",
    suggestion: { "pt-br": "Precisa de ajuda?", "en": "Need help?" }
  },
  {
    keywords: ["finance", "finanças", "financas", "dinheiro", "money", "receita", "revenue", "funding", "investimento"],
    intent: "finance",
    command: "/finance",
    suggestion: { "pt-br": "Quer falar sobre finanças?", "en": "Want to discuss finances?" }
  },
  {
    keywords: ["legal", "jurídico", "juridico", "contrato", "contract", "sócio", "socio", "partner"],
    intent: "legal",
    command: "/legal",
    suggestion: { "pt-br": "Quer falar sobre questões jurídicas?", "en": "Want to discuss legal matters?" }
  },
  {
    keywords: ["compliance", "regulatório", "regulatorio", "licença", "licenca", "anvisa", "impostos", "taxes"],
    intent: "compliance",
    command: "/compliance",
    suggestion: { "pt-br": "Quer falar sobre compliance?", "en": "Want to discuss compliance?" }
  },
  {
    keywords: ["ops", "operações", "operacoes", "operations", "processo", "process", "logística", "logistica"],
    intent: "ops",
    command: "/ops",
    suggestion: { "pt-br": "Quer falar sobre operações?", "en": "Want to discuss operations?" }
  },
  {
    keywords: ["oi", "olá", "ola", "hi", "hello", "hey", "bom dia", "boa tarde", "good morning"],
    intent: "greeting",
    command: "",
    suggestion: { "pt-br": "Olá! Como posso ajudar?", "en": "Hello! How can I help?" }
  }
];

function detectIntentFromPatterns(text: string, lang: Lang): IntentMatch {
  const t = text.toLowerCase().trim();

  let bestMatch: IntentMatch = {
    intent: "unknown",
    confidence: 0,
    suggestion: lang === "pt-br"
      ? "Não entendi. Use `/help` para ver os comandos."
      : "I didn't understand. Use `/help` to see commands."
  };

  for (const pattern of INTENT_PATTERNS) {
    const matchCount = pattern.keywords.filter(kw => t.includes(kw)).length;
    const confidence = matchCount / pattern.keywords.length;

    if (matchCount > 0 && confidence > bestMatch.confidence) {
      bestMatch = {
        intent: pattern.intent,
        confidence,
        suggestion: pattern.suggestion[lang],
        command: pattern.command
      };
    }
  }

  return bestMatch;
}

// -----------------------------
// LLM-powered Intent Detection (uses Copilot model from request)
// -----------------------------

async function detectIntentWithCopilot(
  text: string,
  lang: Lang,
  context: { hasAnswers: boolean; isComplete: boolean },
  model: vscode.LanguageModelChat,
  token: vscode.CancellationToken
): Promise<IntentMatch | null> {
  try {
    const systemPrompt = `You are an intent classifier for BusinessOps, a business structuring assistant.
Classify the user's message into ONE of these intents:
- intake: User wants to start/continue the questionnaire
- generate: User wants to generate documentation
- status: User wants to check progress
- diagnose: User wants organizational diagnosis
- plan: User wants an execution plan
- swot: User wants SWOT analysis
- methods: User wants to see available business methods
- help: User needs help or commands list
- finance: User wants to discuss finances
- legal: User wants to discuss legal matters
- compliance: User wants to discuss compliance/regulations
- ops: User wants to discuss operations
- greeting: User is greeting
- question: User is asking a business question that needs a thoughtful answer
- unknown: Cannot determine intent

Current context:
- User has existing answers: ${context.hasAnswers}
- Intake is complete: ${context.isComplete}
- Language: ${lang}

Respond with ONLY a JSON object: {"intent": "...", "confidence": 0.0-1.0, "needsResponse": true/false}
If needsResponse is true, the user asked something that requires a conversational answer.`;

    const messages = [
      vscode.LanguageModelChatMessage.User(systemPrompt),
      vscode.LanguageModelChatMessage.User(`User message: "${text}"`)
    ];

    const response = await model.sendRequest(messages, {}, token);
    let result = "";
    for await (const chunk of response.text) {
      result += chunk;
    }

    // Parse JSON response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Map intent to command
      const intentToCommand: Record<string, string> = {
        intake: "/intake",
        generate: "/generate",
        status: "STATUS",
        diagnose: "/diagnose",
        plan: "/plan",
        swot: "/swot",
        methods: "/methods",
        help: "/help",
        finance: "/finance",
        legal: "/legal",
        compliance: "/compliance",
        ops: "/ops",
      };

      return {
        intent: parsed.intent,
        confidence: parsed.confidence || 0.5,
        suggestion: "",
        command: intentToCommand[parsed.intent],
        needsResponse: parsed.needsResponse
      };
    }
  } catch (error) {
    console.error("[BusinessOps] Copilot intent detection failed:", error);
  }

  return null;
}

// -----------------------------
// Conversational Response (uses Copilot model)
// -----------------------------

async function generateConversationalResponse(
  text: string,
  lang: Lang,
  context: { answers: any; company: any },
  model: vscode.LanguageModelChat,
  token: vscode.CancellationToken
): Promise<string | null> {
  try {
    // Build context from company data
    const companyData = context.company?.company || {};
    const meta = context.company?.meta || {};

    const systemPrompt = lang === "pt-br"
      ? `Você é o BusinessOps, um assistente especializado em estruturação de empresas.
Responda de forma concisa e útil. Se a pergunta não for sobre negócios, redirecione educadamente.

Contexto da empresa:
- Setor: ${meta.industry || "não definido"}
- País: ${meta.country_mode || "não definido"}
- Estágio: ${companyData.identity?.stage || "não definido"}
- Modelo: ${companyData.business_model || "não definido"}

Mantenha respostas curtas (2-3 parágrafos máx). Sugira comandos relevantes quando apropriado.`
      : `You are BusinessOps, a business structuring assistant.
Respond concisely and helpfully. If the question isn't about business, politely redirect.

Company context:
- Industry: ${meta.industry || "not defined"}
- Country: ${meta.country_mode || "not defined"}
- Stage: ${companyData.identity?.stage || "not defined"}
- Model: ${companyData.business_model || "not defined"}

Keep responses short (2-3 paragraphs max). Suggest relevant commands when appropriate.`;

    const messages = [
      vscode.LanguageModelChatMessage.User(systemPrompt),
      vscode.LanguageModelChatMessage.User(text)
    ];

    const response = await model.sendRequest(messages, {}, token);
    let result = "";
    for await (const chunk of response.text) {
      result += chunk;
    }

    return result.trim();
  } catch (error) {
    console.error("[BusinessOps] Copilot response generation failed:", error);
    return null;
  }
}

// -----------------------------
// Main Handler (now uses Copilot model from request)
// -----------------------------

export async function handleUnknownInput(
  text: string,
  stream: any,
  lang: Lang,
  answers: any,
  company: any,
  model?: vscode.LanguageModelChat,
  token?: vscode.CancellationToken
) {
  const wizard = ensureWizard(answers);
  const hasAnswers = Object.keys(answers?.answers || {}).length > 0;
  const isComplete = isDeepIntakeComplete(answers, company);

  // Use Copilot model if provided
  if (model && token) {
    const copilotIntent = await detectIntentWithCopilot(text, lang, { hasAnswers, isComplete }, model, token);

    if (copilotIntent) {
      // If it's a question that needs a response, generate one with Copilot
      if (copilotIntent.needsResponse && copilotIntent.intent === "question") {
        const response = await generateConversationalResponse(text, lang, { answers, company }, model, token);
        if (response) {
          md(stream, response + "\n");
          return;
        }
      }

      // If we have a high-confidence command match
      if (copilotIntent.confidence >= 0.6 && copilotIntent.command) {
        md(stream, lang === "pt-br"
          ? `💡 Entendi! Use \`${copilotIntent.command}\`\n`
          : `💡 Got it! Use \`${copilotIntent.command}\`\n`
        );
        return;
      }
    }
  }

  // Fallback to pattern-based detection
  const patternIntent = detectIntentFromPatterns(text, lang);

  // Handle greeting
  if (patternIntent.intent === "greeting") {
    if (isComplete) {
      md(stream, lang === "pt-br"
        ? `👋 Olá! Seu intake está completo.\n\n**Sugestões:**\n- \`/generate\` → gerar documentação\n- \`/diagnose\` → diagnóstico\n- \`/plan\` → plano de ação\n`
        : `👋 Hello! Your intake is complete.\n\n**Suggestions:**\n- \`/generate\` → generate docs\n- \`/diagnose\` → diagnostic\n- \`/plan\` → action plan\n`
      );
    } else if (hasAnswers) {
      md(stream, lang === "pt-br"
        ? `👋 Olá! Você tem um intake em andamento.\n\n- \`/intake\` → continuar\n- \`/status\` → ver progresso\n`
        : `👋 Hello! You have an intake in progress.\n\n- \`/intake\` → continue\n- \`/status\` → view progress\n`
      );
    } else {
      md(stream, lang === "pt-br"
        ? `👋 Olá! Sou o **@BusinessOps**.\n\n- \`/intake\` → iniciar questionário\n- \`/help\` → ver comandos\n`
        : `👋 Hello! I'm **@BusinessOps**.\n\n- \`/intake\` → start questionnaire\n- \`/help\` → see commands\n`
      );
    }
    return;
  }

  // High confidence pattern match
  if (patternIntent.confidence >= 0.3 && patternIntent.command) {
    md(stream, lang === "pt-br"
      ? `💡 ${patternIntent.suggestion}\n\n→ \`${patternIntent.command}\`\n`
      : `💡 ${patternIntent.suggestion}\n\n→ \`${patternIntent.command}\`\n`
    );
    return;
  }

  // Try to generate a helpful response with Copilot (if model available)
  if (model && token) {
    const response = await generateConversationalResponse(text, lang, { answers, company }, model, token);
    if (response) {
      md(stream, response + "\n");
      return;
    }
  }

  // Final fallback - contextual help
  if (isComplete) {
    md(stream, lang === "pt-br"
      ? `🤔 Não entendi. Tente:\n- \`/generate\` → documentação\n- \`/diagnose\` → diagnóstico\n- \`/help\` → comandos\n`
      : `🤔 I didn't understand. Try:\n- \`/generate\` → documentation\n- \`/diagnose\` → diagnostic\n- \`/help\` → commands\n`
    );
  } else if (hasAnswers) {
    md(stream, lang === "pt-br"
      ? `🤔 Não entendi. Tente:\n- \`/intake\` → continuar\n- \`/status\` → progresso\n- \`/help\` → comandos\n`
      : `🤔 I didn't understand. Try:\n- \`/intake\` → continue\n- \`/status\` → progress\n- \`/help\` → commands\n`
    );
  } else {
    md(stream, lang === "pt-br"
      ? `🤔 Não entendi. Tente:\n- \`/intake\` → começar\n- \`/help\` → comandos\n`
      : `🤔 I didn't understand. Try:\n- \`/intake\` → start\n- \`/help\` → commands\n`
    );
  }
}

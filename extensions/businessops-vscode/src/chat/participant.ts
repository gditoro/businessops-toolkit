import * as vscode from "vscode";
import { loadState } from "./intakeFlow";
import { Question } from "./schema";
import { ensureWizard, markAsked } from "./stateQueue";
import {
  refreshWizardQueue,
  refreshWizardQueueAdvanced,
  getNextDynamicQuestion,
  buildContext,
} from "./orchestrator";
import { saveDynamicAnswer } from "./saveDynamic";
import { writeYaml } from "../state/yaml";
import { WizardState } from "./types";
import { handleAiAction } from "./aiAssist";
import { loadCoreWorkflow } from "./yamlWorkflow";
import { opsSpecialist } from "./specialists/ops";
import { complianceSpecialist } from "./specialists/compliance";

// -----------------------------
// Helpers
// -----------------------------

function md(stream: any, content: string) {
  if (typeof stream.markdown === "function") return stream.markdown(content);
  if (typeof stream.appendMarkdown === "function")
    return stream.appendMarkdown(content);
  if (typeof stream.append === "function") return stream.append(content);
  if (typeof stream.write === "function") return stream.write(content);
  throw new Error("No markdown-capable method found on ChatResponseStream");
}

function norm(s: string) {
  return (s || "").trim();
}

function upper(s: string) {
  return norm(s).toUpperCase();
}

function isCommand(input: string) {
  return norm(input).startsWith("/");
}

function getLang(company: any): "pt-br" | "en" {
  const pref = company?.meta?.language_preference || "BILINGUAL";
  if (pref === "EN") return "en";
  return "pt-br";
}

function hasAnyAnswers(answers: any) {
  const a = answers?.answers || {};
  return Object.keys(a).length > 0;
}

async function saveWizardOnly(answers: any) {
  const { answersPath } = await loadState();
  await writeYaml(answersPath, answers);
}

function stripBusinessOpsPrefix(input: string) {
  return input.replace(/^(\s*@businessops\s*)+/i, "").trim();
}

function sanitizeUserInput(input: string) {
  let s = stripBusinessOpsPrefix(input);
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

function buildFollowup(label: string, prompt: string): vscode.ChatFollowup {
  return { label, prompt };
}

function ensureHelpLog(wizard: any) {
  if (!wizard.help_events) wizard.help_events = [];
  return wizard.help_events;
}

function deleteAtPath(obj: any, dotPath: string) {
  const parts = (dotPath || "").split(".").filter(Boolean);
  if (parts.length === 0) return;

  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (cur[key] == null || typeof cur[key] !== "object") return;
    cur = cur[key];
  }

  const last = parts[parts.length - 1];
  if (last in cur) delete cur[last];
}

// -----------------------------
// Chat Participant Registration
// -----------------------------

export function registerBusinessOpsChat(context: vscode.ExtensionContext) {
  const participant = vscode.chat.createChatParticipant(
    "businessops",
    async (request, chatContext, stream, token) => {
      const text = sanitizeUserInput(request.prompt);

      const state = await loadState();
      const { answers, company } = state;
      const lang = getLang(company);
      const wizard = ensureWizard(answers);

      // ----------------------------------------------
      // Aliases
      // ----------------------------------------------
      const t = text.toLowerCase();
      const isGenerateAlias =
        t === "generate docs" ||
        t === "gerar docs" ||
        t === "gerar documentação" ||
        t === "generate documentation";

      if (isGenerateAlias) {
        await runRender(stream, lang);
        return;
      }

      // ----------------------------------------------
      // AI Actions (when awaiting a question)
      // ----------------------------------------------
      if (
        !isCommand(text) &&
        wizard.awaiting_answer_for &&
        wizard.last_question
      ) {
        const action = upper(text);

        if (
          action === "EXPLICAR" ||
          action === "REFORMULAR" ||
          action === "SUGERIR"
        ) {
          await handleAiAssistAction(action, stream, lang, answers, company);
          return;
        }
      }

      // ----------------------------------------------
      // Reset prompt priority
      // ----------------------------------------------
      if (!isCommand(text) && wizard.pending_reset_prompt) {
        await handleResetChoice(text, stream, lang, answers);
        return;
      }

      // ----------------------------------------------
      // Stage selector after intake
      // ----------------------------------------------
      if (!isCommand(text) && wizard.awaiting_stage_choice) {
        await handleStageChoice(text, stream, lang, answers, company);
        return;
      }

      // ----------------------------------------------
      // Awaiting normal answer
      // ----------------------------------------------
      if (!isCommand(text) && wizard.awaiting_answer_for) {
        const ok = await handleQuestionAnswer(text, stream, lang);
        if (!ok) return;

        await askNext(stream, lang);
        return;
      }

      // Backtrack: allow user to re-responder a pergunta anterior
      const backText = lang === "pt-br" ? "VOLTAR" : "BACK";
      if (!isCommand(text) && upper(text) === backText) {
        await handleBack(stream, lang);
        return;
      }

      // ----------------------------------------------
      // Commands
      // ----------------------------------------------
      if (text.startsWith("/intake")) {
        if (hasAnyAnswers(answers) || wizard.completed) {
          wizard.pending_reset_prompt = true;
          wizard.awaiting_answer_for = null;
          wizard.current_question_id = null;
          wizard.last_question = null;
          wizard.awaiting_stage_choice = false;
          await saveWizardOnly(answers);
          await askResetContinueExit(stream, lang);
          return;
        }

        wizard.pending_reset_prompt = false;
        wizard.awaiting_answer_for = null;
        wizard.current_question_id = null;
        wizard.last_question = null;
        wizard.awaiting_stage_choice = false;
        wizard.completed = false;
        wizard.completed_at = null;

        await saveWizardOnly(answers);
        await askNext(stream, lang);
        return;
      }

      if (text.startsWith("/render") || text.startsWith("/generate")) {
        await runRender(stream, lang);
        return;
      }

      if (text.startsWith("/help")) {
        md(stream, helpText(lang));
        return;
      }

      // Default help
      md(stream, helpText(lang));
    }
  );

  // ----------------------------------------------------------
  // Followups / Buttons
  // ----------------------------------------------------------
  participant.followupProvider = {
    provideFollowups: async (_result, _context, _token) => {
      const { answers, company } = await loadState();
      const lang = getLang(company);
      const wizard = ensureWizard(answers);

      const base: vscode.ChatFollowup[] = [
        buildFollowup(
          lang === "pt-br" ? "Iniciar /intake" : "Start /intake",
          `/intake`
        ),
        buildFollowup(
          lang === "pt-br" ? "Gerar docs" : "Generate docs",
          `/render`
        ),
        buildFollowup(lang === "pt-br" ? "Ajuda" : "Help", `/help`),
      ];

      // Reset prompt
      if (wizard.pending_reset_prompt) {
        return lang === "pt-br"
          ? [
              buildFollowup("CONTINUAR", "CONTINUAR"),
              buildFollowup("RESETAR", "RESETAR"),
              buildFollowup("SAIR", "SAIR"),
              ...base,
            ]
          : [
              buildFollowup("CONTINUE", "CONTINUE"),
              buildFollowup("RESET", "RESET"),
              buildFollowup("EXIT", "EXIT"),
              ...base,
            ];
      }

      // Stage selector
      if (wizard.awaiting_stage_choice) {
        return lang === "pt-br"
          ? [
              buildFollowup("APROFUNDAR (recomendado)", "APROFUNDAR"),
              buildFollowup("GERAR DOCS", "GERAR_DOCS"),
              buildFollowup("SAIR", "SAIR"),
              ...base,
            ]
          : [
              buildFollowup("DEEPEN (recommended)", "DEEPEN"),
              buildFollowup("GENERATE DOCS", "GENERATE_DOCS"),
              buildFollowup("EXIT", "EXIT"),
              ...base,
            ];
      }

      // Awaiting a question ? show options + AI actions
      if (wizard.awaiting_answer_for && wizard.last_question) {
        const q = wizard.last_question;
        const actions: vscode.ChatFollowup[] =
          lang === "pt-br"
            ? [
                buildFollowup("EXPLICAR", "EXPLICAR"),
                buildFollowup("REFORMULAR", "REFORMULAR"),
                buildFollowup("SUGERIR", "SUGERIR"),
              ]
            : [
                buildFollowup("EXPLAIN", "EXPLICAR"),
                buildFollowup("REFRAME", "REFORMULAR"),
                buildFollowup("SUGGEST", "SUGERIR"),
              ];

        if (q.type === "enum" && q.options?.length) {
          const opts = q.options
            .slice(0, 10)
            .map((o) => buildFollowup(o.label[lang], `${o.value}`));
          const backLabel =
            lang === "pt-br" ? "VOLTAR (refazer)" : "BACK (re-answer)";
          return [
            ...opts,
            buildFollowup(backLabel, lang === "pt-br" ? "VOLTAR" : "BACK"),
            ...actions,
            ...base,
          ];
        }

        if (q.type === "multiselect" && q.options?.length) {
          const first = q.options[0]?.value;
          const second = q.options[1]?.value;
          const third = q.options[2]?.value;

          const suggestions: vscode.ChatFollowup[] = [];
          if (first) suggestions.push(buildFollowup(`${first}`, `${first}`));
          if (first && second)
            suggestions.push(
              buildFollowup(`${first}, ${second}`, `${first}, ${second}`)
            );
          if (first && second && third)
            suggestions.push(
              buildFollowup(
                `${first}, ${second}, ${third}`,
                `${first}, ${second}, ${third}`
              )
            );

          const backLabel =
            lang === "pt-br" ? "VOLTAR (refazer)" : "BACK (re-answer)";
          return [
            ...suggestions,
            buildFollowup(backLabel, lang === "pt-br" ? "VOLTAR" : "BACK"),
            ...actions,
            ...base,
          ];
        }

        const backLabel =
          lang === "pt-br" ? "VOLTAR (refazer)" : "BACK (re-answer)";
        return [
          buildFollowup(backLabel, lang === "pt-br" ? "VOLTAR" : "BACK"),
          ...actions,
          ...base,
        ];
      }

      return base;
    },
  };

  context.subscriptions.push(participant);
}

// -----------------------------
// /render action
// -----------------------------

async function runRender(stream: any, lang: "pt-br" | "en") {
  md(
    stream,
    lang === "pt-br"
      ? "⏳ Gerando docs agora...\n\n"
      : "⏳ Generating docs now...\n\n"
  );

  try {
    await vscode.commands.executeCommand("businessops.generateDocs");
    md(
      stream,
      lang === "pt-br"
        ? "✅ Comando disparado! Veja o terminal **BusinessOps Generate**.\n"
        : "✅ Command started! Check the **BusinessOps Generate** terminal.\n"
    );
  } catch (err: any) {
    md(
      stream,
      lang === "pt-br"
        ? `❌ Falha ao disparar geração: ${err?.message || String(err)}\n`
        : `❌ Failed to start generation: ${err?.message || String(err)}\n`
    );
  }
}

// -----------------------------
// Stage selector (after intake)
// -----------------------------

async function askStageSelector(
  stream: any,
  lang: "pt-br" | "en",
  answers: any
) {
  const wizard = ensureWizard(answers);
  wizard.awaiting_stage_choice = true;
  await saveWizardOnly(answers);

  md(
    stream,
    lang === "pt-br"
      ? "✅ Intake básico completo.\n\n**Quer aprofundar agora?**\n\n- `APROFUNDAR` → diagnóstico e especialistas (recomendado)\n- `GERAR_DOCS` → gerar docs básicas agora\n- `SAIR` → encerrar por aqui\n\n_Responda com o valor exato ou clique em uma opção._\n"
      : "✅ Basic intake complete.\n\n**Do you want to deepen now?**\n\n- `DEEPEN` → specialists & diagnostic (recommended)\n- `GENERATE_DOCS` → generate basic docs now\n- `EXIT` → stop here\n\n_Reply with exact value or click an option._\n"
  );
}

async function handleStageChoice(
  text: string,
  stream: any,
  lang: "pt-br" | "en",
  answers: any,
  company: any
) {
  const wizard = ensureWizard(answers);
  const v = upper(text);

  wizard.awaiting_stage_choice = false;
  await saveWizardOnly(answers);

  if (lang === "pt-br") {
    if (v === "SAIR") {
      md(
        stream,
        "Ok — encerrando por aqui. Quando quiser continuar, use `/intake`.\n"
      );
      return;
    }
    if (v === "GERAR_DOCS") {
      await runRender(stream, lang);
      return;
    }
    if (v === "APROFUNDAR") {
      md(stream, "👍 Beleza — vamos aprofundar agora.\n\n");
      await refreshWizardQueueAdvanced(answers, company);
      await saveWizardOnly(answers);
      await askNext(stream, lang);
      return;
    }

    md(stream, "⚠️ Resposta inválida. Use: APROFUNDAR / GERAR_DOCS / SAIR\n\n");
    await askStageSelector(stream, lang, answers);
    return;
  }

  // EN
  if (v === "EXIT") {
    md(stream, "Ok — stopping here. Run `/intake` anytime to continue.\n");
    return;
  }
  if (v === "GENERATE_DOCS") {
    await runRender(stream, lang);
    return;
  }
  if (v === "DEEPEN") {
    md(stream, "👍 Great — starting deep intake now.\n\n");
    await refreshWizardQueueAdvanced(answers, company);
    await saveWizardOnly(answers);
    await askNext(stream, lang);
    return;
  }

  md(stream, "⚠️ Invalid. Use: DEEPEN / GENERATE_DOCS / EXIT\n\n");
  await askStageSelector(stream, lang, answers);
}

// -----------------------------
// AI assist actions
// -----------------------------

async function handleAiAssistAction(
  action: "EXPLICAR" | "REFORMULAR" | "SUGERIR",
  stream: any,
  lang: "pt-br" | "en",
  answers: any,
  company: any
) {
  const wizard = ensureWizard(answers);
  const q = wizard.last_question;
  if (!q) return;

  const helpLog = ensureHelpLog(wizard);

  // Use VS Code Language Model API with fallback to templates
  const output = await handleAiAction(action, {
    question: q,
    lang,
    answers: answers?.answers || {},
    company,
  });


  helpLog.push({
    question_id: q.id,
    action,
    at: new Date().toISOString(),
    output,
  });

  await saveWizardOnly(answers);

  md(stream, output + "\n\n");

  // Liste sugest�es de IA junto das demais op��es para facilitar a escolha.
  const baseSuggestions = buildAutoSuggestions(q, answers, lang);
  const aiSuggestions =
    action === "SUGERIR"
      ? Array.from(new Set([...baseSuggestions, ...extractSuggestions(output)]))
      : baseSuggestions;

  await renderQuestion(stream, q, lang, aiSuggestions);
}

function explainQuestion(q: Question, lang: "pt-br" | "en") {
  if (q.type === "text") {
    return lang === "pt-br"
      ? `💡 **Explicação**: responda com texto livre. Use \`SKIP\` se não quiser responder agora.`
      : `💡 **Explanation**: reply with free text. Use \`SKIP\` to skip for now.`;
  }

  if (q.type === "enum" || q.type === "multiselect") {
    const opts = (q.options || [])
      .map((o) => `- \`${o.value}\` → ${o.label[lang]}`)
      .join("\n");
    return lang === "pt-br"
      ? `💡 **Explicação**: escolha uma das opções abaixo.\n\n${opts}\n\nDica: você pode clicar em uma opção sugerida.`
      : `💡 **Explanation**: choose one of the options below.\n\n${opts}\n\nTip: you can click a suggested option.`;
  }

  return lang === "pt-br"
    ? "💡 Explicação indisponível."
    : "💡 Explanation unavailable.";
}

function reframeQuestion(q: Question, lang: "pt-br" | "en") {
  return lang === "pt-br"
    ? `🔄 **Reformulação**: ${q.text["pt-br"]}\n\n_(Se quiser, posso adaptar a pergunta ao seu contexto com mais detalhes.)_`
    : `🔄 **Reframed**: ${q.text["en"]}\n\n_(If you want, I can tailor the question further based on your context.)_`;
}

function suggestAnswer(q: Question, answers: any, lang: "pt-br" | "en") {
  // very lightweight heuristic suggestions
  if (q.id === "country_mode")
    return lang === "pt-br" ? "💡 Sugestão: **BR**" : "💡 Suggestion: **BR**";
  if (q.id === "language_preference")
    return lang === "pt-br"
      ? "💡 Sugestão: **BILINGUAL**"
      : "💡 Suggestion: **BILINGUAL**";
  if (q.id === "industry_pack")
    return lang === "pt-br"
      ? "💡 Sugestão: **health-import**"
      : "💡 Suggestion: **health-import**";
  if (q.id === "compliance.product_registration")
    return lang === "pt-br"
      ? "💡 Sugestão: **MIXED**"
      : "💡 Suggestion: **MIXED**";

  // fallback: propose a generic "custom" answer users can accept
  return lang === "pt-br"
    ? "💡 Sugestão: **CUSTOM** — descreva com suas palavras."
    : "💡 Suggestion: **CUSTOM** — describe it in your own words.";
}

// -----------------------------
// Intake flow
// -----------------------------

async function handleBack(stream: any, lang: "pt-br" | "en") {
  const { answers, company } = await loadState();
  const wizard = ensureWizard(answers);

  if (!wizard.asked || wizard.asked.length === 0) {
    md(
      stream,
      lang === "pt-br"
        ? "Nenhuma pergunta anterior para voltar.\n\n"
        : "No previous question to go back to.\n\n"
    );
    return;
  }

  const lastId = wizard.asked.pop()!;
  const q = await findQuestionById(lastId, answers, company);

  if (!q) {
    md(
      stream,
      lang === "pt-br"
        ? "Não encontrei a pergunta anterior.\n\n"
        : "Could not find the previous question.\n\n"
    );
    await saveWizardOnly(answers);
    return;
  }

  // remove previous answer (only in answers.yaml scope)
  if (q.save_to?.answers) {
    deleteAtPath(answers.answers || {}, q.save_to.answers);
  }

  wizard.awaiting_answer_for = q.id;
  wizard.current_question_id = q.id;
  wizard.last_question = q;
  wizard.completed = false;
  wizard.completed_at = null;
  wizard.awaiting_stage_choice = false;

  await saveWizardOnly(answers);

  const aiSuggestions = buildAutoSuggestions(q, answers, lang);
  md(
    stream,
    lang === "pt-br"
      ? "↩️ Voltando para a pergunta anterior.\n\n"
      : "↩️ Going back to the previous question.\n\n"
  );
  await renderQuestion(stream, q, lang, aiSuggestions);
}

async function askNext(stream: any, lang: "pt-br" | "en") {
  const { answers, company } = await loadState();
  const wizard = ensureWizard(answers);

  await refreshWizardQueue(answers, company);
  await saveWizardOnly(answers);

  const q = getNextDynamicQuestion(answers);

  if (!q) {
    wizard.completed = true;
    wizard.completed_at = new Date().toISOString().slice(0, 10);
    await saveWizardOnly(answers);

    // Stage selector instead of ending
    await askStageSelector(stream, lang, answers);
    return;
  }

  wizard.current_question_id = q.id;
  wizard.awaiting_answer_for = q.id;
  wizard.last_question = q;

  await saveWizardOnly(answers);
  const aiSuggestions = buildAutoSuggestions(q, answers, lang);
  await renderQuestion(stream, q, lang, aiSuggestions);
}

function extractSuggestions(output: string): string[] {
  const boldMatches = Array.from(output.matchAll(/\*\*([^*]+)\*\*/g))
    .map((m) => m[1].trim())
    .filter(Boolean);
  if (boldMatches.length > 0) return boldMatches;

  const lines = output
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const suggestions: string[] = [];

  for (const line of lines) {
    const cleaned = line.replace(/^[-•]\s*/, "");
    if (/sugest/i.test(cleaned) || /suggest/i.test(cleaned)) {
      const parts = cleaned.split(":");
      if (parts.length > 1) {
        suggestions.push(parts.slice(1).join(":").trim());
        continue;
      }
    }
    suggestions.push(cleaned);
  }

  return suggestions;
}

function buildAutoSuggestions(q: Question, answers: any, lang: "pt-br" | "en") {
  const suggestionText = suggestAnswer(q, answers, lang);
  return extractSuggestions(suggestionText);
}

async function findQuestionById(
  id: string,
  answers: any,
  company: any
): Promise<Question | null> {
  try {
    const core = await loadCoreWorkflow();
    const ctx = buildContext(answers, company);
    const specialists = [...opsSpecialist(ctx), ...complianceSpecialist(ctx)];
    const all = [...(core.questions || []), ...specialists];
    return all.find((q) => q.id === id) ?? null;
  } catch (err) {
    console.error("[businessops] findQuestionById failed", err);
    return null;
  }
}

async function renderQuestion(
  stream: any,
  q: Question,
  lang: "pt-br" | "en",
  aiSuggestions: string[] = []
) {
  md(stream, `### ${q.text[lang]}\n`);

  const isText = q.type === "text";
  const isEnum = q.type === "enum";
  const isMulti = q.type === "multiselect";

  if (isText) {
    const placeholder = q.placeholder?.[lang]
      ? `\n_${q.placeholder[lang]}_\n`
      : "\n";
    md(stream, placeholder);

    const sk = q.options?.find((o) => o.value === "SKIP");
    if (sk) md(stream, `- \`${sk.value}\` → ${sk.label[lang]}\n`);

    md(
      stream,
      lang === "pt-br"
        ? "\n_Responda com texto (ou `SKIP`)._\n"
        : "\n_Reply with text (or `SKIP`)._\n"
    );
    return;
  }

  if (aiSuggestions.length > 0) {
    md(
      stream,
      lang === "pt-br"
        ? "_Sugestões da IA (você pode escolher qualquer uma ou outra opção):_\n"
        : "_AI suggestions (you can pick any of these or another option):_\n"
    );
    for (const s of aiSuggestions) {
      md(stream, `- ${s}\n`);
    }
    md(stream, "\n");
  }

  md(
    stream,
    lang === "pt-br"
      ? "_Clique numa opção ou responda com o valor exato._\n\n"
      : "_Click an option or reply with the exact value._\n\n"
  );

  for (const opt of q.options || []) {
    md(stream, `- \`${opt.value}\` → ${opt.label[lang]}\n`);
  }

  if (isEnum)
    md(
      stream,
      lang === "pt-br"
        ? "\n_Responda com um único valor._\n"
        : "\n_Reply with a single value._\n"
    );
  if (isMulti) {
    md(
      stream,
      lang === "pt-br"
        ? "\n_Responda com valores separados por vírgula (ex: `ACCOUNTING, CUSTOMS`)._\n"
        : "\n_Reply with comma-separated values (e.g., `ACCOUNTING, CUSTOMS`)._\n"
    );
  }
}

// -----------------------------
// Answer handling (same as current)
// -----------------------------

async function handleQuestionAnswer(
  text: string,
  stream: any,
  lang: "pt-br" | "en"
): Promise<boolean> {
  text = sanitizeUserInput(text);

  const { answers } = await loadState();
  const wizard = ensureWizard(answers);

  const qId = wizard.awaiting_answer_for;
  if (!qId) return false;

  const lastQ = wizard.last_question || null;

  if (!lastQ || lastQ.id !== qId) {
    md(
      stream,
      lang === "pt-br"
        ? "⚠️ Não consegui recuperar a pergunta anterior. Rode `/intake` novamente.\n"
        : "⚠️ I couldn't recover the previous question. Run `/intake` again.\n"
    );
    wizard.awaiting_answer_for = null;
    wizard.current_question_id = null;
    wizard.last_question = null;
    await saveWizardOnly(answers);
    return false;
  }

  const aiSuggestions = buildAutoSuggestions(lastQ, answers, lang);
  const ok = validateAnswer(lastQ, text, aiSuggestions);
  if (!ok.valid) {
    md(
      stream,
      lang === "pt-br" ? `❌ ${ok.messagePt}\n\n` : `❌ ${ok.messageEn}\n\n`
    );
    await renderQuestion(stream, lastQ, lang, aiSuggestions);
    return false;
  }

  const normalized = normalizeAnswer(lastQ, text, aiSuggestions);
  await saveDynamicAnswer(lastQ, normalized);

  markAsked(wizard, lastQ.id);
  wizard.last_question = null;

  await saveWizardOnly(answers);

  md(
    stream,
    lang === "pt-br"
      ? `✅ Perfeito — anotei: **${lastQ.id} = ${
          Array.isArray(normalized) ? normalized.join(", ") : normalized
        }**\n\n`
      : `✅ Saved: **${lastQ.id} = ${
          Array.isArray(normalized) ? normalized.join(", ") : normalized
        }**\n\n`
  );

  return true;
}

function validateAnswer(
  q: Question,
  raw: string,
  aiSuggestions: string[] = []
): { valid: boolean; messagePt: string; messageEn: string } {
  const v = norm(raw);

  if (q.type === "text") {
    if (!v)
      return {
        valid: false,
        messagePt: "Resposta vazia. Escreva texto ou `SKIP`.",
        messageEn: "Empty response. Write text or `SKIP`.",
      };
    return { valid: true, messagePt: "", messageEn: "" };
  }

  const options = new Set((q.options || []).map((o) => o.value.toLowerCase()));
  const aiSet = new Set(aiSuggestions.map((s) => s.toLowerCase()));

  if (q.type === "enum") {
    if (!options.has(v.toLowerCase()) && !aiSet.has(v.toLowerCase())) {
      return {
        valid: false,
        messagePt: `Resposta inválida. Use: ${(q.options || [])
          .map((o) => o.value)
          .join(" / ")}`,
        messageEn: `Invalid. Use: ${(q.options || [])
          .map((o) => o.value)
          .join(" / ")}`,
      };
    }
    return { valid: true, messagePt: "", messageEn: "" };
  }

  if (q.type === "multiselect") {
    const parts = v
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) {
      return {
        valid: false,
        messagePt: "Resposta vazia. Use valores separados por vírgula.",
        messageEn: "Empty response. Use comma-separated values.",
      };
    }
    for (const p of parts) {
      if (!options.has(p.toLowerCase()) && !aiSet.has(p.toLowerCase())) {
        return {
          valid: false,
          messagePt: `Opção inválida: ${p}. Use: ${(q.options || [])
            .map((o) => o.value)
            .join(", ")}`,
          messageEn: `Invalid option: ${p}. Use: ${(q.options || [])
            .map((o) => o.value)
            .join(", ")}`,
        };
      }
    }
    return { valid: true, messagePt: "", messageEn: "" };
  }

  return {
    valid: false,
    messagePt: "Tipo inválido.",
    messageEn: "Invalid type.",
  };
}

function normalizeAnswer(
  q: Question,
  raw: string,
  aiSuggestions: string[] = []
): any {
  const v = norm(raw);

  if (q.type === "text") {
    if (upper(v) === "SKIP") return "SKIP";
    return v;
  }

  if (q.type === "enum") {
    const rawLower = v.toLowerCase();
    const opt = (q.options || []).find(
      (o) => o.value.toLowerCase() === rawLower
    );
    if (opt) return opt.value;

    const ai = aiSuggestions.find((s) => s.toLowerCase() === rawLower);
    if (ai) return ai;

    return v;
  }

  if (q.type === "multiselect") {
    const parts = v
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const normalized: string[] = [];

    for (const part of parts) {
      const partLower = part.toLowerCase();
      const opt = (q.options || []).find(
        (o) => o.value.toLowerCase() === partLower
      );
      if (opt) {
        normalized.push(opt.value);
        continue;
      }

      const ai = aiSuggestions.find((s) => s.toLowerCase() === partLower);
      if (ai) {
        normalized.push(ai);
        continue;
      }

      normalized.push(part);
    }

    return normalized;
  }

  return v;
}

// -----------------------------
// Reset / Continue / Exit
// -----------------------------

async function askResetContinueExit(stream: any, lang: "pt-br" | "en") {
  md(
    stream,
    lang === "pt-br"
      ? `Encontrei respostas existentes. O que você quer fazer?\n\n- \`CONTINUAR\` → continuar\n- \`RESETAR\` → apagar e começar\n- \`SAIR\` → sair\n\n_Responda com o valor exato._\n\n💡 Dica: clique em uma opção sugerida.\n`
      : `I found existing answers. What do you want to do?\n\n- \`CONTINUE\` → keep\n- \`RESET\` → clear\n- \`EXIT\` → exit\n\n_Reply with exact value._\n\n💡 Tip: click a suggestion.\n`
  );
}

async function handleResetChoice(
  text: string,
  stream: any,
  lang: "pt-br" | "en",
  answers: any
) {
  text = sanitizeUserInput(text);

  const wizard = ensureWizard(answers);
  const v = upper(text);

  const CONTINUE = lang === "pt-br" ? "CONTINUAR" : "CONTINUE";
  const RESET = lang === "pt-br" ? "RESETAR" : "RESET";
  const EXIT = lang === "pt-br" ? "SAIR" : "EXIT";

  if (v === EXIT) {
    wizard.pending_reset_prompt = false;
    wizard.awaiting_answer_for = null;
    wizard.current_question_id = null;
    wizard.last_question = null;
    wizard.awaiting_stage_choice = false;
    await saveWizardOnly(answers);
    md(stream, lang === "pt-br" ? "Ok — saindo.\n" : "Ok — exiting.\n");
    return;
  }

  if (v === RESET) {
    answers.answers = {};
    answers.wizard = {
      workflow_id: "businessops_wizard",
      version: 0.1,
      mode: "robust",
      dynamic_enabled: true,
      queue: [],
      asked: [],
      help_events: [],
      pending_reset_prompt: false,
      current_question_id: null,
      awaiting_answer_for: null,
      last_question: null,
      awaiting_stage_choice: false,
      completed: false,
      completed_at: null,
    };

    await saveWizardOnly(answers);
    md(
      stream,
      lang === "pt-br"
        ? "✅ Reset feito. Vamos começar do zero.\n\n"
        : "✅ Reset done. Starting fresh.\n\n"
    );
    await askNext(stream, lang);
    return;
  }

  if (v === CONTINUE) {
    wizard.pending_reset_prompt = false;
    wizard.awaiting_answer_for = null;
    wizard.current_question_id = null;
    wizard.last_question = null;
    wizard.awaiting_stage_choice = false;
    await saveWizardOnly(answers);
    md(
      stream,
      lang === "pt-br" ? "✅ Ok — continuando.\n\n" : "✅ Ok — continuing.\n\n"
    );
    await askNext(stream, lang);
    return;
  }

  md(
    stream,
    lang === "pt-br"
      ? `⚠️ Resposta inválida. Use: **${CONTINUE} / ${RESET} / ${EXIT}**\n\n`
      : `⚠️ Invalid. Use: **${CONTINUE} / ${RESET} / ${EXIT}**\n\n`
  );

  await askResetContinueExit(stream, lang);
}

// -----------------------------
// Help
// -----------------------------

function helpText(lang: "pt-br" | "en") {
  if (lang === "pt-br") {
    return `Olá! Eu sou o **@BusinessOps**.\n\nComandos:\n- \`/intake\` → intake básico (1 pergunta por vez)\n- \`/render\` → gerar docs\n- \`/help\` → ajuda\n\nDurante perguntas você pode usar: \`EXPLICAR\`, \`REFORMULAR\`, \`SUGERIR\`.\n`;
  }
  return `Hi! I'm **@BusinessOps**.\n\nCommands:\n- \`/intake\` → basic intake (one question at a time)\n- \`/render\` → generate docs\n- \`/help\` → help\n\nDuring questions you can use: \`EXPLICAR\`, \`REFORMULAR\`, \`SUGERIR\`.\n`;
}

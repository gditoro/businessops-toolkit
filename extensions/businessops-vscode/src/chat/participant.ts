import * as vscode from "vscode";
import { loadState } from "./intakeFlow";
import { Question } from "./schema";
import { ensureWizard, markAsked } from "./stateQueue";
import { refreshWizardQueue, getNextDynamicQuestion } from "./orchestrator";
import { saveDynamicAnswer } from "./saveDynamic";
import { writeYaml } from "../state/yaml";

// -----------------------------
// Helpers
// -----------------------------

function md(stream: any, content: string) {
  if (typeof stream.markdown === "function") return stream.markdown(content);
  if (typeof stream.appendMarkdown === "function") return stream.appendMarkdown(content);
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
  // remove leading "@BusinessOps" or "@businessops" (once or multiple times)
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

      // ----------------------------------------------------------------
      // Priority 1 — reset prompt has absolute priority
      // ----------------------------------------------------------------
      if (!isCommand(text) && wizard.pending_reset_prompt) {
        await handleResetChoice(text, stream, lang, answers);
        return;
      }

      // ----------------------------------------------------------------
      // Priority 2 — awaiting answer for last asked question
      // ----------------------------------------------------------------
      if (!isCommand(text) && wizard.awaiting_answer_for) {
        const ok = await handleQuestionAnswer(text, stream, lang);
        if (!ok) return; // invalid → do not advance
        await askNext(stream, lang);
        return;
      }

      // ----------------------------------------------------------------
      // Commands
      // ----------------------------------------------------------------
      if (text.startsWith("/intake")) {
        // Treat completed wizard as existing state too
        if (hasAnyAnswers(answers) || wizard.completed) {
          wizard.pending_reset_prompt = true;
          wizard.awaiting_answer_for = null;
          wizard.current_question_id = null;
          wizard.last_question = null;
          await saveWizardOnly(answers);
          await askResetContinueExit(stream, lang);
          return;
        }

        // fresh start
        wizard.pending_reset_prompt = false;
        wizard.awaiting_answer_for = null;
        wizard.current_question_id = null;
        wizard.last_question = null;
        wizard.completed = false;
        wizard.completed_at = null;

        await saveWizardOnly(answers);
        await askNext(stream, lang);
        return;
      }

      if (text.startsWith("/render") || text.startsWith("/generate")) {
        md(
          stream,
          lang === "pt-br"
            ? "✅ Para gerar docs agora, use **BusinessOps: Generate Docs** (Command Palette) ou rode `npm run bo:generate`.\n"
            : "✅ To generate docs, use **BusinessOps: Generate Docs** (Command Palette) or run `npm run bo:generate`.\n"
        );
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
  // Followups (Buttons / Quick Replies)
  // IMPORTANT: do NOT include "@BusinessOps" here
  // VS Code will route the followup to the active participant.
  // ----------------------------------------------------------
  participant.followupProvider = {
    provideFollowups: async (_result, _context, _token) => {
      const { answers, company } = await loadState();
      const lang = getLang(company);
      const wizard = ensureWizard(answers);

      // Global always-on followups
      const base: vscode.ChatFollowup[] = [
        buildFollowup(lang === "pt-br" ? "Iniciar /intake" : "Start /intake", `/intake`),
        buildFollowup(lang === "pt-br" ? "Gerar docs (/render)" : "Generate docs (/render)", `/render`),
        buildFollowup(lang === "pt-br" ? "Ajuda" : "Help", `/help`)
      ];

      // Reset prompt followups
      if (wizard.pending_reset_prompt) {
        if (lang === "pt-br") {
          return [
            buildFollowup("CONTINUAR", `CONTINUAR`),
            buildFollowup("RESETAR", `RESETAR`),
            buildFollowup("SAIR", `SAIR`),
            ...base
          ];
        }
        return [
          buildFollowup("CONTINUE", `CONTINUE`),
          buildFollowup("RESET", `RESET`),
          buildFollowup("EXIT", `EXIT`),
          ...base
        ];
      }

      // If awaiting a question answer, provide option buttons for enum questions
      if (wizard.awaiting_answer_for && wizard.last_question) {
        const q = wizard.last_question;

        if (q.type === "enum" && q.options?.length) {
          const opts = q.options.slice(0, 10).map(o =>
            buildFollowup(o.label[lang], `${o.value}`)
          );
          return [...opts, ...base];
        }

        if (q.type === "multiselect" && q.options?.length) {
          // Provide a few useful examples
          const first = q.options[0]?.value;
          const second = q.options[1]?.value;
          const third = q.options[2]?.value;

          const suggestions: vscode.ChatFollowup[] = [];
          if (first) suggestions.push(buildFollowup(`${first}`, `${first}`));
          if (first && second) suggestions.push(buildFollowup(`${first}, ${second}`, `${first}, ${second}`));
          if (first && second && third) suggestions.push(buildFollowup(`${first}, ${second}, ${third}`, `${first}, ${second}, ${third}`));

          return [...suggestions, ...base];
        }

        return base;
      }

      return base;
    }
  };

  context.subscriptions.push(participant);
}

// -----------------------------
// Intake flow — queue-driven
// -----------------------------

async function askNext(stream: any, lang: "pt-br" | "en") {
  const { answers, company } = await loadState();
  const wizard = ensureWizard(answers);

  // 1) Refresh queue
  await refreshWizardQueue(answers, company);
  await saveWizardOnly(answers);

  // 2) Get next question
  const q = getNextDynamicQuestion(answers);

  if (!q) {
    wizard.completed = true;
    wizard.completed_at = new Date().toISOString().slice(0, 10);
    await saveWizardOnly(answers);

    md(
      stream,
      lang === "pt-br"
        ? "✅ Intake completo! Agora rode `/render` para gerar docs.\n"
        : "✅ Intake complete! Now run `/render` to generate docs.\n"
    );
    return;
  }

  wizard.current_question_id = q.id;
  wizard.awaiting_answer_for = q.id;
  wizard.last_question = q;

  await saveWizardOnly(answers);
  await renderQuestion(stream, q, lang);
}

async function renderQuestion(stream: any, q: Question, lang: "pt-br" | "en") {
  md(stream, `### ${q.text[lang]}\n`);

  const isText = q.type === "text";
  const isEnum = q.type === "enum";
  const isMulti = q.type === "multiselect";

  if (isText) {
    const placeholder = q.placeholder?.[lang] ? `\n_${q.placeholder[lang]}_\n` : "\n";
    md(stream, placeholder);

    const sk = q.options?.find(o => o.value === "SKIP");
    if (sk) md(stream, `- \`${sk.value}\` — ${sk.label[lang]}\n`);

    md(stream, lang === "pt-br" ? "\n_Responda com texto (ou `SKIP`)._\n" : "\n_Reply with text (or `SKIP`)._\n");
    return;
  }

  md(stream, lang === "pt-br" ? "_Clique numa opção ou responda com o valor exato._\n\n" : "_Click an option or reply with the exact value._\n\n");

  for (const opt of q.options || []) {
    md(stream, `- \`${opt.value}\` — ${opt.label[lang]}\n`);
  }

  if (isEnum) md(stream, lang === "pt-br" ? "\n_Responda com um único valor._\n" : "\n_Reply with a single value._\n");
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
// Answer handling
// -----------------------------

async function handleQuestionAnswer(text: string, stream: any, lang: "pt-br" | "en"): Promise<boolean> {
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
        ? "⚠️ Não consegui recuperar a pergunta anterior (estado inconsistente). Rode `/intake` novamente.\n"
        : "⚠️ I couldn't recover the previous question (state mismatch). Run `/intake` again.\n"
    );
    wizard.awaiting_answer_for = null;
    wizard.current_question_id = null;
    wizard.last_question = null;
    await saveWizardOnly(answers);
    return false;
  }

  const ok = validateAnswer(lastQ, text);
  if (!ok.valid) {
    md(stream, lang === "pt-br" ? `❌ ${ok.messagePt}\n\n` : `❌ ${ok.messageEn}\n\n`);
    await renderQuestion(stream, lastQ, lang);
    return false;
  }

  const normalized = normalizeAnswer(lastQ, text, lang);
  await saveDynamicAnswer(lastQ, normalized);

  markAsked(wizard, lastQ.id);
  wizard.last_question = null;

  await saveWizardOnly(answers);

  md(
    stream,
    lang === "pt-br"
      ? `✅ Perfeito — anotei: **${lastQ.id} = ${Array.isArray(normalized) ? normalized.join(", ") : normalized}**\n\n`
      : `✅ Saved: **${lastQ.id} = ${Array.isArray(normalized) ? normalized.join(", ") : normalized}**\n\n`
  );

  return true;
}

function validateAnswer(q: Question, raw: string): { valid: boolean; messagePt: string; messageEn: string } {
  const v = norm(raw);

  if (q.type === "text") {
    if (!v) return { valid: false, messagePt: "Resposta vazia. Escreva texto ou `SKIP`.", messageEn: "Empty response. Write text or `SKIP`." };
    const max = q.validation?.maxLength;
    if (max && v.length > max) return { valid: false, messagePt: `Texto muito longo (máx ${max}).`, messageEn: `Text too long (max ${max}).` };
    return { valid: true, messagePt: "", messageEn: "" };
  }

  const options = new Set((q.options || []).map(o => o.value.toLowerCase()));

  if (q.type === "enum") {
    if (!options.has(v.toLowerCase())) {
      return {
        valid: false,
        messagePt: `Resposta inválida. Use uma das opções: ${(q.options || []).map(o => o.value).join(" / ")}`,
        messageEn: `Invalid. Use one of: ${(q.options || []).map(o => o.value).join(" / ")}`
      };
    }
    return { valid: true, messagePt: "", messageEn: "" };
  }

  if (q.type === "multiselect") {
    const parts = v.split(",").map(p => p.trim()).filter(Boolean);
    if (parts.length === 0) {
      return {
        valid: false,
        messagePt: "Resposta vazia. Use valores separados por vírgula.",
        messageEn: "Empty response. Use comma-separated values."
      };
    }
    for (const p of parts) {
      if (!options.has(p.toLowerCase())) {
        return {
          valid: false,
          messagePt: `Opção inválida: ${p}. Use: ${(q.options || []).map(o => o.value).join(", ")}`,
          messageEn: `Invalid option: ${p}. Use: ${(q.options || []).map(o => o.value).join(", ")}`
        };
      }
    }
    return { valid: true, messagePt: "", messageEn: "" };
  }

  return { valid: false, messagePt: "Tipo de pergunta inválido.", messageEn: "Invalid question type." };
}

function normalizeAnswer(q: Question, raw: string, lang: "pt-br" | "en"): any {
  const v = norm(raw);

  if (q.type === "text") {
    if (upper(v) === "SKIP") return "SKIP";
    return v;
  }

  // Preserve option.value casing and accept labels + natural text
  if (q.type === "enum") {
    const rawLower = v.toLowerCase();

    // match by option value
    let opt = (q.options || []).find(o => o.value.toLowerCase() === rawLower);
    if (opt) return opt.value;

    // match by label (pt-br/en)
    opt = (q.options || []).find(o =>
      (o.label?.["pt-br"] || "").toLowerCase() === rawLower ||
      (o.label?.["en"] || "").toLowerCase() === rawLower
    );
    if (opt) return opt.value;

    // simple heuristic mappings (useful for Brazil-specific wording)
    if (rawLower.includes("registro") && rawLower.includes("notifica")) return "UNKNOWN";
    if (rawLower.includes("registro")) return "REGISTRATION";
    if (rawLower.includes("notifica")) return "NOTIFICATION";

    return v;
  }

  if (q.type === "multiselect") {
    const parts = v.split(",").map(p => p.trim()).filter(Boolean);
    const normalized: string[] = [];

    for (const part of parts) {
      const partLower = part.toLowerCase();

      // match by value
      let opt = (q.options || []).find(o => o.value.toLowerCase() === partLower);
      if (opt) {
        normalized.push(opt.value);
        continue;
      }

      // match by label
      opt = (q.options || []).find(o =>
        (o.label?.["pt-br"] || "").toLowerCase() === partLower ||
        (o.label?.["en"] || "").toLowerCase() === partLower
      );
      if (opt) {
        normalized.push(opt.value);
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
  if (lang === "pt-br") {
    md(
      stream,
      `Encontrei respostas existentes. O que você quer fazer?\n\n- \`CONTINUAR\` — continuar com o que já existe\n- \`RESETAR\` — apagar e começar do zero\n- \`SAIR\` — sair agora\n\n_Responda com o valor exato._\n\n⚠️ Dica: clique em uma das opções sugeridas abaixo (ou responda com o valor exato).\n`
    );
  } else {
    md(
      stream,
      `I found existing answers. What do you want to do?\n\n- \`CONTINUE\` — keep existing\n- \`RESET\` — clear and start over\n- \`EXIT\` — exit\n\n_Reply with the exact value._\n\n⚠️ Tip: click one of the suggestions below (or reply with exact value).\n`
    );
  }
}

async function handleResetChoice(text: string, stream: any, lang: "pt-br" | "en", answers: any) {
  text = sanitizeUserInput(text);

  const wizard = ensureWizard(answers);
  const v = upper(text);

  const CONTINUE = lang === "pt-br" ? "CONTINUAR" : "CONTINUE";
  const RESET = lang === "pt-br" ? "RESETAR" : "RESET";
  const EXIT = lang === "pt-br" ? "SAIR" : "EXIT";

  // EXIT
  if (v === EXIT) {
    wizard.pending_reset_prompt = false;
    wizard.awaiting_answer_for = null;
    wizard.current_question_id = null;
    wizard.last_question = null;

    await saveWizardOnly(answers);
    md(stream, lang === "pt-br" ? "Ok — saindo do intake.\n" : "Ok — exiting intake.\n");
    return;
  }

  // RESET (HARD RESET)
  if (v === RESET) {
    answers.answers = {};

    answers.wizard = {
      workflow_id: "businessops_wizard",
      version: 0.1,
      mode: "robust",
      dynamic_enabled: true,

      queue: [],
      asked: [],

      pending_reset_prompt: false,
      current_question_id: null,
      awaiting_answer_for: null,
      last_question: null,

      completed: false,
      completed_at: null
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

  // CONTINUE
  if (v === CONTINUE) {
    wizard.pending_reset_prompt = false;
    wizard.awaiting_answer_for = null;
    wizard.current_question_id = null;
    wizard.last_question = null;

    await saveWizardOnly(answers);

    md(
      stream,
      lang === "pt-br"
        ? "✅ Ok — continuando com as respostas existentes.\n\n"
        : "✅ Ok — continuing with existing answers.\n\n"
    );

    await askNext(stream, lang);
    return;
  }

  // Invalid input
  md(
    stream,
    lang === "pt-br"
      ? `❌ Resposta inválida. Use exatamente: **${CONTINUE} / ${RESET} / ${EXIT}**\n`
      : `❌ Invalid. Use exactly: **${CONTINUE} / ${RESET} / ${EXIT}**\n`
  );

  await askResetContinueExit(stream, lang);
}

// -----------------------------
// Help
// -----------------------------

function helpText(lang: "pt-br" | "en") {
  if (lang === "pt-br") {
    return `Olá! Eu sou o **@BusinessOps**.\n\nComandos:\n- \`/intake\` — iniciar intake (1 pergunta por vez)\n- \`/render\` — gerar docs\n- \`/help\` — ajuda\n\nDica: use as sugestões/botões do chat sempre que possível.\n`;
  }
  return `Hi! I'm **@BusinessOps**.\n\nCommands:\n- \`/intake\` — start intake (one question at a time)\n- \`/render\` — generate docs\n- \`/help\` — help\n\nTip: use chat suggestions/buttons when possible.\n`;
}

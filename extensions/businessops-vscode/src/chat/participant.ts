import * as vscode from "vscode";
import { loadState, nextMissingStep, promptForStep, saveStep, IntakeStep } from "./intakeFlow";

// -----------------------------
// Helpers
// -----------------------------

type WizardMeta = {
  pending_reset_prompt?: boolean;
  awaiting_step?: IntakeStep | null;
};

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

function ensureWizard(answers: any): WizardMeta {
  if (!answers.wizard) {
    answers.wizard = { workflow_id: "businessops_wizard", version: 0.1, mode: "robust" };
  }
  return answers.wizard as WizardMeta;
}

function hasAnyAnswers(answers: any) {
  const a = answers?.answers || {};
  return Object.keys(a).length > 0;
}

function getLang(company: any): "pt-br" | "en" {
  const pref = company?.meta?.language_preference || "BILINGUAL";
  // If EN, speak EN; otherwise default to PT-BR.
  if (pref === "EN") return "en";
  return "pt-br";
}

function isCommand(input: string) {
  return norm(input).startsWith("/");
}

// Canonical values written to YAML (stable identifiers)
type Canonical =
  | "NEW"
  | "EXISTING"
  | "UNKNOWN"
  | "BR"
  | "GLOBAL"
  | "BILINGUAL"
  | "PT-BR"
  | "EN"
  | "industry-neutral"
  | "health-import"
  | "SKIP";

function mapLocalizedToCanonical(step: IntakeStep, input: string, lang: "pt-br" | "en"): Canonical | string {
  const v = upper(input);

  // For free text steps, return original
  if (step === "company_name" || step === "one_liner") {
    if (v === "SKIP" || (lang === "pt-br" && v === "PULAR")) return "SKIP";
    return norm(input);
  }

  // Reset prompt choices (not steps) handled elsewhere.

  // Localized synonyms to canonical:
  const map: Record<string, Canonical> = {
    // lifecycle
    "NEW": "NEW",
    "NOVA": "NEW",
    "NOVO": "NEW",

    "EXISTING": "EXISTING",
    "EXISTENTE": "EXISTING",
    "OPERANDO": "EXISTING",

    "UNKNOWN": "UNKNOWN",
    "NAO SEI": "UNKNOWN",
    "NÃO SEI": "UNKNOWN",
    "INDEFINIDO": "UNKNOWN",

    // country
    "BR": "BR",
    "BRAZIL": "BR",
    "BRASIL": "BR",

    "GLOBAL": "GLOBAL",
    "MUNDO": "GLOBAL",

    // language
    "BILINGUAL": "BILINGUAL",
    "BILÍNGUE": "BILINGUAL",
    "BILINGUE": "BILINGUAL",

    "PT-BR": "PT-BR",
    "PORTUGUES": "PT-BR",
    "PORTUGUÊS": "PT-BR",

    "EN": "EN",
    "ENGLISH": "EN",
    "INGLES": "EN",
    "INGLÊS": "EN",

    // packs
    "INDUSTRY-NEUTRAL": "industry-neutral",
    "NEUTRO": "industry-neutral",
    "PADRAO": "industry-neutral",
    "PADRÃO": "industry-neutral",

    "HEALTH-IMPORT": "health-import",
    "SAUDE-IMPORT": "health-import",
    "SAÚDE-IMPORT": "health-import",
    "IMPORTACAO-SAUDE": "health-import",
    "IMPORTAÇÃO-SAUDE": "health-import",

    // skip
    "SKIP": "SKIP",
    "PULAR": "SKIP"
  };

  return map[v] ?? (v as any);
}

function validForStep(step: IntakeStep, value: string, lang: "pt-br" | "en") {
  // canonical options derived from promptForStep (labels are canonical)
  const p = promptForStep(step, lang);
  const canonical = mapLocalizedToCanonical(step, value, lang);

  if (step === "company_name" || step === "one_liner") {
    return typeof canonical === "string" && canonical.length > 0;
  }

  return p.options.some(o => o.label.toUpperCase() === String(canonical).toUpperCase());
}

// -----------------------------
// Main registration
// -----------------------------

export function registerBusinessOpsChat(context: vscode.ExtensionContext) {
  const participant = vscode.chat.createChatParticipant(
    "businessops",
    async (request, chatContext, stream, token) => {
      const text = norm(request.prompt);

      const { answers, company } = await loadState();
      const lang = getLang(company);
      const wizard = ensureWizard(answers);

      // -------------------------
      // 1) Reset/Continue prompt has absolute priority
      // -------------------------
      if (!isCommand(text) && wizard.pending_reset_prompt) {
        await handleResetChoice(text, stream, lang, answers);
        return;
      }

      // -------------------------
      // 2) Answering a step (awaiting_step)
      // -------------------------
      if (!isCommand(text) && wizard.awaiting_step) {
        const ok = await handleStepAnswer(text, wizard.awaiting_step, stream, lang);
        if (!ok) return; // do NOT advance

        // clear awaiting
        wizard.awaiting_step = null;
        await saveWizardMetaOnly(answers);

        // ask next
        await askNext(stream, lang);
        return;
      }

      // -------------------------
      // 3) Commands
      // -------------------------
      if (text.startsWith("/intake")) {
        // If there are existing answers, ask reset/continue/exit first.
        if (hasAnyAnswers(answers)) {
          wizard.pending_reset_prompt = true;
          wizard.awaiting_step = null;
          await saveWizardMetaOnly(answers);
          await askResetContinueExit(stream, lang);
          return;
        }

        // Fresh start
        wizard.pending_reset_prompt = false;
        wizard.awaiting_step = null;
        await saveWizardMetaOnly(answers);
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

  context.subscriptions.push(participant);
}

// -----------------------------
// Reset / Continue / Exit
// -----------------------------

async function askResetContinueExit(stream: any, lang: "pt-br" | "en") {
  if (lang === "pt-br") {
    md(
      stream,
      `Encontrei respostas existentes. O que você quer fazer?\n\n- \`CONTINUAR\` — continuar com o que já existe\n- \`RESETAR\` — apagar e começar do zero\n- \`SAIR\` — sair agora\n\n_Responda com o valor exato._\n`
    );
  } else {
    md(
      stream,
      `I found existing answers. What do you want to do?\n\n- \`CONTINUE\` — keep existing\n- \`RESET\` — clear and start over\n- \`EXIT\` — exit\n\n_Reply with the exact value._\n`
    );
  }
}

async function handleResetChoice(text: string, stream: any, lang: "pt-br" | "en", answers: any) {
  const wizard = ensureWizard(answers);
  const v = upper(text);

  const CONTINUE = lang === "pt-br" ? "CONTINUAR" : "CONTINUE";
  const RESET = lang === "pt-br" ? "RESETAR" : "RESET";
  const EXIT = lang === "pt-br" ? "SAIR" : "EXIT";

  if (v === EXIT) {
    wizard.pending_reset_prompt = false;
    wizard.awaiting_step = null;
    await saveWizardMetaOnly(answers);
    md(stream, lang === "pt-br" ? "Ok — saindo do intake.\n" : "Ok — exiting intake.\n");
    return;
  }

  if (v === RESET) {
    // clear answers
    answers.answers = {};
    wizard.pending_reset_prompt = false;
    wizard.awaiting_step = null;
    await saveWizardMetaOnly(answers);

    md(stream, lang === "pt-br" ? "✅ Reset feito. Vamos começar do zero.\n\n" : "✅ Reset done. Starting fresh.\n\n");
    await askNext(stream, lang);
    return;
  }

  if (v === CONTINUE) {
    wizard.pending_reset_prompt = false;
    wizard.awaiting_step = null;
    await saveWizardMetaOnly(answers);

    md(stream, lang === "pt-br" ? "✅ Ok — continuando com as respostas existentes.\n\n" : "✅ Ok — continuing with existing answers.\n\n");
    await askNext(stream, lang);
    return;
  }

  // invalid
  md(
    stream,
    lang === "pt-br"
      ? `❌ Resposta inválida. Use exatamente: **${CONTINUE} / ${RESET} / ${EXIT}**\n`
      : `❌ Invalid response. Use exactly: **${CONTINUE} / ${RESET} / ${EXIT}**\n`
  );
  await askResetContinueExit(stream, lang);
}

// -----------------------------
// Intake flow
// -----------------------------

async function askNext(stream: any, lang: "pt-br" | "en") {
  const { answers } = await loadState();
  const wizard = ensureWizard(answers);

  const step = nextMissingStep(answers);

  if (!step) {
    md(
      stream,
      lang === "pt-br"
        ? "✅ Intake completo! Agora rode `/render` para gerar docs.\n"
        : "✅ Intake complete! Now run `/render` to generate docs.\n"
    );
    return;
  }

  await askStep(stream, lang, step, answers);
}

async function askStep(stream: any, lang: "pt-br" | "en", step: IntakeStep, answers: any) {
  const p = promptForStep(step, lang);

  md(stream, `### ${p.question}\n`);
  md(stream, lang === "pt-br" ? "_Clique numa opção ou responda com o valor exato._\n\n" : "_Click an option or reply with the exact value._\n\n");

  for (const opt of p.options) {
    // Show localized hints as well
    md(stream, `- \`${opt.label}\` — ${opt.detail}\n`);
  }

  const extraHints =
    lang === "pt-br"
      ? step === "lifecycle_mode"
        ? "\n_Dica: você também pode responder com `NOVO` / `EXISTENTE` / `NÃO SEI`._\n"
        : step === "language_preference"
          ? "\n_Dica: você pode responder com `BILÍNGUE` / `PORTUGUÊS` / `INGLÊS`._\n"
          : ""
      : "";

  md(stream, extraHints);

  // set awaiting step
  const wizard = ensureWizard(answers);
  wizard.awaiting_step = step;
  await saveWizardMetaOnly(answers);
}

async function handleStepAnswer(text: string, step: IntakeStep, stream: any, lang: "pt-br" | "en"): Promise<boolean> {
  const value = norm(text);

  if (!validForStep(step, value, lang)) {
    // invalid → re-ask same step, do not advance
    md(
      stream,
      lang === "pt-br"
        ? "❌ Resposta inválida. Por favor, escolha uma das opções listadas.\n\n"
        : "❌ Invalid answer. Please choose one of the listed options.\n\n"
    );

    const { answers } = await loadState();
    await askStep(stream, lang, step, answers);
    return false;
  }

  const canonicalOrText = mapLocalizedToCanonical(step, value, lang);

  // Persist canonical values to YAML for structured steps
  const stored =
    step === "company_name" || step === "one_liner"
      ? (canonicalOrText === "SKIP" ? "SKIP" : String(canonicalOrText))
      : String(canonicalOrText);

  await saveStep(step, stored);

  md(
    stream,
    lang === "pt-br"
      ? `✅ Perfeito — anotei: **${step} = ${stored}**\n\n`
      : `✅ Great — saved: **${step} = ${stored}**\n\n`
  );

  return true;
}

// -----------------------------
// Persistence (wizard meta only)
// -----------------------------

async function saveWizardMetaOnly(answers: any) {
  const { answersPath } = await loadState();
  const { writeYaml } = await import("../state/yaml");
  await writeYaml(answersPath, answers);
}

// -----------------------------
// Help
// -----------------------------

function helpText(lang: "pt-br" | "en") {
  if (lang === "pt-br") {
    return `Olá! Eu sou o **@businessops**.\n\nComandos:\n- \`/intake\` — iniciar intake (1 pergunta por vez)\n- \`/render\` — gerar docs\n- \`/help\` — ajuda\n\nDica: Responda com valores exatos (ex: \`NOVO\`, \`BR\`, \`BILÍNGUE\`).\n`;
  }
  return `Hi! I'm **@businessops**.\n\nCommands:\n- \`/intake\` — start intake (one question at a time)\n- \`/render\` — generate docs\n- \`/help\` — help\n\nTip: reply with exact values.\n`;
}

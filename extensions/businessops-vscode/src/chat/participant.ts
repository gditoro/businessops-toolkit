import * as vscode from "vscode";
import { loadState } from "./intakeFlow";
import { Question, validateQuestion } from "./schema";
import { ensureWizard, markAsked } from "./stateQueue";
import {
  refreshWizardQueue,
  refreshWizardQueueAdvanced,
  getNextDynamicQuestion,
  buildContext,
} from "./orchestrator";
import { saveDynamicAnswer, saveCustomData, getPendingCustomRequests, clearCustomRequest, CustomDataRequest } from "./saveDynamic";
import { writeYaml } from "../state/yaml";
import { WizardState } from "./types";
import { handleAiAction } from "./aiAssist";
import { loadCoreWorkflow } from "./yamlWorkflow";
import { opsSpecialist, generateOpsAnalysis, getOpsPrompt } from "./specialists/ops";
import { complianceSpecialist, generateComplianceAnalysis, getCompliancePrompt } from "./specialists/compliance";
import { financeSpecialist, generateFinanceAnalysis, getFinancePrompt } from "./specialists/finance";
import { legalSpecialist, generateLegalAnalysis, getLegalPrompt } from "./specialists/legal";
import { generateAccountingAnalysis, getAccountingPrompt } from "./specialists/accounting";
import { generateLogisticsAnalysis, getLogisticsPrompt } from "./specialists/logistics";
import { getMethod, getMethodsHelpText, getApplicableMethods, methodsRegistry } from "./methods";
import { getMethodRecommendations, checkMethodReadiness, formatMethodSuggestions, getMethodSuggestionPrompt } from "./methodAdvisor";
import {
  checkRequirements,
  generateDataPrompt,
  agentSaveData,
  SPECIALIST_DATA_REQUIREMENTS,
  DataRequirement,
  parseDataResponse
} from "./agentDataHelper";

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

/**
 * Checks if deep intake has been completed.
 * Deep intake is complete when we have answers from specialists (compliance, finance, legal, ops).
 */
function isDeepIntakeComplete(answers: any, company: any): boolean {
  const wizard = answers?.wizard;
  if (!wizard) return false;

  // Check if active_stage is DEEP_INTAKE and queue is empty
  if (wizard.active_stage === "DEEP_INTAKE" && (!wizard.queue || wizard.queue.length === 0)) {
    return true;
  }

  // Check if deep specialist questions have been asked
  const asked = wizard.asked || [];
  const deepQuestionPrefixes = ["compliance.", "finance.", "legal."];
  const hasDeepQuestions = deepQuestionPrefixes.every(prefix =>
    asked.some((id: string) => id.startsWith(prefix))
  );

  if (hasDeepQuestions) {
    return true;
  }

  // Alternative check: see if we have answers from deep specialists
  const c = company?.company || {};
  const hasCompliance = c.compliance && Object.keys(c.compliance).length > 3; // More than basic fields
  const hasOps = c.ops && Object.keys(c.ops).length > 0;
  const hasFinance = c.finance && Object.keys(c.finance).length > 0;
  const hasLegal = c.legal && Object.keys(c.legal).length > 0;

  return hasCompliance && hasOps && hasFinance && hasLegal;
}

/**
 * Checks if initial (core) intake has been completed.
 */
function isCoreIntakeComplete(answers: any): boolean {
  const wizard = answers?.wizard;
  if (!wizard) return false;

  const coreQuestions = [
    "lifecycle_mode", "country_mode", "language_preference",
    "industry_sector", "industry_pack", "company_name",
    "one_liner", "business_model", "headcount_range", "stage"
  ];

  const asked = wizard.asked || [];
  return coreQuestions.every(q => asked.includes(q));
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

function getProgressInfo(wizard: WizardState, answers: any): { asked: number; total: number; percent: number } {
  const askedCount = wizard.asked?.length || 0;
  const queueCount = wizard.queue?.length || 0;
  const total = askedCount + queueCount;
  const percent = total > 0 ? Math.round((askedCount / total) * 100) : 0;
  return { asked: askedCount, total, percent };
}

function renderProgressBar(percent: number, width: number = 20): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${percent}%`;
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
      // Global Navigation - works in ANY state
      // These should be checked BEFORE state-specific handlers
      // ----------------------------------------------
      const backText = lang === "pt-br" ? "VOLTAR" : "BACK";
      const skipText = lang === "pt-br" ? "PULAR" : "SKIP";
      const restartText = lang === "pt-br" ? "RECOMEÇAR" : "RESTART";

      // STATUS - always available (both as text and /status command)
      if (upper(text) === "STATUS" || text.startsWith("/status")) {
        await showStatus(stream, lang);
        return;
      }

      // VOLTAR/BACK - always available to go back
      if (upper(text) === backText) {
        await handleBack(stream, lang);
        return;
      }

      // RECOMEÇAR/RESTART - always available to start fresh
      if (upper(text) === restartText) {
        await handleRestart(stream, lang, answers);
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
      // Specialist selector
      // ----------------------------------------------
      if (!isCommand(text) && (wizard as any).awaiting_specialist_choice) {
        await handleSpecialistChoice(text, stream, lang, answers, company);
        return;
      }

      // ----------------------------------------------
      // Custom data response from agent
      // ----------------------------------------------
      if (!isCommand(text) && (wizard as any).pending_custom_data) {
        await handleCustomDataResponse(text, stream, lang, answers, company);
        return;
      }

      // ----------------------------------------------
      // Awaiting normal answer (skip also checked here for context)
      // ----------------------------------------------
      if (!isCommand(text) && wizard.awaiting_answer_for) {
        // PULAR/SKIP - only works when there's a question
        if (upper(text) === skipText) {
          await handleSkip(stream, lang);
          return;
        }

        const ok = await handleQuestionAnswer(text, stream, lang);
        if (!ok) return;

        await askNext(stream, lang);
        return;
      }

      // ----------------------------------------------
      // Commands (slash commands)
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

      // Business Analysis Commands
      if (text.startsWith("/diagnose")) {
        await runDiagnose(stream, lang, answers, company);
        return;
      }

      if (text.startsWith("/plan")) {
        await runPlan(stream, lang, answers, company);
        return;
      }

      if (text.startsWith("/swot")) {
        await runSwot(stream, lang, answers, company);
        return;
      }

      if (text.startsWith("/canvas")) {
        await runCanvas(stream, lang, answers, company);
        return;
      }

      if (text.startsWith("/score")) {
        await runScore(stream, lang, answers, company);
        return;
      }

      // Specialist Commands
      if (text.startsWith("/ops")) {
        await startSpecialistChat(stream, lang, answers, company, "OPS");
        return;
      }

      if (text.startsWith("/compliance")) {
        await startSpecialistChat(stream, lang, answers, company, "COMPLIANCE");
        return;
      }

      if (text.startsWith("/finance")) {
        await startSpecialistChat(stream, lang, answers, company, "FINANCE");
        return;
      }

      if (text.startsWith("/legal")) {
        await startSpecialistChat(stream, lang, answers, company, "LEGAL");
        return;
      }

      if (text.startsWith("/accounting")) {
        await startSpecialistChat(stream, lang, answers, company, "ACCOUNTING");
        return;
      }

      if (text.startsWith("/logistics")) {
        await startSpecialistChat(stream, lang, answers, company, "LOGISTICS");
        return;
      }

      if (text.startsWith("/method")) {
        const args = text.replace("/method", "").trim();
        await runMethod(stream, lang, answers, company, args);
        return;
      }

      if (text.startsWith("/methods")) {
        md(stream, getMethodsHelpText(lang));
        return;
      }

      if (text.startsWith("/help")) {
        md(stream, helpText(lang));
        return;
      }

      // Unknown input - try to understand intent and guide user using Copilot
      await handleUnknownInput(text, stream, lang, answers, company, request.model, token);
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

      // Navigation actions available in most states
      const navActions: vscode.ChatFollowup[] = lang === "pt-br"
        ? [
            buildFollowup("📊 Ver Status", "STATUS"),
            buildFollowup("🔄 Recomeçar", "RECOMEÇAR"),
          ]
        : [
            buildFollowup("📊 View Status", "STATUS"),
            buildFollowup("🔄 Restart", "RESTART"),
          ];

      const base: vscode.ChatFollowup[] = [
        buildFollowup(
          lang === "pt-br" ? "▶️ Iniciar /intake" : "▶️ Start /intake",
          `/intake`
        ),
        buildFollowup(
          lang === "pt-br" ? "📄 Gerar docs" : "📄 Generate docs",
          `/render`
        ),
        buildFollowup(
          lang === "pt-br" ? "📚 Métodos" : "📚 Methods",
          `/methods`
        ),
        buildFollowup(lang === "pt-br" ? "❓ Ajuda" : "❓ Help", `/help`),
      ];

      // Quick analysis actions (always available)
      const analysisActions: vscode.ChatFollowup[] = lang === "pt-br"
        ? [
            buildFollowup("📊 SWOT", "/method swot"),
            buildFollowup("🎯 OKR", "/method okr"),
            buildFollowup("📈 Porter", "/method porter"),
            buildFollowup("🏷️ BCG", "/method bcg"),
          ]
        : [
            buildFollowup("📊 SWOT", "/method swot"),
            buildFollowup("🎯 OKR", "/method okr"),
            buildFollowup("📈 Porter", "/method porter"),
            buildFollowup("🏷️ BCG", "/method bcg"),
          ];

      // Context-aware method recommendations
      const ctx = buildContext(answers, company);
      const methodRecs = getMethodRecommendations(ctx, { maxRecommendations: 3 });
      const smartMethodActions: vscode.ChatFollowup[] = methodRecs.recommendations.map(rec =>
        buildFollowup(`💡 ${rec.method.name[lang]}`, `/method ${rec.method.id}`)
      );

      // Reset prompt
      if (wizard.pending_reset_prompt) {
        return lang === "pt-br"
          ? [
              buildFollowup("▶️ CONTINUAR", "CONTINUAR"),
              buildFollowup("🔄 RESETAR", "RESETAR"),
              buildFollowup("🚪 SAIR", "SAIR"),
              ...base,
            ]
          : [
              buildFollowup("▶️ CONTINUE", "CONTINUE"),
              buildFollowup("🔄 RESET", "RESET"),
              buildFollowup("🚪 EXIT", "EXIT"),
              ...base,
            ];
      }

      // Stage selector - adapt based on intake status
      if (wizard.awaiting_stage_choice) {
        const deepComplete = isDeepIntakeComplete(answers, company);

        if (deepComplete) {
          // Deep intake complete - show advanced options
          return lang === "pt-br"
            ? [
                buildFollowup("📄 GERAR DOCS", "GERAR_DOCS"),
                buildFollowup("🔍 DIAGNOSTICAR", "DIAGNOSTICAR"),
                buildFollowup("📋 PLANEJAR", "PLANEJAR"),
                buildFollowup("📚 MÉTODOS", "/methods"),
                buildFollowup("🎯 ESPECIALISTA", "ESPECIALISTA"),
                buildFollowup("🔄 REFAZER", "REFAZER"),
                buildFollowup("🚪 SAIR", "SAIR"),
                ...analysisActions,
                ...navActions,
                ...base,
              ]
            : [
                buildFollowup("📄 GENERATE DOCS", "GENERATE_DOCS"),
                buildFollowup("🔍 DIAGNOSE", "DIAGNOSE"),
                buildFollowup("📋 PLAN", "PLAN"),
                buildFollowup("📚 METHODS", "/methods"),
                buildFollowup("🎯 SPECIALIST", "SPECIALIST"),
                buildFollowup("🔄 REDO", "REDO"),
                buildFollowup("🚪 EXIT", "EXIT"),
                ...analysisActions,
                ...navActions,
                ...base,
              ];
        }

        // Core intake complete - show deepen option
        return lang === "pt-br"
          ? [
              buildFollowup("🔍 APROFUNDAR (recomendado)", "APROFUNDAR"),
              buildFollowup("🎯 ESPECIALISTA", "ESPECIALISTA"),
              buildFollowup("📄 GERAR DOCS", "GERAR_DOCS"),
              buildFollowup("📚 MÉTODOS", "/methods"),
              buildFollowup("🚪 SAIR", "SAIR"),
              ...analysisActions,
              ...navActions,
              ...base,
            ]
          : [
              buildFollowup("🔍 DEEPEN (recommended)", "DEEPEN"),
              buildFollowup("🎯 SPECIALIST", "SPECIALIST"),
              buildFollowup("📄 GENERATE DOCS", "GENERATE_DOCS"),
              buildFollowup("📚 METHODS", "/methods"),
              buildFollowup("🚪 EXIT", "EXIT"),
              ...analysisActions,
              ...navActions,
              ...base,
            ];
      }

      // Specialist selector
      if ((wizard as any).awaiting_specialist_choice) {
        return lang === "pt-br"
          ? [
              buildFollowup("⚙️ OPS", "OPS"),
              buildFollowup("📋 COMPLIANCE", "COMPLIANCE"),
              buildFollowup("💰 FINANCE", "FINANCE"),
              buildFollowup("⚖️ LEGAL", "LEGAL"),
              buildFollowup("📒 ACCOUNTING", "ACCOUNTING"),
              buildFollowup("🚚 LOGISTICS", "LOGISTICS"),
              buildFollowup("↩️ VOLTAR", "VOLTAR"),
              ...base,
            ]
          : [
              buildFollowup("⚙️ OPS", "OPS"),
              buildFollowup("📋 COMPLIANCE", "COMPLIANCE"),
              buildFollowup("💰 FINANCE", "FINANCE"),
              buildFollowup("⚖️ LEGAL", "LEGAL"),
              buildFollowup("📒 ACCOUNTING", "ACCOUNTING"),
              buildFollowup("🚚 LOGISTICS", "LOGISTICS"),
              buildFollowup("↩️ BACK", "BACK"),
              ...base,
            ];
      }

      // Awaiting a question ? show options + AI actions + navigation
      if (wizard.awaiting_answer_for && wizard.last_question) {
        const q = wizard.last_question;

        // AI assistance actions
        const aiActions: vscode.ChatFollowup[] =
          lang === "pt-br"
            ? [
                buildFollowup("💡 EXPLICAR", "EXPLICAR"),
                buildFollowup("🔄 REFORMULAR", "REFORMULAR"),
                buildFollowup("✨ SUGERIR", "SUGERIR"),
              ]
            : [
                buildFollowup("💡 EXPLAIN", "EXPLICAR"),
                buildFollowup("🔄 REFRAME", "REFORMULAR"),
                buildFollowup("✨ SUGGEST", "SUGERIR"),
              ];

        // Navigation actions for current question
        const questionNav: vscode.ChatFollowup[] = [];

        // Back button (only if we have previous questions)
        if (wizard.asked && wizard.asked.length > 0) {
          questionNav.push(
            buildFollowup(
              lang === "pt-br" ? "↩️ VOLTAR" : "↩️ BACK",
              lang === "pt-br" ? "VOLTAR" : "BACK"
            )
          );
        }

        // Skip button (only for non-required questions)
        if (!q.validation?.required) {
          questionNav.push(
            buildFollowup(
              lang === "pt-br" ? "⏭️ PULAR" : "⏭️ SKIP",
              lang === "pt-br" ? "PULAR" : "SKIP"
            )
          );
        }

        if (q.type === "enum" && q.options?.length) {
          const opts = q.options
            .slice(0, 8)
            .map((o) => buildFollowup(`${o.label[lang]}`, `${o.value}`));
          return [
            ...opts,
            ...questionNav,
            ...aiActions,
            ...navActions,
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

          return [
            ...suggestions,
            ...questionNav,
            ...aiActions,
            ...navActions,
            ...base,
          ];
        }

        // Text questions
        return [
          ...questionNav,
          ...aiActions,
          ...navActions,
          ...base,
        ];
      }

      // Default: show smart method recommendations based on context + standard actions
      return [...smartMethodActions, ...analysisActions, ...navActions, ...base];
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
  answers: any,
  company: any
) {
  const wizard = ensureWizard(answers);
  wizard.awaiting_stage_choice = true;
  await saveWizardOnly(answers);

  const deepComplete = isDeepIntakeComplete(answers, company);

  if (deepComplete) {
    // Deep intake is complete - offer advanced options
    md(
      stream,
      lang === "pt-br"
        ? "✅ **Intake completo!**\n\n- `GERAR_DOCS` → gerar documentação\n- `DIAGNOSTICAR` → diagnóstico organizacional\n- `PLANEJAR` → plano 7/30/90 dias\n- `ESPECIALISTA` → conversar com especialista\n- `REFAZER` → recomeçar do zero\n- `SAIR` → encerrar\n"
        : "✅ **Intake complete!**\n\n- `GENERATE_DOCS` → generate documentation\n- `DIAGNOSE` → organizational diagnostic\n- `PLAN` → 7/30/90 day plan\n- `SPECIALIST` → chat with specialist\n- `REDO` → start over\n- `EXIT` → stop here\n"
    );
  } else {
    // Core intake done, deep intake not complete
    md(
      stream,
      lang === "pt-br"
        ? "✅ **Intake básico completo.**\n\n- `APROFUNDAR` → mais perguntas _(recomendado)_\n- `GERAR_DOCS` → gerar docs agora\n- `ESPECIALISTA` → conversar com especialista\n- `SAIR` → encerrar\n"
        : "✅ **Basic intake complete.**\n\n- `DEEPEN` → more questions _(recommended)_\n- `GENERATE_DOCS` → generate docs now\n- `SPECIALIST` → chat with specialist\n- `EXIT` → stop here\n"
    );
  }
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

  const deepComplete = isDeepIntakeComplete(answers, company);

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
      if (deepComplete) {
        md(stream, "✅ Você já completou o intake profundo! Use `GERAR_DOCS` ou `DIAGNOSTICAR`.\n\n");
        await askStageSelector(stream, lang, answers, company);
        return;
      }
      md(stream, "👍 Vamos aprofundar.\n\n");
      await refreshWizardQueueAdvanced(answers, company);
      await saveWizardOnly(answers);
      await askNext(stream, lang);
      return;
    }
    if (v === "ESPECIALISTA") {
      await askSpecialistChoice(stream, lang, answers);
      return;
    }
    if (v === "DIAGNOSTICAR") {
      await runDiagnose(stream, lang, answers, company);
      return;
    }
    if (v === "PLANEJAR") {
      await runPlan(stream, lang, answers, company);
      return;
    }
    if (v === "REFAZER") {
      await handleRestart(stream, lang, answers);
      return;
    }

    const validOptions = deepComplete
      ? "GERAR_DOCS / DIAGNOSTICAR / PLANEJAR / ESPECIALISTA / REFAZER / SAIR"
      : "APROFUNDAR / ESPECIALISTA / GERAR_DOCS / SAIR";
    md(stream, `⚠️ Use: ${validOptions}\n\n`);
    await askStageSelector(stream, lang, answers, company);
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
    if (deepComplete) {
      md(stream, "✅ You've already completed the deep intake! Use `GENERATE_DOCS` or `DIAGNOSE`.\n\n");
      await askStageSelector(stream, lang, answers, company);
      return;
    }
    md(stream, "👍 Let's deepen.\n\n");
    await refreshWizardQueueAdvanced(answers, company);
    await saveWizardOnly(answers);
    await askNext(stream, lang);
    return;
  }
  if (v === "SPECIALIST") {
    await askSpecialistChoice(stream, lang, answers);
    return;
  }
  if (v === "DIAGNOSE") {
    md(stream, "🔍 Generating organizational diagnostic...\n\n");
    await runDiagnose(stream, lang, answers, company);
    return;
  }
  if (v === "PLAN") {
    md(stream, "📋 Generating execution plan...\n\n");
    await runPlan(stream, lang, answers, company);
    return;
  }
  if (v === "REDO") {
    await handleRestart(stream, lang, answers);
    return;
  }

  const validOptions = deepComplete
    ? "GENERATE_DOCS / DIAGNOSE / PLAN / SPECIALIST / REDO / EXIT"
    : "DEEPEN / SPECIALIST / GENERATE_DOCS / EXIT";
  md(stream, `⚠️ Invalid. Use: ${validOptions}\n\n`);
  await askStageSelector(stream, lang, answers, company);
}

// -----------------------------
// Specialist selector
// -----------------------------

async function askSpecialistChoice(stream: any, lang: "pt-br" | "en", answers: any) {
  const wizard = ensureWizard(answers);
  wizard.awaiting_specialist_choice = true;
  await saveWizardOnly(answers);

  md(
    stream,
    lang === "pt-br"
      ? "🎯 **Com qual especialista você quer conversar?**\n\n- `OPS` → Operações (terceirização, canais, logística)\n- `COMPLIANCE` → Compliance (entidade, impostos, licenças)\n- `FINANCE` → Finanças (funding, receita, pagamentos)\n- `LEGAL` → Jurídico (sócios, contratos, PI, seguros)\n- `ACCOUNTING` → Contabilidade (escrituração, fiscal, custos)\n- `LOGISTICS` → Logística (supply chain, estoque, distribuição)\n- `VOLTAR` → voltar ao menu anterior\n\n_Responda com o nome do especialista._\n"
      : "🎯 **Which specialist would you like to chat with?**\n\n- `OPS` → Operations (outsourcing, channels, logistics)\n- `COMPLIANCE` → Compliance (entity, taxes, licenses)\n- `FINANCE` → Finance (funding, revenue, payments)\n- `LEGAL` → Legal (partners, contracts, IP, insurance)\n- `ACCOUNTING` → Accounting (bookkeeping, tax, costing)\n- `LOGISTICS` → Logistics (supply chain, inventory, distribution)\n- `BACK` → return to previous menu\n\n_Reply with the specialist name._\n"
  );
}

async function handleSpecialistChoice(
  text: string,
  stream: any,
  lang: "pt-br" | "en",
  answers: any,
  company: any
) {
  const wizard = ensureWizard(answers);
  const v = upper(text);

  wizard.awaiting_specialist_choice = false;
  await saveWizardOnly(answers);

  const backCmd = lang === "pt-br" ? "VOLTAR" : "BACK";

  if (v === backCmd) {
    await askStageSelector(stream, lang, answers, company);
    return;
  }

  const specialists = ["OPS", "COMPLIANCE", "FINANCE", "LEGAL", "ACCOUNTING", "LOGISTICS"];
  if (!specialists.includes(v)) {
    md(
      stream,
      lang === "pt-br"
        ? `⚠️ Especialista inválido. Use: ${specialists.join(" / ")} / VOLTAR\n\n`
        : `⚠️ Invalid specialist. Use: ${specialists.join(" / ")} / BACK\n\n`
    );
    await askSpecialistChoice(stream, lang, answers);
    return;
  }

  // Start specialist-specific intake
  wizard.active_stage = v;
  await saveWizardOnly(answers);

  md(
    stream,
    lang === "pt-br"
      ? `👍 Iniciando conversa com especialista **${v}**...\n\n`
      : `👍 Starting conversation with **${v}** specialist...\n\n`
  );

  await refreshSpecialistQueue(answers, company, v);
  await saveWizardOnly(answers);
  await askNext(stream, lang);
}

async function refreshSpecialistQueue(answers: any, company: any, specialist: string) {
  const wizard = ensureWizard(answers);
  if (!wizard.dynamic_enabled) return;

  const ctx = buildContext(answers, company);
  let questions: Question[] = [];

  switch (specialist) {
    case "OPS":
      questions = opsSpecialist(ctx);
      break;
    case "COMPLIANCE":
      questions = complianceSpecialist(ctx);
      break;
    case "FINANCE":
      questions = financeSpecialist(ctx);
      break;
    case "LEGAL":
      questions = legalSpecialist(ctx);
      break;
  }

  const valid: Question[] = [];
  for (const q of questions) {
    const errs = validateQuestion(q);
    if (errs.length === 0) valid.push(q);
  }

  // Clear queue and add specialist questions
  wizard.queue = valid;
}

// -----------------------------
// Custom Data Response Handler
// -----------------------------

async function handleCustomDataResponse(
  text: string,
  stream: any,
  lang: "pt-br" | "en",
  answers: any,
  company: any
) {
  const wizard = ensureWizard(answers);
  const pendingData = (wizard as any).pending_custom_data;

  if (!pendingData) {
    return;
  }

  const { specialist, requirements } = pendingData as {
    specialist: string;
    requirements: DataRequirement[];
  };

  // Check if user wants to skip
  const skipText = upper(text);
  if (skipText === "SKIP" || skipText === "/SKIP" || skipText === "PULAR") {
    (wizard as any).pending_custom_data = null;
    await saveWizardOnly(answers);
    md(
      stream,
      lang === "pt-br"
        ? `⏭️ Dados opcionais ignorados. Continuando...\n\n`
        : `⏭️ Optional data skipped. Continuing...\n\n`
    );
    return;
  }

  // Parse the response
  const parsedData = parseDataResponse(text, requirements);

  if (parsedData.size === 0) {
    // Try to save as single value if only one requirement
    if (requirements.length === 1) {
      const req = requirements[0];
      const value = parseValue(text, req.type);
      await agentSaveData(req.path, value, specialist);
      parsedData.set(req.path, value);
    } else {
      md(
        stream,
        lang === "pt-br"
          ? `⚠️ Não consegui entender a resposta. Por favor, use o formato:\n\`1. valor\`\n\`2. valor\`\n\n_Ou digite \`/skip\` para pular._\n\n`
          : `⚠️ Could not parse response. Please use the format:\n\`1. value\`\n\`2. value\`\n\n_Or type \`/skip\` to skip._\n\n`
      );
      return;
    }
  }

  // Save all parsed data
  let savedCount = 0;
  for (const [path, value] of parsedData) {
    await agentSaveData(path, value, specialist);
    savedCount++;
  }

  // Clear the pending request
  (wizard as any).pending_custom_data = null;
  await saveWizardOnly(answers);

  // Confirm save
  md(
    stream,
    lang === "pt-br"
      ? `✅ ${savedCount} dado(s) salvo(s) com sucesso!\n\n`
      : `✅ ${savedCount} data point(s) saved successfully!\n\n`
  );

  // Re-run the specialist analysis with the new data
  const { answers: freshAnswers, company: freshCompany } = await loadState();
  await startSpecialistChat(stream, lang, freshAnswers, freshCompany, specialist);
}

function parseValue(value: string, type: DataRequirement["type"]): any {
  switch (type) {
    case "number":
      return parseFloat(value.replace(/[^\d.-]/g, "")) || 0;
    case "boolean":
      return /^(sim|yes|true|1|s|y)$/i.test(value);
    case "list":
      return value.split(/[,;]/).map(v => v.trim()).filter(Boolean);
    case "currency":
      return parseFloat(value.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
    default:
      return value;
  }
}

// -----------------------------
// Diagnose and Plan commands
// -----------------------------

async function runDiagnose(stream: any, lang: "pt-br" | "en", answers: any, company: any) {
  const c = company?.company || {};
  const compliance = c.compliance || {};
  const ops = c.ops || {};
  const finance = c.finance || {};
  const legal = c.legal || {};

  // Generate diagnostic based on collected data
  const gaps: string[] = [];
  const risks: string[] = [];
  const quickWins: string[] = [];

  // Compliance checks
  if (compliance.tax_registration !== "YES") {
    risks.push(lang === "pt-br" ? "⚠️ Regularização fiscal pendente" : "⚠️ Tax registration pending");
  }
  if (compliance.data_privacy === "YES_NOT_COMPLIANT") {
    risks.push(lang === "pt-br" ? "🔴 LGPD/GDPR não conformidade" : "🔴 LGPD/GDPR non-compliance");
    quickWins.push(lang === "pt-br" ? "Implementar política de privacidade" : "Implement privacy policy");
  }

  // Ops checks
  if (ops.key_challenges?.includes("PROCESSES")) {
    gaps.push(lang === "pt-br" ? "Processos desorganizados identificados" : "Disorganized processes identified");
    quickWins.push(lang === "pt-br" ? "Documentar processos-chave" : "Document key processes");
  }
  if (ops.key_challenges?.includes("CASH_FLOW")) {
    risks.push(lang === "pt-br" ? "⚠️ Desafios de fluxo de caixa" : "⚠️ Cash flow challenges");
  }

  // Finance checks
  if (finance.runway === "LESS_3M") {
    risks.push(lang === "pt-br" ? "🔴 Runway crítico (< 3 meses)" : "🔴 Critical runway (< 3 months)");
  }
  if (finance.bank_account === "USING_PERSONAL") {
    gaps.push(lang === "pt-br" ? "Usando conta pessoal" : "Using personal account");
    quickWins.push(lang === "pt-br" ? "Abrir conta PJ" : "Open business bank account");
  }

  // Legal checks
  if (legal.partnership_agreement === "NO" && legal.founders !== "SOLO") {
    risks.push(lang === "pt-br" ? "🔴 Sem acordo de sócios formalizado" : "🔴 No formal partnership agreement");
    quickWins.push(lang === "pt-br" ? "Formalizar acordo de sócios" : "Formalize partnership agreement");
  }
  if (legal.legal_support === "NONE") {
    gaps.push(lang === "pt-br" ? "Sem suporte jurídico" : "No legal support");
  }

  // Output
  const ctx = buildContext(answers, company);
  const methodRecs = getMethodRecommendations(ctx, { maxRecommendations: 3 });
  const methodsSection = formatMethodSuggestions(methodRecs.recommendations, lang);

  md(stream, lang === "pt-br"
    ? `# 🔍 Diagnóstico Organizacional\n\n## Riscos Identificados\n${risks.length > 0 ? risks.map(r => `- ${r}`).join("\n") : "- Nenhum risco crítico identificado"}\n\n## Gaps/Lacunas\n${gaps.length > 0 ? gaps.map(g => `- ${g}`).join("\n") : "- Nenhuma lacuna significativa"}\n\n## Quick Wins (Vitórias Rápidas)\n${quickWins.length > 0 ? quickWins.map(q => `- ${q}`).join("\n") : "- Continue com o progresso atual"}${methodsSection}\n\n---\n_Use \`/plan\` para gerar um plano de execução detalhado._\n`
    : `# 🔍 Organizational Diagnostic\n\n## Identified Risks\n${risks.length > 0 ? risks.map(r => `- ${r}`).join("\n") : "- No critical risks identified"}\n\n## Gaps\n${gaps.length > 0 ? gaps.map(g => `- ${g}`).join("\n") : "- No significant gaps"}\n\n## Quick Wins\n${quickWins.length > 0 ? quickWins.map(q => `- ${q}`).join("\n") : "- Continue with current progress"}${methodsSection}\n\n---\n_Use \`/plan\` to generate a detailed execution plan._\n`
  );
}

async function runPlan(stream: any, lang: "pt-br" | "en", answers: any, company: any) {
  const c = company?.company || {};
  const stage = c.identity?.stage || "EARLY";
  const ops = c.ops || {};

  // Generate planning recommendations
  md(stream, lang === "pt-br"
    ? `# 📋 Plano de Execução\n\n## 🗓️ Próximos 7 Dias\n- [ ] Revisar diagnóstico organizacional\n- [ ] Priorizar quick wins identificados\n- [ ] Agendar reunião de alinhamento com sócios\n\n## 🗓️ Próximos 30 Dias\n- [ ] Implementar 2-3 quick wins\n- [ ] Documentar processos críticos\n- [ ] Definir KPIs principais\n- [ ] Revisar estrutura de custos\n\n## 🗓️ Próximos 90 Dias\n- [ ] Completar formalização jurídica pendente\n- [ ] Implementar sistema de gestão financeira\n- [ ] Estabelecer rotinas de review mensal\n- [ ] Avaliar progresso e ajustar prioridades\n\n---\n_Este plano é baseado no seu estágio atual (${stage}) e desafios identificados._\n`
    : `# 📋 Execution Plan\n\n## 🗓️ Next 7 Days\n- [ ] Review organizational diagnostic\n- [ ] Prioritize identified quick wins\n- [ ] Schedule alignment meeting with partners\n\n## 🗓️ Next 30 Days\n- [ ] Implement 2-3 quick wins\n- [ ] Document critical processes\n- [ ] Define key KPIs\n- [ ] Review cost structure\n\n## 🗓️ Next 90 Days\n- [ ] Complete pending legal formalization\n- [ ] Implement financial management system\n- [ ] Establish monthly review routines\n- [ ] Evaluate progress and adjust priorities\n\n---\n_This plan is based on your current stage (${stage}) and identified challenges._\n`
  );
}

// -----------------------------
// SWOT Analysis
// -----------------------------

async function runSwot(stream: any, lang: "pt-br" | "en", answers: any, company: any) {
  const c = company?.company || {};
  const identity = c.identity || {};
  const ops = c.ops || {};
  const finance = c.finance || {};
  const compliance = c.compliance || {};
  const legal = c.legal || {};
  const meta = company?.meta || {};

  // Build SWOT based on gathered data
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const opportunities: string[] = [];
  const threats: string[] = [];

  // Analyze strengths
  if (finance.funding_status === "REVENUE_FUNDED" || finance.funding_status === "BOOTSTRAPPED") {
    strengths.push(lang === "pt-br" ? "Independência financeira (sem dívida/investidor)" : "Financial independence (no debt/investor)");
  }
  if (legal.partnership_agreement === "YES_COMPLETE") {
    strengths.push(lang === "pt-br" ? "Acordo de sócios formalizado" : "Formalized partnership agreement");
  }
  if (compliance.tax_registration === "YES") {
    strengths.push(lang === "pt-br" ? "Regularização fiscal em ordem" : "Tax registration in order");
  }
  if (compliance.anvisa_license && compliance.anvisa_license !== "NO") {
    strengths.push(lang === "pt-br" ? "Licenças ANVISA obtidas" : "ANVISA licenses obtained");
  }
  if (ops.outsourced_services?.includes("ACCOUNTING")) {
    strengths.push(lang === "pt-br" ? "Contabilidade terceirizada (especialização)" : "Outsourced accounting (specialization)");
  }

  // Analyze weaknesses
  if (ops.key_challenges?.includes("PROCESSES")) {
    weaknesses.push(lang === "pt-br" ? "Processos desorganizados" : "Disorganized processes");
  }
  if (ops.key_challenges?.includes("CASH_FLOW")) {
    weaknesses.push(lang === "pt-br" ? "Desafios de fluxo de caixa" : "Cash flow challenges");
  }
  if (legal.key_contracts?.includes("NONE")) {
    weaknesses.push(lang === "pt-br" ? "Contratos não formalizados" : "Non-formalized contracts");
  }
  if (finance.tools?.includes("SPREADSHEET") && !finance.tools?.includes("ERP")) {
    weaknesses.push(lang === "pt-br" ? "Gestão financeira manual (planilhas)" : "Manual financial management (spreadsheets)");
  }
  if (legal.legal_support === "NONE") {
    weaknesses.push(lang === "pt-br" ? "Sem suporte jurídico estruturado" : "No structured legal support");
  }

  // Analyze opportunities
  if (identity.stage === "GROWTH" || identity.stage === "EARLY") {
    opportunities.push(lang === "pt-br" ? "Mercado em expansão para empresas em crescimento" : "Expanding market for growing companies");
  }
  if (meta.packs?.includes("health-import")) {
    opportunities.push(lang === "pt-br" ? "Setor de saúde em crescimento no Brasil" : "Growing healthcare sector in Brazil");
  }
  if (ops.sales_channels?.includes("ECOMMERCE") || ops.sales_channels?.includes("MARKETPLACE")) {
    opportunities.push(lang === "pt-br" ? "Digitalização de canais de venda" : "Digitalization of sales channels");
  }
  if (!legal.ip_assets?.includes("TRADEMARK")) {
    opportunities.push(lang === "pt-br" ? "Oportunidade de registrar marca" : "Opportunity to register trademark");
  }

  // Analyze threats
  if (compliance.data_privacy === "YES_NOT_COMPLIANT") {
    threats.push(lang === "pt-br" ? "Risco de multas LGPD/GDPR" : "LGPD/GDPR fine risk");
  }
  if (ops.key_challenges?.includes("COMPLIANCE")) {
    threats.push(lang === "pt-br" ? "Ambiente regulatório complexo" : "Complex regulatory environment");
  }
  if (finance.runway === "LESS_3M" || finance.runway === "3_6M") {
    threats.push(lang === "pt-br" ? "Runway limitado - risco de liquidez" : "Limited runway - liquidity risk");
  }
  if (legal.founders !== "SOLO" && legal.partnership_agreement !== "YES_COMPLETE") {
    threats.push(lang === "pt-br" ? "Conflito potencial entre sócios" : "Potential partner conflict");
  }

  // Default entries if empty
  if (strengths.length === 0) strengths.push(lang === "pt-br" ? "Complete o intake para análise detalhada" : "Complete intake for detailed analysis");
  if (weaknesses.length === 0) weaknesses.push(lang === "pt-br" ? "Complete o intake para análise detalhada" : "Complete intake for detailed analysis");
  if (opportunities.length === 0) opportunities.push(lang === "pt-br" ? "Complete o intake para análise detalhada" : "Complete intake for detailed analysis");
  if (threats.length === 0) threats.push(lang === "pt-br" ? "Complete o intake para análise detalhada" : "Complete intake for detailed analysis");

  md(stream, lang === "pt-br"
    ? `# 📊 Análise SWOT\n\n## 💪 Forças (Strengths)\n${strengths.map(s => `- ${s}`).join("\n")}\n\n## 😰 Fraquezas (Weaknesses)\n${weaknesses.map(w => `- ${w}`).join("\n")}\n\n## 🚀 Oportunidades (Opportunities)\n${opportunities.map(o => `- ${o}`).join("\n")}\n\n## ⚠️ Ameaças (Threats)\n${threats.map(t => `- ${t}`).join("\n")}\n\n---\n_Análise baseada nos dados coletados. Use \`/diagnose\` para ações recomendadas._\n`
    : `# 📊 SWOT Analysis\n\n## 💪 Strengths\n${strengths.map(s => `- ${s}`).join("\n")}\n\n## 😰 Weaknesses\n${weaknesses.map(w => `- ${w}`).join("\n")}\n\n## 🚀 Opportunities\n${opportunities.map(o => `- ${o}`).join("\n")}\n\n## ⚠️ Threats\n${threats.map(t => `- ${t}`).join("\n")}\n\n---\n_Analysis based on collected data. Use \`/diagnose\` for recommended actions._\n`
  );
}

// -----------------------------
// Business Model Canvas
// -----------------------------

async function runCanvas(stream: any, lang: "pt-br" | "en", answers: any, company: any) {
  const c = company?.company || {};
  const identity = c.identity || {};
  const ops = c.ops || {};
  const finance = c.finance || {};
  const meta = company?.meta || {};

  const name = identity.name || (lang === "pt-br" ? "Empresa" : "Company");
  const oneLiner = identity.one_liner || "-";
  const businessModel = c.business_model || "-";
  const salesChannels = ops.sales_channels?.join(", ") || "-";
  const revenueModel = finance.revenue_model || "-";
  const outsourced = ops.outsourced_services?.join(", ") || "-";
  const industry = meta.industry || "-";

  md(stream, lang === "pt-br"
    ? `# 🎯 Business Model Canvas - ${name}

## 📝 Proposta de Valor
${oneLiner}

## 👥 Segmentos de Cliente
- Modelo: **${businessModel}**
- Indústria: **${industry}**
- _[Complete com ICP específico]_

## 📢 Canais
${salesChannels}

## 🤝 Relacionamento com Cliente
- _[Defina estratégia de relacionamento]_

## 💰 Fontes de Receita
- Modelo: **${revenueModel}**
- _[Detalhe pricing e estrutura de receita]_

## 🔑 Recursos-Chave
- Licenças e autorizações regulatórias
- Equipe operacional
- _[Liste recursos críticos]_

## 🛠️ Atividades-Chave
- Gestão de compliance
- Vendas e distribuição
- _[Liste atividades core]_

## 🤝 Parcerias-Chave
Serviços terceirizados: ${outsourced}

## 💸 Estrutura de Custos
- Custos operacionais
- Terceirizações
- _[Detalhe principais custos]_

---
_Canvas gerado automaticamente. Refine cada seção com dados específicos._
`
    : `# 🎯 Business Model Canvas - ${name}

## 📝 Value Proposition
${oneLiner}

## 👥 Customer Segments
- Model: **${businessModel}**
- Industry: **${industry}**
- _[Complete with specific ICP]_

## 📢 Channels
${salesChannels}

## 🤝 Customer Relationships
- _[Define relationship strategy]_

## 💰 Revenue Streams
- Model: **${revenueModel}**
- _[Detail pricing and revenue structure]_

## 🔑 Key Resources
- Regulatory licenses and authorizations
- Operational team
- _[List critical resources]_

## 🛠️ Key Activities
- Compliance management
- Sales and distribution
- _[List core activities]_

## 🤝 Key Partners
Outsourced services: ${outsourced}

## 💸 Cost Structure
- Operational costs
- Outsourcing
- _[Detail main costs]_

---
_Canvas generated automatically. Refine each section with specific data._
`
  );
}

// -----------------------------
// Maturity Scorecard
// -----------------------------

async function runScore(stream: any, lang: "pt-br" | "en", answers: any, company: any) {
  const c = company?.company || {};
  const compliance = c.compliance || {};
  const ops = c.ops || {};
  const finance = c.finance || {};
  const legal = c.legal || {};

  // Calculate scores (0-5) for each area
  function calcScore(conditions: boolean[]): number {
    const met = conditions.filter(Boolean).length;
    return Math.round((met / conditions.length) * 5);
  }

  const complianceScore = calcScore([
    compliance.entity_type && compliance.entity_type !== "NOT_FORMED",
    compliance.tax_registration === "YES",
    compliance.data_privacy !== "YES_NOT_COMPLIANT",
    !!compliance.anvisa_license && compliance.anvisa_license !== "NO",
    !!compliance.br_tax_regime || !!compliance.us_state,
  ]);

  const opsScore = calcScore([
    !!ops.outsourced_services?.length,
    !!ops.sales_channels?.length,
    !!ops.inventory_model || !!ops.service_delivery,
    !ops.key_challenges?.includes("PROCESSES"),
    !ops.key_challenges?.includes("SCALE"),
  ]);

  const financeScore = calcScore([
    finance.bank_account && !finance.bank_account.includes("PERSONAL"),
    finance.revenue_status !== "PRE_REVENUE",
    !!finance.revenue_model && finance.revenue_model !== "NOT_DEFINED",
    !!finance.tools?.length && !finance.tools?.includes("NONE"),
    finance.runway !== "LESS_3M",
  ]);

  const legalScore = calcScore([
    legal.partnership_agreement === "YES_COMPLETE" || legal.founders === "SOLO",
    !!legal.ip_assets?.length && !legal.ip_assets?.includes("NONE"),
    !!legal.key_contracts?.length && !legal.key_contracts?.includes("NONE"),
    legal.legal_support !== "NONE",
    !!legal.insurance?.length && !legal.insurance?.includes("NONE"),
  ]);

  const overallScore = Math.round((complianceScore + opsScore + financeScore + legalScore) / 4);

  function renderBar(score: number): string {
    return "█".repeat(score) + "░".repeat(5 - score);
  }

  function getLevel(score: number, lang: "pt-br" | "en"): string {
    if (score <= 1) return lang === "pt-br" ? "Inicial" : "Initial";
    if (score <= 2) return lang === "pt-br" ? "Básico" : "Basic";
    if (score <= 3) return lang === "pt-br" ? "Intermediário" : "Intermediate";
    if (score <= 4) return lang === "pt-br" ? "Avançado" : "Advanced";
    return lang === "pt-br" ? "Excelência" : "Excellence";
  }

  md(stream, lang === "pt-br"
    ? `# 📈 Scorecard de Maturidade

## Pontuação Geral: ${overallScore}/5 - ${getLevel(overallScore, lang)}

| Área | Score | Nível |
|------|-------|-------|
| 📋 Compliance | ${renderBar(complianceScore)} ${complianceScore}/5 | ${getLevel(complianceScore, lang)} |
| ⚙️ Operações | ${renderBar(opsScore)} ${opsScore}/5 | ${getLevel(opsScore, lang)} |
| 💰 Finanças | ${renderBar(financeScore)} ${financeScore}/5 | ${getLevel(financeScore, lang)} |
| ⚖️ Jurídico | ${renderBar(legalScore)} ${legalScore}/5 | ${getLevel(legalScore, lang)} |

## Recomendações por Área

${complianceScore < 3 ? "**Compliance:** Priorize regularização fiscal e licenças pendentes.\n" : ""}
${opsScore < 3 ? "**Operações:** Documente processos e defina canais de venda claros.\n" : ""}
${financeScore < 3 ? "**Finanças:** Implemente ferramentas de gestão e separe contas PJ/PF.\n" : ""}
${legalScore < 3 ? "**Jurídico:** Formalize contratos e considere suporte jurídico.\n" : ""}

---
_Use \`/diagnose\` para análise detalhada ou \`/plan\` para próximos passos._
`
    : `# 📈 Maturity Scorecard

## Overall Score: ${overallScore}/5 - ${getLevel(overallScore, lang)}

| Area | Score | Level |
|------|-------|-------|
| 📋 Compliance | ${renderBar(complianceScore)} ${complianceScore}/5 | ${getLevel(complianceScore, lang)} |
| ⚙️ Operations | ${renderBar(opsScore)} ${opsScore}/5 | ${getLevel(opsScore, lang)} |
| 💰 Finance | ${renderBar(financeScore)} ${financeScore}/5 | ${getLevel(financeScore, lang)} |
| ⚖️ Legal | ${renderBar(legalScore)} ${legalScore}/5 | ${getLevel(legalScore, lang)} |

## Recommendations by Area

${complianceScore < 3 ? "**Compliance:** Prioritize tax registration and pending licenses.\n" : ""}
${opsScore < 3 ? "**Operations:** Document processes and define clear sales channels.\n" : ""}
${financeScore < 3 ? "**Finance:** Implement management tools and separate business/personal accounts.\n" : ""}
${legalScore < 3 ? "**Legal:** Formalize contracts and consider legal support.\n" : ""}

---
_Use \`/diagnose\` for detailed analysis or \`/plan\` for next steps._
`
  );
}

// -----------------------------
// Specialist Chat Starter
// -----------------------------

async function startSpecialistChat(
  stream: any,
  lang: "pt-br" | "en",
  answers: any,
  company: any,
  specialist: string
) {
  const wizard = ensureWizard(answers);
  wizard.active_stage = specialist;
  await saveWizardOnly(answers);

  const specialistNames: Record<string, Record<string, string>> = {
    OPS: { "pt-br": "Operações", en: "Operations" },
    COMPLIANCE: { "pt-br": "Compliance", en: "Compliance" },
    FINANCE: { "pt-br": "Finanças", en: "Finance" },
    LEGAL: { "pt-br": "Jurídico", en: "Legal" },
    ACCOUNTING: { "pt-br": "Contabilidade", en: "Accounting" },
    LOGISTICS: { "pt-br": "Logística", en: "Logistics" },
  };

  const specialistIntros: Record<string, Record<string, string>> = {
    OPS: {
      "pt-br": "Posso ajudar com: terceirização, canais de venda, logística, modelo de entrega, desafios operacionais.",
      en: "I can help with: outsourcing, sales channels, logistics, delivery model, operational challenges."
    },
    COMPLIANCE: {
      "pt-br": "Posso ajudar com: entidade jurídica, impostos, licenças regulatórias, LGPD/GDPR, ANVISA, FDA.",
      en: "I can help with: legal entity, taxes, regulatory licenses, LGPD/GDPR, ANVISA, FDA."
    },
    FINANCE: {
      "pt-br": "Posso ajudar com: funding, receita, modelo de negócio, pagamentos, runway, ferramentas financeiras.",
      en: "I can help with: funding, revenue, business model, payments, runway, financial tools."
    },
    LEGAL: {
      "pt-br": "Posso ajudar com: sócios, contratos, propriedade intelectual, seguros, suporte jurídico.",
      en: "I can help with: partners, contracts, intellectual property, insurance, legal support."
    },
    ACCOUNTING: {
      "pt-br": "Posso ajudar com: escrituração, regime tributário, plano de contas, custos, preparação para auditoria.",
      en: "I can help with: bookkeeping, tax regime, chart of accounts, costing, audit preparation."
    },
    LOGISTICS: {
      "pt-br": "Posso ajudar com: supply chain, gestão de estoque, fulfillment, distribuição, last-mile.",
      en: "I can help with: supply chain, inventory management, fulfillment, distribution, last-mile."
    },
  };

  // Special handling for specialists - they generate analysis immediately
  const ctx = buildContext(answers, company);

  // Check for custom data needs
  const specialistReqs = SPECIALIST_DATA_REQUIREMENTS[specialist] || [];
  const { missing } = checkRequirements(ctx, specialistReqs);
  const customDataPrompt = missing.length > 0
    ? generateDataPrompt(missing, lang, specialist)
    : "";

  // Store pending custom data request for this specialist
  if (missing.length > 0) {
    const wizard = ensureWizard(answers);
    (wizard as any).pending_custom_data = {
      specialist,
      requirements: missing,
    };
    await saveWizardOnly(answers);
  }

  if (specialist === "OPS") {
    const analysis = generateOpsAnalysis(ctx, lang);
    md(stream, analysis + customDataPrompt);
    await refreshSpecialistQueue(answers, company, specialist);
    await saveWizardOnly(answers);
    return;
  }

  if (specialist === "COMPLIANCE") {
    const analysis = generateComplianceAnalysis(ctx, lang);
    md(stream, analysis + customDataPrompt);
    await refreshSpecialistQueue(answers, company, specialist);
    await saveWizardOnly(answers);
    return;
  }

  if (specialist === "FINANCE") {
    const analysis = generateFinanceAnalysis(ctx, lang);
    md(stream, analysis + customDataPrompt);
    await refreshSpecialistQueue(answers, company, specialist);
    await saveWizardOnly(answers);
    return;
  }

  if (specialist === "LEGAL") {
    const analysis = generateLegalAnalysis(ctx, lang);
    md(stream, analysis + customDataPrompt);
    await refreshSpecialistQueue(answers, company, specialist);
    await saveWizardOnly(answers);
    return;
  }

  if (specialist === "ACCOUNTING") {
    const analysis = generateAccountingAnalysis(ctx, lang);
    md(stream, analysis + customDataPrompt);
    return;
  }

  if (specialist === "LOGISTICS") {
    const analysis = generateLogisticsAnalysis(ctx, lang);
    md(stream, analysis + customDataPrompt);
    return;
  }

  md(
    stream,
    lang === "pt-br"
      ? `# 🎯 Especialista: ${specialistNames[specialist]["pt-br"]}\n\n${specialistIntros[specialist]["pt-br"]}\n\n**Como posso ajudar?** Você pode:\n- Fazer perguntas livres sobre ${specialistNames[specialist]["pt-br"].toLowerCase()}\n- Responder às perguntas guiadas do intake\n- Pedir análise específica da sua situação\n\n_Digite sua pergunta ou use \`/intake\` para perguntas guiadas._\n`
      : `# 🎯 Specialist: ${specialistNames[specialist].en}\n\n${specialistIntros[specialist].en}\n\n**How can I help?** You can:\n- Ask free-form questions about ${specialistNames[specialist].en.toLowerCase()}\n- Answer guided intake questions\n- Request specific analysis of your situation\n\n_Type your question or use \`/intake\` for guided questions._\n`
  );

  // Optionally start specialist intake
  await refreshSpecialistQueue(answers, company, specialist);
  await saveWizardOnly(answers);
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
        ? "⚠️ Nenhuma pergunta anterior para voltar. Você está no início do intake.\n\n"
        : "⚠️ No previous question to go back to. You're at the beginning of the intake.\n\n"
    );

    // If there's a current question, re-render it
    if (wizard.last_question) {
      const aiSuggestions = buildAutoSuggestions(wizard.last_question, answers, lang);
      await renderQuestion(stream, wizard.last_question, lang, aiSuggestions);
    }
    return;
  }

  const lastId = wizard.asked.pop()!;
  const q = await findQuestionById(lastId, answers, company);

  if (!q) {
    md(
      stream,
      lang === "pt-br"
        ? "⚠️ Não encontrei a pergunta anterior. Isso pode acontecer se o workflow foi atualizado.\n\n"
        : "⚠️ Could not find the previous question. This may happen if the workflow was updated.\n\n"
    );
    await saveWizardOnly(answers);
    await askNext(stream, lang);
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
  const progress = getProgressInfo(wizard, answers);

  md(
    stream,
    lang === "pt-br"
      ? `↩️ Voltando para a pergunta anterior.\n\n**Progresso:** ${renderProgressBar(progress.percent)} (${progress.asked}/${progress.total} perguntas)\n\n`
      : `↩️ Going back to the previous question.\n\n**Progress:** ${renderProgressBar(progress.percent)} (${progress.asked}/${progress.total} questions)\n\n`
  );
  await renderQuestion(stream, q, lang, aiSuggestions);
}

async function handleSkip(stream: any, lang: "pt-br" | "en") {
  const { answers, company } = await loadState();
  const wizard = ensureWizard(answers);

  const q = wizard.last_question;
  if (!q) {
    md(
      stream,
      lang === "pt-br"
        ? "⚠️ Nenhuma pergunta para pular.\n\n"
        : "⚠️ No question to skip.\n\n"
    );
    return;
  }

  // Check if question is required
  if (q.validation?.required) {
    md(
      stream,
      lang === "pt-br"
        ? `⚠️ Esta pergunta é **obrigatória** e não pode ser pulada.\n\nPor favor, responda: **${q.text["pt-br"]}**\n\n`
        : `⚠️ This question is **required** and cannot be skipped.\n\nPlease answer: **${q.text["en"]}**\n\n`
    );
    const aiSuggestions = buildAutoSuggestions(q, answers, lang);
    await renderQuestion(stream, q, lang, aiSuggestions);
    return;
  }

  // Mark as asked but without saving an answer
  markAsked(wizard, q.id);
  wizard.last_question = null;
  await saveWizardOnly(answers);

  md(
    stream,
    lang === "pt-br"
      ? `⏭️ Pulando: **${q.id}**. Você pode voltar depois.\n\n`
      : `⏭️ Skipping: **${q.id}**. You can come back later.\n\n`
  );

  await askNext(stream, lang);
}

async function handleRestart(stream: any, lang: "pt-br" | "en", answers: any) {
  const wizard = ensureWizard(answers);

  // Clear all state
  answers.answers = {};
  answers.wizard = {
    workflow_id: "businessops_wizard",
    version: 0.2,
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
    active_stage: "CORE_INTAKE",
  };

  await saveWizardOnly(answers);

  md(
    stream,
    lang === "pt-br"
      ? "🔄 Recomeçando do zero. Todas as respostas foram limpas.\n\n"
      : "🔄 Restarting from scratch. All answers have been cleared.\n\n"
  );

  await askNext(stream, lang);
}

async function showStatus(stream: any, lang: "pt-br" | "en") {
  const { answers, company } = await loadState();
  const wizard = ensureWizard(answers);
  const progress = getProgressInfo(wizard, answers);

  const answersObj = answers.answers || {};
  const answeredKeys = Object.keys(answersObj).filter(k => answersObj[k] != null && answersObj[k] !== "" && !k.startsWith("_"));

  md(
    stream,
    lang === "pt-br"
      ? `📊 **Status do Intake**\n\n**Progresso:** ${renderProgressBar(progress.percent)}\n\n- ✅ Perguntas respondidas: ${progress.asked}\n- ⏳ Perguntas na fila: ${wizard.queue?.length || 0}\n- 📋 Estágio atual: ${wizard.active_stage || "CORE_INTAKE"}\n\n`
      : `📊 **Intake Status**\n\n**Progress:** ${renderProgressBar(progress.percent)}\n\n- ✅ Questions answered: ${progress.asked}\n- ⏳ Questions in queue: ${wizard.queue?.length || 0}\n- 📋 Current stage: ${wizard.active_stage || "CORE_INTAKE"}\n\n`
  );

  // Show pending custom data requests
  const pendingData = (wizard as any).pending_custom_data;
  if (pendingData) {
    md(
      stream,
      lang === "pt-br"
        ? `\n---\n\n**❓ Dados Pendentes do Especialista ${pendingData.specialist}:**\n`
        : `\n---\n\n**❓ Pending Data from ${pendingData.specialist} Specialist:**\n`
    );
    for (const req of pendingData.requirements) {
      md(stream, `- ${req.label[lang]}\n`);
    }
    md(
      stream,
      lang === "pt-br"
        ? `\n_Responda com os dados acima ou use \`/skip\` para pular._\n\n`
        : `\n_Reply with the data above or use \`/skip\` to skip._\n\n`
    );
  }

  // Show custom data collected
  const customMeta = answersObj._custom_meta;
  if (customMeta && Object.keys(customMeta).length > 0) {
    md(
      stream,
      lang === "pt-br"
        ? `\n---\n\n**🤖 Dados Coletados por Agentes:**\n`
        : `\n---\n\n**🤖 Data Collected by Agents:**\n`
    );
    for (const [path, meta] of Object.entries(customMeta) as [string, any][]) {
      md(stream, `- \`${path}\` _(${meta.source})_\n`);
    }
    md(stream, "\n");
  }

  if (answeredKeys.length > 0) {
    md(
      stream,
      lang === "pt-br"
        ? "**Respostas salvas:**\n"
        : "**Saved answers:**\n"
    );

    for (const key of answeredKeys.slice(0, 10)) {
      const val = answersObj[key];
      const display = Array.isArray(val) ? val.join(", ") : String(val);
      md(stream, `- \`${key}\`: ${display}\n`);
    }

    if (answeredKeys.length > 10) {
      md(
        stream,
        lang === "pt-br"
          ? `\n_(e mais ${answeredKeys.length - 10} respostas)_\n`
          : `\n_(and ${answeredKeys.length - 10} more answers)_\n`
      );
    }
  }

  md(stream, "\n");

  // If there's a pending question, show it again
  if (wizard.awaiting_answer_for && wizard.last_question) {
    md(
      stream,
      lang === "pt-br"
        ? "---\n\n**Pergunta atual:**\n\n"
        : "---\n\n**Current question:**\n\n"
    );
    const aiSuggestions = buildAutoSuggestions(wizard.last_question, answers, lang);
    await renderQuestion(stream, wizard.last_question, lang, aiSuggestions);
  }
}

async function askNext(stream: any, lang: "pt-br" | "en") {
  const { answers, company } = await loadState();
  const wizard = ensureWizard(answers);

  // Only refresh core queue if not in deep intake mode
  // (deep intake uses refreshWizardQueueAdvanced separately)
  if (wizard.active_stage !== "DEEP_INTAKE") {
    await refreshWizardQueue(answers, company);
    await saveWizardOnly(answers);
  }

  const q = getNextDynamicQuestion(answers);

  if (!q) {
    wizard.completed = true;
    wizard.completed_at = new Date().toISOString().slice(0, 10);
    await saveWizardOnly(answers);

    // Stage selector instead of ending - pass company for status check
    await askStageSelector(stream, lang, answers, company);
    return;
  }

  wizard.current_question_id = q.id;
  wizard.awaiting_answer_for = q.id;
  wizard.last_question = q;

  await saveWizardOnly(answers);

  // Show progress
  const progress = getProgressInfo(wizard, answers);
  if (progress.total > 0) {
    md(
      stream,
      lang === "pt-br"
        ? `**Progresso:** ${renderProgressBar(progress.percent)} (${progress.asked}/${progress.total})\n\n`
        : `**Progress:** ${renderProgressBar(progress.percent)} (${progress.asked}/${progress.total})\n\n`
    );
  }

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
    if (q.placeholder?.[lang]) {
      md(stream, `_Ex.: ${q.placeholder[lang]}_\n`);
    }
    const sk = q.options?.find((o) => o.value === "SKIP");
    if (sk) md(stream, `- \`SKIP\` → ${sk.label[lang]}\n`);
    return;
  }

  // For enum/multiselect: list options directly, no verbose instructions
  for (const opt of q.options || []) {
    md(stream, `- \`${opt.value}\` → ${opt.label[lang]}\n`);
  }

  if (isMulti) {
    md(
      stream,
      lang === "pt-br"
        ? "\n_Múltiplos: separe com vírgula._\n"
        : "\n_Multiple: separate with comma._\n"
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

  // Concise confirmation - just value, no field ID
  const displayValue = Array.isArray(normalized) ? normalized.join(", ") : normalized;
  md(stream, `✅ **${displayValue}**\n\n`);

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
// Method command handler
// -----------------------------

async function runMethod(
  stream: any,
  lang: "pt-br" | "en",
  answers: any,
  company: any,
  args: string
) {
  const ctx = buildContext(answers, company);

  // No args - show help
  if (!args) {
    md(stream, getMethodsHelpText(lang));
    return;
  }

  const parts = args.split(/\s+/);
  const methodId = parts[0].toLowerCase();
  const flags = parts.slice(1);
  const isExplain = flags.includes("--explain") || flags.includes("-e");
  const isChecklist = flags.includes("--checklist") || flags.includes("-c");

  const method = getMethod(methodId);

  if (!method) {
    // Try to find similar methods
    const similar = methodsRegistry
      .filter(m => m.id.includes(methodId) || m.tags.some(t => t.includes(methodId)))
      .slice(0, 5);

    if (similar.length > 0) {
      md(
        stream,
        lang === "pt-br"
          ? `⚠️ Método \`${methodId}\` não encontrado.\n\n**Métodos similares:**\n${similar.map(m => `- \`${m.id}\` → ${m.name["pt-br"]}`).join("\n")}\n\n_Use \`/methods\` para ver todos os métodos disponíveis._\n`
          : `⚠️ Method \`${methodId}\` not found.\n\n**Similar methods:**\n${similar.map(m => `- \`${m.id}\` → ${m.name["en"]}`).join("\n")}\n\n_Use \`/methods\` to see all available methods._\n`
      );
    } else {
      md(
        stream,
        lang === "pt-br"
          ? `⚠️ Método \`${methodId}\` não encontrado. Use \`/methods\` para ver todos os métodos disponíveis.\n`
          : `⚠️ Method \`${methodId}\` not found. Use \`/methods\` to see all available methods.\n`
      );
    }
    return;
  }

  // --explain flag: show knowledge base
  if (isExplain) {
    if (method.getKnowledge) {
      const knowledge = method.getKnowledge(lang);
      md(stream, `# 📚 ${method.name[lang]}\n\n${method.description[lang]}\n\n${knowledge}\n`);
    } else {
      md(
        stream,
        lang === "pt-br"
          ? `# 📚 ${method.name[lang]}\n\n${method.description[lang]}\n\n_Base de conhecimento não disponível para este método._\n`
          : `# 📚 ${method.name[lang]}\n\n${method.description[lang]}\n\n_Knowledge base not available for this method._\n`
      );
    }
    return;
  }

  // --checklist flag: show implementation checklist
  if (isChecklist) {
    if (method.getChecklist) {
      const checklist = method.getChecklist(ctx, lang);
      md(
        stream,
        lang === "pt-br"
          ? `# ✅ Checklist: ${method.name[lang]}\n\n${checklist.map(item => `- [ ] ${item}`).join("\n")}\n`
          : `# ✅ Checklist: ${method.name[lang]}\n\n${checklist.map(item => `- [ ] ${item}`).join("\n")}\n`
      );
    } else {
      md(
        stream,
        lang === "pt-br"
          ? `⚠️ Checklist não disponível para o método \`${methodId}\`.\n`
          : `⚠️ Checklist not available for method \`${methodId}\`.\n`
      );
    }
    return;
  }

  // Default: generate method output
  try {
    // Check for missing data and warn user
    const readiness = checkMethodReadiness(methodId, ctx);
    if (!readiness.ready && readiness.missingData.length > 0) {
      md(
        stream,
        lang === "pt-br"
          ? `⚠️ **Dados incompletos** - Para melhores resultados, complete o intake:\n${readiness.missingData.slice(0, 5).map(d => `- \`${d}\``).join("\n")}\n\n_Continuando com dados disponíveis..._\n\n`
          : `⚠️ **Incomplete data** - For better results, complete the intake:\n${readiness.missingData.slice(0, 5).map(d => `- \`${d}\``).join("\n")}\n\n_Continuing with available data..._\n\n`
      );
    }

    const output = method.generate(ctx, lang);
    md(stream, output);

    // Add footer with related actions
    md(
      stream,
      lang === "pt-br"
        ? `\n---\n_Use \`/method ${methodId} --explain\` para saber mais ou \`/method ${methodId} --checklist\` para o checklist de implementação._\n`
        : `\n---\n_Use \`/method ${methodId} --explain\` to learn more or \`/method ${methodId} --checklist\` for implementation checklist._\n`
    );
  } catch (error: any) {
    md(
      stream,
      lang === "pt-br"
        ? `❌ Erro ao gerar ${method.name[lang]}: ${error?.message || String(error)}\n`
        : `❌ Error generating ${method.name[lang]}: ${error?.message || String(error)}\n`
    );
  }
}

// -----------------------------
// Help
// -----------------------------

function helpText(lang: "pt-br" | "en") {
  if (lang === "pt-br") {
    return `**@BusinessOps** 👋

## Comandos
| Comando | Descrição |
|---------|-----------|
| \`/intake\` | Iniciar questionário |
| \`/generate\` | Gerar documentação |
| \`/status\` | Ver progresso |
| \`/diagnose\` | Diagnóstico organizacional |
| \`/plan\` | Plano 7/30/90 dias |
| \`/methods\` | Listar frameworks |
| \`/help\` | Esta ajuda |

## Navegação
\`VOLTAR\` • \`PULAR\` • \`RECOMEÇAR\` • \`STATUS\`

## Assistência IA
\`EXPLICAR\` • \`REFORMULAR\` • \`SUGERIR\`
`;
  }
  return `**@BusinessOps** 👋

## Commands
| Command | Description |
|---------|-------------|
| \`/intake\` | Start questionnaire |
| \`/generate\` | Generate documentation |
| \`/status\` | View progress |
| \`/diagnose\` | Organizational diagnostic |
| \`/plan\` | 7/30/90 day plan |
| \`/methods\` | List frameworks |
| \`/help\` | This help |

## Navigation
\`BACK\` • \`SKIP\` • \`RESTART\` • \`STATUS\`

## AI Assistance
\`EXPLAIN\` • \`REFRAME\` • \`SUGGEST\`
`;
}

// -----------------------------
// Intelligent Unknown Input Handler
// -----------------------------

interface IntentMatch {
  intent: string;
  confidence: number;
  suggestion: string;
  command?: string;
}

function detectIntent(text: string, lang: "pt-br" | "en"): IntentMatch {
  const t = text.toLowerCase().trim();

  // Intent patterns with keywords
  const patterns: { keywords: string[]; intent: string; command: string; suggestion: Record<string, string> }[] = [
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

  // Find best matching intent
  let bestMatch: IntentMatch = {
    intent: "unknown",
    confidence: 0,
    suggestion: lang === "pt-br"
      ? "Não entendi. Use `/help` para ver os comandos."
      : "I didn't understand. Use `/help` to see commands."
  };

  for (const pattern of patterns) {
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

async function handleUnknownInput(
  text: string,
  stream: any,
  lang: "pt-br" | "en",
  answers: any,
  company: any,
  model?: vscode.LanguageModelChat,
  token?: vscode.CancellationToken
) {
  const wizard = ensureWizard(answers);
  const hasAnswers = Object.keys(answers?.answers || {}).length > 0;
  const deepComplete = isDeepIntakeComplete(answers, company);

  // Try Copilot-powered intent detection if model is available
  if (model && token) {
    try {
      const intentPrompt = `You are an intent classifier for BusinessOps, a business structuring assistant.
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

Context: User has answers: ${hasAnswers}, Intake complete: ${deepComplete}, Language: ${lang}

Respond with ONLY a JSON object: {"intent": "...", "confidence": 0.0-1.0, "needsResponse": true/false}`;

      const messages = [
        vscode.LanguageModelChatMessage.User(intentPrompt),
        vscode.LanguageModelChatMessage.User(`User message: "${text}"`)
      ];

      const response = await model.sendRequest(messages, {}, token);
      let result = "";
      for await (const chunk of response.text) {
        result += chunk;
      }

      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // If it needs a conversational response, generate one with Copilot
        if (parsed.needsResponse && parsed.intent === "question") {
          const companyData = company?.company || {};
          const meta = company?.meta || {};

          const responsePrompt = lang === "pt-br"
            ? `Você é o BusinessOps, assistente de estruturação empresarial. Responda de forma concisa.
Contexto: Setor: ${meta.industry || "não definido"}, País: ${meta.country_mode || "não definido"}
Mantenha respostas curtas (2-3 parágrafos). Sugira comandos relevantes.`
            : `You are BusinessOps, a business structuring assistant. Respond concisely.
Context: Industry: ${meta.industry || "not defined"}, Country: ${meta.country_mode || "not defined"}
Keep responses short (2-3 paragraphs). Suggest relevant commands when appropriate.`;

          const responseMessages = [
            vscode.LanguageModelChatMessage.User(responsePrompt),
            vscode.LanguageModelChatMessage.User(text)
          ];

          const aiResponse = await model.sendRequest(responseMessages, {}, token);
          let aiResult = "";
          for await (const chunk of aiResponse.text) {
            aiResult += chunk;
          }

          if (aiResult.trim()) {
            md(stream, aiResult.trim() + "\n");
            return;
          }
        }

        // High confidence command suggestion
        const intentToCommand: Record<string, string> = {
          intake: "/intake", generate: "/generate", status: "STATUS",
          diagnose: "/diagnose", plan: "/plan", swot: "/swot",
          methods: "/methods", help: "/help", finance: "/finance",
          legal: "/legal", compliance: "/compliance", ops: "/ops",
        };

        if (parsed.confidence >= 0.6 && intentToCommand[parsed.intent]) {
          md(stream, lang === "pt-br"
            ? `💡 Entendi! Use \`${intentToCommand[parsed.intent]}\`\n`
            : `💡 Got it! Use \`${intentToCommand[parsed.intent]}\`\n`
          );
          return;
        }
      }
    } catch (error) {
      console.error("[BusinessOps] Copilot intent detection failed:", error);
    }
  }

  // Fallback to pattern-based detection
  const intent = detectIntent(text, lang);

  // Greeting - give a warm welcome with context-aware suggestions
  if (intent.intent === "greeting") {
    if (deepComplete) {
      md(stream, lang === "pt-br"
        ? `👋 Olá! Seu intake está completo.\n\n**Sugestões:**\n- \`/generate\` → gerar documentação\n- \`/diagnose\` → diagnóstico\n- \`/plan\` → plano de ação\n`
        : `👋 Hello! Your intake is complete.\n\n**Suggestions:**\n- \`/generate\` → generate docs\n- \`/diagnose\` → diagnostic\n- \`/plan\` → action plan\n`
      );
    } else if (hasAnswers) {
      md(stream, lang === "pt-br"
        ? `👋 Olá! Você tem um intake em andamento.\n\n**Sugestões:**\n- \`/intake\` → continuar questionário\n- \`/status\` → ver progresso\n`
        : `👋 Hello! You have an intake in progress.\n\n**Suggestions:**\n- \`/intake\` → continue questionnaire\n- \`/status\` → view progress\n`
      );
    } else {
      md(stream, lang === "pt-br"
        ? `👋 Olá! Sou o **@BusinessOps**, seu assistente para estruturar empresas.\n\n**Para começar:**\n- \`/intake\` → iniciar questionário\n- \`/help\` → ver todos os comandos\n`
        : `👋 Hello! I'm **@BusinessOps**, your assistant for structuring companies.\n\n**To start:**\n- \`/intake\` → start questionnaire\n- \`/help\` → see all commands\n`
      );
    }
    return;
  }

  // High confidence match - suggest the command
  if (intent.confidence >= 0.3 && intent.command) {
    md(stream, lang === "pt-br"
      ? `💡 ${intent.suggestion}\n\n→ Use \`${intent.command}\`\n`
      : `💡 ${intent.suggestion}\n\n→ Use \`${intent.command}\`\n`
    );
    return;
  }

  // Low confidence or unknown - show contextual help
  if (deepComplete) {
    md(stream, lang === "pt-br"
      ? `🤔 Não entendi "${text}".\n\n**Seu intake está completo!** Tente:\n- \`/generate\` → gerar documentação\n- \`/diagnose\` → diagnóstico organizacional\n- \`/plan\` → plano de execução\n- \`/help\` → ver todos os comandos\n`
      : `🤔 I didn't understand "${text}".\n\n**Your intake is complete!** Try:\n- \`/generate\` → generate documentation\n- \`/diagnose\` → organizational diagnostic\n- \`/plan\` → execution plan\n- \`/help\` → see all commands\n`
    );
  } else if (hasAnswers) {
    md(stream, lang === "pt-br"
      ? `🤔 Não entendi "${text}".\n\n**Você tem um intake em andamento.** Tente:\n- \`/intake\` → continuar questionário\n- \`/status\` → ver progresso\n- \`/help\` → ver todos os comandos\n`
      : `🤔 I didn't understand "${text}".\n\n**You have an intake in progress.** Try:\n- \`/intake\` → continue questionnaire\n- \`/status\` → view progress\n- \`/help\` → see all commands\n`
    );
  } else {
    md(stream, lang === "pt-br"
      ? `🤔 Não entendi "${text}".\n\n**Para começar:**\n- \`/intake\` → iniciar questionário\n- \`/help\` → ver todos os comandos\n`
      : `🤔 I didn't understand "${text}".\n\n**To start:**\n- \`/intake\` → start questionnaire\n- \`/help\` → see all commands\n`
    );
  }
}

import { Question, validateQuestion } from "./schema";
import { enqueueQuestions, ensureWizard, popNextQuestion } from "./stateQueue";
import { opsSpecialist } from "./specialists/ops";
import { complianceSpecialist } from "./specialists/compliance";
import { loadCoreWorkflow } from "./yamlWorkflow";
import { WizardState } from "./types";

/**
 * Contexto usado pelo orquestrador para decidir quais perguntas sugerir.
 */

export type OrchestratorContext = {
  lifecycle_mode?: string;
  country_mode?: string;
  language_preference?: string;
  packs?: string[];
  answers?: any;
  company?: any;
};

function getByPath(obj: any, dot: string) {
  const parts = dot.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

export function buildContext(answers: any, company: any): OrchestratorContext {
  const a = answers?.answers || {};

  const packs =
    company?.meta?.packs ||
    (a.industry_pack && typeof a.industry_pack === "string"
      ? [a.industry_pack]
      : ["industry-neutral"]);

  return {
    lifecycle_mode: a.lifecycle_mode,
    country_mode: a.country_mode || company?.meta?.country_mode,
    language_preference: a.language_preference || company?.meta?.language_preference,
    packs,
    answers,
    company
  };
}

export async function refreshWizardQueue(answers: any, company: any) {
  const wizard = ensureWizard(answers);
  if (!wizard.dynamic_enabled) return;

  const existingAnswers = answers?.answers || {};
  const isEmptyAnswers = Object.keys(existingAnswers).length === 0;

  // 1) Core YAML
  let core;
  try {
    core = await loadCoreWorkflow();
  } catch (e) {
    console.error("[businessops] Failed to load intake.core.yaml", e);
    return;
  }

  const coreToEnqueue: Question[] = [];

  for (const q of core.questions) {
    const errs = validateQuestion(q);
    if (errs.length > 0) continue;

    const alreadyAnswered = getByPath(existingAnswers, q.save_to.answers) != null;
    const alreadyAsked = wizard.asked?.includes(q.id);

    if (!alreadyAnswered && (!alreadyAsked || isEmptyAnswers)) {
      coreToEnqueue.push(q);
    }
  }

  enqueueQuestions(wizard, coreToEnqueue);

  // 2) Light ops specialist
  const ctx = buildContext(answers, company);
  const opsQuestions = opsSpecialist(ctx);

  const validOps: Question[] = [];
  for (const q of opsQuestions) {
    const errs = validateQuestion(q);
    if (errs.length === 0) validOps.push(q);
  }

  enqueueQuestions(wizard, validOps);
}

export async function refreshWizardQueueAdvanced(answers: any, company: any) {
  const wizard = ensureWizard(answers);
  if (!wizard.dynamic_enabled) return;

  const ctx = buildContext(answers, company);
  const suggested = complianceSpecialist(ctx);

  const valid: Question[] = [];
  for (const q of suggested) {
    const errs = validateQuestion(q);
    if (errs.length === 0) valid.push(q);
  }

  enqueueQuestions(wizard, valid);
}

export function getNextDynamicQuestion(answers: any): Question | null {
  const wizard = ensureWizard(answers);
  return popNextQuestion(wizard);
}

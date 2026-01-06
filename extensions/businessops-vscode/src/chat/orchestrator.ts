import { Question, validateQuestion } from "./schema";
import { enqueueQuestions, ensureWizard, popNextQuestion } from "./stateQueue";
import { opsSpecialist } from "./specialists/ops";
import { complianceSpecialist } from "./specialists/compliance";
import { financeSpecialist } from "./specialists/finance";
import { legalSpecialist } from "./specialists/legal";
import { loadCoreWorkflow } from "./yamlWorkflow";
import { WizardState } from "./types";

/**
 * Contexto usado pelo orquestrador para decidir quais perguntas sugerir.
 * Contém todas as informações relevantes sobre o estado atual da empresa.
 */
export type OrchestratorContext = {
  // Core intake fields
  lifecycle_mode?: string;
  country_mode?: string;
  language_preference?: string;
  industry?: string;         // industry_sector from answers
  packs?: string[];          // active industry packs
  business_model?: string;
  headcount_range?: string;
  stage?: string;

  // Full state references
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

/**
 * Builds the orchestrator context from answers and company state.
 * This context is passed to all specialists to determine which questions to ask.
 */
export function buildContext(answers: any, company: any): OrchestratorContext {
  const a = answers?.answers || {};
  const meta = company?.meta || {};
  const companyInfo = company?.company || {};

  // Determine active packs
  const packs =
    meta.packs ||
    (a.industry_pack && typeof a.industry_pack === "string"
      ? [a.industry_pack]
      : ["industry-neutral"]);

  return {
    // Core fields - check both answers and company
    lifecycle_mode: a.lifecycle_mode || companyInfo.lifecycle_mode,
    country_mode: a.country_mode || meta.country_mode,
    language_preference: a.language_preference || meta.language_preference,
    industry: a.industry_sector || meta.industry,
    packs,
    business_model: a.business_model || companyInfo.business_model,
    headcount_range: a.headcount_range || companyInfo?.identity?.headcount_range,
    stage: a.stage || companyInfo?.identity?.stage,

    // Full references
    answers,
    company
  };
}

/**
 * Refreshes the wizard queue with core questions and basic specialists (ops).
 * Called during the initial intake flow.
 */
export async function refreshWizardQueue(answers: any, company: any) {
  const wizard = ensureWizard(answers);
  if (!wizard.dynamic_enabled) return;

  const existingAnswers = answers?.answers || {};
  const isEmptyAnswers = Object.keys(existingAnswers).length === 0;

  // 1) Load Core YAML questions
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

  // 2) Build context and get ops specialist questions
  const ctx = buildContext(answers, company);

  // Ops specialist provides universal questions
  const opsQuestions = opsSpecialist(ctx);
  const validOps: Question[] = [];
  for (const q of opsQuestions) {
    const errs = validateQuestion(q);
    if (errs.length === 0) validOps.push(q);
  }
  enqueueQuestions(wizard, validOps);
}

/**
 * Refreshes the wizard queue with advanced/deep specialists.
 * Called when user chooses to "deepen" after basic intake.
 * Includes: compliance, finance, legal specialists.
 */
export async function refreshWizardQueueAdvanced(answers: any, company: any) {
  const wizard = ensureWizard(answers);
  if (!wizard.dynamic_enabled) return;

  const ctx = buildContext(answers, company);

  // Collect questions from all advanced specialists
  const allQuestions: Question[] = [
    ...complianceSpecialist(ctx),
    ...financeSpecialist(ctx),
    ...legalSpecialist(ctx),
  ];

  const valid: Question[] = [];
  for (const q of allQuestions) {
    const errs = validateQuestion(q);
    if (errs.length === 0) valid.push(q);
  }

  enqueueQuestions(wizard, valid);

  // Update active stage
  wizard.active_stage = "DEEP_INTAKE";
}

/**
 * Gets all available specialists for a given context.
 * Useful for debugging and introspection.
 */
export function getAllSpecialists() {
  return {
    ops: opsSpecialist,
    compliance: complianceSpecialist,
    finance: financeSpecialist,
    legal: legalSpecialist,
  };
}

export function getNextDynamicQuestion(answers: any): Question | null {
  const wizard = ensureWizard(answers);
  return popNextQuestion(wizard);
}

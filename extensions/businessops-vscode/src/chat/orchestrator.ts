import { loadCoreWorkflow } from "./yamlWorkflow";
import { Question, validateQuestion } from "./schema";
import { enqueueQuestions, ensureWizard, popNextQuestion } from "./stateQueue";
import { complianceSpecialist } from "./specialists/compliance";
import { opsSpecialist } from "./specialists/ops";

export type OrchestratorContext = {
  country_mode?: string;
  language_preference?: string;
  packs?: string[];
  lifecycle_mode?: string;
  answers?: any;
  company?: any;
};

export async function seedCoreQuestions(answers: any) {
  const wf = await loadCoreWorkflow();
  const wizard = ensureWizard(answers);

  // adiciona perguntas core na queue (se não estiverem respondidas)
  const existingAnswers = answers?.answers || {};
  const toAdd = wf.questions.filter(q => {
    // only enqueue if missing in answers
    const path = q.save_to?.answers;
    if (!path) return false;
    // quick check: only top-level keys for core
    const topKey = path.split(".")[0];
    return existingAnswers[topKey] == null;
  });

  enqueueQuestions(wizard, toAdd);
}

export function buildContext(answers: any, company: any): OrchestratorContext {
  const a = answers?.answers || {};
  return {
    lifecycle_mode: a.lifecycle_mode,
    country_mode: a.country_mode || company?.meta?.country_mode,
    language_preference: a.language_preference || company?.meta?.language_preference,
    packs: company?.meta?.packs || a.packs || ["industry-neutral"],
    answers,
    company
  };
}

export async function refreshWizardQueue(answers: any, company: any) {
  await seedCoreQuestions(answers);
  upsertDynamicQuestionsIntoWizard(answers, company);
}

export function runSpecialists(ctx: OrchestratorContext): Question[] {
  const suggestions: Question[] = [];
  suggestions.push(...complianceSpecialist(ctx));
  suggestions.push(...opsSpecialist(ctx));
  return suggestions;
}

export function upsertDynamicQuestionsIntoWizard(answers: any, company: any) {
  const wizard = ensureWizard(answers);
  if (!wizard.dynamic_enabled) return;

  const ctx = buildContext(answers, company);
  const suggested = runSpecialists(ctx);

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

import { Question } from "./schema";
import type { WizardState } from "./types";

export function ensureWizard(answers: any): WizardState {
  if (!answers.wizard) {
    answers.wizard = {
      workflow_id: "businessops_wizard",
      version: 0.1,
      mode: "robust",

      // core flags
      dynamic_enabled: true,
      pending_reset_prompt: false,

      // current question state
      awaiting_answer_for: null,
      last_question: null,
      current_question_id: null,

      // queue
      queue: [],
      asked: [],

      // completion
      completed: false,
      completed_at: null,

      // stage selector (after intake)
      awaiting_stage_choice: false,

      // AI assist logs
      help_events: [],

      // optional future proofing
      active_stage: "CORE_INTAKE",
    };
  }

  const w = answers.wizard as WizardState;

  // defensive defaults (in case YAML has partial wizard object)
  if (!w.workflow_id) w.workflow_id = "businessops_wizard";
  if (w.version === undefined) w.version = 0.1;
  if (!w.mode) w.mode = "robust";

  if (w.dynamic_enabled === undefined) w.dynamic_enabled = true;
  if (w.pending_reset_prompt === undefined) w.pending_reset_prompt = false;

  if (w.queue === undefined || !Array.isArray(w.queue)) w.queue = [];
  if (w.asked === undefined || !Array.isArray(w.asked)) w.asked = [];

  if (w.current_question_id === undefined) w.current_question_id = null;
  if (w.awaiting_answer_for === undefined) w.awaiting_answer_for = null;
  if (w.last_question === undefined) w.last_question = null;

  if (w.completed === undefined) w.completed = false;
  if (w.completed_at === undefined) w.completed_at = null;

  if (w.awaiting_stage_choice === undefined) w.awaiting_stage_choice = false;

  if (w.help_events === undefined || !Array.isArray(w.help_events)) w.help_events = [];

  if (w.active_stage === undefined) w.active_stage = "CORE_INTAKE";

  return w;
}

export function enqueueQuestions(wizard: WizardState, questions: Question[]) {
  if (!wizard.queue) wizard.queue = [];
  if (!wizard.asked) wizard.asked = [];

  const existing = new Set((wizard.queue || []).map((q) => q.id));

  for (const q of questions) {
    if (!existing.has(q.id) && !wizard.asked.includes(q.id)) {
      wizard.queue.push(q);
      existing.add(q.id);
    }
  }

  // sort by priority (desc), then stable by id
  wizard.queue.sort(
    (a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.id.localeCompare(b.id)
  );
}

export function popNextQuestion(wizard: WizardState): Question | null {
  if (!wizard.queue || wizard.queue.length === 0) return null;

  const q = wizard.queue.shift()!;
  wizard.current_question_id = q.id;
  wizard.awaiting_answer_for = q.id;
  wizard.last_question = q;

  return q;
}

export function markAsked(wizard: WizardState, questionId: string) {
  if (!wizard.asked) wizard.asked = [];
  if (!wizard.asked.includes(questionId)) wizard.asked.push(questionId);

  wizard.current_question_id = null;
  wizard.awaiting_answer_for = null;
}

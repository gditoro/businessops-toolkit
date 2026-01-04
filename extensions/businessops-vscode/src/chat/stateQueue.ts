import { Question } from "./schema";

export type WizardState = {
  workflow_id: string;
  version: number;
  mode: string;

  dynamic_enabled?: boolean;

  queue?: Question[];
  asked?: string[];

  current_question_id?: string | null;
  awaiting_answer_for?: string | null;

  pending_reset_prompt?: boolean;

  last_question?: Question | null;

  // completion metadata (important for /intake resume/reset decision)
  completed?: boolean;
  completed_at?: string | null;
};

export function ensureWizard(answers: any): WizardState {
  if (!answers.wizard) {
    answers.wizard = {
      workflow_id: "businessops_wizard",
      version: 0.1,
      mode: "robust",
    };
  }

  const w = answers.wizard as WizardState;
  if (!w.queue) w.queue = [];
  if (!w.asked) w.asked = [];
  if (w.dynamic_enabled === undefined) w.dynamic_enabled = true;
  if (w.current_question_id === undefined) w.current_question_id = null;
  if (w.awaiting_answer_for === undefined) w.awaiting_answer_for = null;
  if (w.last_question === undefined) w.last_question = null;
  if (w.completed === undefined) w.completed = false;
  if (w.completed_at === undefined) w.completed_at = null;

  return w;
}

export function enqueueQuestions(wizard: WizardState, questions: Question[]) {
  const existing = new Set((wizard.queue || []).map((q) => q.id));
  for (const q of questions) {
    if (!existing.has(q.id) && !wizard.asked?.includes(q.id)) {
      wizard.queue!.push(q);
      existing.add(q.id);
    }
  }

  // sort by priority (desc), then stable
  wizard.queue!.sort(
    (a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.id.localeCompare(b.id)
  );
}

export function popNextQuestion(wizard: WizardState): Question | null {
  if (!wizard.queue || wizard.queue.length === 0) return null;
  const q = wizard.queue.shift()!;
  wizard.current_question_id = q.id;
  wizard.awaiting_answer_for = q.id;
  return q;
}

export function markAsked(wizard: WizardState, questionId: string) {
  wizard.asked = wizard.asked || [];
  if (!wizard.asked.includes(questionId)) wizard.asked.push(questionId);
  wizard.current_question_id = null;
  wizard.awaiting_answer_for = null;
}

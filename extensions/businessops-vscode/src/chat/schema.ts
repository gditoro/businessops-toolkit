export type Lang = "pt-br" | "en";

export type QuestionType = "enum" | "text" | "multiselect";

export type QuestionOption = {
  value: string; // canonical
  label: Record<Lang, string>;
};

export type QuestionSaveTo = {
  answers: string; // dot-path
  company?: string; // dot-path
};

/**
 * Condition for conditional questions.
 * Allows questions to be shown only when certain conditions are met.
 *
 * Examples:
 * - { field: "country_mode", equals: "BR" }
 * - { field: "industry_sector", in: ["HEALTHCARE", "FOOD"] }
 * - { field: "stage", not_equals: "IDEA" }
 */
export type QuestionCondition = {
  field: string;              // dot-path to check in answers
  equals?: string;            // must equal this value
  not_equals?: string;        // must not equal this value
  in?: string[];              // must be one of these values
  not_in?: string[];          // must not be one of these values
  exists?: boolean;           // field must exist (true) or not exist (false)
};

export type Question = {
  id: string;
  text: Record<Lang, string>;
  type: QuestionType;
  options?: QuestionOption[];
  placeholder?: Record<Lang, string>;
  validation?: { required?: boolean; minLength?: number; maxLength?: number };
  save_to: QuestionSaveTo;
  tags?: string[];
  priority?: number;          // higher = asked sooner
  created_by?: string;        // specialist id (e.g., "specialist:ops")
  condition?: QuestionCondition; // optional condition for showing this question
};

export function validateQuestion(q: Question): string[] {
  const errs: string[] = [];

  if (!q.id) errs.push("Missing id");
  if (!q.text?.["pt-br"] || !q.text?.["en"]) errs.push("Missing bilingual text");
  if (!q.type) errs.push("Missing type");
  if (!q.save_to?.answers) errs.push("Missing save_to.answers");

  if (q.type === "enum" || q.type === "multiselect") {
    if (!q.options || q.options.length === 0) errs.push("Missing options for enum/multiselect");
    else {
      for (const o of q.options) {
        if (!o.value) errs.push(`Option missing value in ${q.id}`);
        if (!o.label?.["pt-br"] || !o.label?.["en"]) errs.push(`Option missing bilingual label in ${q.id}`);
      }
    }
  }

  return errs;
}

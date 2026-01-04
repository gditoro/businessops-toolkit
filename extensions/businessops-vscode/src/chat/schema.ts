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

export type Question = {
  id: string;
  text: Record<Lang, string>;
  type: QuestionType;
  options?: QuestionOption[];
  placeholder?: Record<Lang, string>;
  validation?: { required?: boolean; minLength?: number; maxLength?: number };
  save_to: QuestionSaveTo;
  tags?: string[];
  priority?: number; // higher = sooner
  created_by?: string; // specialist id
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

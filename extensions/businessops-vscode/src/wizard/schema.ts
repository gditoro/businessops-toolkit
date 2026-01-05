// Re-export core schema types for wizard use
export { Question, QuestionOption, QuestionType, Lang, validateQuestion } from "../chat/schema";

// Wizard-specific answer type (flat key-value for webview simplicity)
export type Answers = {
  lifecycle_mode?: "NEW" | "EXISTING" | "UNKNOWN";
  country_mode?: "BR" | "GLOBAL" | "UNKNOWN";
  language_preference?: "PT-BR" | "EN" | "BILINGUAL" | "UNKNOWN";
  industry_pack?: "industry-neutral" | "health-import" | "UNKNOWN";
  company_name?: string;
  one_liner?: string;
  stage?: "IDEA" | "EARLY" | "GROWTH" | "SCALE" | "UNKNOWN";
  headcount_range?: "SOLO" | "SMALL" | "MEDIUM" | "LARGE" | "UNKNOWN";
  [key: string]: any; // Allow dynamic fields from YAML workflow
};

export type WizardState = {
  answers: Answers;
};

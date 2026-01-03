export type Answers = {
  lifecycle_mode?: "NEW" | "EXISTING" | "UNKNOWN";
  country_mode?: "BR" | "GLOBAL" | "UNKNOWN";
  language_preference?: "PT-BR" | "EN" | "BILINGUAL" | "UNKNOWN";
  industry_pack?: "industry-neutral" | "health-import" | "UNKNOWN";
  company_name?: string;
  one_liner?: string;
  stage?: "IDEA" | "EARLY" | "GROWTH" | "SCALE" | "UNKNOWN";
  headcount_range?: "SOLO" | "SMALL" | "MEDIUM" | "LARGE" | "UNKNOWN";
};

export type WizardState = {
  answers: Answers;
};

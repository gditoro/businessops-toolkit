import { Question } from "../chat/schema";

export type StepOption = { value: string; label: string };
export type Step =
  | {
      id: string;
      type: "select";
      titlePt: string;
      titleEn: string;
      options: StepOption[];
      required?: boolean;
    }
  | {
      id: string;
      type: "text";
      titlePt: string;
      titleEn: string;
      placeholderPt?: string;
      placeholderEn?: string;
      required?: boolean;
    };

/**
 * Convert a Question from YAML schema to webview Step format
 */
export function questionToStep(q: Question): Step {
  if (q.type === "text") {
    return {
      id: q.id,
      type: "text",
      titlePt: q.text["pt-br"],
      titleEn: q.text["en"],
      placeholderPt: q.placeholder?.["pt-br"],
      placeholderEn: q.placeholder?.["en"],
      required: q.validation?.required ?? false
    };
  }

  // enum or multiselect -> select
  return {
    id: q.id,
    type: "select",
    titlePt: q.text["pt-br"],
    titleEn: q.text["en"],
    options: (q.options || []).map(o => ({
      value: o.value,
      label: `${o.value} — ${o.label["pt-br"]}`
    })),
    required: q.validation?.required ?? true
  };
}

/**
 * Fallback steps when YAML can't be loaded (used by WizardPanel)
 * These match the core intake.yaml structure
 */
export const STEPS: Step[] = [
  {
    id: "lifecycle_mode",
    type: "select",
    required: true,
    titlePt: "A empresa é nova ou já existente?",
    titleEn: "Is the company new or existing?",
    options: [
      { value: "NEW", label: "NEW — nova" },
      { value: "EXISTING", label: "EXISTING — existente" },
      { value: "UNKNOWN", label: "UNKNOWN — não sei" }
    ]
  },
  {
    id: "country_mode",
    type: "select",
    required: true,
    titlePt: "Qual o modo de país/regras?",
    titleEn: "Which country/rules mode?",
    options: [
      { value: "BR", label: "BR — Brasil" },
      { value: "GLOBAL", label: "GLOBAL — Global" },
      { value: "UNKNOWN", label: "UNKNOWN — não sei" }
    ]
  },
  {
    id: "language_preference",
    type: "select",
    required: true,
    titlePt: "Qual idioma dos documentos?",
    titleEn: "Which language for generated docs?",
    options: [
      { value: "PT-BR", label: "PT-BR — português" },
      { value: "EN", label: "EN — English" },
      { value: "BILINGUAL", label: "BILINGUAL — PT + EN" },
      { value: "UNKNOWN", label: "UNKNOWN — não sei" }
    ]
  },
  {
    id: "industry_pack",
    type: "select",
    required: true,
    titlePt: "Qual pack você quer ativar?",
    titleEn: "Which pack should be enabled?",
    options: [
      { value: "industry-neutral", label: "industry-neutral" },
      { value: "health-import", label: "health-import" },
      { value: "UNKNOWN", label: "UNKNOWN" }
    ]
  },
  {
    id: "company_name",
    type: "text",
    titlePt: "Qual é o nome da empresa?",
    titleEn: "What is the company name?",
    placeholderPt: "Ex: Gamma Crucis",
    placeholderEn: "e.g., Gamma Crucis"
  },
  {
    id: "one_liner",
    type: "text",
    required: true,
    titlePt: "Em 1 frase: o que a empresa faz?",
    titleEn: "In one sentence: what does the company do?",
    placeholderPt: "Ex: Importação e distribuição de materiais médicos descartáveis no Brasil.",
    placeholderEn: "e.g., Import and distribution of disposable medical supplies in Brazil."
  },
  {
    id: "stage",
    type: "select",
    required: true,
    titlePt: "Em que estágio você está?",
    titleEn: "What stage are you in?",
    options: [
      { value: "IDEA", label: "IDEA" },
      { value: "EARLY", label: "EARLY" },
      { value: "GROWTH", label: "GROWTH" },
      { value: "SCALE", label: "SCALE" },
      { value: "UNKNOWN", label: "UNKNOWN" }
    ]
  },
  {
    id: "headcount_range",
    type: "select",
    required: true,
    titlePt: "Qual o tamanho do time hoje?",
    titleEn: "What is the team size today?",
    options: [
      { value: "SOLO", label: "SOLO" },
      { value: "SMALL", label: "SMALL (2-10)" },
      { value: "MEDIUM", label: "MEDIUM (11-50)" },
      { value: "LARGE", label: "LARGE (51+)" },
      { value: "UNKNOWN", label: "UNKNOWN" }
    ]
  }
];

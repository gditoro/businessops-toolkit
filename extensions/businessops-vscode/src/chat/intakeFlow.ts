import * as vscode from "vscode";
import * as path from "node:path";
import { readYaml, writeYaml } from "../state/yaml";
import { getRepoRoot } from "../state/paths";

/**
 * Core intake steps - these are now loaded dynamically from intake.core.yaml
 * This type is kept for backwards compatibility with legacy code paths
 */
export type IntakeStep =
  | "lifecycle_mode"
  | "country_mode"
  | "language_preference"
  | "industry_sector"
  | "industry_pack"
  | "company_name"
  | "one_liner"
  | "business_model"
  | "headcount_range"
  | "stage";

export type AnswersState = {
  wizard?: {
    workflow_id: string;
    version: number;
    mode: string;
    pending_reset_prompt?: boolean;
    awaiting_step?: string | null;
  };
  answers?: Record<string, any>;
};

export type CompanyState = any;

/**
 * Find the next missing step in the core intake flow.
 * @deprecated Use the dynamic queue system via orchestrator instead
 */
export function nextMissingStep(answers: AnswersState): IntakeStep | null {
  const a = answers.answers || {};
  const order: IntakeStep[] = [
    "lifecycle_mode",
    "country_mode",
    "language_preference",
    "industry_sector",
    "industry_pack",
    "company_name",
    "one_liner",
    "business_model",
    "headcount_range",
    "stage"
  ];

  for (const step of order) {
    if (!a[step]) return step;
  }
  return null;
}

/**
 * Get prompt configuration for a specific step.
 * @deprecated Questions are now loaded from YAML and specialists
 */
export function promptForStep(step: IntakeStep, lang: "pt-br" | "en") {
  const pt = lang === "pt-br";

  switch (step) {
    case "lifecycle_mode":
      return {
        question: pt
          ? "A empresa é nova ou já existente?"
          : "Is the company new or existing?",
        options: [
          { label: "NEW", detail: pt ? "empresa nova" : "new company" },
          { label: "EXISTING", detail: pt ? "já opera" : "already operating" },
          { label: "UNKNOWN", detail: pt ? "não sei" : "not sure" }
        ]
      };

    case "country_mode":
      return {
        question: pt ? "Qual o país principal de operação?" : "Main country of operation?",
        options: [
          { label: "BR", detail: pt ? "Brasil" : "Brazil" },
          { label: "US", detail: pt ? "Estados Unidos" : "United States" },
          { label: "EU", detail: pt ? "Europa" : "Europe" },
          { label: "GLOBAL", detail: pt ? "Global" : "Global" },
          { label: "OTHER", detail: pt ? "Outro" : "Other" },
          { label: "UNKNOWN", detail: pt ? "não sei" : "not sure" }
        ]
      };

    case "language_preference":
      return {
        question: pt ? "Idioma dos documentos gerados?" : "Docs language?",
        options: [
          { label: "BILINGUAL", detail: pt ? "PT-BR + EN" : "PT-BR + EN" },
          { label: "PT-BR", detail: pt ? "só português" : "Portuguese only" },
          { label: "EN", detail: pt ? "só inglês" : "English only" }
        ]
      };

    case "industry_sector":
      return {
        question: pt ? "Qual o setor/indústria?" : "What industry/sector?",
        options: [
          { label: "HEALTHCARE", detail: pt ? "Saúde" : "Healthcare" },
          { label: "TECHNOLOGY", detail: pt ? "Tecnologia" : "Technology" },
          { label: "RETAIL", detail: pt ? "Varejo" : "Retail" },
          { label: "SERVICES", detail: pt ? "Serviços" : "Services" },
          { label: "OTHER", detail: pt ? "Outro" : "Other" }
        ]
      };

    case "industry_pack":
      return {
        question: pt ? "Qual pacote especializado ativar?" : "Which specialized pack?",
        options: [
          { label: "industry-neutral", detail: pt ? "padrão" : "default" },
          { label: "health-import", detail: pt ? "importação saúde" : "health import" },
          { label: "saas-startup", detail: pt ? "SaaS Startup" : "SaaS Startup" },
          { label: "ecommerce", detail: pt ? "E-commerce" : "E-commerce" },
          { label: "consulting", detail: pt ? "Consultoria" : "Consulting" }
        ]
      };

    case "company_name":
      return {
        question: pt ? "Qual o nome da empresa?" : "Company name?",
        options: [{ label: "SKIP", detail: pt ? "pular por agora" : "skip" }]
      };

    case "one_liner":
      return {
        question: pt
          ? "Descreva a empresa em uma frase (one-liner)."
          : "Describe the company in one sentence (one-liner).",
        options: [{ label: "SKIP", detail: pt ? "pular por agora" : "skip" }]
      };

    case "business_model":
      return {
        question: pt ? "Qual o modelo de negócio?" : "What's the business model?",
        options: [
          { label: "B2B", detail: pt ? "Vende para empresas" : "Sells to businesses" },
          { label: "B2C", detail: pt ? "Vende para consumidores" : "Sells to consumers" },
          { label: "B2B2C", detail: pt ? "Ambos via parceiros" : "Both via partners" },
          { label: "MARKETPLACE", detail: pt ? "Marketplace" : "Marketplace" },
          { label: "UNKNOWN", detail: pt ? "não sei" : "not sure" }
        ]
      };

    case "headcount_range":
      return {
        question: pt ? "Quantos funcionários?" : "How many employees?",
        options: [
          { label: "SOLO", detail: pt ? "Só eu" : "Just me" },
          { label: "MICRO", detail: pt ? "1-9" : "1-9" },
          { label: "SMALL", detail: pt ? "10-49" : "10-49" },
          { label: "MEDIUM", detail: pt ? "50-249" : "50-249" },
          { label: "LARGE", detail: pt ? "250+" : "250+" }
        ]
      };

    case "stage":
      return {
        question: pt ? "Qual estágio da empresa?" : "What stage is the company?",
        options: [
          { label: "IDEA", detail: pt ? "Ideia" : "Idea" },
          { label: "MVP", detail: pt ? "MVP" : "MVP" },
          { label: "EARLY", detail: pt ? "Primeiros clientes" : "Early customers" },
          { label: "GROWTH", detail: pt ? "Crescimento" : "Growth" },
          { label: "MATURE", detail: pt ? "Madura" : "Mature" }
        ]
      };
  }
}

/**
 * Load the current wizard and company state from YAML files.
 */
export async function loadState() {
  const root = await getRepoRoot();
  const answersPath = path.join(root, "businessops", "state", "answers.yaml");
  const companyPath = path.join(root, "businessops", "state", "company.yaml");

  const answers = (await readYaml<AnswersState>(answersPath)) || {
    wizard: { workflow_id: "businessops_wizard", version: 0.2, mode: "robust" },
    answers: {}
  };

  const company = (await readYaml<CompanyState>(companyPath)) || {
    company: { identity: {}, compliance: {}, ops: {}, finance: {}, legal: {} },
    meta: { language_preference: "BILINGUAL", country_mode: null, packs: ["industry-neutral"] }
  };

  return { root, answersPath, companyPath, answers, company };
}

/**
 * Save a step answer to both answers.yaml and company.yaml.
 * @deprecated Use saveDynamicAnswer for new code
 */
export async function saveStep(step: IntakeStep, value: string) {
  const { answersPath, companyPath, answers, company } = await loadState();

  answers.answers = answers.answers || {};
  answers.answers[step] = value;

  // Mirror into company.yaml where appropriate
  company.meta = company.meta || {};
  company.company = company.company || {};
  company.company.identity = company.company.identity || {};

  switch (step) {
    case "lifecycle_mode":
      company.company.lifecycle_mode = value;
      break;
    case "country_mode":
      company.meta.country_mode = value;
      break;
    case "language_preference":
      company.meta.language_preference = value;
      break;
    case "industry_sector":
      company.meta.industry = value;
      break;
    case "industry_pack":
      company.meta.packs = [value];
      break;
    case "company_name":
      if (value !== "SKIP") company.company.identity.name = value;
      break;
    case "one_liner":
      if (value !== "SKIP") company.company.identity.one_liner = value;
      break;
    case "business_model":
      company.company.business_model = value;
      break;
    case "headcount_range":
      company.company.identity.headcount_range = value;
      break;
    case "stage":
      company.company.identity.stage = value;
      break;
  }

  await writeYaml(answersPath, answers);
  await writeYaml(companyPath, company);

  return { answers, company };
}

import * as vscode from "vscode";
import * as path from "node:path";
import { readYaml, writeYaml } from "../state/yaml";
import { getRepoRoot } from "../state/paths";

export type IntakeStep =
  | "lifecycle_mode"
  | "country_mode"
  | "language_preference"
  | "industry_pack"
  | "company_name"
  | "one_liner";

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

export function nextMissingStep(answers: AnswersState): IntakeStep | null {
  const a = answers.answers || {};
  const order: IntakeStep[] = [
    "lifecycle_mode",
    "country_mode",
    "language_preference",
    "industry_pack",
    "company_name",
    "one_liner"
  ];

  for (const step of order) {
    if (!a[step]) return step;
  }
  return null;
}

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
        question: pt ? "Qual o modo de país/regras?" : "Country/rules mode?",
        options: [
          { label: "BR", detail: pt ? "Brasil" : "Brazil" },
          { label: "GLOBAL", detail: pt ? "global" : "global" },
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

    case "industry_pack":
      return {
        question: pt ? "Qual pacote (indústria) ativar?" : "Which industry pack?",
        options: [
          { label: "industry-neutral", detail: pt ? "padrão" : "default" },
          { label: "health-import", detail: pt ? "importação saúde" : "health import" },
          { label: "UNKNOWN", detail: pt ? "não sei" : "not sure" }
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
  }
}

export async function loadState() {
  const root = await getRepoRoot();
  const answersPath = path.join(root, "businessops", "state", "answers.yaml");
  const companyPath = path.join(root, "businessops", "state", "company.yaml");

  const answers = (await readYaml<AnswersState>(answersPath)) || {
    wizard: { workflow_id: "businessops_wizard", version: 0.1, mode: "robust" },
    answers: {}
  };

  const company = (await readYaml<CompanyState>(companyPath)) || {
    company: { identity: {} },
    meta: { language_preference: "BILINGUAL", country_mode: "BR", packs: ["industry-neutral"] }
  };

  return { root, answersPath, companyPath, answers, company };
}

export async function saveStep(step: IntakeStep, value: string) {
  const { answersPath, companyPath, answers, company } = await loadState();

  answers.answers = answers.answers || {};
  answers.answers[step] = value;

  // mirror into company.yaml where appropriate
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
    case "industry_pack":
      company.meta.packs = [value];
      break;
    case "company_name":
      if (value !== "SKIP") company.company.identity.name = value;
      break;
    case "one_liner":
      if (value !== "SKIP") company.company.identity.one_liner = value;
      break;
  }

  await writeYaml(answersPath, answers);
  await writeYaml(companyPath, company);

  return { answers, company };
}

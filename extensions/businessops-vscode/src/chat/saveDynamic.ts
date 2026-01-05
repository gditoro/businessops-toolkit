import { setByPath } from "./dotPath";
import { loadState } from "./intakeFlow";
import { writeYaml } from "../state/yaml";
import { Question } from "./schema";

/**
 * Detects if a save path should store an array value.
 * Used to properly handle multiselect questions and pack selections.
 */
function looksLikeArrayField(path: string): boolean {
  // Common list field patterns
  const arrayPatterns = [
    // Packs and modules
    "packs",
    "modules",
    // Multi-value operational fields
    "outsourced_services",
    "sales_channels",
    "key_challenges",
    "payment_methods",
    "tools",
    // Legal multi-value fields
    "ip_assets",
    "key_contracts",
    "insurance",
    // Generic patterns
    "_list",
    "_items",
    "_array",
  ];

  return arrayPatterns.some((pattern) => path.endsWith(pattern) || path.includes(pattern + "."));
}

/**
 * Saves a dynamic answer from the intake flow.
 * Handles both answers.yaml and company.yaml updates.
 */
export async function saveDynamicAnswer(question: Question, rawValue: any) {
  const { answersPath, companyPath, answers, company } = await loadState();

  answers.answers = answers.answers || {};

  // Normalize value based on question type and target
  let valueToSave = rawValue;

  // Handle multiselect questions - ensure array format
  if (question.type === "multiselect" && !Array.isArray(rawValue)) {
    if (typeof rawValue === "string" && rawValue.includes(",")) {
      valueToSave = rawValue.split(",").map((v: string) => v.trim()).filter(Boolean);
    } else if (rawValue && rawValue !== "SKIP") {
      valueToSave = [rawValue];
    }
  }

  // Special handling for industry_pack -> meta.packs (always array)
  if (question.id === "industry_pack" && question.save_to.company?.endsWith("meta.packs")) {
    if (typeof rawValue === "string" && rawValue !== "UNKNOWN" && rawValue !== "SKIP") {
      valueToSave = [rawValue];
    }
  }

  // Save to answers.yaml via dot-path
  setByPath(answers.answers, question.save_to.answers, valueToSave);

  // Save to company.yaml if specified
  if (question.save_to.company) {
    let companyValue = valueToSave;

    // Ensure array format for known array fields
    if (looksLikeArrayField(question.save_to.company) && typeof companyValue === "string") {
      if (companyValue !== "SKIP" && companyValue !== "UNKNOWN") {
        companyValue = [companyValue];
      }
    }

    setByPath(company, question.save_to.company, companyValue);
  }

  await writeYaml(answersPath, answers);
  await writeYaml(companyPath, company);
}

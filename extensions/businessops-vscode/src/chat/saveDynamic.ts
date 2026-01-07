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
    "tags",
    "notes",
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

/**
 * Custom data request from an agent/specialist
 */
export interface CustomDataRequest {
  /** Unique ID for this data point */
  id: string;
  /** Which agent/specialist requested this */
  source: string;
  /** The question to ask the user */
  prompt: {
    "pt-br": string;
    "en": string;
  };
  /** Where to save in company.yaml */
  savePath: string;
  /** Optional: expected type */
  type?: "text" | "number" | "boolean" | "list";
  /** Optional: context for why this is needed */
  reason?: {
    "pt-br": string;
    "en": string;
  };
  /** When was this requested */
  requestedAt?: string;
}

/**
 * Saves custom data requested by an agent.
 * Used when specialists need information beyond the standard intake.
 */
export async function saveCustomData(
  savePath: string,
  value: any,
  options?: {
    source?: string;
    appendIfArray?: boolean;
  }
) {
  const { companyPath, answersPath, answers, company } = await loadState();

  // Determine if this is an array field
  const isArrayField = looksLikeArrayField(savePath);

  let valueToSave = value;

  // Handle array appending
  if (options?.appendIfArray && isArrayField) {
    const existing = getByPath(company, savePath);
    if (Array.isArray(existing)) {
      valueToSave = [...existing, ...(Array.isArray(value) ? value : [value])];
    } else if (existing) {
      valueToSave = [existing, ...(Array.isArray(value) ? value : [value])];
    } else {
      valueToSave = Array.isArray(value) ? value : [value];
    }
  }

  // Save to company.yaml
  setByPath(company, savePath, valueToSave);

  // Also save a reference in answers for tracking
  const answerPath = savePath.replace("company.", "custom.");
  answers.answers = answers.answers || {};
  answers.answers.custom = answers.answers.custom || {};
  setByPath(answers.answers, answerPath, valueToSave);

  // Track metadata about custom data
  answers.answers._custom_meta = answers.answers._custom_meta || {};
  answers.answers._custom_meta[savePath] = {
    source: options?.source || "agent",
    savedAt: new Date().toISOString(),
  };

  await writeYaml(companyPath, company);
  await writeYaml(answersPath, answers);
}

/**
 * Queue a custom data request from an agent.
 * Returns a pending request that can be shown to the user.
 */
export async function queueCustomDataRequest(
  request: CustomDataRequest
): Promise<void> {
  const { answersPath, answers } = await loadState();

  answers.answers = answers.answers || {};
  answers.answers._pending_custom = answers.answers._pending_custom || [];

  // Check if already requested
  const existing = answers.answers._pending_custom.find(
    (r: CustomDataRequest) => r.id === request.id
  );
  if (existing) return;

  // Add to queue
  answers.answers._pending_custom.push({
    ...request,
    requestedAt: new Date().toISOString(),
  });

  await writeYaml(answersPath, answers);
}

/**
 * Get pending custom data requests
 */
export async function getPendingCustomRequests(): Promise<CustomDataRequest[]> {
  const { answers } = await loadState();
  return answers.answers?._pending_custom || [];
}

/**
 * Clear a pending custom data request after it's been answered
 */
export async function clearCustomRequest(requestId: string): Promise<void> {
  const { answersPath, answers } = await loadState();

  if (answers.answers?._pending_custom) {
    answers.answers._pending_custom = answers.answers._pending_custom.filter(
      (r: CustomDataRequest) => r.id !== requestId
    );
    await writeYaml(answersPath, answers);
  }
}

/**
 * Helper to get value by dot path
 */
function getByPath(obj: any, path: string): any {
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

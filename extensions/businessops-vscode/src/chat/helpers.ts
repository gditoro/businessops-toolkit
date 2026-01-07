import * as vscode from "vscode";
import { WizardState } from "./types";
import { writeYaml } from "../state/yaml";
import { loadState } from "./intakeFlow";
import { ensureWizard as ensureWizardBase } from "./stateQueue";

// Re-export ensureWizard from stateQueue
export const ensureWizard = ensureWizardBase;

// -----------------------------
// Stream/Markdown Helpers
// -----------------------------

export function md(stream: any, content: string) {
  if (typeof stream.markdown === "function") return stream.markdown(content);
  if (typeof stream.appendMarkdown === "function")
    return stream.appendMarkdown(content);
  if (typeof stream.append === "function") return stream.append(content);
  if (typeof stream.write === "function") return stream.write(content);
  throw new Error("No markdown-capable method found on ChatResponseStream");
}

// -----------------------------
// String Helpers
// -----------------------------

export function norm(s: string) {
  return (s || "").trim();
}

export function upper(s: string) {
  return norm(s).toUpperCase();
}

export function isCommand(input: string) {
  return norm(input).startsWith("/");
}

export function stripBusinessOpsPrefix(input: string) {
  return input.replace(/^(\s*@businessops\s*)+/i, "").trim();
}

export function sanitizeUserInput(input: string) {
  let s = stripBusinessOpsPrefix(input);
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

// -----------------------------
// Language Helper
// -----------------------------

export type Lang = "pt-br" | "en";

export function getLang(company: any): Lang {
  const pref = company?.meta?.language_preference || "BILINGUAL";
  if (pref === "EN") return "en";
  return "pt-br";
}

// -----------------------------
// State Helpers
// -----------------------------

export function hasAnyAnswers(answers: any) {
  const a = answers?.answers || {};
  return Object.keys(a).length > 0;
}

export async function saveWizardOnly(answers: any, saveAnswers?: (data: any) => Promise<void>) {
  if (saveAnswers) {
    await saveAnswers(answers);
  } else {
    const { answersPath } = await loadState();
    await writeYaml(answersPath, answers);
  }
}

export function ensureHelpLog(wizard: any) {
  if (!wizard.help_events) wizard.help_events = [];
  return wizard.help_events;
}

export function deleteAtPath(obj: any, dotPath: string) {
  const parts = (dotPath || "").split(".").filter(Boolean);
  if (parts.length === 0) return;

  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (cur[key] == null || typeof cur[key] !== "object") return;
    cur = cur[key];
  }

  const last = parts[parts.length - 1];
  if (last in cur) delete cur[last];
}

// -----------------------------
// Progress Helpers
// -----------------------------

export function getProgressInfo(answers: any): { answered: number; total: number; percent: number } {
  const wizard = answers?.wizard;
  const askedCount = wizard?.asked?.length || 0;
  const queueCount = wizard?.queue?.length || 0;
  const total = askedCount + queueCount;
  const percent = total > 0 ? Math.round((askedCount / total) * 100) : 0;
  return { answered: askedCount, total, percent };
}

export function renderProgressBar(percent: number, width: number = 20): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${percent}%`;
}

// -----------------------------
// Intake Status Helpers
// -----------------------------

export function isDeepIntakeComplete(answers: any, company: any): boolean {
  const wizard = answers?.wizard;
  if (!wizard) return false;

  // Check if active_stage is DEEP_INTAKE and queue is empty
  if (wizard.active_stage === "DEEP_INTAKE" && (!wizard.queue || wizard.queue.length === 0)) {
    return true;
  }

  // Check if deep specialist questions have been asked
  const asked = wizard.asked || [];
  const deepQuestionPrefixes = ["compliance.", "finance.", "legal."];
  const hasDeepQuestions = deepQuestionPrefixes.every(prefix =>
    asked.some((id: string) => id.startsWith(prefix))
  );

  if (hasDeepQuestions) {
    return true;
  }

  // Alternative check: see if we have answers from deep specialists
  const c = company?.company || {};
  const hasCompliance = c.compliance && Object.keys(c.compliance).length > 3;
  const hasOps = c.ops && Object.keys(c.ops).length > 0;
  const hasFinance = c.finance && Object.keys(c.finance).length > 0;
  const hasLegal = c.legal && Object.keys(c.legal).length > 0;

  return hasCompliance && hasOps && hasFinance && hasLegal;
}

export function isCoreIntakeComplete(answers: any, _company?: any): boolean {
  const wizard = answers?.wizard;
  if (!wizard) return false;

  const coreQuestions = [
    "lifecycle_mode", "country_mode", "language_preference",
    "industry_sector", "industry_pack", "company_name",
    "one_liner", "business_model", "headcount_range", "stage"
  ];

  const asked = wizard.asked || [];
  return coreQuestions.every(q => asked.includes(q));
}

// -----------------------------
// Followup Builder
// -----------------------------

export function buildFollowup(label: string, prompt: string): vscode.ChatFollowup {
  return { label, prompt };
}

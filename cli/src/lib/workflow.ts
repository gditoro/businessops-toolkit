import fs from "fs-extra";
import path from "node:path";
import YAML from "yaml";

export type Workflow = {
  workflow_id: string;
  version: number | string;
  defaults?: Record<string, any>;
  globals?: Record<string, any>;
  sections: WorkflowSection[];
};

export type WorkflowSection = {
  id: string;
  title?: Record<string, string>;
  description?: Record<string, string>;
  when?: WorkflowCondition;
  questions: WorkflowQuestion[];
};

export type WorkflowCondition = {
  equals: Record<string, any>;
};

export type WorkflowQuestion = {
  id: string;
  type: "text" | "single_choice" | "multi_choice" | "confirm";
  required?: boolean;
  prompt: Record<string, string>;
  options?: Array<{ value: string; label: Record<string, string> }>;
  map_to?: { path: string };
};

export async function loadWorkflow(filePath: string): Promise<Workflow> {
  const content = await fs.readFile(filePath, "utf8");
  const wf = YAML.parse(content) as Workflow;

  if (!wf.workflow_id || !wf.sections?.length) {
    throw new Error("Invalid workflow.yaml: missing workflow_id or sections.");
  }

  return wf;
}

export function shouldRunSection(section: WorkflowSection, answers: any): boolean {
  if (!section.when) return true;
  const eq = section.when.equals ?? {};
  for (const [key, value] of Object.entries(eq)) {
    if (answers?.[key] !== value) return false;
  }
  return true;
}

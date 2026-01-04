import * as path from "node:path";
import { readYaml } from "../state/yaml";
import { getRepoRoot } from "../state/paths";
import { Question, validateQuestion } from "./schema";

export type WorkflowFile = {
  workflow_id: string;
  version: number;
  mode: string;
  questions: Question[];
};

export async function loadCoreWorkflow(): Promise<WorkflowFile> {
  const root = await getRepoRoot();
  const workflowPath = path.join(root, "businessops", "workflows", "intake.core.yaml");
  const wf = await readYaml<WorkflowFile>(workflowPath);

  if (!wf || !wf.questions) {
    throw new Error(`Core workflow not found or invalid at: ${workflowPath}`);
  }

  const valid: Question[] = [];
  for (const q of wf.questions) {
    const errs = validateQuestion(q);
    if (errs.length === 0) valid.push(q);
  }

  return { ...wf, questions: valid };
}

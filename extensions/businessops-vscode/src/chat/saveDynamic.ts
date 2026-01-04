import { setByPath } from "./dotPath";
import { loadState } from "./intakeFlow";
import { writeYaml } from "../state/yaml";
import { Question } from "./schema";

function looksLikeArrayField(path: string) {
  // Common list fields
  return (
    path.endsWith("meta.packs") ||
    path.endsWith("packs") ||
    path.endsWith("outsourced_services") ||
    path.endsWith("channels") ||
    path.endsWith("customer_type")
  );
}

export async function saveDynamicAnswer(question: Question, rawValue: any) {
  const { answersPath, companyPath, answers, company } = await loadState();

  answers.answers = answers.answers || {};

  // Normalize for array fields if needed
  let valueToSave = rawValue;

  // If saving a pack into meta.packs, store as [pack]
  if (question.id === "industry_pack" && question.save_to.company?.endsWith("meta.packs")) {
    if (typeof rawValue === "string" && rawValue !== "UNKNOWN" && rawValue !== "SKIP") {
      valueToSave = [rawValue];
    }
  }

  // Save to answers.yaml via dot-path
  setByPath(answers.answers, question.save_to.answers, valueToSave);

  // Save to company.yaml if requested
  if (question.save_to.company) {
    // `company` object includes both company + meta in our file.
    // So use company root.
    if (looksLikeArrayField(question.save_to.company) && typeof valueToSave === "string") {
      valueToSave = [valueToSave];
    }
    setByPath(company, question.save_to.company, valueToSave);
  }

  await writeYaml(answersPath, answers);
  await writeYaml(companyPath, company);
}

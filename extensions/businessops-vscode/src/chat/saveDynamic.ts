import { setByPath } from "./dotPath";
import { loadState } from "../chat/intakeFlow";
import { writeYaml } from "../state/yaml";
import { Question } from "./schema";

export async function saveDynamicAnswer(question: Question, rawValue: any) {
  const { answersPath, companyPath, answers, company } = await loadState();

  answers.answers = answers.answers || {};

  // Save to answers
  setByPath(answers.answers, question.save_to.answers, rawValue);

  // Optional mirror into company.yaml
  if (question.save_to.company) {
    company.company = company.company || {};
    setByPath(company, question.save_to.company, rawValue);
  }

  await writeYaml(answersPath, answers);
  await writeYaml(companyPath, company);
}

import { Question } from "../schema";

export function complianceSpecialist(ctx: any): Question[] {
  const { country_mode, packs } = ctx;

  if (!packs?.includes("health-import")) return [];

  const questions: Question[] = [];

  // ANVISA license
  questions.push({
    id: "compliance.anvisa_license_active",
    text: {
      "pt-br": "Você possui licença/regularização ANVISA ativa para operar com esses produtos? ([VERIFY])",
      "en": "Do you have an active ANVISA license/registration to operate with these products? ([VERIFY])"
    },
    type: "enum",
    options: [
      { value: "YES", label: { "pt-br": "Sim", "en": "Yes" } },
      { value: "NO", label: { "pt-br": "Não", "en": "No" } },
      { value: "UNKNOWN", label: { "pt-br": "Não sei", "en": "Not sure" } }
    ],
    save_to: { answers: "compliance.anvisa_license_active", company: "company.compliance.anvisa_license_active" },
    tags: ["compliance", "health-import", "br"],
    priority: 100,
    created_by: "specialist:compliance"
  });

  // Product registration
  questions.push({
    id: "compliance.product_registration",
    text: {
      "pt-br": "Os produtos exigem registro ou notificação na ANVISA? Marque tudo que se aplica. ([VERIFY])",
      "en": "Do the products require registration or notification at ANVISA? Select all that apply. ([VERIFY])"
    },
    type: "multiselect",
    options: [
      { value: "REGISTRATION", label: { "pt-br": "Registro", "en": "Registration" } },
      { value: "NOTIFICATION", label: { "pt-br": "Notificação", "en": "Notification" } },
      { value: "BOTH", label: { "pt-br": "Ambos (registro e notificação dependendo do produto)", "en": "Both (registration and notification depending on the product)" } },
      { value: "NONE", label: { "pt-br": "Nenhum exige registro/notificação", "en": "None require registration/notification" } },
      { value: "MIXED", label: { "pt-br": "Alguns exigem registro e outros notificação", "en": "Some require registration, others notification" } },
      { value: "OTHER", label: { "pt-br": "Outro (especifique ao responder)", "en": "Other (specify in your reply)" } },
      { value: "UNKNOWN", label: { "pt-br": "Não sei", "en": "Not sure" } }
    ],
    save_to: { answers: "compliance.product_registration", company: "company.compliance.product_registration" },
    tags: ["compliance", "health-import", "br"],
    priority: 90,
    created_by: "specialist:compliance"
  });

  return questions;
}

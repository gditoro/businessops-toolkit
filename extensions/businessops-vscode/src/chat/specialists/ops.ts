import { Question } from "../schema";

export function opsSpecialist(ctx: any): Question[] {
  const { packs } = ctx;

  if (!packs?.includes("health-import")) return [];

  return [
    {
      id: "ops.outsourced_services",
      text: {
        "pt-br": "Quais serviços você terceiriza hoje? (pode marcar mais de um)",
        "en": "Which services do you outsource today? (select all that apply)"
      },
      type: "multiselect",
      options: [
        { value: "ACCOUNTING", label: { "pt-br": "Contabilidade", "en": "Accounting" } },
        { value: "CUSTOMS", label: { "pt-br": "Despacho aduaneiro", "en": "Customs broker" } },
        { value: "WAREHOUSE", label: { "pt-br": "Armazém / logística", "en": "Warehouse / logistics" } },
        { value: "LEGAL", label: { "pt-br": "Jurídico", "en": "Legal" } },
        { value: "PAYROLL", label: { "pt-br": "Folha / RH", "en": "Payroll / HR" } }
      ],
      save_to: { answers: "ops.outsourced_services", company: "company.ops.outsourced_services" },
      tags: ["ops", "health-import"],
      priority: 80,
      created_by: "specialist:ops"
    },
    {
      id: "ops.inventory_model",
      text: {
        "pt-br": "Seu modelo de entrega é baseado em estoque próprio?",
        "en": "Is your delivery model based on owning inventory?"
      },
      type: "enum",
      options: [
        { value: "INVENTORY", label: { "pt-br": "Sim, estoque", "en": "Yes, inventory" } },
        { value: "DROPSHIP", label: { "pt-br": "Não, sob demanda", "en": "No, on-demand" } },
        { value: "UNKNOWN", label: { "pt-br": "Não sei", "en": "Not sure" } }
      ],
      save_to: { answers: "ops.delivery_type", company: "company.ops.delivery_type" },
      tags: ["ops", "health-import"],
      priority: 70,
      created_by: "specialist:ops"
    }
  ];
}

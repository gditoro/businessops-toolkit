import { Question } from "../schema";
import { OrchestratorContext } from "../orchestrator";

/**
 * Legal Specialist - Generic for all industries
 * Provides questions about legal structure, contracts, and intellectual property
 */
export function legalSpecialist(ctx: OrchestratorContext): Question[] {
  const { country_mode, packs, industry, stage } = ctx;
  const questions: Question[] = [];

  // Universal: Founder/ownership structure
  questions.push({
    id: "legal.founders",
    text: {
      "pt-br": "Quantos sócios/fundadores a empresa tem?",
      "en": "How many partners/founders does the company have?"
    },
    type: "enum",
    options: [
      { value: "SOLO", label: { "pt-br": "1 (fundador solo)", "en": "1 (solo founder)" } },
      { value: "TWO", label: { "pt-br": "2 sócios", "en": "2 partners" } },
      { value: "THREE_FOUR", label: { "pt-br": "3-4 sócios", "en": "3-4 partners" } },
      { value: "FIVE_PLUS", label: { "pt-br": "5+ sócios", "en": "5+ partners" } },
      { value: "CORP_OWNED", label: { "pt-br": "Pertence a outra empresa", "en": "Owned by another company" } },
      { value: "NOT_DEFINED", label: { "pt-br": "Ainda não definido", "en": "Not yet defined" } }
    ],
    save_to: { answers: "legal.founders", company: "company.legal.founders" },
    tags: ["legal", "universal"],
    priority: 500,
    created_by: "specialist:legal"
  });

  // Universal: Partnership agreement
  questions.push({
    id: "legal.partnership_agreement",
    text: {
      "pt-br": "Existe contrato social/acordo de sócios formalizado?",
      "en": "Is there a formal partnership/shareholders agreement?"
    },
    type: "enum",
    options: [
      { value: "YES_COMPLETE", label: { "pt-br": "Sim, completo e assinado", "en": "Yes, complete and signed" } },
      { value: "YES_BASIC", label: { "pt-br": "Sim, mas básico", "en": "Yes, but basic" } },
      { value: "IN_PROGRESS", label: { "pt-br": "Em elaboração", "en": "In progress" } },
      { value: "NO", label: { "pt-br": "Não", "en": "No" } },
      { value: "SOLO", label: { "pt-br": "Não aplicável (sócio único)", "en": "Not applicable (sole owner)" } }
    ],
    save_to: { answers: "legal.partnership_agreement", company: "company.legal.partnership_agreement" },
    tags: ["legal", "universal"],
    priority: 490,
    created_by: "specialist:legal"
  });

  // Universal: Vesting for startups
  const isStartup = stage === "IDEA" || stage === "MVP" || stage === "EARLY" ||
    packs?.includes("saas-startup");

  if (isStartup) {
    questions.push({
      id: "legal.vesting",
      text: {
        "pt-br": "Existe cláusula de vesting para os sócios?",
        "en": "Is there a vesting clause for the partners?"
      },
      type: "enum",
      options: [
        { value: "YES", label: { "pt-br": "Sim", "en": "Yes" } },
        { value: "NO", label: { "pt-br": "Não", "en": "No" } },
        { value: "PLANNING", label: { "pt-br": "Planejando implementar", "en": "Planning to implement" } },
        { value: "NOT_APPLICABLE", label: { "pt-br": "Não aplicável", "en": "Not applicable" } },
        { value: "UNKNOWN", label: { "pt-br": "Não sei o que é", "en": "Don't know what it is" } }
      ],
      save_to: { answers: "legal.vesting", company: "company.legal.vesting" },
      tags: ["legal", "startup"],
      priority: 485,
      created_by: "specialist:legal"
    });
  }

  // Universal: Intellectual property
  questions.push({
    id: "legal.ip_assets",
    text: {
      "pt-br": "A empresa possui ativos de propriedade intelectual?",
      "en": "Does the company have intellectual property assets?"
    },
    type: "multiselect",
    options: [
      { value: "TRADEMARK", label: { "pt-br": "Marca registrada", "en": "Registered trademark" } },
      { value: "TRADEMARK_PENDING", label: { "pt-br": "Marca em processo de registro", "en": "Trademark pending" } },
      { value: "PATENT", label: { "pt-br": "Patente", "en": "Patent" } },
      { value: "SOFTWARE", label: { "pt-br": "Software/código proprietário", "en": "Proprietary software/code" } },
      { value: "TRADE_SECRET", label: { "pt-br": "Segredo comercial/know-how", "en": "Trade secret/know-how" } },
      { value: "DESIGN", label: { "pt-br": "Design industrial", "en": "Industrial design" } },
      { value: "COPYRIGHT", label: { "pt-br": "Direitos autorais", "en": "Copyright" } },
      { value: "NONE", label: { "pt-br": "Nenhum ainda", "en": "None yet" } },
      { value: "UNKNOWN", label: { "pt-br": "Não sei", "en": "Not sure" } }
    ],
    save_to: { answers: "legal.ip_assets", company: "company.legal.ip_assets" },
    tags: ["legal", "universal"],
    priority: 480,
    created_by: "specialist:legal"
  });

  // Universal: Key contracts in place
  questions.push({
    id: "legal.key_contracts",
    text: {
      "pt-br": "Quais contratos-chave a empresa já possui?",
      "en": "Which key contracts does the company already have?"
    },
    type: "multiselect",
    options: [
      { value: "CUSTOMER_CONTRACT", label: { "pt-br": "Contrato com clientes", "en": "Customer contracts" } },
      { value: "SUPPLIER_CONTRACT", label: { "pt-br": "Contrato com fornecedores", "en": "Supplier contracts" } },
      { value: "EMPLOYMENT", label: { "pt-br": "Contratos de trabalho", "en": "Employment contracts" } },
      { value: "NDA", label: { "pt-br": "NDA/Confidencialidade", "en": "NDA/Confidentiality" } },
      { value: "SERVICE_AGREEMENT", label: { "pt-br": "Contratos de prestação de serviços", "en": "Service agreements" } },
      { value: "TERMS_OF_SERVICE", label: { "pt-br": "Termos de uso/serviço", "en": "Terms of service" } },
      { value: "PRIVACY_POLICY", label: { "pt-br": "Política de privacidade", "en": "Privacy policy" } },
      { value: "LEASE", label: { "pt-br": "Contrato de aluguel/imóvel", "en": "Lease agreement" } },
      { value: "NONE", label: { "pt-br": "Nenhum formalizado", "en": "None formalized" } }
    ],
    save_to: { answers: "legal.key_contracts", company: "company.legal.key_contracts" },
    tags: ["legal", "universal"],
    priority: 470,
    created_by: "specialist:legal"
  });

  // Universal: Legal support
  questions.push({
    id: "legal.legal_support",
    text: {
      "pt-br": "Como a empresa lida com questões jurídicas?",
      "en": "How does the company handle legal matters?"
    },
    type: "enum",
    options: [
      { value: "IN_HOUSE", label: { "pt-br": "Advogado interno", "en": "In-house lawyer" } },
      { value: "EXTERNAL_RETAINED", label: { "pt-br": "Escritório contratado (retainer)", "en": "Retained law firm" } },
      { value: "EXTERNAL_AD_HOC", label: { "pt-br": "Advogado externo (por demanda)", "en": "External lawyer (ad-hoc)" } },
      { value: "TEMPLATES", label: { "pt-br": "Modelos prontos/internet", "en": "Templates/online" } },
      { value: "NONE", label: { "pt-br": "Sem suporte jurídico ainda", "en": "No legal support yet" } }
    ],
    save_to: { answers: "legal.legal_support", company: "company.legal.legal_support" },
    tags: ["legal", "universal"],
    priority: 460,
    created_by: "specialist:legal"
  });

  // For technology companies
  const isTech = industry === "TECHNOLOGY" || packs?.includes("saas-startup");
  if (isTech) {
    questions.push({
      id: "legal.software_licenses",
      text: {
        "pt-br": "O software utiliza código open-source?",
        "en": "Does the software use open-source code?"
      },
      type: "enum",
      options: [
        { value: "YES_COMPLIANT", label: { "pt-br": "Sim, licenças compatíveis", "en": "Yes, compatible licenses" } },
        { value: "YES_UNKNOWN", label: { "pt-br": "Sim, não sei as licenças", "en": "Yes, unknown licenses" } },
        { value: "NO", label: { "pt-br": "Não usa open-source", "en": "No open-source used" } },
        { value: "UNKNOWN", label: { "pt-br": "Não sei", "en": "Not sure" } }
      ],
      save_to: { answers: "legal.software_licenses", company: "company.legal.software_licenses" },
      tags: ["legal", "tech"],
      priority: 455,
      created_by: "specialist:legal"
    });
  }

  // Universal: Insurance
  questions.push({
    id: "legal.insurance",
    text: {
      "pt-br": "A empresa possui seguros empresariais?",
      "en": "Does the company have business insurance?"
    },
    type: "multiselect",
    options: [
      { value: "LIABILITY", label: { "pt-br": "Responsabilidade civil", "en": "General liability" } },
      { value: "PROFESSIONAL", label: { "pt-br": "Responsabilidade profissional (E&O)", "en": "Professional liability (E&O)" } },
      { value: "CYBER", label: { "pt-br": "Cyber/dados", "en": "Cyber/data" } },
      { value: "PROPERTY", label: { "pt-br": "Patrimonial", "en": "Property" } },
      { value: "DIRECTORS", label: { "pt-br": "D&O (diretores)", "en": "D&O (directors & officers)" } },
      { value: "HEALTH", label: { "pt-br": "Saúde para funcionários", "en": "Employee health" } },
      { value: "NONE", label: { "pt-br": "Nenhum", "en": "None" } },
      { value: "PLANNING", label: { "pt-br": "Planejando contratar", "en": "Planning to get" } }
    ],
    save_to: { answers: "legal.insurance", company: "company.legal.insurance" },
    tags: ["legal", "universal"],
    priority: 450,
    created_by: "specialist:legal"
  });

  return questions;
}

import { Question } from "../schema";
import { OrchestratorContext } from "../orchestrator";
import { getSpecialistMethodRecommendations, formatMethodSuggestions } from "../methodAdvisor";

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

/**
 * Generate Legal Analysis Report
 */
export function generateLegalAnalysis(
  ctx: OrchestratorContext,
  lang: "pt-br" | "en"
): string {
  const company = ctx.company?.company || {};
  const legal = company.legal || {};
  const stage = ctx.stage || company.stage || "idea";

  const founders = legal.founders;
  const partnershipAgreement = legal.partnership_agreement;
  const ipAssets = legal.ip_assets || [];
  const keyContracts = legal.key_contracts || [];
  const legalSupport = legal.legal_support;
  const insurance = legal.insurance || [];

  // Risk analysis
  const risks: string[] = [];
  const gaps: string[] = [];
  const actions: string[] = [];

  if (founders !== "SOLO" && partnershipAgreement !== "YES_COMPLETE") {
    risks.push(lang === "pt-br" ? "🔴 Sem acordo de sócios formalizado" : "🔴 No formalized partnership agreement");
    actions.push(lang === "pt-br" ? "Formalizar contrato social/acordo de sócios" : "Formalize partnership/shareholders agreement");
  }

  if (partnershipAgreement === "IN_PROGRESS") {
    gaps.push(lang === "pt-br" ? "Acordo de sócios em elaboração" : "Partnership agreement in progress");
  }

  if (!ipAssets.includes("TRADEMARK") && !ipAssets.includes("NONE")) {
    gaps.push(lang === "pt-br" ? "Marca não registrada" : "Trademark not registered");
    actions.push(lang === "pt-br" ? "Registrar marca no INPI" : "Register trademark");
  }

  if (keyContracts.includes("NONE") || keyContracts.length === 0) {
    gaps.push(lang === "pt-br" ? "Contratos não formalizados" : "Contracts not formalized");
    actions.push(lang === "pt-br" ? "Formalizar contratos-chave" : "Formalize key contracts");
  }

  if (legalSupport === "NONE") {
    gaps.push(lang === "pt-br" ? "Sem suporte jurídico" : "No legal support");
    actions.push(lang === "pt-br" ? "Considerar assessoria jurídica" : "Consider legal counsel");
  }

  if (insurance.includes("NONE")) {
    gaps.push(lang === "pt-br" ? "Sem seguros contratados" : "No insurance contracted");
  }

  // Missing data
  const missingData: string[] = [];
  if (!founders) missingData.push(lang === "pt-br" ? "Estrutura societária" : "Ownership structure");
  if (!partnershipAgreement) missingData.push(lang === "pt-br" ? "Acordo de sócios" : "Partnership agreement");
  if (ipAssets.length === 0) missingData.push(lang === "pt-br" ? "Ativos de PI" : "IP assets");

  const methodRecs = getSpecialistMethodRecommendations(ctx, "LEGAL");
  const methodsSection = formatMethodSuggestions(methodRecs, lang);

  if (lang === "pt-br") {
    return `# ⚖️ Análise Jurídica

## Estrutura Societária
- **Fundadores:** ${getFoundersLabel(founders, lang)}
- **Acordo de sócios:** ${getAgreementLabel(partnershipAgreement, lang)}
- **Suporte jurídico:** ${getSupportLabel(legalSupport, lang)}

---

## 🔴 Riscos Jurídicos
${risks.length > 0 ? risks.map(r => `- ${r}`).join("\n") : "- Nenhum risco crítico identificado"}

---

## 📊 Lacunas Identificadas
${gaps.length > 0 ? gaps.map(g => `- ${g}`).join("\n") : "- Nenhuma lacuna significativa"}

---

## ✅ Ações Recomendadas
${actions.length > 0 ? actions.map((a, i) => `${i + 1}. ${a}`).join("\n") : "- Continue monitorando questões jurídicas"}

---

## 🏷️ Propriedade Intelectual
${ipAssets.length > 0 && !ipAssets.includes("NONE")
  ? ipAssets.map((ip: string) => `- ${getIPLabel(ip, lang)}`).join("\n")
  : "- Nenhum ativo de PI registrado"}

---

## 📝 Contratos-Chave
${keyContracts.length > 0 && !keyContracts.includes("NONE")
  ? keyContracts.map((c: string) => `- ${getContractLabel(c, lang)}`).join("\n")
  : "- Nenhum contrato formalizado"}

---

## 🛡️ Seguros
${insurance.length > 0 && !insurance.includes("NONE")
  ? insurance.map((i: string) => `- ${getInsuranceLabel(i, lang)}`).join("\n")
  : "- Nenhum seguro contratado"}

---

## 📋 Checklist Jurídico

${getLegalChecklist(stage, lang)}

${missingData.length > 0 ? `\n---\n\n⚠️ **Dados faltando:**\n${missingData.map(d => `- ${d}`).join("\n")}\n\n_Use \`/intake\` para completar._` : ""}
${methodsSection}
`;
  } else {
    return `# ⚖️ Legal Analysis

## Ownership Structure
- **Founders:** ${getFoundersLabel(founders, lang)}
- **Partnership agreement:** ${getAgreementLabel(partnershipAgreement, lang)}
- **Legal support:** ${getSupportLabel(legalSupport, lang)}

---

## 🔴 Legal Risks
${risks.length > 0 ? risks.map(r => `- ${r}`).join("\n") : "- No critical risks identified"}

---

## 📊 Identified Gaps
${gaps.length > 0 ? gaps.map(g => `- ${g}`).join("\n") : "- No significant gaps"}

---

## ✅ Recommended Actions
${actions.length > 0 ? actions.map((a, i) => `${i + 1}. ${a}`).join("\n") : "- Continue monitoring legal matters"}

---

## 🏷️ Intellectual Property
${ipAssets.length > 0 && !ipAssets.includes("NONE")
  ? ipAssets.map((ip: string) => `- ${getIPLabel(ip, lang)}`).join("\n")
  : "- No IP assets registered"}

---

## 📝 Key Contracts
${keyContracts.length > 0 && !keyContracts.includes("NONE")
  ? keyContracts.map((c: string) => `- ${getContractLabel(c, lang)}`).join("\n")
  : "- No contracts formalized"}

---

## 🛡️ Insurance
${insurance.length > 0 && !insurance.includes("NONE")
  ? insurance.map((i: string) => `- ${getInsuranceLabel(i, lang)}`).join("\n")
  : "- No insurance contracted"}

---

## 📋 Legal Checklist

${getLegalChecklist(stage, lang)}

${missingData.length > 0 ? `\n---\n\n⚠️ **Missing data:**\n${missingData.map(d => `- ${d}`).join("\n")}\n\n_Use \`/intake\` to complete._` : ""}
${methodsSection}
`;
  }
}

function getFoundersLabel(value: string | undefined, lang: "pt-br" | "en"): string {
  const labels: Record<string, Record<string, string>> = {
    SOLO: { "pt-br": "1 (fundador solo)", en: "1 (solo founder)" },
    TWO: { "pt-br": "2 sócios", en: "2 partners" },
    THREE_FOUR: { "pt-br": "3-4 sócios", en: "3-4 partners" },
    FIVE_PLUS: { "pt-br": "5+ sócios", en: "5+ partners" },
    CORP_OWNED: { "pt-br": "Pertence a outra empresa", en: "Owned by another company" },
  };
  return labels[value || ""]?.[lang] || (lang === "pt-br" ? "_Não informado_" : "_Not provided_");
}

function getAgreementLabel(value: string | undefined, lang: "pt-br" | "en"): string {
  const labels: Record<string, Record<string, string>> = {
    YES_COMPLETE: { "pt-br": "Sim, completo", en: "Yes, complete" },
    YES_BASIC: { "pt-br": "Sim, básico", en: "Yes, basic" },
    IN_PROGRESS: { "pt-br": "Em elaboração", en: "In progress" },
    NO: { "pt-br": "Não", en: "No" },
    SOLO: { "pt-br": "N/A (sócio único)", en: "N/A (sole owner)" },
  };
  return labels[value || ""]?.[lang] || (lang === "pt-br" ? "_Não informado_" : "_Not provided_");
}

function getSupportLabel(value: string | undefined, lang: "pt-br" | "en"): string {
  const labels: Record<string, Record<string, string>> = {
    NONE: { "pt-br": "Nenhum", en: "None" },
    OCCASIONAL: { "pt-br": "Ocasional", en: "Occasional" },
    RETAINER: { "pt-br": "Contrato mensal", en: "Retainer" },
    INHOUSE: { "pt-br": "Jurídico interno", en: "In-house counsel" },
  };
  return labels[value || ""]?.[lang] || (lang === "pt-br" ? "_Não informado_" : "_Not provided_");
}

function getIPLabel(value: string, lang: "pt-br" | "en"): string {
  const labels: Record<string, Record<string, string>> = {
    TRADEMARK: { "pt-br": "Marca registrada", en: "Trademark" },
    PATENT: { "pt-br": "Patente", en: "Patent" },
    COPYRIGHT: { "pt-br": "Direitos autorais", en: "Copyright" },
    TRADE_SECRET: { "pt-br": "Segredo comercial", en: "Trade secret" },
    DOMAIN: { "pt-br": "Domínios", en: "Domains" },
  };
  return labels[value]?.[lang] || value;
}

function getContractLabel(value: string, lang: "pt-br" | "en"): string {
  const labels: Record<string, Record<string, string>> = {
    CUSTOMER: { "pt-br": "Contratos com clientes", en: "Customer contracts" },
    SUPPLIER: { "pt-br": "Contratos com fornecedores", en: "Supplier contracts" },
    EMPLOYEE: { "pt-br": "Contratos de trabalho", en: "Employment contracts" },
    NDA: { "pt-br": "NDAs", en: "NDAs" },
    PARTNERSHIP: { "pt-br": "Parcerias", en: "Partnerships" },
  };
  return labels[value]?.[lang] || value;
}

function getInsuranceLabel(value: string, lang: "pt-br" | "en"): string {
  const labels: Record<string, Record<string, string>> = {
    LIABILITY: { "pt-br": "Responsabilidade civil", en: "General liability" },
    PROFESSIONAL: { "pt-br": "E&O", en: "E&O" },
    CYBER: { "pt-br": "Cyber", en: "Cyber" },
    PROPERTY: { "pt-br": "Patrimonial", en: "Property" },
    DIRECTORS: { "pt-br": "D&O", en: "D&O" },
    HEALTH: { "pt-br": "Saúde", en: "Health" },
  };
  return labels[value]?.[lang] || value;
}

function getLegalChecklist(stage: string, lang: "pt-br" | "en"): string {
  if (lang === "pt-br") {
    return `- [ ] Contrato social/atos constitutivos
- [ ] Acordo de sócios (se > 1 sócio)
- [ ] Vesting para fundadores (startups)
- [ ] Contratos com clientes
- [ ] Contratos com fornecedores
- [ ] Contratos de trabalho
- [ ] Termos de uso e políticas
- [ ] Registro de marca
- [ ] NDAs com colaboradores`;
  }
  return `- [ ] Articles of incorporation
- [ ] Shareholders agreement (if > 1 owner)
- [ ] Founder vesting (startups)
- [ ] Customer contracts
- [ ] Supplier contracts
- [ ] Employment contracts
- [ ] Terms of service and policies
- [ ] Trademark registration
- [ ] NDAs with team members`;
}

export function getLegalPrompt(lang: "pt-br" | "en"): string {
  return lang === "pt-br"
    ? `Você é um especialista em direito empresarial, com foco em:
- Estrutura societária e acordos de sócios
- Propriedade intelectual (marcas, patentes)
- Contratos comerciais
- Seguros empresariais
- Compliance trabalhista
- Due diligence para investimentos

Responda de forma prática e objetiva.
Alerte sobre riscos legais.
Recomende métodos de análise quando apropriado.`
    : `You are a corporate law specialist focusing on:
- Corporate structure and shareholder agreements
- Intellectual property (trademarks, patents)
- Commercial contracts
- Business insurance
- Employment compliance
- Investment due diligence

Respond practically and objectively.
Alert about legal risks.
Recommend analysis methods when appropriate.`;
}
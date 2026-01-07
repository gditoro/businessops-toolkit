import { Question } from "../schema";
import { OrchestratorContext } from "../orchestrator";
import { getSpecialistMethodRecommendations, formatMethodSuggestions } from "../methodAdvisor";

/**
 * Compliance Specialist - Generic for all industries and countries
 * Provides questions about regulatory, legal, and compliance requirements
 */
export function complianceSpecialist(ctx: OrchestratorContext): Question[] {
  const { country_mode, packs, industry } = ctx;
  const questions: Question[] = [];

  // ================================
  // UNIVERSAL QUESTIONS (all countries)
  // ================================

  // Company legal entity type
  questions.push({
    id: "compliance.entity_type",
    text: {
      "pt-br": "Qual o tipo de entidade jurídica da empresa?",
      "en": "What is the company's legal entity type?"
    },
    type: "enum",
    options: [
      // Brazil-specific
      ...(country_mode === "BR" ? [
        { value: "MEI", label: { "pt-br": "MEI (Microempreendedor Individual)", "en": "MEI (Individual Microentrepreneur)" } },
        { value: "ME", label: { "pt-br": "ME (Microempresa)", "en": "ME (Microenterprise)" } },
        { value: "EPP", label: { "pt-br": "EPP (Empresa de Pequeno Porte)", "en": "EPP (Small Business)" } },
        { value: "LTDA", label: { "pt-br": "Ltda (Sociedade Limitada)", "en": "Ltda (Limited Liability Company)" } },
        { value: "SA", label: { "pt-br": "S.A. (Sociedade Anônima)", "en": "S.A. (Corporation)" } },
        { value: "EIRELI", label: { "pt-br": "EIRELI", "en": "EIRELI (Individual Limited Liability)" } },
      ] : []),
      // US-specific
      ...(country_mode === "US" ? [
        { value: "LLC", label: { "pt-br": "LLC (Limited Liability Company)", "en": "LLC (Limited Liability Company)" } },
        { value: "C_CORP", label: { "pt-br": "C-Corp", "en": "C-Corporation" } },
        { value: "S_CORP", label: { "pt-br": "S-Corp", "en": "S-Corporation" } },
        { value: "SOLE_PROP", label: { "pt-br": "Sole Proprietorship", "en": "Sole Proprietorship" } },
        { value: "PARTNERSHIP", label: { "pt-br": "Partnership", "en": "Partnership" } },
      ] : []),
      // EU-specific
      ...(country_mode === "EU" ? [
        { value: "GMBH", label: { "pt-br": "GmbH (Alemanha)", "en": "GmbH (Germany)" } },
        { value: "SAS", label: { "pt-br": "SAS (França)", "en": "SAS (France)" } },
        { value: "BV", label: { "pt-br": "B.V. (Holanda)", "en": "B.V. (Netherlands)" } },
        { value: "LTD_UK", label: { "pt-br": "Ltd (Reino Unido)", "en": "Ltd (UK)" } },
      ] : []),
      // Global options
      { value: "NOT_FORMED", label: { "pt-br": "Ainda não constituída", "en": "Not yet formed" } },
      { value: "OTHER", label: { "pt-br": "Outro", "en": "Other" } },
      { value: "UNKNOWN", label: { "pt-br": "Não sei", "en": "Not sure" } }
    ],
    save_to: { answers: "compliance.entity_type", company: "company.compliance.entity_type" },
    tags: ["compliance", "legal", "universal"],
    priority: 300,
    created_by: "specialist:compliance"
  });

  // Tax registration status
  questions.push({
    id: "compliance.tax_registration",
    text: {
      "pt-br": "A empresa está regularizada fiscalmente?",
      "en": "Is the company registered for taxes?"
    },
    type: "enum",
    options: [
      { value: "YES", label: { "pt-br": "Sim, regularizada", "en": "Yes, registered" } },
      { value: "IN_PROGRESS", label: { "pt-br": "Em processo", "en": "In progress" } },
      { value: "NO", label: { "pt-br": "Não", "en": "No" } },
      { value: "NOT_APPLICABLE", label: { "pt-br": "Não se aplica ainda", "en": "Not applicable yet" } },
      { value: "UNKNOWN", label: { "pt-br": "Não sei", "en": "Not sure" } }
    ],
    save_to: { answers: "compliance.tax_registration", company: "company.compliance.tax_registration" },
    tags: ["compliance", "tax", "universal"],
    priority: 290,
    created_by: "specialist:compliance"
  });

  // Data privacy compliance (universal)
  questions.push({
    id: "compliance.data_privacy",
    text: {
      "pt-br": "A empresa coleta dados pessoais de clientes/usuários?",
      "en": "Does the company collect personal data from customers/users?"
    },
    type: "enum",
    options: [
      { value: "YES_COMPLIANT", label: { "pt-br": "Sim, e estamos em conformidade (LGPD/GDPR)", "en": "Yes, and we're compliant (LGPD/GDPR)" } },
      { value: "YES_NOT_COMPLIANT", label: { "pt-br": "Sim, mas ainda não estamos em conformidade", "en": "Yes, but not yet compliant" } },
      { value: "NO", label: { "pt-br": "Não coletamos dados pessoais", "en": "We don't collect personal data" } },
      { value: "UNKNOWN", label: { "pt-br": "Não sei", "en": "Not sure" } }
    ],
    save_to: { answers: "compliance.data_privacy", company: "company.compliance.data_privacy" },
    tags: ["compliance", "privacy", "universal"],
    priority: 280,
    created_by: "specialist:compliance"
  });

  // ================================
  // BRAZIL-SPECIFIC QUESTIONS
  // ================================

  if (country_mode === "BR") {
    // Tax regime (Brazil)
    questions.push({
      id: "compliance.br_tax_regime",
      text: {
        "pt-br": "Qual o regime tributário?",
        "en": "What is the tax regime?"
      },
      type: "enum",
      options: [
        { value: "SIMPLES", label: { "pt-br": "Simples Nacional", "en": "Simples Nacional" } },
        { value: "PRESUMIDO", label: { "pt-br": "Lucro Presumido", "en": "Presumed Profit" } },
        { value: "REAL", label: { "pt-br": "Lucro Real", "en": "Real Profit" } },
        { value: "MEI", label: { "pt-br": "MEI", "en": "MEI" } },
        { value: "NOT_DEFINED", label: { "pt-br": "Ainda não definido", "en": "Not yet defined" } },
        { value: "UNKNOWN", label: { "pt-br": "Não sei", "en": "Not sure" } }
      ],
      save_to: { answers: "compliance.br_tax_regime", company: "company.compliance.br_tax_regime" },
      tags: ["compliance", "tax", "br"],
      priority: 270,
      created_by: "specialist:compliance"
    });

    // Healthcare-specific: ANVISA (only if healthcare industry or health-import pack)
    const isHealthcare = industry === "HEALTHCARE" || packs?.includes("health-import");
    if (isHealthcare) {
      questions.push({
        id: "compliance.anvisa_license",
        text: {
          "pt-br": "A empresa possui autorização/licença da ANVISA? ([VERIFY])",
          "en": "Does the company have ANVISA authorization/license? ([VERIFY])"
        },
        type: "enum",
        options: [
          { value: "AFE", label: { "pt-br": "Sim, AFE (Autorização de Funcionamento)", "en": "Yes, AFE (Operating Authorization)" } },
          { value: "AE", label: { "pt-br": "Sim, AE (Autorização Especial)", "en": "Yes, AE (Special Authorization)" } },
          { value: "BOTH", label: { "pt-br": "Ambas (AFE e AE)", "en": "Both (AFE and AE)" } },
          { value: "IN_PROGRESS", label: { "pt-br": "Em processo", "en": "In progress" } },
          { value: "NO", label: { "pt-br": "Não", "en": "No" } },
          { value: "NOT_REQUIRED", label: { "pt-br": "Não necessário para nossos produtos", "en": "Not required for our products" } },
          { value: "UNKNOWN", label: { "pt-br": "Não sei", "en": "Not sure" } }
        ],
        save_to: { answers: "compliance.anvisa_license", company: "company.compliance.anvisa_license" },
        tags: ["compliance", "health", "br", "anvisa"],
        priority: 260,
        created_by: "specialist:compliance"
      });

      questions.push({
        id: "compliance.product_registration",
        text: {
          "pt-br": "Os produtos exigem registro ou notificação na ANVISA? ([VERIFY])",
          "en": "Do products require ANVISA registration or notification? ([VERIFY])"
        },
        type: "enum",
        options: [
          { value: "REGISTRATION", label: { "pt-br": "Registro obrigatório", "en": "Registration required" } },
          { value: "NOTIFICATION", label: { "pt-br": "Apenas notificação", "en": "Notification only" } },
          { value: "MIXED", label: { "pt-br": "Depende do produto (misto)", "en": "Depends on product (mixed)" } },
          { value: "NONE", label: { "pt-br": "Nenhum exige", "en": "None required" } },
          { value: "UNKNOWN", label: { "pt-br": "Não sei", "en": "Not sure" } }
        ],
        save_to: { answers: "compliance.product_registration", company: "company.compliance.product_registration" },
        tags: ["compliance", "health", "br", "anvisa"],
        priority: 250,
        created_by: "specialist:compliance"
      });
    }

    // Food-specific: ANVISA/MAPA
    if (industry === "FOOD") {
      questions.push({
        id: "compliance.food_license",
        text: {
          "pt-br": "A empresa possui licença sanitária para alimentos? ([VERIFY])",
          "en": "Does the company have a food sanitary license? ([VERIFY])"
        },
        type: "enum",
        options: [
          { value: "ANVISA", label: { "pt-br": "Sim, ANVISA", "en": "Yes, ANVISA" } },
          { value: "MAPA", label: { "pt-br": "Sim, MAPA (produtos de origem animal)", "en": "Yes, MAPA (animal origin products)" } },
          { value: "STATE", label: { "pt-br": "Sim, vigilância sanitária estadual", "en": "Yes, state sanitary agency" } },
          { value: "MUNICIPAL", label: { "pt-br": "Sim, vigilância sanitária municipal", "en": "Yes, municipal sanitary agency" } },
          { value: "IN_PROGRESS", label: { "pt-br": "Em processo", "en": "In progress" } },
          { value: "NO", label: { "pt-br": "Não", "en": "No" } },
          { value: "UNKNOWN", label: { "pt-br": "Não sei", "en": "Not sure" } }
        ],
        save_to: { answers: "compliance.food_license", company: "company.compliance.food_license" },
        tags: ["compliance", "food", "br"],
        priority: 255,
        created_by: "specialist:compliance"
      });
    }

    // Import/Export
    if (packs?.some(p => ["health-import", "ecommerce"].includes(p))) {
      questions.push({
        id: "compliance.radar",
        text: {
          "pt-br": "A empresa possui habilitação no RADAR (Siscomex)?",
          "en": "Is the company registered in RADAR (Siscomex)?"
        },
        type: "enum",
        options: [
          { value: "EXPRESS", label: { "pt-br": "Sim, modalidade Expressa", "en": "Yes, Express modality" } },
          { value: "LIMITED", label: { "pt-br": "Sim, modalidade Limitada", "en": "Yes, Limited modality" } },
          { value: "UNLIMITED", label: { "pt-br": "Sim, modalidade Ilimitada", "en": "Yes, Unlimited modality" } },
          { value: "IN_PROGRESS", label: { "pt-br": "Em processo", "en": "In progress" } },
          { value: "NO", label: { "pt-br": "Não", "en": "No" } },
          { value: "NOT_NEEDED", label: { "pt-br": "Não necessário (não importamos)", "en": "Not needed (we don't import)" } },
          { value: "UNKNOWN", label: { "pt-br": "Não sei", "en": "Not sure" } }
        ],
        save_to: { answers: "compliance.radar", company: "company.compliance.radar" },
        tags: ["compliance", "import", "br"],
        priority: 240,
        created_by: "specialist:compliance"
      });
    }
  }

  // ================================
  // US-SPECIFIC QUESTIONS
  // ================================

  if (country_mode === "US") {
    // State of incorporation
    questions.push({
      id: "compliance.us_state",
      text: {
        "pt-br": "Em qual estado a empresa está incorporada?",
        "en": "In which state is the company incorporated?"
      },
      type: "enum",
      options: [
        { value: "DE", label: { "pt-br": "Delaware", "en": "Delaware" } },
        { value: "CA", label: { "pt-br": "Califórnia", "en": "California" } },
        { value: "NY", label: { "pt-br": "Nova York", "en": "New York" } },
        { value: "TX", label: { "pt-br": "Texas", "en": "Texas" } },
        { value: "FL", label: { "pt-br": "Flórida", "en": "Florida" } },
        { value: "WY", label: { "pt-br": "Wyoming", "en": "Wyoming" } },
        { value: "OTHER", label: { "pt-br": "Outro", "en": "Other" } },
        { value: "NOT_YET", label: { "pt-br": "Ainda não incorporada", "en": "Not yet incorporated" } }
      ],
      save_to: { answers: "compliance.us_state", company: "company.compliance.us_state" },
      tags: ["compliance", "legal", "us"],
      priority: 270,
      created_by: "specialist:compliance"
    });

    // FDA for healthcare/food
    const needsFDA = industry === "HEALTHCARE" || industry === "FOOD" || packs?.includes("health-import");
    if (needsFDA) {
      questions.push({
        id: "compliance.fda_registration",
        text: {
          "pt-br": "A empresa/produtos estão registrados na FDA? ([VERIFY])",
          "en": "Is the company/products registered with the FDA? ([VERIFY])"
        },
        type: "enum",
        options: [
          { value: "YES", label: { "pt-br": "Sim", "en": "Yes" } },
          { value: "IN_PROGRESS", label: { "pt-br": "Em processo", "en": "In progress" } },
          { value: "NO", label: { "pt-br": "Não", "en": "No" } },
          { value: "NOT_REQUIRED", label: { "pt-br": "Não necessário", "en": "Not required" } },
          { value: "UNKNOWN", label: { "pt-br": "Não sei", "en": "Not sure" } }
        ],
        save_to: { answers: "compliance.fda_registration", company: "company.compliance.fda_registration" },
        tags: ["compliance", "fda", "us"],
        priority: 260,
        created_by: "specialist:compliance"
      });
    }
  }

  // ================================
  // EU-SPECIFIC QUESTIONS
  // ================================

  if (country_mode === "EU") {
    questions.push({
      id: "compliance.eu_vat",
      text: {
        "pt-br": "A empresa possui registro de VAT?",
        "en": "Does the company have VAT registration?"
      },
      type: "enum",
      options: [
        { value: "YES", label: { "pt-br": "Sim", "en": "Yes" } },
        { value: "OSS", label: { "pt-br": "Sim, via OSS (One-Stop-Shop)", "en": "Yes, via OSS (One-Stop-Shop)" } },
        { value: "IN_PROGRESS", label: { "pt-br": "Em processo", "en": "In progress" } },
        { value: "NO", label: { "pt-br": "Não", "en": "No" } },
        { value: "UNKNOWN", label: { "pt-br": "Não sei", "en": "Not sure" } }
      ],
      save_to: { answers: "compliance.eu_vat", company: "company.compliance.eu_vat" },
      tags: ["compliance", "tax", "eu"],
      priority: 270,
      created_by: "specialist:compliance"
    });

    // CE marking for products
    const needsCE = industry === "MANUFACTURING" || industry === "HEALTHCARE" || packs?.includes("health-import");
    if (needsCE) {
      questions.push({
        id: "compliance.ce_marking",
        text: {
          "pt-br": "Os produtos possuem marcação CE? ([VERIFY])",
          "en": "Do products have CE marking? ([VERIFY])"
        },
        type: "enum",
        options: [
          { value: "YES", label: { "pt-br": "Sim", "en": "Yes" } },
          { value: "IN_PROGRESS", label: { "pt-br": "Em processo", "en": "In progress" } },
          { value: "NO", label: { "pt-br": "Não", "en": "No" } },
          { value: "NOT_REQUIRED", label: { "pt-br": "Não necessário", "en": "Not required" } },
          { value: "UNKNOWN", label: { "pt-br": "Não sei", "en": "Not sure" } }
        ],
        save_to: { answers: "compliance.ce_marking", company: "company.compliance.ce_marking" },
        tags: ["compliance", "product", "eu"],
        priority: 260,
        created_by: "specialist:compliance"
      });
    }
  }

  // ================================
  // INDUSTRY-SPECIFIC (all countries)
  // ================================

  // Finance/Fintech specific
  if (industry === "FINANCE" || packs?.includes("saas-startup")) {
    questions.push({
      id: "compliance.financial_license",
      text: {
        "pt-br": "A empresa necessita de licença/autorização do órgão regulador financeiro? ([VERIFY])",
        "en": "Does the company need a license from the financial regulator? ([VERIFY])"
      },
      type: "enum",
      options: [
        { value: "YES_HAVE", label: { "pt-br": "Sim, já possuímos", "en": "Yes, we have it" } },
        { value: "YES_NEED", label: { "pt-br": "Sim, precisamos obter", "en": "Yes, we need to obtain" } },
        { value: "PARTNER", label: { "pt-br": "Usamos parceiro licenciado", "en": "We use a licensed partner" } },
        { value: "NO", label: { "pt-br": "Não, não precisamos", "en": "No, not needed" } },
        { value: "UNKNOWN", label: { "pt-br": "Não sei", "en": "Not sure" } }
      ],
      save_to: { answers: "compliance.financial_license", company: "company.compliance.financial_license" },
      tags: ["compliance", "finance"],
      priority: 255,
      created_by: "specialist:compliance"
    });
  }

  return questions;
}

/**
 * Generate Compliance Analysis Report
 */
export function generateComplianceAnalysis(
  ctx: OrchestratorContext,
  lang: "pt-br" | "en"
): string {
  const company = ctx.company?.company || {};
  const compliance = company.compliance || {};
  const stage = ctx.stage || company.stage || "idea";
  const country = ctx.country_mode || "BR";

  const entityType = compliance.entity_type;
  const taxReg = compliance.tax_registration;
  const dataPrivacy = compliance.data_privacy;
  const anvisaLicense = compliance.anvisa_license;
  const brTaxRegime = compliance.br_tax_regime;

  // Identify risks and gaps
  const risks: string[] = [];
  const gaps: string[] = [];
  const actions: string[] = [];

  if (!entityType || entityType === "NOT_FORMED") {
    gaps.push(lang === "pt-br" ? "Empresa não constituída formalmente" : "Company not formally incorporated");
    actions.push(lang === "pt-br" ? "Constituir entidade jurídica" : "Incorporate legal entity");
  }

  if (taxReg !== "YES") {
    risks.push(lang === "pt-br" ? "⚠️ Regularização fiscal pendente" : "⚠️ Tax registration pending");
    actions.push(lang === "pt-br" ? "Regularizar situação fiscal" : "Regularize tax status");
  }

  if (dataPrivacy === "YES_NOT_COMPLIANT") {
    risks.push(lang === "pt-br" ? "🔴 LGPD/GDPR - não conforme" : "🔴 LGPD/GDPR - non-compliant");
    actions.push(lang === "pt-br" ? "Implementar programa de privacidade" : "Implement privacy program");
  }

  if (anvisaLicense === "YES_NEED") {
    gaps.push(lang === "pt-br" ? "Licença ANVISA necessária mas não obtida" : "ANVISA license needed but not obtained");
    actions.push(lang === "pt-br" ? "Iniciar processo de licenciamento ANVISA" : "Start ANVISA licensing process");
  }

  // Missing data detection
  const missingData: string[] = [];
  if (!entityType) missingData.push(lang === "pt-br" ? "Tipo de entidade" : "Entity type");
  if (!taxReg) missingData.push(lang === "pt-br" ? "Status fiscal" : "Tax status");
  if (!dataPrivacy) missingData.push(lang === "pt-br" ? "Conformidade LGPD/GDPR" : "LGPD/GDPR compliance");

  const methodRecs = getSpecialistMethodRecommendations(ctx, "COMPLIANCE");
  const methodsSection = formatMethodSuggestions(methodRecs, lang);

  if (lang === "pt-br") {
    return `# 📋 Análise de Compliance

## Perfil Regulatório
- **País:** ${country}
- **Estágio:** ${translateStage(stage, lang)}
- **Entidade:** ${entityType || "_Não informado_"}
- **Regime tributário:** ${brTaxRegime || "_Não informado_"}

---

## 🔴 Riscos Identificados
${risks.length > 0 ? risks.map(r => `- ${r}`).join("\n") : "- Nenhum risco crítico identificado"}

---

## 📊 Lacunas de Conformidade
${gaps.length > 0 ? gaps.map(g => `- ${g}`).join("\n") : "- Nenhuma lacuna significativa"}

---

## ✅ Ações Recomendadas
${actions.length > 0 ? actions.map((a, i) => `${i + 1}. ${a}`).join("\n") : "- Continue monitorando conformidade"}

---

## 📅 Calendário de Obrigações

${getComplianceCalendar(country, lang)}

---

## 🎯 Checklist de Conformidade

${getComplianceChecklist(stage, country, lang)}

${missingData.length > 0 ? `\n---\n\n⚠️ **Dados faltando:**\n${missingData.map(d => `- ${d}`).join("\n")}\n\n_Use \`/intake\` para completar._` : ""}
${methodsSection}
`;
  } else {
    return `# 📋 Compliance Analysis

## Regulatory Profile
- **Country:** ${country}
- **Stage:** ${translateStage(stage, lang)}
- **Entity:** ${entityType || "_Not provided_"}
- **Tax regime:** ${brTaxRegime || "_Not provided_"}

---

## 🔴 Identified Risks
${risks.length > 0 ? risks.map(r => `- ${r}`).join("\n") : "- No critical risks identified"}

---

## 📊 Compliance Gaps
${gaps.length > 0 ? gaps.map(g => `- ${g}`).join("\n") : "- No significant gaps"}

---

## ✅ Recommended Actions
${actions.length > 0 ? actions.map((a, i) => `${i + 1}. ${a}`).join("\n") : "- Continue monitoring compliance"}

---

## 📅 Obligations Calendar

${getComplianceCalendar(country, lang)}

---

## 🎯 Compliance Checklist

${getComplianceChecklist(stage, country, lang)}

${missingData.length > 0 ? `\n---\n\n⚠️ **Missing data:**\n${missingData.map(d => `- ${d}`).join("\n")}\n\n_Use \`/intake\` to complete._` : ""}
${methodsSection}
`;
  }
}

function translateStage(stage: string, lang: "pt-br" | "en"): string {
  const stages: Record<string, Record<string, string>> = {
    idea: { "pt-br": "Ideia", en: "Idea" },
    mvp: { "pt-br": "MVP", en: "MVP" },
    traction: { "pt-br": "Tração", en: "Traction" },
    growth: { "pt-br": "Crescimento", en: "Growth" },
    scale: { "pt-br": "Escala", en: "Scale" },
    mature: { "pt-br": "Maturidade", en: "Mature" },
  };
  return stages[stage.toLowerCase()]?.[lang] || stage;
}

function getComplianceCalendar(country: string, lang: "pt-br" | "en"): string {
  if (country === "BR") {
    return lang === "pt-br"
      ? `| Obrigação | Frequência | Prazo |
|-----------|------------|-------|
| DCTF | Mensal | Dia 15 |
| EFD-Contribuições | Mensal | Dia 10 |
| ECF | Anual | Julho |
| ECD | Anual | Maio |
| DIRF | Anual | Fevereiro |`
      : `| Obligation | Frequency | Deadline |
|------------|-----------|----------|
| DCTF | Monthly | 15th |
| EFD-Contributions | Monthly | 10th |
| ECF | Annual | July |
| ECD | Annual | May |
| DIRF | Annual | February |`;
  }
  return lang === "pt-br"
    ? "_Verifique requisitos específicos do seu país._"
    : "_Check specific requirements for your country._";
}

function getComplianceChecklist(stage: string, country: string, lang: "pt-br" | "en"): string {
  if (lang === "pt-br") {
    return `- [ ] Entidade jurídica constituída
- [ ] CNPJ/registro ativo
- [ ] Alvará de funcionamento
- [ ] Inscrição estadual/municipal
- [ ] Certificado digital válido
- [ ] Política de privacidade (LGPD)
- [ ] Termos de uso atualizados`;
  }
  return `- [ ] Legal entity incorporated
- [ ] Business registration active
- [ ] Operating licenses valid
- [ ] State/local registrations
- [ ] Digital certificate valid
- [ ] Privacy policy (GDPR)
- [ ] Terms of service updated`;
}

export function getCompliancePrompt(lang: "pt-br" | "en"): string {
  return lang === "pt-br"
    ? `Você é um especialista em compliance e regulatório, com foco em:
- Constituição de empresas e tipos societários
- Obrigações fiscais e tributárias
- LGPD e proteção de dados
- Licenças regulatórias (ANVISA, etc.)
- Compliance trabalhista
- Certificações e auditorias

Responda de forma prática e objetiva.
Alerte sobre riscos e prazos.
Recomende métodos de análise quando apropriado.`
    : `You are a compliance and regulatory specialist focusing on:
- Company incorporation and entity types
- Tax and fiscal obligations
- GDPR and data protection
- Regulatory licenses (FDA, etc.)
- Labor compliance
- Certifications and audits

Respond practically and objectively.
Alert about risks and deadlines.
Recommend analysis methods when appropriate.`;
}
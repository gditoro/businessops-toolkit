import { Question } from "../schema";
import { OrchestratorContext } from "../orchestrator";
import { getSpecialistMethodRecommendations, formatMethodSuggestions } from "../methodAdvisor";

/**
 * Finance Specialist - Generic for all industries
 * Provides questions about financial structure, funding, and revenue
 */
export function financeSpecialist(ctx: OrchestratorContext): Question[] {
  const { lifecycle_mode, stage, packs, answers } = ctx;
  const questions: Question[] = [];

  // Universal: Current funding situation
  questions.push({
    id: "finance.funding_status",
    text: {
      "pt-br": "Qual a situação de financiamento/capital da empresa?",
      "en": "What is the company's funding/capital situation?"
    },
    type: "enum",
    options: [
      { value: "BOOTSTRAPPED", label: { "pt-br": "Bootstrapped (capital próprio)", "en": "Bootstrapped (own capital)" } },
      { value: "FFF", label: { "pt-br": "Friends, Family & Fools", "en": "Friends, Family & Fools" } },
      { value: "ANGEL", label: { "pt-br": "Investimento anjo", "en": "Angel investment" } },
      { value: "SEED", label: { "pt-br": "Seed (pré-série A)", "en": "Seed (pre-Series A)" } },
      { value: "SERIES_A", label: { "pt-br": "Série A", "en": "Series A" } },
      { value: "SERIES_B_PLUS", label: { "pt-br": "Série B ou posterior", "en": "Series B or later" } },
      { value: "DEBT", label: { "pt-br": "Financiamento/dívida", "en": "Debt financing" } },
      { value: "GRANT", label: { "pt-br": "Subvenção/incentivo", "en": "Grant/subsidy" } },
      { value: "REVENUE_FUNDED", label: { "pt-br": "Financiado por receita", "en": "Revenue funded" } },
      { value: "SEEKING", label: { "pt-br": "Buscando investimento", "en": "Seeking investment" } },
      { value: "UNKNOWN", label: { "pt-br": "Não sei", "en": "Not sure" } }
    ],
    save_to: { answers: "finance.funding_status", company: "company.finance.funding_status" },
    tags: ["finance", "universal"],
    priority: 400,
    created_by: "specialist:finance"
  });

  // Universal: Revenue status
  questions.push({
    id: "finance.revenue_status",
    text: {
      "pt-br": "A empresa já gera receita?",
      "en": "Is the company generating revenue?"
    },
    type: "enum",
    options: [
      { value: "PRE_REVENUE", label: { "pt-br": "Pré-receita (ainda não vende)", "en": "Pre-revenue (not selling yet)" } },
      { value: "EARLY_REVENUE", label: { "pt-br": "Receita inicial (< R$100k/ano)", "en": "Early revenue (< $20k/year)" } },
      { value: "GROWING", label: { "pt-br": "Em crescimento (R$100k-1M/ano)", "en": "Growing ($20k-200k/year)" } },
      { value: "ESTABLISHED", label: { "pt-br": "Estabelecida (R$1M-10M/ano)", "en": "Established ($200k-2M/year)" } },
      { value: "SCALE", label: { "pt-br": "Escala (> R$10M/ano)", "en": "Scale (> $2M/year)" } },
      { value: "UNKNOWN", label: { "pt-br": "Prefiro não informar", "en": "Prefer not to say" } }
    ],
    save_to: { answers: "finance.revenue_status", company: "company.finance.revenue_status" },
    tags: ["finance", "universal"],
    priority: 390,
    created_by: "specialist:finance"
  });

  // Universal: Revenue model
  questions.push({
    id: "finance.revenue_model",
    text: {
      "pt-br": "Qual o modelo de receita principal?",
      "en": "What is the main revenue model?"
    },
    type: "enum",
    options: [
      { value: "PRODUCT_SALES", label: { "pt-br": "Venda de produtos", "en": "Product sales" } },
      { value: "SERVICE_FEE", label: { "pt-br": "Taxa por serviço/projeto", "en": "Service/project fee" } },
      { value: "SUBSCRIPTION", label: { "pt-br": "Assinatura recorrente", "en": "Recurring subscription" } },
      { value: "TRANSACTION_FEE", label: { "pt-br": "Taxa por transação", "en": "Transaction fee" } },
      { value: "LICENSING", label: { "pt-br": "Licenciamento", "en": "Licensing" } },
      { value: "ADVERTISING", label: { "pt-br": "Publicidade", "en": "Advertising" } },
      { value: "FREEMIUM", label: { "pt-br": "Freemium", "en": "Freemium" } },
      { value: "COMMISSION", label: { "pt-br": "Comissão/intermediação", "en": "Commission/brokerage" } },
      { value: "HYBRID", label: { "pt-br": "Híbrido (múltiplos modelos)", "en": "Hybrid (multiple models)" } },
      { value: "NOT_DEFINED", label: { "pt-br": "Ainda não definido", "en": "Not yet defined" } }
    ],
    save_to: { answers: "finance.revenue_model", company: "company.finance.revenue_model" },
    tags: ["finance", "universal"],
    priority: 380,
    created_by: "specialist:finance"
  });

  // Universal: Bank account status
  questions.push({
    id: "finance.bank_account",
    text: {
      "pt-br": "A empresa possui conta bancária PJ?",
      "en": "Does the company have a business bank account?"
    },
    type: "enum",
    options: [
      { value: "YES_TRADITIONAL", label: { "pt-br": "Sim, banco tradicional", "en": "Yes, traditional bank" } },
      { value: "YES_DIGITAL", label: { "pt-br": "Sim, banco digital", "en": "Yes, digital bank" } },
      { value: "YES_BOTH", label: { "pt-br": "Sim, ambos", "en": "Yes, both" } },
      { value: "USING_PERSONAL", label: { "pt-br": "Usando conta pessoal (PF)", "en": "Using personal account" } },
      { value: "IN_PROGRESS", label: { "pt-br": "Em processo de abertura", "en": "In progress" } },
      { value: "NO", label: { "pt-br": "Não", "en": "No" } }
    ],
    save_to: { answers: "finance.bank_account", company: "company.finance.bank_account" },
    tags: ["finance", "universal"],
    priority: 370,
    created_by: "specialist:finance"
  });

  // Universal: Payment methods accepted
  questions.push({
    id: "finance.payment_methods",
    text: {
      "pt-br": "Quais formas de pagamento você aceita/planeja aceitar?",
      "en": "Which payment methods do you accept/plan to accept?"
    },
    type: "multiselect",
    options: [
      { value: "PIX", label: { "pt-br": "Pix", "en": "Pix (Brazil instant payment)" } },
      { value: "CREDIT_CARD", label: { "pt-br": "Cartão de crédito", "en": "Credit card" } },
      { value: "DEBIT_CARD", label: { "pt-br": "Cartão de débito", "en": "Debit card" } },
      { value: "BOLETO", label: { "pt-br": "Boleto bancário", "en": "Bank slip (Boleto)" } },
      { value: "BANK_TRANSFER", label: { "pt-br": "Transferência bancária", "en": "Bank transfer" } },
      { value: "INVOICE", label: { "pt-br": "Faturamento/NF", "en": "Invoice billing" } },
      { value: "PAYPAL", label: { "pt-br": "PayPal", "en": "PayPal" } },
      { value: "CRYPTO", label: { "pt-br": "Criptomoedas", "en": "Cryptocurrency" } },
      { value: "OTHER", label: { "pt-br": "Outro", "en": "Other" } },
      { value: "NOT_DEFINED", label: { "pt-br": "Ainda não definido", "en": "Not yet defined" } }
    ],
    save_to: { answers: "finance.payment_methods", company: "company.finance.payment_methods" },
    tags: ["finance", "universal"],
    priority: 360,
    created_by: "specialist:finance"
  });

  // For startups seeking investment
  const isStartup = stage === "IDEA" || stage === "MVP" || stage === "EARLY" ||
    packs?.includes("saas-startup");

  if (isStartup) {
    questions.push({
      id: "finance.runway",
      text: {
        "pt-br": "Qual o runway atual (tempo até precisar de mais capital)?",
        "en": "What is the current runway (time until more capital needed)?"
      },
      type: "enum",
      options: [
        { value: "LESS_3M", label: { "pt-br": "Menos de 3 meses", "en": "Less than 3 months" } },
        { value: "3_6M", label: { "pt-br": "3-6 meses", "en": "3-6 months" } },
        { value: "6_12M", label: { "pt-br": "6-12 meses", "en": "6-12 months" } },
        { value: "12_18M", label: { "pt-br": "12-18 meses", "en": "12-18 months" } },
        { value: "MORE_18M", label: { "pt-br": "Mais de 18 meses", "en": "More than 18 months" } },
        { value: "PROFITABLE", label: { "pt-br": "Lucrativo/auto-sustentável", "en": "Profitable/self-sustaining" } },
        { value: "UNKNOWN", label: { "pt-br": "Não sei", "en": "Not sure" } }
      ],
      save_to: { answers: "finance.runway", company: "company.finance.runway" },
      tags: ["finance", "startup"],
      priority: 350,
      created_by: "specialist:finance"
    });
  }

  // Universal: Financial management tools
  questions.push({
    id: "finance.tools",
    text: {
      "pt-br": "Quais ferramentas de gestão financeira você usa?",
      "en": "Which financial management tools do you use?"
    },
    type: "multiselect",
    options: [
      { value: "SPREADSHEET", label: { "pt-br": "Planilhas (Excel/Google Sheets)", "en": "Spreadsheets (Excel/Google Sheets)" } },
      { value: "ACCOUNTING_SW", label: { "pt-br": "Software contábil (Conta Azul, Bling, etc.)", "en": "Accounting software (QuickBooks, Xero, etc.)" } },
      { value: "ERP", label: { "pt-br": "ERP", "en": "ERP" } },
      { value: "BANK_APP", label: { "pt-br": "App do banco apenas", "en": "Bank app only" } },
      { value: "ACCOUNTANT", label: { "pt-br": "Contador cuida de tudo", "en": "Accountant handles everything" } },
      { value: "NONE", label: { "pt-br": "Nenhuma ainda", "en": "None yet" } }
    ],
    save_to: { answers: "finance.tools", company: "company.finance.tools" },
    tags: ["finance", "universal"],
    priority: 340,
    created_by: "specialist:finance"
  });

  return questions;
}

/**
 * Generate Finance Analysis Report
 */
export function generateFinanceAnalysis(
  ctx: OrchestratorContext,
  lang: "pt-br" | "en"
): string {
  const company = ctx.company?.company || {};
  const finance = company.finance || {};
  const stage = ctx.stage || company.stage || "idea";

  const fundingStatus = finance.funding_status;
  const revenueStatus = finance.revenue_status;
  const revenueModel = finance.revenue_model;
  const bankAccount = finance.bank_account;
  const runway = finance.runway;
  const tools = finance.tools || [];

  // Risk analysis
  const risks: string[] = [];
  const opportunities: string[] = [];
  const actions: string[] = [];

  if (runway === "LESS_3M") {
    risks.push(lang === "pt-br" ? "🔴 Runway crítico (< 3 meses)" : "🔴 Critical runway (< 3 months)");
    actions.push(lang === "pt-br" ? "Priorizar captação ou corte de custos" : "Prioritize fundraising or cost cutting");
  } else if (runway === "3_6M") {
    risks.push(lang === "pt-br" ? "⚠️ Runway curto (3-6 meses)" : "⚠️ Short runway (3-6 months)");
    actions.push(lang === "pt-br" ? "Iniciar processo de captação" : "Start fundraising process");
  }

  if (bankAccount === "USING_PERSONAL") {
    risks.push(lang === "pt-br" ? "⚠️ Usando conta pessoal" : "⚠️ Using personal account");
    actions.push(lang === "pt-br" ? "Abrir conta PJ" : "Open business bank account");
  }

  if (revenueStatus === "PRE_REVENUE") {
    opportunities.push(lang === "pt-br" ? "Foco em validação e primeiros clientes" : "Focus on validation and first customers");
  }

  if (fundingStatus === "SEEKING") {
    actions.push(lang === "pt-br" ? "Preparar pitch deck e materiais de captação" : "Prepare pitch deck and fundraising materials");
  }

  if (tools.includes("SPREADSHEET") && !tools.includes("ERP")) {
    opportunities.push(lang === "pt-br" ? "Oportunidade de automatizar gestão financeira" : "Opportunity to automate financial management");
  }

  // Missing data
  const missingData: string[] = [];
  if (!fundingStatus) missingData.push(lang === "pt-br" ? "Status de funding" : "Funding status");
  if (!revenueStatus) missingData.push(lang === "pt-br" ? "Status de receita" : "Revenue status");
  if (!revenueModel) missingData.push(lang === "pt-br" ? "Modelo de receita" : "Revenue model");

  const methodRecs = getSpecialistMethodRecommendations(ctx, "FINANCE");
  const methodsSection = formatMethodSuggestions(methodRecs, lang);

  if (lang === "pt-br") {
    return `# 💰 Análise Financeira

## Perfil Financeiro
- **Estágio:** ${translateStage(stage, lang)}
- **Funding:** ${fundingStatus || "_Não informado_"}
- **Receita:** ${revenueStatus || "_Não informado_"}
- **Modelo:** ${revenueModel || "_Não informado_"}
- **Runway:** ${runway || "_Não informado_"}

---

## 🔴 Riscos Financeiros
${risks.length > 0 ? risks.map(r => `- ${r}`).join("\n") : "- Nenhum risco crítico identificado"}

---

## 🚀 Oportunidades
${opportunities.length > 0 ? opportunities.map(o => `- ${o}`).join("\n") : "- Continue monitorando indicadores"}

---

## ✅ Ações Recomendadas
${actions.length > 0 ? actions.map((a, i) => `${i + 1}. ${a}`).join("\n") : "- Manter controles financeiros atualizados"}

---

## 📊 KPIs Financeiros Essenciais

| KPI | Descrição | Meta |
|-----|-----------|------|
| Burn Rate | Gasto mensal | Conhecer exatamente |
| Runway | Meses de operação | > 12 meses |
| MRR/ARR | Receita recorrente | Crescer mês a mês |
| CAC | Custo de aquisição | < LTV/3 |
| LTV | Lifetime value | > 3x CAC |
| Margem Bruta | (Receita - CMV) / Receita | > 40% |

---

## 🛠️ Ferramentas em Uso
${tools.length > 0 ? tools.map((t: string) => `- ${t}`).join("\n") : "- Nenhuma ferramenta registrada"}

${missingData.length > 0 ? `\n---\n\n⚠️ **Dados faltando:**\n${missingData.map(d => `- ${d}`).join("\n")}\n\n_Use \`/intake\` para completar._` : ""}
${methodsSection}
`;
  } else {
    return `# 💰 Financial Analysis

## Financial Profile
- **Stage:** ${translateStage(stage, lang)}
- **Funding:** ${fundingStatus || "_Not provided_"}
- **Revenue:** ${revenueStatus || "_Not provided_"}
- **Model:** ${revenueModel || "_Not provided_"}
- **Runway:** ${runway || "_Not provided_"}

---

## 🔴 Financial Risks
${risks.length > 0 ? risks.map(r => `- ${r}`).join("\n") : "- No critical risks identified"}

---

## 🚀 Opportunities
${opportunities.length > 0 ? opportunities.map(o => `- ${o}`).join("\n") : "- Continue monitoring indicators"}

---

## ✅ Recommended Actions
${actions.length > 0 ? actions.map((a, i) => `${i + 1}. ${a}`).join("\n") : "- Keep financial controls updated"}

---

## 📊 Essential Financial KPIs

| KPI | Description | Target |
|-----|-------------|--------|
| Burn Rate | Monthly spend | Know exactly |
| Runway | Months of operation | > 12 months |
| MRR/ARR | Recurring revenue | Grow month over month |
| CAC | Acquisition cost | < LTV/3 |
| LTV | Lifetime value | > 3x CAC |
| Gross Margin | (Revenue - COGS) / Revenue | > 40% |

---

## 🛠️ Tools in Use
${tools.length > 0 ? tools.map((t: string) => `- ${t}`).join("\n") : "- No tools registered"}

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

export function getFinancePrompt(lang: "pt-br" | "en"): string {
  return lang === "pt-br"
    ? `Você é um especialista em finanças empresariais, com foco em:
- Estrutura de capital e funding
- Modelo de receita e pricing
- Análise de runway e burn rate
- Métricas SaaS (MRR, ARR, CAC, LTV)
- Fluxo de caixa e projeções
- Ferramentas financeiras

Responda de forma prática e objetiva.
Recomende métodos de análise financeira quando apropriado.
Use /method dre, /method cash-flow, /method balance-sheet para análises.`
    : `You are a corporate finance specialist focusing on:
- Capital structure and funding
- Revenue model and pricing
- Runway and burn rate analysis
- SaaS metrics (MRR, ARR, CAC, LTV)
- Cash flow and projections
- Financial tools

Respond practically and objectively.
Recommend financial analysis methods when appropriate.
Use /method dre, /method cash-flow, /method balance-sheet for analyses.`;
}
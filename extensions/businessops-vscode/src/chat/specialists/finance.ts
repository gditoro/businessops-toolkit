import { Question } from "../schema";
import { OrchestratorContext } from "../orchestrator";

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

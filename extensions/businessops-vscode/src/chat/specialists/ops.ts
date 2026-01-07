import { Question } from "../schema";
import { OrchestratorContext } from "../orchestrator";
import { getSpecialistMethodRecommendations, formatMethodSuggestions } from "../methodAdvisor";

/**
 * Operations Specialist - Generic for all industries
 * Provides questions about operational structure, outsourcing, and delivery models
 */
export function opsSpecialist(ctx: OrchestratorContext): Question[] {
  const { packs, industry, answers } = ctx;
  const questions: Question[] = [];

  // Universal: Outsourced services (applies to all companies)
  questions.push({
    id: "ops.outsourced_services",
    text: {
      "pt-br": "Quais serviços você terceiriza hoje? (pode marcar mais de um)",
      "en": "Which services do you outsource today? (select all that apply)"
    },
    type: "multiselect",
    options: [
      { value: "ACCOUNTING", label: { "pt-br": "Contabilidade", "en": "Accounting" } },
      { value: "LEGAL", label: { "pt-br": "Jurídico", "en": "Legal" } },
      { value: "PAYROLL", label: { "pt-br": "Folha / RH", "en": "Payroll / HR" } },
      { value: "IT", label: { "pt-br": "TI / Infraestrutura", "en": "IT / Infrastructure" } },
      { value: "MARKETING", label: { "pt-br": "Marketing / Publicidade", "en": "Marketing / Advertising" } },
      { value: "CUSTOMER_SUPPORT", label: { "pt-br": "Suporte ao cliente", "en": "Customer support" } },
      { value: "WAREHOUSE", label: { "pt-br": "Armazém / logística", "en": "Warehouse / logistics" } },
      { value: "CUSTOMS", label: { "pt-br": "Despacho aduaneiro", "en": "Customs broker" } },
      { value: "NONE", label: { "pt-br": "Nenhum (tudo interno)", "en": "None (all in-house)" } }
    ],
    save_to: { answers: "ops.outsourced_services", company: "company.ops.outsourced_services" },
    tags: ["ops", "universal"],
    priority: 200,
    created_by: "specialist:ops"
  });

  // Universal: Main sales/revenue channels
  questions.push({
    id: "ops.sales_channels",
    text: {
      "pt-br": "Quais são os principais canais de venda/receita?",
      "en": "What are your main sales/revenue channels?"
    },
    type: "multiselect",
    options: [
      { value: "DIRECT_SALES", label: { "pt-br": "Vendas diretas (equipe comercial)", "en": "Direct sales (sales team)" } },
      { value: "ECOMMERCE", label: { "pt-br": "E-commerce próprio", "en": "Own e-commerce" } },
      { value: "MARKETPLACE", label: { "pt-br": "Marketplace (Amazon, Mercado Livre, etc.)", "en": "Marketplace (Amazon, etc.)" } },
      { value: "RETAIL", label: { "pt-br": "Varejo físico", "en": "Physical retail" } },
      { value: "DISTRIBUTOR", label: { "pt-br": "Distribuidores / Revendedores", "en": "Distributors / Resellers" } },
      { value: "SUBSCRIPTION", label: { "pt-br": "Assinatura / SaaS", "en": "Subscription / SaaS" } },
      { value: "LICENSING", label: { "pt-br": "Licenciamento", "en": "Licensing" } },
      { value: "CONSULTING", label: { "pt-br": "Consultoria / Projetos", "en": "Consulting / Projects" } },
      { value: "OTHER", label: { "pt-br": "Outro", "en": "Other" } }
    ],
    save_to: { answers: "ops.sales_channels", company: "company.ops.sales_channels" },
    tags: ["ops", "universal"],
    priority: 190,
    created_by: "specialist:ops"
  });

  // For physical product companies (retail, healthcare, manufacturing, food, etc.)
  const physicalProductIndustries = ["HEALTHCARE", "RETAIL", "MANUFACTURING", "FOOD", "AGRICULTURE"];
  const hasPhysicalProducts = physicalProductIndustries.includes(industry || "") ||
    packs?.some(p => ["health-import", "ecommerce"].includes(p));

  if (hasPhysicalProducts) {
    questions.push({
      id: "ops.inventory_model",
      text: {
        "pt-br": "Qual o modelo de estoque/entrega?",
        "en": "What is your inventory/delivery model?"
      },
      type: "enum",
      options: [
        { value: "INVENTORY", label: { "pt-br": "Estoque próprio", "en": "Own inventory" } },
        { value: "DROPSHIP", label: { "pt-br": "Dropshipping / sob demanda", "en": "Dropshipping / on-demand" } },
        { value: "CONSIGNMENT", label: { "pt-br": "Consignação", "en": "Consignment" } },
        { value: "HYBRID", label: { "pt-br": "Híbrido", "en": "Hybrid" } },
        { value: "NOT_APPLICABLE", label: { "pt-br": "Não se aplica (serviços)", "en": "Not applicable (services)" } },
        { value: "UNKNOWN", label: { "pt-br": "Não sei", "en": "Not sure" } }
      ],
      save_to: { answers: "ops.inventory_model", company: "company.ops.inventory_model" },
      tags: ["ops", "inventory"],
      priority: 180,
      created_by: "specialist:ops"
    });
  }

  // For service companies (consulting, technology, services, education)
  const serviceIndustries = ["SERVICES", "TECHNOLOGY", "EDUCATION", "FINANCE"];
  const isServiceBased = serviceIndustries.includes(industry || "") ||
    packs?.some(p => ["saas-startup", "consulting"].includes(p));

  if (isServiceBased) {
    questions.push({
      id: "ops.service_delivery",
      text: {
        "pt-br": "Como os serviços são entregues?",
        "en": "How are services delivered?"
      },
      type: "enum",
      options: [
        { value: "REMOTE", label: { "pt-br": "100% remoto", "en": "100% remote" } },
        { value: "ONSITE", label: { "pt-br": "Presencial no cliente", "en": "On-site at client" } },
        { value: "HYBRID", label: { "pt-br": "Híbrido", "en": "Hybrid" } },
        { value: "SELF_SERVICE", label: { "pt-br": "Self-service (plataforma)", "en": "Self-service (platform)" } },
        { value: "UNKNOWN", label: { "pt-br": "Não sei", "en": "Not sure" } }
      ],
      save_to: { answers: "ops.service_delivery", company: "company.ops.service_delivery" },
      tags: ["ops", "services"],
      priority: 175,
      created_by: "specialist:ops"
    });
  }

  // Universal: Key operational challenges
  questions.push({
    id: "ops.key_challenges",
    text: {
      "pt-br": "Quais os principais desafios operacionais hoje?",
      "en": "What are your main operational challenges today?"
    },
    type: "multiselect",
    options: [
      { value: "CASH_FLOW", label: { "pt-br": "Fluxo de caixa", "en": "Cash flow" } },
      { value: "HIRING", label: { "pt-br": "Contratação / talentos", "en": "Hiring / talent" } },
      { value: "PROCESSES", label: { "pt-br": "Processos desorganizados", "en": "Disorganized processes" } },
      { value: "TECHNOLOGY", label: { "pt-br": "Tecnologia / sistemas", "en": "Technology / systems" } },
      { value: "COMPLIANCE", label: { "pt-br": "Compliance / regulatório", "en": "Compliance / regulatory" } },
      { value: "SALES", label: { "pt-br": "Vendas / aquisição de clientes", "en": "Sales / customer acquisition" } },
      { value: "SCALE", label: { "pt-br": "Escalar operação", "en": "Scaling operations" } },
      { value: "SUPPLY_CHAIN", label: { "pt-br": "Cadeia de suprimentos", "en": "Supply chain" } },
      { value: "NONE", label: { "pt-br": "Nenhum específico", "en": "None specific" } }
    ],
    save_to: { answers: "ops.key_challenges", company: "company.ops.key_challenges" },
    tags: ["ops", "universal"],
    priority: 150,
    created_by: "specialist:ops"
  });

  return questions;
}

/**
 * Generate Operations Analysis Report
 */
export function generateOpsAnalysis(
  ctx: OrchestratorContext,
  lang: "pt-br" | "en"
): string {
  const company = ctx.company?.company || {};
  const ops = company.ops || {};
  const stage = ctx.stage || company.stage || "idea";
  const industry = ctx.industry || company.sector || "general";

  const outsourced = ops.outsourced_services || [];
  const channels = ops.sales_channels || [];
  const challenges = ops.key_challenges || [];
  const inventoryModel = ops.inventory_model;
  const serviceDelivery = ops.service_delivery;

  // Determine what data we have vs missing
  const hasOutsourcedData = outsourced.length > 0;
  const hasChannelsData = channels.length > 0;
  const hasChallengesData = challenges.length > 0;

  // Build missing data prompt
  const missingData: string[] = [];
  if (!hasOutsourcedData) missingData.push(lang === "pt-br" ? "Serviços terceirizados" : "Outsourced services");
  if (!hasChannelsData) missingData.push(lang === "pt-br" ? "Canais de venda" : "Sales channels");
  if (!hasChallengesData) missingData.push(lang === "pt-br" ? "Desafios operacionais" : "Operational challenges");

  const methodRecs = getSpecialistMethodRecommendations(ctx, "OPS");
  const methodsSection = formatMethodSuggestions(methodRecs, lang);

  if (lang === "pt-br") {
    return `# ⚙️ Análise de Operações

## Perfil Operacional
- **Estágio:** ${translateStage(stage, lang)}
- **Indústria:** ${industry}
${inventoryModel ? `- **Modelo de estoque:** ${inventoryModel}` : ""}
${serviceDelivery ? `- **Entrega de serviços:** ${serviceDelivery}` : ""}

---

## 🔄 Serviços Terceirizados
${hasOutsourcedData
  ? outsourced.map((s: string) => `- ${s}`).join("\n")
  : "_Não informado. Use `/intake` para responder._"}

---

## 📢 Canais de Venda
${hasChannelsData
  ? channels.map((c: string) => `- ${c}`).join("\n")
  : "_Não informado. Use `/intake` para responder._"}

---

## ⚠️ Desafios Identificados
${hasChallengesData
  ? challenges.map((c: string) => `- ${getChallengeName(c, lang)}`).join("\n")
  : "_Não informado. Use `/intake` para responder._"}

---

## 📊 Recomendações

${getOpsRecommendations(challenges, stage, lang)}

---

## 📈 KPIs Operacionais Sugeridos

| KPI | Fórmula/Descrição | Meta |
|-----|-------------------|------|
| Eficiência operacional | Output / Input | Melhorar 10%/ano |
| Lead time | Tempo pedido → entrega | Reduzir continuamente |
| Taxa de erro | Erros / Total operações | < 1% |
| NPS operacional | Pesquisa de satisfação | > 50 |
| Custo por transação | Custo op. / Transações | Reduzir 5%/ano |

${missingData.length > 0 ? `\n---\n\n⚠️ **Dados faltando para análise completa:**\n${missingData.map(d => `- ${d}`).join("\n")}\n\n_Use \`/intake\` para completar as informações._` : ""}
${methodsSection}
`;
  } else {
    return `# ⚙️ Operations Analysis

## Operational Profile
- **Stage:** ${translateStage(stage, lang)}
- **Industry:** ${industry}
${inventoryModel ? `- **Inventory model:** ${inventoryModel}` : ""}
${serviceDelivery ? `- **Service delivery:** ${serviceDelivery}` : ""}

---

## 🔄 Outsourced Services
${hasOutsourcedData
  ? outsourced.map((s: string) => `- ${s}`).join("\n")
  : "_Not provided. Use `/intake` to answer._"}

---

## 📢 Sales Channels
${hasChannelsData
  ? channels.map((c: string) => `- ${c}`).join("\n")
  : "_Not provided. Use `/intake` to answer._"}

---

## ⚠️ Identified Challenges
${hasChallengesData
  ? challenges.map((c: string) => `- ${getChallengeName(c, lang)}`).join("\n")
  : "_Not provided. Use `/intake` to answer._"}

---

## 📊 Recommendations

${getOpsRecommendations(challenges, stage, lang)}

---

## 📈 Suggested Operational KPIs

| KPI | Formula/Description | Target |
|-----|---------------------|--------|
| Operational efficiency | Output / Input | Improve 10%/year |
| Lead time | Order → Delivery time | Reduce continuously |
| Error rate | Errors / Total operations | < 1% |
| Operational NPS | Satisfaction survey | > 50 |
| Cost per transaction | Op. cost / Transactions | Reduce 5%/year |

${missingData.length > 0 ? `\n---\n\n⚠️ **Missing data for complete analysis:**\n${missingData.map(d => `- ${d}`).join("\n")}\n\n_Use \`/intake\` to complete the information._` : ""}
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

function getChallengeName(challenge: string, lang: "pt-br" | "en"): string {
  const names: Record<string, Record<string, string>> = {
    CASH_FLOW: { "pt-br": "Fluxo de caixa", en: "Cash flow" },
    HIRING: { "pt-br": "Contratação / talentos", en: "Hiring / talent" },
    PROCESSES: { "pt-br": "Processos desorganizados", en: "Disorganized processes" },
    TECHNOLOGY: { "pt-br": "Tecnologia / sistemas", en: "Technology / systems" },
    COMPLIANCE: { "pt-br": "Compliance / regulatório", en: "Compliance / regulatory" },
    SALES: { "pt-br": "Vendas / aquisição de clientes", en: "Sales / customer acquisition" },
    SCALE: { "pt-br": "Escalar operação", en: "Scaling operations" },
    SUPPLY_CHAIN: { "pt-br": "Cadeia de suprimentos", en: "Supply chain" },
  };
  return names[challenge]?.[lang] || challenge;
}

function getOpsRecommendations(challenges: string[], stage: string, lang: "pt-br" | "en"): string {
  const recs: string[] = [];

  if (lang === "pt-br") {
    if (challenges.includes("PROCESSES")) {
      recs.push("🔧 **Processos:** Implemente Kanban para visualizar fluxos. Use `/method kanban`");
      recs.push("🧹 **Organização:** Aplique 5S para organizar ambiente. Use `/method five-s`");
    }
    if (challenges.includes("SCALE")) {
      recs.push("📈 **Escala:** Use Six Sigma para reduzir variabilidade. Use `/method six-sigma`");
      recs.push("🔄 **Melhoria contínua:** Implemente Kaizen. Use `/method kaizen`");
    }
    if (challenges.includes("CASH_FLOW")) {
      recs.push("💰 **Fluxo de caixa:** Analise com `/method cash-flow`");
    }
    if (challenges.includes("SUPPLY_CHAIN")) {
      recs.push("🔗 **Supply chain:** Analise cadeia de valor com `/method value-chain`");
    }
    if (recs.length === 0) {
      recs.push("✅ Continue monitorando KPIs operacionais");
      recs.push("📋 Documente processos com `/method bpmn`");
    }
  } else {
    if (challenges.includes("PROCESSES")) {
      recs.push("🔧 **Processes:** Implement Kanban to visualize flows. Use `/method kanban`");
      recs.push("🧹 **Organization:** Apply 5S to organize environment. Use `/method five-s`");
    }
    if (challenges.includes("SCALE")) {
      recs.push("📈 **Scale:** Use Six Sigma to reduce variability. Use `/method six-sigma`");
      recs.push("🔄 **Continuous improvement:** Implement Kaizen. Use `/method kaizen`");
    }
    if (challenges.includes("CASH_FLOW")) {
      recs.push("💰 **Cash flow:** Analyze with `/method cash-flow`");
    }
    if (challenges.includes("SUPPLY_CHAIN")) {
      recs.push("🔗 **Supply chain:** Analyze value chain with `/method value-chain`");
    }
    if (recs.length === 0) {
      recs.push("✅ Continue monitoring operational KPIs");
      recs.push("📋 Document processes with `/method bpmn`");
    }
  }

  return recs.join("\n\n");
}

export function getOpsPrompt(lang: "pt-br" | "en"): string {
  return lang === "pt-br"
    ? `Você é um especialista em operações empresariais, com foco em:
- Terceirização e gestão de fornecedores
- Canais de venda e distribuição
- Modelos de entrega (estoque, dropship, serviços)
- Otimização de processos operacionais
- Gestão de desafios operacionais
- Métricas e KPIs operacionais

Responda de forma prática e objetiva.
Recomende métodos específicos quando apropriado (Kanban, 5S, Kaizen, etc.).`
    : `You are an operations specialist focusing on:
- Outsourcing and vendor management
- Sales channels and distribution
- Delivery models (inventory, dropship, services)
- Operational process optimization
- Operational challenges management
- Operational metrics and KPIs

Respond practically and objectively.
Recommend specific methods when appropriate (Kanban, 5S, Kaizen, etc.).`;
}
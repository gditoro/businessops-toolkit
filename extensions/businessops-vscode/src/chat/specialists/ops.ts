import { Question } from "../schema";
import { OrchestratorContext } from "../orchestrator";

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

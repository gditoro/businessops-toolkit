/**
 * Value Chain Analysis (Porter)
 */

import { BusinessMethod } from "../index";
import { OrchestratorContext } from "../../orchestrator";

export const valueChainMethod: BusinessMethod = {
  id: "value-chain",
  name: {
    "pt-br": "Cadeia de Valor",
    "en": "Value Chain",
  },
  description: {
    "pt-br": "Análise das atividades primárias e de suporte que criam valor.",
    "en": "Analysis of primary and support activities that create value.",
  },
  category: "strategic",
  outputType: "markdown",
  complexity: "intermediate",
  requiredData: [
    "company.ops.outsourced_services",
    "company.ops.channels",
    "company.ops.delivery_model"
  ],
  tags: ["strategy", "operations", "value", "processes"],

  generate: (ctx: OrchestratorContext, lang: "pt-br" | "en"): string => {
    const c = ctx.company?.company || {};
    const meta = ctx.company?.meta || {};
    const ops = c.ops || {};

    const companyName = meta.name || (lang === "pt-br" ? "Sua Empresa" : "Your Company");
    const industry = meta.industry || "GENERAL";

    const chain = analyzeValueChain(c, ops, industry, lang);

    return lang === "pt-br"
      ? `# 🔗 Cadeia de Valor - ${companyName}

## Conceito
A Cadeia de Valor de Porter identifica atividades que criam valor e geram margem.

---

## 📊 Estrutura da Cadeia

\`\`\`
┌──────────────────────────────────────────────────────────────────┐
│                    ATIVIDADES DE SUPORTE                         │
├──────────────────────────────────────────────────────────────────┤
│ 🏢 Infraestrutura da Empresa                                     │
│    (Gestão, Finanças, Planejamento, Qualidade)                   │
├──────────────────────────────────────────────────────────────────┤
│ 👥 Gestão de Recursos Humanos                                    │
│    (Recrutamento, Treinamento, Remuneração)                      │
├──────────────────────────────────────────────────────────────────┤
│ 💻 Desenvolvimento de Tecnologia                                 │
│    (P&D, Automação, Design)                                      │
├──────────────────────────────────────────────────────────────────┤
│ 📦 Aquisição                                                     │ → MARGEM
│    (Compras, Fornecedores, Materiais)                            │
├────────┬────────┬────────┬────────┬────────┬────────────────────┤
│ 📥     │ ⚙️     │ 📤     │ 📢     │ 🤝     │                    │
│Logíst. │Operaç. │Logíst. │Market. │Serviço │                    │
│Entrada │        │ Saída  │ Vendas │        │                    │
├────────┴────────┴────────┴────────┴────────┴────────────────────┤
│                    ATIVIDADES PRIMÁRIAS                          │
└──────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 📥 Atividades Primárias

### 1. Logística de Entrada
${chain.inbound.map(a => `- ${a.activity}: **${a.status}** ${a.recommendation ? `→ ${a.recommendation}` : ""}`).join("\n")}

### 2. Operações
${chain.operations.map(a => `- ${a.activity}: **${a.status}** ${a.recommendation ? `→ ${a.recommendation}` : ""}`).join("\n")}

### 3. Logística de Saída
${chain.outbound.map(a => `- ${a.activity}: **${a.status}** ${a.recommendation ? `→ ${a.recommendation}` : ""}`).join("\n")}

### 4. Marketing e Vendas
${chain.marketing.map(a => `- ${a.activity}: **${a.status}** ${a.recommendation ? `→ ${a.recommendation}` : ""}`).join("\n")}

### 5. Serviço
${chain.service.map(a => `- ${a.activity}: **${a.status}** ${a.recommendation ? `→ ${a.recommendation}` : ""}`).join("\n")}

---

## 🏢 Atividades de Suporte

### Infraestrutura
${chain.infrastructure.map(a => `- ${a.activity}: **${a.status}**`).join("\n")}

### Gestão de RH
${chain.hr.map(a => `- ${a.activity}: **${a.status}**`).join("\n")}

### Desenvolvimento de Tecnologia
${chain.technology.map(a => `- ${a.activity}: **${a.status}**`).join("\n")}

### Aquisição
${chain.procurement.map(a => `- ${a.activity}: **${a.status}**`).join("\n")}

---

## 💡 Análise de Valor

| Atividade | Criação de Valor | Custo | Eficiência |
|-----------|------------------|-------|------------|
${chain.summary.map(s => `| ${s.activity} | ${s.value} | ${s.cost} | ${s.efficiency} |`).join("\n")}

### Recomendações Estratégicas
${chain.recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}
`
      : `# 🔗 Value Chain - ${companyName}

## Concept
Porter's Value Chain identifies activities that create value and generate margin.

---

## 📊 Chain Structure

\`\`\`
┌──────────────────────────────────────────────────────────────────┐
│                      SUPPORT ACTIVITIES                          │
├──────────────────────────────────────────────────────────────────┤
│ 🏢 Firm Infrastructure                                           │
│    (Management, Finance, Planning, Quality)                      │
├──────────────────────────────────────────────────────────────────┤
│ 👥 Human Resource Management                                     │
│    (Recruiting, Training, Compensation)                          │
├──────────────────────────────────────────────────────────────────┤
│ 💻 Technology Development                                        │
│    (R&D, Automation, Design)                                     │
├──────────────────────────────────────────────────────────────────┤
│ 📦 Procurement                                                   │ → MARGIN
│    (Purchasing, Suppliers, Materials)                            │
├────────┬────────┬────────┬────────┬────────┬────────────────────┤
│ 📥     │ ⚙️     │ 📤     │ 📢     │ 🤝     │                    │
│Inbound │Operat. │Outbound│Market. │Service │                    │
│Logist. │        │Logist. │& Sales │        │                    │
├────────┴────────┴────────┴────────┴────────┴────────────────────┤
│                      PRIMARY ACTIVITIES                          │
└──────────────────────────────────────────────────────────────────┘
\`\`\`

---

## 📥 Primary Activities

### 1. Inbound Logistics
${chain.inbound.map(a => `- ${a.activity}: **${a.status}** ${a.recommendation ? `→ ${a.recommendation}` : ""}`).join("\n")}

### 2. Operations
${chain.operations.map(a => `- ${a.activity}: **${a.status}** ${a.recommendation ? `→ ${a.recommendation}` : ""}`).join("\n")}

### 3. Outbound Logistics
${chain.outbound.map(a => `- ${a.activity}: **${a.status}** ${a.recommendation ? `→ ${a.recommendation}` : ""}`).join("\n")}

### 4. Marketing & Sales
${chain.marketing.map(a => `- ${a.activity}: **${a.status}** ${a.recommendation ? `→ ${a.recommendation}` : ""}`).join("\n")}

### 5. Service
${chain.service.map(a => `- ${a.activity}: **${a.status}** ${a.recommendation ? `→ ${a.recommendation}` : ""}`).join("\n")}

---

## 🏢 Support Activities

### Infrastructure
${chain.infrastructure.map(a => `- ${a.activity}: **${a.status}**`).join("\n")}

### HR Management
${chain.hr.map(a => `- ${a.activity}: **${a.status}**`).join("\n")}

### Technology Development
${chain.technology.map(a => `- ${a.activity}: **${a.status}**`).join("\n")}

### Procurement
${chain.procurement.map(a => `- ${a.activity}: **${a.status}**`).join("\n")}

---

## 💡 Value Analysis

| Activity | Value Creation | Cost | Efficiency |
|----------|----------------|------|------------|
${chain.summary.map(s => `| ${s.activity} | ${s.value} | ${s.cost} | ${s.efficiency} |`).join("\n")}

### Strategic Recommendations
${chain.recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}
`;
  },

  getKnowledge: (lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# Cadeia de Valor

## O que é?
Modelo de Michael Porter que decompõe a empresa em atividades estratégicas.

## Atividades Primárias:
1. **Logística de Entrada:** Recebimento e armazenamento de insumos
2. **Operações:** Transformação de insumos em produtos
3. **Logística de Saída:** Distribuição ao cliente
4. **Marketing e Vendas:** Comunicação e comercialização
5. **Serviço:** Suporte pós-venda

## Atividades de Suporte:
- **Infraestrutura:** Gestão, finanças, legal
- **RH:** Pessoas e desenvolvimento
- **Tecnologia:** Inovação e automação
- **Aquisição:** Compras e fornecedores

## Quando usar?
- Identificar fontes de vantagem competitiva
- Reduzir custos estrategicamente
- Melhorar diferenciação
- Otimizar processos
`
      : `# Value Chain

## What is it?
Michael Porter model that decomposes the company into strategic activities.

## Primary Activities:
1. **Inbound Logistics:** Receiving and storing inputs
2. **Operations:** Transforming inputs into products
3. **Outbound Logistics:** Distribution to customer
4. **Marketing & Sales:** Communication and commercialization
5. **Service:** After-sales support

## Support Activities:
- **Infrastructure:** Management, finance, legal
- **HR:** People and development
- **Technology:** Innovation and automation
- **Procurement:** Purchasing and suppliers

## When to use?
- Identify sources of competitive advantage
- Reduce costs strategically
- Improve differentiation
- Optimize processes
`;
  },
};

interface ChainActivity {
  activity: string;
  status: string;
  recommendation?: string;
}

interface ChainSummary {
  activity: string;
  value: string;
  cost: string;
  efficiency: string;
}

interface ValueChainAnalysis {
  inbound: ChainActivity[];
  operations: ChainActivity[];
  outbound: ChainActivity[];
  marketing: ChainActivity[];
  service: ChainActivity[];
  infrastructure: ChainActivity[];
  hr: ChainActivity[];
  technology: ChainActivity[];
  procurement: ChainActivity[];
  summary: ChainSummary[];
  recommendations: string[];
}

function analyzeValueChain(company: any, ops: any, industry: string, lang: "pt-br" | "en"): ValueChainAnalysis {
  const isPtBr = lang === "pt-br";

  return {
    inbound: [
      { activity: isPtBr ? "Recebimento de materiais" : "Material receiving",
        status: isPtBr ? "A definir" : "To define",
        recommendation: isPtBr ? "Mapear fornecedores" : "Map suppliers" },
      { activity: isPtBr ? "Controle de estoque" : "Inventory control",
        status: isPtBr ? "A definir" : "To define" },
      { activity: isPtBr ? "Gestão de fornecedores" : "Supplier management",
        status: isPtBr ? "A definir" : "To define" },
    ],
    operations: [
      { activity: isPtBr ? "Produção/Desenvolvimento" : "Production/Development",
        status: ops.processes ? "✅ Definido" : (isPtBr ? "A definir" : "To define") },
      { activity: isPtBr ? "Controle de qualidade" : "Quality control",
        status: isPtBr ? "A definir" : "To define" },
      { activity: isPtBr ? "Manutenção" : "Maintenance",
        status: isPtBr ? "A definir" : "To define" },
    ],
    outbound: [
      { activity: isPtBr ? "Processamento de pedidos" : "Order processing",
        status: isPtBr ? "A definir" : "To define" },
      { activity: isPtBr ? "Entrega/Distribuição" : "Delivery/Distribution",
        status: isPtBr ? "A definir" : "To define" },
      { activity: isPtBr ? "Gestão de canais" : "Channel management",
        status: isPtBr ? "A definir" : "To define" },
    ],
    marketing: [
      { activity: isPtBr ? "Promoção e publicidade" : "Promotion and advertising",
        status: isPtBr ? "A definir" : "To define" },
      { activity: isPtBr ? "Força de vendas" : "Sales force",
        status: isPtBr ? "A definir" : "To define" },
      { activity: isPtBr ? "Precificação" : "Pricing",
        status: isPtBr ? "A definir" : "To define" },
    ],
    service: [
      { activity: isPtBr ? "Suporte ao cliente" : "Customer support",
        status: isPtBr ? "A definir" : "To define" },
      { activity: isPtBr ? "Garantia e devoluções" : "Warranty and returns",
        status: isPtBr ? "A definir" : "To define" },
      { activity: isPtBr ? "Treinamento de clientes" : "Customer training",
        status: isPtBr ? "A definir" : "To define" },
    ],
    infrastructure: [
      { activity: isPtBr ? "Gestão geral" : "General management",
        status: "⚙️" },
      { activity: isPtBr ? "Planejamento" : "Planning",
        status: "⚙️" },
      { activity: isPtBr ? "Finanças" : "Finance",
        status: "⚙️" },
      { activity: isPtBr ? "Jurídico" : "Legal",
        status: "⚙️" },
    ],
    hr: [
      { activity: isPtBr ? "Recrutamento" : "Recruiting",
        status: "👥" },
      { activity: isPtBr ? "Treinamento" : "Training",
        status: "👥" },
      { activity: isPtBr ? "Remuneração" : "Compensation",
        status: "👥" },
    ],
    technology: [
      { activity: isPtBr ? "P&D" : "R&D",
        status: "💻" },
      { activity: isPtBr ? "Automação de processos" : "Process automation",
        status: "💻" },
      { activity: isPtBr ? "Sistemas de informação" : "Information systems",
        status: "💻" },
    ],
    procurement: [
      { activity: isPtBr ? "Compras" : "Purchasing",
        status: "📦" },
      { activity: isPtBr ? "Negociação" : "Negotiation",
        status: "📦" },
      { activity: isPtBr ? "Qualificação de fornecedores" : "Supplier qualification",
        status: "📦" },
    ],
    summary: [
      { activity: isPtBr ? "Operações" : "Operations", value: "Alta", cost: "Alto", efficiency: "Média" },
      { activity: isPtBr ? "Marketing" : "Marketing", value: "Alta", cost: "Médio", efficiency: "A medir" },
      { activity: isPtBr ? "Serviço" : "Service", value: "Média", cost: "Baixo", efficiency: "Alta" },
      { activity: isPtBr ? "Logística" : "Logistics", value: "Média", cost: "Médio", efficiency: "Média" },
    ],
    recommendations: isPtBr
      ? [
          "Mapear todas as atividades em detalhe",
          "Identificar atividades que mais criam valor",
          "Otimizar ou terceirizar atividades de baixo valor",
          "Investir em diferenciação nas atividades-chave",
          "Automatizar processos repetitivos",
        ]
      : [
          "Map all activities in detail",
          "Identify highest value-creating activities",
          "Optimize or outsource low-value activities",
          "Invest in differentiation in key activities",
          "Automate repetitive processes",
        ],
  };
}

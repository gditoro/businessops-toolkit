/**
 * SWOT Analysis Method
 * Strengths, Weaknesses, Opportunities, Threats
 */

import { BusinessMethod } from "../index";
import { OrchestratorContext } from "../../orchestrator";

export const swotMethod: BusinessMethod = {
  id: "swot",
  name: {
    "pt-br": "Análise SWOT",
    "en": "SWOT Analysis",
  },
  description: {
    "pt-br": "Análise de Forças, Fraquezas, Oportunidades e Ameaças para planejamento estratégico.",
    "en": "Strengths, Weaknesses, Opportunities, and Threats analysis for strategic planning.",
  },
  category: "strategic",
  outputType: "markdown",
  complexity: "basic",
  requiredData: [
    "company.identity.stage",
    "company.ops.key_challenges",
    "company.finance.funding_status",
    "company.legal.partnership_agreement",
    "company.compliance.tax_registration"
  ],
  tags: ["strategy", "planning", "analysis"],

  generate: (ctx: OrchestratorContext, lang: "pt-br" | "en"): string => {
    const c = ctx.company?.company || {};
    const identity = c.identity || {};
    const ops = c.ops || {};
    const finance = c.finance || {};
    const compliance = c.compliance || {};
    const legal = c.legal || {};
    const meta = ctx.company?.meta || {};

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const opportunities: string[] = [];
    const threats: string[] = [];

    // Analyze strengths
    if (finance.funding_status === "REVENUE_FUNDED" || finance.funding_status === "BOOTSTRAPPED") {
      strengths.push(lang === "pt-br" ? "Independência financeira" : "Financial independence");
    }
    if (legal.partnership_agreement === "YES_COMPLETE") {
      strengths.push(lang === "pt-br" ? "Acordo de sócios formalizado" : "Formalized partnership agreement");
    }
    if (compliance.tax_registration === "YES") {
      strengths.push(lang === "pt-br" ? "Regularização fiscal em ordem" : "Tax registration in order");
    }
    if (compliance.anvisa_license && compliance.anvisa_license !== "NO") {
      strengths.push(lang === "pt-br" ? "Licenças regulatórias obtidas" : "Regulatory licenses obtained");
    }
    if (ops.outsourced_services?.length > 0) {
      strengths.push(lang === "pt-br" ? "Especialização via terceirização" : "Specialization via outsourcing");
    }
    if (legal.ip_assets?.includes("TRADEMARK")) {
      strengths.push(lang === "pt-br" ? "Marca registrada protegida" : "Protected registered trademark");
    }

    // Analyze weaknesses
    if (ops.key_challenges?.includes("PROCESSES")) {
      weaknesses.push(lang === "pt-br" ? "Processos desorganizados" : "Disorganized processes");
    }
    if (ops.key_challenges?.includes("CASH_FLOW")) {
      weaknesses.push(lang === "pt-br" ? "Desafios de fluxo de caixa" : "Cash flow challenges");
    }
    if (legal.key_contracts?.includes("NONE")) {
      weaknesses.push(lang === "pt-br" ? "Contratos não formalizados" : "Non-formalized contracts");
    }
    if (finance.tools?.includes("SPREADSHEET") && !finance.tools?.includes("ERP")) {
      weaknesses.push(lang === "pt-br" ? "Gestão financeira manual" : "Manual financial management");
    }
    if (legal.legal_support === "NONE") {
      weaknesses.push(lang === "pt-br" ? "Sem suporte jurídico" : "No legal support");
    }
    if (ops.key_challenges?.includes("HIRING")) {
      weaknesses.push(lang === "pt-br" ? "Dificuldade em contratação" : "Hiring difficulties");
    }

    // Analyze opportunities
    if (identity.stage === "GROWTH" || identity.stage === "EARLY") {
      opportunities.push(lang === "pt-br" ? "Mercado em expansão" : "Expanding market");
    }
    if (meta.packs?.includes("health-import")) {
      opportunities.push(lang === "pt-br" ? "Setor de saúde em crescimento" : "Growing healthcare sector");
    }
    if (ops.sales_channels?.includes("ECOMMERCE") || ops.sales_channels?.includes("MARKETPLACE")) {
      opportunities.push(lang === "pt-br" ? "Digitalização de canais" : "Channel digitalization");
    }
    if (!legal.ip_assets?.includes("PATENT")) {
      opportunities.push(lang === "pt-br" ? "Potencial para patentes" : "Patent potential");
    }
    opportunities.push(lang === "pt-br" ? "Novos mercados/segmentos" : "New markets/segments");

    // Analyze threats
    if (compliance.data_privacy === "YES_NOT_COMPLIANT") {
      threats.push(lang === "pt-br" ? "Risco de multas LGPD/GDPR" : "LGPD/GDPR fine risk");
    }
    if (ops.key_challenges?.includes("COMPLIANCE")) {
      threats.push(lang === "pt-br" ? "Ambiente regulatório complexo" : "Complex regulatory environment");
    }
    if (finance.runway === "LESS_3M" || finance.runway === "3_6M") {
      threats.push(lang === "pt-br" ? "Runway limitado" : "Limited runway");
    }
    if (legal.founders !== "SOLO" && legal.partnership_agreement !== "YES_COMPLETE") {
      threats.push(lang === "pt-br" ? "Conflito potencial entre sócios" : "Potential partner conflict");
    }
    threats.push(lang === "pt-br" ? "Concorrência de mercado" : "Market competition");

    // Defaults
    if (strengths.length === 0) strengths.push(lang === "pt-br" ? "A identificar" : "To be identified");
    if (weaknesses.length === 0) weaknesses.push(lang === "pt-br" ? "A identificar" : "To be identified");

    return lang === "pt-br"
      ? `# 📊 Análise SWOT

## 💪 Forças (Strengths)
${strengths.map(s => `- ${s}`).join("\n")}

## 😰 Fraquezas (Weaknesses)
${weaknesses.map(w => `- ${w}`).join("\n")}

## 🚀 Oportunidades (Opportunities)
${opportunities.map(o => `- ${o}`).join("\n")}

## ⚠️ Ameaças (Threats)
${threats.map(t => `- ${t}`).join("\n")}

---

## 📋 Matriz SWOT

|  | **Fatores Positivos** | **Fatores Negativos** |
|--|----------------------|----------------------|
| **Interno** | Forças | Fraquezas |
| **Externo** | Oportunidades | Ameaças |

### Estratégias Sugeridas:
- **SO (Forças + Oportunidades):** Use suas forças para aproveitar oportunidades
- **WO (Fraquezas + Oportunidades):** Supere fraquezas para aproveitar oportunidades
- **ST (Forças + Ameaças):** Use forças para mitigar ameaças
- **WT (Fraquezas + Ameaças):** Minimize fraquezas e evite ameaças
`
      : `# 📊 SWOT Analysis

## 💪 Strengths
${strengths.map(s => `- ${s}`).join("\n")}

## 😰 Weaknesses
${weaknesses.map(w => `- ${w}`).join("\n")}

## 🚀 Opportunities
${opportunities.map(o => `- ${o}`).join("\n")}

## ⚠️ Threats
${threats.map(t => `- ${t}`).join("\n")}

---

## 📋 SWOT Matrix

|  | **Positive Factors** | **Negative Factors** |
|--|---------------------|---------------------|
| **Internal** | Strengths | Weaknesses |
| **External** | Opportunities | Threats |

### Suggested Strategies:
- **SO (Strengths + Opportunities):** Use strengths to leverage opportunities
- **WO (Weaknesses + Opportunities):** Overcome weaknesses to leverage opportunities
- **ST (Strengths + Threats):** Use strengths to mitigate threats
- **WT (Weaknesses + Threats):** Minimize weaknesses and avoid threats
`;
  },

  getChecklist: (ctx: OrchestratorContext, lang: "pt-br" | "en"): string[] => {
    return lang === "pt-br"
      ? [
          "Reunir equipe para brainstorming",
          "Listar todas as forças internas",
          "Identificar fraquezas honestas",
          "Pesquisar oportunidades de mercado",
          "Mapear ameaças competitivas e regulatórias",
          "Cruzar fatores para gerar estratégias",
          "Priorizar ações por impacto",
          "Definir responsáveis e prazos",
          "Revisar trimestralmente",
        ]
      : [
          "Gather team for brainstorming",
          "List all internal strengths",
          "Identify honest weaknesses",
          "Research market opportunities",
          "Map competitive and regulatory threats",
          "Cross factors to generate strategies",
          "Prioritize actions by impact",
          "Assign owners and deadlines",
          "Review quarterly",
        ];
  },

  getKnowledge: (lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# Análise SWOT

## O que é?
A análise SWOT é uma ferramenta de planejamento estratégico que ajuda organizações a identificar fatores internos (Forças e Fraquezas) e externos (Oportunidades e Ameaças) que afetam seus objetivos.

## Quando usar?
- Planejamento estratégico anual
- Lançamento de novos produtos/serviços
- Entrada em novos mercados
- Avaliação de projetos
- Análise competitiva

## Como aplicar?
1. **Forças:** Recursos, capacidades e vantagens competitivas
2. **Fraquezas:** Limitações, gaps e áreas de melhoria
3. **Oportunidades:** Tendências de mercado, mudanças regulatórias favoráveis
4. **Ameaças:** Concorrência, riscos econômicos, mudanças desfavoráveis

## Dicas
- Seja específico e baseado em dados
- Envolva múltiplas perspectivas
- Atualize regularmente
- Use para gerar estratégias concretas
`
      : `# SWOT Analysis

## What is it?
SWOT analysis is a strategic planning tool that helps organizations identify internal factors (Strengths and Weaknesses) and external factors (Opportunities and Threats) affecting their objectives.

## When to use?
- Annual strategic planning
- New product/service launches
- Entering new markets
- Project evaluation
- Competitive analysis

## How to apply?
1. **Strengths:** Resources, capabilities, and competitive advantages
2. **Weaknesses:** Limitations, gaps, and areas for improvement
3. **Opportunities:** Market trends, favorable regulatory changes
4. **Threats:** Competition, economic risks, unfavorable changes

## Tips
- Be specific and data-driven
- Involve multiple perspectives
- Update regularly
- Use to generate concrete strategies
`;
  },
};

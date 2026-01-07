/**
 * Porter's Five Forces Analysis
 */

import { BusinessMethod } from "../index";
import { OrchestratorContext } from "../../orchestrator";

export const porterMethod: BusinessMethod = {
  id: "porter",
  name: {
    "pt-br": "5 Forças de Porter",
    "en": "Porter's Five Forces",
  },
  description: {
    "pt-br": "Análise das 5 forças competitivas que moldam a indústria.",
    "en": "Analysis of the 5 competitive forces that shape the industry.",
  },
  category: "strategic",
  outputType: "markdown",
  complexity: "intermediate",
  requiredData: [
    "meta.industry",
    "company.business_model",
    "company.ops.channels"
  ],
  tags: ["strategy", "competition", "industry", "market"],

  generate: (ctx: OrchestratorContext, lang: "pt-br" | "en"): string => {
    const meta = ctx.company?.meta || {};
    const c = ctx.company?.company || {};
    const ops = c.ops || {};
    const industry = meta.industry || "GENERAL";
    const businessModel = c.business_model || "";

    // Analyze each force based on context
    const forces = analyzeForces(industry, businessModel, ops, lang);

    return lang === "pt-br"
      ? `# 🎯 5 Forças de Porter

## 1. 🏭 Rivalidade entre Concorrentes
**Intensidade: ${forces.rivalry.level}**

${forces.rivalry.factors.map(f => `- ${f}`).join("\n")}

## 2. 🚪 Ameaça de Novos Entrantes
**Intensidade: ${forces.newEntrants.level}**

${forces.newEntrants.factors.map(f => `- ${f}`).join("\n")}

## 3. 🔄 Ameaça de Substitutos
**Intensidade: ${forces.substitutes.level}**

${forces.substitutes.factors.map(f => `- ${f}`).join("\n")}

## 4. 💪 Poder de Barganha dos Fornecedores
**Intensidade: ${forces.suppliers.level}**

${forces.suppliers.factors.map(f => `- ${f}`).join("\n")}

## 5. 👥 Poder de Barganha dos Clientes
**Intensidade: ${forces.buyers.level}**

${forces.buyers.factors.map(f => `- ${f}`).join("\n")}

---

## 📊 Resumo das Forças

| Força | Intensidade | Ação Estratégica |
|-------|-------------|------------------|
| Rivalidade | ${forces.rivalry.level} | ${forces.rivalry.action} |
| Novos Entrantes | ${forces.newEntrants.level} | ${forces.newEntrants.action} |
| Substitutos | ${forces.substitutes.level} | ${forces.substitutes.action} |
| Fornecedores | ${forces.suppliers.level} | ${forces.suppliers.action} |
| Clientes | ${forces.buyers.level} | ${forces.buyers.action} |

## 💡 Implicações Estratégicas
- **Atratividade da Indústria:** ${forces.industryAttractiveness}
- **Foco Recomendado:** ${forces.recommendedFocus}
`
      : `# 🎯 Porter's Five Forces

## 1. 🏭 Competitive Rivalry
**Intensity: ${forces.rivalry.level}**

${forces.rivalry.factors.map(f => `- ${f}`).join("\n")}

## 2. 🚪 Threat of New Entrants
**Intensity: ${forces.newEntrants.level}**

${forces.newEntrants.factors.map(f => `- ${f}`).join("\n")}

## 3. 🔄 Threat of Substitutes
**Intensity: ${forces.substitutes.level}**

${forces.substitutes.factors.map(f => `- ${f}`).join("\n")}

## 4. 💪 Supplier Power
**Intensity: ${forces.suppliers.level}**

${forces.suppliers.factors.map(f => `- ${f}`).join("\n")}

## 5. 👥 Buyer Power
**Intensity: ${forces.buyers.level}**

${forces.buyers.factors.map(f => `- ${f}`).join("\n")}

---

## 📊 Forces Summary

| Force | Intensity | Strategic Action |
|-------|-----------|------------------|
| Rivalry | ${forces.rivalry.level} | ${forces.rivalry.action} |
| New Entrants | ${forces.newEntrants.level} | ${forces.newEntrants.action} |
| Substitutes | ${forces.substitutes.level} | ${forces.substitutes.action} |
| Suppliers | ${forces.suppliers.level} | ${forces.suppliers.action} |
| Buyers | ${forces.buyers.level} | ${forces.buyers.action} |

## 💡 Strategic Implications
- **Industry Attractiveness:** ${forces.industryAttractiveness}
- **Recommended Focus:** ${forces.recommendedFocus}
`;
  },

  getKnowledge: (lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# 5 Forças de Porter

## O que é?
Modelo desenvolvido por Michael Porter para analisar a competitividade de uma indústria.

## As 5 Forças:
1. **Rivalidade entre Concorrentes:** Intensidade da competição existente
2. **Ameaça de Novos Entrantes:** Facilidade de entrada de novos competidores
3. **Ameaça de Substitutos:** Produtos/serviços alternativos
4. **Poder dos Fornecedores:** Controle sobre insumos e preços
5. **Poder dos Clientes:** Capacidade de negociação dos compradores

## Quando usar?
- Análise de atratividade de mercado
- Planejamento de entrada em novo setor
- Definição de estratégia competitiva
- Análise de ameaças e oportunidades

## Estratégias Genéricas (Porter):
- **Liderança em Custo:** Ser o produtor de menor custo
- **Diferenciação:** Oferecer valor único
- **Foco:** Concentrar em nicho específico
`
      : `# Porter's Five Forces

## What is it?
Model developed by Michael Porter to analyze industry competitiveness.

## The 5 Forces:
1. **Competitive Rivalry:** Intensity of existing competition
2. **Threat of New Entrants:** Ease of entry for new competitors
3. **Threat of Substitutes:** Alternative products/services
4. **Supplier Power:** Control over inputs and prices
5. **Buyer Power:** Negotiating capacity of customers

## When to use?
- Market attractiveness analysis
- New sector entry planning
- Competitive strategy definition
- Threat and opportunity analysis

## Generic Strategies (Porter):
- **Cost Leadership:** Be the lowest cost producer
- **Differentiation:** Offer unique value
- **Focus:** Concentrate on specific niche
`;
  },
};

function analyzeForces(industry: string, businessModel: string, ops: any, lang: "pt-br" | "en") {
  // Healthcare/Medical sector
  if (industry === "HEALTHCARE") {
    return {
      rivalry: {
        level: lang === "pt-br" ? "Alta" : "High",
        factors: lang === "pt-br"
          ? ["Mercado fragmentado", "Competição por licenças", "Diferenciação por qualidade"]
          : ["Fragmented market", "License competition", "Quality differentiation"],
        action: lang === "pt-br" ? "Diferenciação por qualidade e serviço" : "Quality and service differentiation",
      },
      newEntrants: {
        level: lang === "pt-br" ? "Baixa" : "Low",
        factors: lang === "pt-br"
          ? ["Barreiras regulatórias altas (ANVISA)", "Capital intensivo", "Conhecimento técnico necessário"]
          : ["High regulatory barriers (ANVISA/FDA)", "Capital intensive", "Technical knowledge required"],
        action: lang === "pt-br" ? "Fortalecer compliance como barreira" : "Strengthen compliance as barrier",
      },
      substitutes: {
        level: lang === "pt-br" ? "Média" : "Medium",
        factors: lang === "pt-br"
          ? ["Produtos genéricos", "Tecnologias alternativas", "Importação paralela"]
          : ["Generic products", "Alternative technologies", "Parallel imports"],
        action: lang === "pt-br" ? "Inovação e parcerias exclusivas" : "Innovation and exclusive partnerships",
      },
      suppliers: {
        level: lang === "pt-br" ? "Alta" : "High",
        factors: lang === "pt-br"
          ? ["Poucos fabricantes qualificados", "Dependência de importação", "Certificações necessárias"]
          : ["Few qualified manufacturers", "Import dependency", "Required certifications"],
        action: lang === "pt-br" ? "Diversificar fornecedores" : "Diversify suppliers",
      },
      buyers: {
        level: lang === "pt-br" ? "Média-Alta" : "Medium-High",
        factors: lang === "pt-br"
          ? ["Hospitais com poder de compra", "Licitações públicas", "Sensibilidade a preço"]
          : ["Hospitals with buying power", "Public tenders", "Price sensitivity"],
        action: lang === "pt-br" ? "Criar valor além do preço" : "Create value beyond price",
      },
      industryAttractiveness: lang === "pt-br" ? "Média-Alta (barreiras protegem)" : "Medium-High (barriers protect)",
      recommendedFocus: lang === "pt-br" ? "Diferenciação e compliance" : "Differentiation and compliance",
    };
  }

  // Technology/SaaS
  if (industry === "TECHNOLOGY") {
    return {
      rivalry: {
        level: lang === "pt-br" ? "Muito Alta" : "Very High",
        factors: lang === "pt-br"
          ? ["Muitos competidores", "Ciclos rápidos de inovação", "Competição global"]
          : ["Many competitors", "Fast innovation cycles", "Global competition"],
        action: lang === "pt-br" ? "Inovação contínua" : "Continuous innovation",
      },
      newEntrants: {
        level: lang === "pt-br" ? "Alta" : "High",
        factors: lang === "pt-br"
          ? ["Baixo custo de entrada", "Cloud computing", "Open source"]
          : ["Low entry cost", "Cloud computing", "Open source"],
        action: lang === "pt-br" ? "Criar switching costs" : "Create switching costs",
      },
      substitutes: {
        level: lang === "pt-br" ? "Alta" : "High",
        factors: lang === "pt-br"
          ? ["Novas tecnologias", "Plataformas alternativas", "No-code/Low-code"]
          : ["New technologies", "Alternative platforms", "No-code/Low-code"],
        action: lang === "pt-br" ? "Adaptar e integrar" : "Adapt and integrate",
      },
      suppliers: {
        level: lang === "pt-br" ? "Baixa" : "Low",
        factors: lang === "pt-br"
          ? ["Muitos provedores cloud", "Commoditização", "APIs abertas"]
          : ["Many cloud providers", "Commoditization", "Open APIs"],
        action: lang === "pt-br" ? "Multi-cloud strategy" : "Multi-cloud strategy",
      },
      buyers: {
        level: lang === "pt-br" ? "Alta" : "High",
        factors: lang === "pt-br"
          ? ["Muitas opções", "Baixo switching cost", "Comparação fácil"]
          : ["Many options", "Low switching cost", "Easy comparison"],
        action: lang === "pt-br" ? "Lock-in via integrações" : "Lock-in via integrations",
      },
      industryAttractiveness: lang === "pt-br" ? "Média (alta competição)" : "Medium (high competition)",
      recommendedFocus: lang === "pt-br" ? "Nicho e produto excepcional" : "Niche and exceptional product",
    };
  }

  // Generic analysis
  return {
    rivalry: {
      level: lang === "pt-br" ? "Média" : "Medium",
      factors: lang === "pt-br"
        ? ["Competição moderada", "Mercado em crescimento", "Diferenciação possível"]
        : ["Moderate competition", "Growing market", "Differentiation possible"],
      action: lang === "pt-br" ? "Focar em diferenciação" : "Focus on differentiation",
    },
    newEntrants: {
      level: lang === "pt-br" ? "Média" : "Medium",
      factors: lang === "pt-br"
        ? ["Barreiras moderadas", "Capital moderado", "Conhecimento acessível"]
        : ["Moderate barriers", "Moderate capital", "Accessible knowledge"],
      action: lang === "pt-br" ? "Construir marca e relacionamentos" : "Build brand and relationships",
    },
    substitutes: {
      level: lang === "pt-br" ? "Média" : "Medium",
      factors: lang === "pt-br"
        ? ["Alternativas existem", "Custo de troca moderado", "Inovação constante"]
        : ["Alternatives exist", "Moderate switching cost", "Constant innovation"],
      action: lang === "pt-br" ? "Inovar continuamente" : "Innovate continuously",
    },
    suppliers: {
      level: lang === "pt-br" ? "Média" : "Medium",
      factors: lang === "pt-br"
        ? ["Opções de fornecedores", "Negociação possível", "Qualidade variável"]
        : ["Supplier options", "Negotiation possible", "Variable quality"],
      action: lang === "pt-br" ? "Desenvolver parcerias" : "Develop partnerships",
    },
    buyers: {
      level: lang === "pt-br" ? "Média" : "Medium",
      factors: lang === "pt-br"
        ? ["Base diversificada", "Sensibilidade a valor", "Fidelidade possível"]
        : ["Diversified base", "Value sensitivity", "Loyalty possible"],
      action: lang === "pt-br" ? "Criar valor e relacionamento" : "Create value and relationship",
    },
    industryAttractiveness: lang === "pt-br" ? "Média" : "Medium",
    recommendedFocus: lang === "pt-br" ? "Diferenciação e eficiência" : "Differentiation and efficiency",
  };
}

/**
 * Ansoff Growth Matrix
 */

import { BusinessMethod } from "../index";
import { OrchestratorContext } from "../../orchestrator";

export const ansoffMethod: BusinessMethod = {
  id: "ansoff",
  name: {
    "pt-br": "Matriz de Ansoff",
    "en": "Ansoff Matrix",
  },
  description: {
    "pt-br": "Matriz de crescimento que analisa estratégias de produtos e mercados.",
    "en": "Growth matrix analyzing product and market strategies.",
  },
  category: "strategic",
  outputType: "markdown",
  complexity: "basic",
  requiredData: [
    "company.identity.stage",
    "company.ops.channels",
    "meta.industry"
  ],
  tags: ["strategy", "growth", "expansion", "market"],

  generate: (ctx: OrchestratorContext, lang: "pt-br" | "en"): string => {
    const c = ctx.company?.company || {};
    const meta = ctx.company?.meta || {};
    const ops = c.ops || {};

    const companyName = meta.name || (lang === "pt-br" ? "Sua Empresa" : "Your Company");
    const products = ops.products || [];
    const services = ops.services || [];

    // Analyze growth opportunities
    const analysis = analyzeGrowthStrategies(c, lang);

    return lang === "pt-br"
      ? `# 📈 Matriz de Ansoff - ${companyName}

## Conceito
A Matriz de Ansoff identifica 4 estratégias de crescimento baseadas em:
- **Produtos:** Existentes vs. Novos
- **Mercados:** Existentes vs. Novos

---

## 📊 Matriz Visual

\`\`\`
                         PRODUTOS
                  Existentes    |    Novos
              ┌─────────────────┼─────────────────┐
    Existentes│   PENETRAÇÃO    │ DESENVOLVIMENTO │
              │   DE MERCADO    │   DE PRODUTO    │
   MERCADOS   │  🎯 Risco Baixo │  🔧 Risco Médio │
              ├─────────────────┼─────────────────┤
              │ DESENVOLVIMENTO │ DIVERSIFICAÇÃO  │
        Novos │   DE MERCADO    │                 │
              │  🌍 Risco Médio │  🚀 Risco Alto  │
              └─────────────────┴─────────────────┘
\`\`\`

---

## 1. 🎯 Penetração de Mercado
*Produtos existentes + Mercados existentes*
**Risco: Baixo**

${analysis.penetration.map(s => `- ${s}`).join("\n")}

**Ações Recomendadas:**
- Aumentar frequência de compra
- Conquistar clientes da concorrência
- Converter não-usuários em usuários

---

## 2. 🔧 Desenvolvimento de Produto
*Produtos novos + Mercados existentes*
**Risco: Médio**

${analysis.productDev.map(s => `- ${s}`).join("\n")}

**Ações Recomendadas:**
- Lançar novas versões/funcionalidades
- Criar produtos complementares
- Atualizar linha de produtos

---

## 3. 🌍 Desenvolvimento de Mercado
*Produtos existentes + Mercados novos*
**Risco: Médio**

${analysis.marketDev.map(s => `- ${s}`).join("\n")}

**Ações Recomendadas:**
- Expandir geograficamente
- Atingir novos segmentos demográficos
- Explorar novos canais de distribuição

---

## 4. 🚀 Diversificação
*Produtos novos + Mercados novos*
**Risco: Alto**

${analysis.diversification.map(s => `- ${s}`).join("\n")}

**Ações Recomendadas:**
- Diversificação relacionada (sinergias)
- Diversificação não relacionada (conglomerado)
- Aquisições estratégicas

---

## 💡 Recomendação de Estratégia

| Estratégia | Risco | Retorno Potencial | Prioridade |
|------------|-------|-------------------|------------|
| Penetração de Mercado | Baixo | Médio | Alta |
| Desenvolvimento de Produto | Médio | Alto | Média |
| Desenvolvimento de Mercado | Médio | Alto | Média |
| Diversificação | Alto | Muito Alto | Seletiva |

### Para ${companyName}:
${analysis.recommendation}
`
      : `# 📈 Ansoff Matrix - ${companyName}

## Concept
The Ansoff Matrix identifies 4 growth strategies based on:
- **Products:** Existing vs. New
- **Markets:** Existing vs. New

---

## 📊 Visual Matrix

\`\`\`
                         PRODUCTS
                  Existing      |      New
              ┌─────────────────┼─────────────────┐
     Existing │    MARKET       │    PRODUCT      │
              │  PENETRATION    │  DEVELOPMENT    │
    MARKETS   │  🎯 Low Risk    │  🔧 Medium Risk │
              ├─────────────────┼─────────────────┤
              │    MARKET       │ DIVERSIFICATION │
         New  │  DEVELOPMENT    │                 │
              │  🌍 Medium Risk │  🚀 High Risk   │
              └─────────────────┴─────────────────┘
\`\`\`

---

## 1. 🎯 Market Penetration
*Existing products + Existing markets*
**Risk: Low**

${analysis.penetration.map(s => `- ${s}`).join("\n")}

**Recommended Actions:**
- Increase purchase frequency
- Win competitors' customers
- Convert non-users to users

---

## 2. 🔧 Product Development
*New products + Existing markets*
**Risk: Medium**

${analysis.productDev.map(s => `- ${s}`).join("\n")}

**Recommended Actions:**
- Launch new versions/features
- Create complementary products
- Update product line

---

## 3. 🌍 Market Development
*Existing products + New markets*
**Risk: Medium**

${analysis.marketDev.map(s => `- ${s}`).join("\n")}

**Recommended Actions:**
- Geographic expansion
- Reach new demographic segments
- Explore new distribution channels

---

## 4. 🚀 Diversification
*New products + New markets*
**Risk: High**

${analysis.diversification.map(s => `- ${s}`).join("\n")}

**Recommended Actions:**
- Related diversification (synergies)
- Unrelated diversification (conglomerate)
- Strategic acquisitions

---

## 💡 Strategy Recommendation

| Strategy | Risk | Potential Return | Priority |
|----------|------|------------------|----------|
| Market Penetration | Low | Medium | High |
| Product Development | Medium | High | Medium |
| Market Development | Medium | High | Medium |
| Diversification | High | Very High | Selective |

### For ${companyName}:
${analysis.recommendation}
`;
  },

  getKnowledge: (lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# Matriz de Ansoff

## O que é?
Ferramenta de planejamento estratégico criada por Igor Ansoff para análise de crescimento.

## Os 4 Quadrantes:
1. **Penetração de Mercado:** Vender mais dos produtos atuais para clientes atuais
2. **Desenvolvimento de Produto:** Criar novos produtos para clientes atuais
3. **Desenvolvimento de Mercado:** Vender produtos atuais para novos clientes
4. **Diversificação:** Novos produtos para novos mercados

## Níveis de Risco:
- Penetração: ★☆☆☆ (menor risco)
- Desenvolvimento Produto: ★★☆☆
- Desenvolvimento Mercado: ★★☆☆
- Diversificação: ★★★★ (maior risco)

## Quando usar?
- Planejamento de crescimento
- Análise de estratégias de expansão
- Avaliação de novos mercados
- Decisões de portfólio
`
      : `# Ansoff Matrix

## What is it?
Strategic planning tool created by Igor Ansoff for growth analysis.

## The 4 Quadrants:
1. **Market Penetration:** Sell more current products to current customers
2. **Product Development:** Create new products for current customers
3. **Market Development:** Sell current products to new customers
4. **Diversification:** New products for new markets

## Risk Levels:
- Penetration: ★☆☆☆ (lowest risk)
- Product Development: ★★☆☆
- Market Development: ★★☆☆
- Diversification: ★★★★ (highest risk)

## When to use?
- Growth planning
- Expansion strategy analysis
- New market evaluation
- Portfolio decisions
`;
  },
};

interface GrowthAnalysis {
  penetration: string[];
  productDev: string[];
  marketDev: string[];
  diversification: string[];
  recommendation: string;
}

function analyzeGrowthStrategies(company: any, lang: "pt-br" | "en"): GrowthAnalysis {
  const stage = company.stage || "STARTUP";
  const businessModel = company.business_model || "";

  if (lang === "pt-br") {
    return {
      penetration: [
        "Intensificar marketing para base atual",
        "Programas de fidelidade e retenção",
        "Melhorar conversão de leads existentes",
        "Aumentar share of wallet",
      ],
      productDev: [
        "Adicionar funcionalidades ao produto atual",
        "Criar versões premium/enterprise",
        "Desenvolver produtos complementares",
        "Atender necessidades não-satisfeitas",
      ],
      marketDev: [
        "Expandir para novas regiões",
        "Entrar em segmentos adjacentes",
        "Explorar canais digitais",
        "Parcerias com distribuidores",
      ],
      diversification: [
        "Aquisições estratégicas",
        "Sinergias com negócios relacionados",
        "Novas unidades de negócio",
        "Integração vertical",
      ],
      recommendation: stage === "STARTUP"
        ? "Foco em **Penetração de Mercado** para consolidar posição antes de diversificar."
        : "Equilibrar **Penetração** com **Desenvolvimento** para crescimento sustentável.",
    };
  }

  return {
    penetration: [
      "Intensify marketing to current base",
      "Loyalty and retention programs",
      "Improve conversion of existing leads",
      "Increase share of wallet",
    ],
    productDev: [
      "Add features to current product",
      "Create premium/enterprise versions",
      "Develop complementary products",
      "Address unmet needs",
    ],
    marketDev: [
      "Expand to new regions",
      "Enter adjacent segments",
      "Explore digital channels",
      "Distributor partnerships",
    ],
    diversification: [
      "Strategic acquisitions",
      "Related business synergies",
      "New business units",
      "Vertical integration",
    ],
    recommendation: stage === "STARTUP"
      ? "Focus on **Market Penetration** to consolidate position before diversifying."
      : "Balance **Penetration** with **Development** for sustainable growth.",
  };
}

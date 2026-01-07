/**
 * BCG Matrix Analysis
 */

import { BusinessMethod } from "../index";
import { OrchestratorContext } from "../../orchestrator";

export const bcgMethod: BusinessMethod = {
  id: "bcg",
  name: {
    "pt-br": "Matriz BCG",
    "en": "BCG Matrix",
  },
  description: {
    "pt-br": "Análise de portfólio de produtos/serviços baseada em crescimento e participação de mercado.",
    "en": "Product/service portfolio analysis based on growth and market share.",
  },
  category: "strategic",
  outputType: "markdown",
  complexity: "intermediate",
  requiredData: [
    "company.identity.stage",
    "company.finance.revenue_model",
    "meta.industry"
  ],
  tags: ["strategy", "portfolio", "products", "growth"],

  generate: (ctx: OrchestratorContext, lang: "pt-br" | "en"): string => {
    const c = ctx.company?.company || {};
    const ops = c.ops || {};
    const products = ops.products || [];
    const services = ops.services || [];

    // Classify products/services into BCG quadrants
    const portfolio = classifyPortfolio(products, services, lang);

    return lang === "pt-br"
      ? `# 📊 Matriz BCG

## Conceito
A Matriz BCG classifica produtos/serviços em 4 quadrantes baseados em:
- **Crescimento do Mercado** (Alto/Baixo)
- **Participação de Mercado** (Alta/Baixa)

---

## 🌟 Estrelas (Stars)
*Alto crescimento + Alta participação*

${portfolio.stars.length > 0
  ? portfolio.stars.map(p => `- **${p.name}:** ${p.strategy}`).join("\n")
  : "- *Identificar produtos com potencial de liderança*"}

**Estratégia:** Investir para manter liderança

---

## 🐄 Vacas Leiteiras (Cash Cows)
*Baixo crescimento + Alta participação*

${portfolio.cashCows.length > 0
  ? portfolio.cashCows.map(p => `- **${p.name}:** ${p.strategy}`).join("\n")
  : "- *Produtos maduros que geram caixa*"}

**Estratégia:** Colher lucros, investimento mínimo

---

## ❓ Interrogações (Question Marks)
*Alto crescimento + Baixa participação*

${portfolio.questionMarks.length > 0
  ? portfolio.questionMarks.map(p => `- **${p.name}:** ${p.strategy}`).join("\n")
  : "- *Novos produtos em mercados crescentes*"}

**Estratégia:** Investir seletivamente ou desinvestir

---

## 🐕 Abacaxis (Dogs)
*Baixo crescimento + Baixa participação*

${portfolio.dogs.length > 0
  ? portfolio.dogs.map(p => `- **${p.name}:** ${p.strategy}`).join("\n")
  : "- *Avaliar produtos de baixo desempenho*"}

**Estratégia:** Desinvestir ou reposicionar

---

## 📈 Matriz Visual

\`\`\`
                    PARTICIPAÇÃO DE MERCADO
                    Alta            Baixa
               ┌─────────────┬─────────────┐
         Alto  │   ⭐        │     ❓      │
    CRESCIMENTO│   ESTRELA   │  INTERROGAÇÃO│
               │             │             │
    DO MERCADO ├─────────────┼─────────────┤
               │   🐄        │     🐕      │
         Baixo │   VACA      │   ABACAXI   │
               │   LEITEIRA  │             │
               └─────────────┴─────────────┘
\`\`\`

## 💡 Recomendações

| Quadrante | Quantidade | Ação Principal |
|-----------|------------|----------------|
| Estrelas | ${portfolio.stars.length} | Investir |
| Vacas Leiteiras | ${portfolio.cashCows.length} | Manter |
| Interrogações | ${portfolio.questionMarks.length} | Decidir |
| Abacaxis | ${portfolio.dogs.length} | Avaliar |

### Estratégia de Portfólio
${getPortfolioStrategy(portfolio, "pt-br")}
`
      : `# 📊 BCG Matrix

## Concept
The BCG Matrix classifies products/services into 4 quadrants based on:
- **Market Growth** (High/Low)
- **Market Share** (High/Low)

---

## 🌟 Stars
*High growth + High share*

${portfolio.stars.length > 0
  ? portfolio.stars.map(p => `- **${p.name}:** ${p.strategy}`).join("\n")
  : "- *Identify products with leadership potential*"}

**Strategy:** Invest to maintain leadership

---

## 🐄 Cash Cows
*Low growth + High share*

${portfolio.cashCows.length > 0
  ? portfolio.cashCows.map(p => `- **${p.name}:** ${p.strategy}`).join("\n")
  : "- *Mature products generating cash*"}

**Strategy:** Harvest profits, minimal investment

---

## ❓ Question Marks
*High growth + Low share*

${portfolio.questionMarks.length > 0
  ? portfolio.questionMarks.map(p => `- **${p.name}:** ${p.strategy}`).join("\n")
  : "- *New products in growing markets*"}

**Strategy:** Invest selectively or divest

---

## 🐕 Dogs
*Low growth + Low share*

${portfolio.dogs.length > 0
  ? portfolio.dogs.map(p => `- **${p.name}:** ${p.strategy}`).join("\n")
  : "- *Evaluate underperforming products*"}

**Strategy:** Divest or reposition

---

## 📈 Visual Matrix

\`\`\`
                      MARKET SHARE
                    High          Low
               ┌─────────────┬─────────────┐
         High  │   ⭐        │     ❓      │
    MARKET     │   STAR      │  QUESTION   │
    GROWTH     │             │    MARK     │
               ├─────────────┼─────────────┤
               │   🐄        │     🐕      │
         Low   │   CASH COW  │    DOG      │
               │             │             │
               └─────────────┴─────────────┘
\`\`\`

## 💡 Recommendations

| Quadrant | Count | Main Action |
|----------|-------|-------------|
| Stars | ${portfolio.stars.length} | Invest |
| Cash Cows | ${portfolio.cashCows.length} | Maintain |
| Question Marks | ${portfolio.questionMarks.length} | Decide |
| Dogs | ${portfolio.dogs.length} | Evaluate |

### Portfolio Strategy
${getPortfolioStrategy(portfolio, "en")}
`;
  },

  getKnowledge: (lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# Matriz BCG

## O que é?
Ferramenta do Boston Consulting Group para análise de portfólio de produtos.

## Os 4 Quadrantes:
1. **Estrelas:** Líderes em mercados crescentes - requerem investimento
2. **Vacas Leiteiras:** Líderes em mercados maduros - geram caixa
3. **Interrogações:** Seguidores em mercados crescentes - decisão crítica
4. **Abacaxis:** Seguidores em mercados maduros - candidatos a desinvestimento

## Ciclo Ideal:
Interrogação → Estrela → Vaca Leiteira → (Abacaxi - desinvestir)

## Quando usar?
- Decisões de investimento em produtos
- Alocação de recursos
- Planejamento de portfólio
- Análise de ciclo de vida
`
      : `# BCG Matrix

## What is it?
Boston Consulting Group tool for product portfolio analysis.

## The 4 Quadrants:
1. **Stars:** Leaders in growing markets - require investment
2. **Cash Cows:** Leaders in mature markets - generate cash
3. **Question Marks:** Followers in growing markets - critical decision
4. **Dogs:** Followers in mature markets - divestment candidates

## Ideal Cycle:
Question Mark → Star → Cash Cow → (Dog - divest)

## When to use?
- Product investment decisions
- Resource allocation
- Portfolio planning
- Lifecycle analysis
`;
  },
};

interface PortfolioItem {
  name: string;
  strategy: string;
}

interface Portfolio {
  stars: PortfolioItem[];
  cashCows: PortfolioItem[];
  questionMarks: PortfolioItem[];
  dogs: PortfolioItem[];
}

function classifyPortfolio(products: string[], services: string[], lang: "pt-br" | "en"): Portfolio {
  const portfolio: Portfolio = {
    stars: [],
    cashCows: [],
    questionMarks: [],
    dogs: [],
  };

  // For now, provide template items based on common patterns
  // In a real implementation, this would analyze actual data
  if (products.length === 0 && services.length === 0) {
    return portfolio;
  }

  // Simple classification logic based on product/service names
  const allItems = [...products, ...services];

  allItems.forEach((item, index) => {
    const itemLower = item.toLowerCase();

    // Keywords suggesting different quadrants
    if (itemLower.includes("novo") || itemLower.includes("new") ||
        itemLower.includes("inovação") || itemLower.includes("innovation") ||
        itemLower.includes("premium")) {
      portfolio.stars.push({
        name: item,
        strategy: lang === "pt-br" ? "Investir para crescimento" : "Invest for growth",
      });
    } else if (itemLower.includes("básico") || itemLower.includes("basic") ||
               itemLower.includes("tradicional") || itemLower.includes("standard")) {
      portfolio.cashCows.push({
        name: item,
        strategy: lang === "pt-br" ? "Manter e colher" : "Maintain and harvest",
      });
    } else if (itemLower.includes("beta") || itemLower.includes("piloto") ||
               itemLower.includes("pilot") || itemLower.includes("teste")) {
      portfolio.questionMarks.push({
        name: item,
        strategy: lang === "pt-br" ? "Avaliar potencial" : "Evaluate potential",
      });
    } else {
      // Default distribution based on position
      const mod = index % 4;
      if (mod === 0) portfolio.stars.push({ name: item, strategy: lang === "pt-br" ? "Expandir" : "Expand" });
      else if (mod === 1) portfolio.cashCows.push({ name: item, strategy: lang === "pt-br" ? "Otimizar" : "Optimize" });
      else if (mod === 2) portfolio.questionMarks.push({ name: item, strategy: lang === "pt-br" ? "Investigar" : "Investigate" });
      else portfolio.dogs.push({ name: item, strategy: lang === "pt-br" ? "Reavaliar" : "Reevaluate" });
    }
  });

  return portfolio;
}

function getPortfolioStrategy(portfolio: Portfolio, lang: "pt-br" | "en"): string {
  const total = portfolio.stars.length + portfolio.cashCows.length +
                portfolio.questionMarks.length + portfolio.dogs.length;

  if (total === 0) {
    return lang === "pt-br"
      ? "Adicione produtos/serviços ao intake para análise detalhada."
      : "Add products/services to intake for detailed analysis.";
  }

  const starPercent = (portfolio.stars.length / total) * 100;
  const cowPercent = (portfolio.cashCows.length / total) * 100;

  if (starPercent > 50) {
    return lang === "pt-br"
      ? "⚠️ Portfólio agressivo com muitas estrelas. Garantir fluxo de caixa."
      : "⚠️ Aggressive portfolio with many stars. Ensure cash flow.";
  }

  if (cowPercent > 50) {
    return lang === "pt-br"
      ? "⚠️ Portfólio maduro. Investir em inovação para crescimento futuro."
      : "⚠️ Mature portfolio. Invest in innovation for future growth.";
  }

  return lang === "pt-br"
    ? "✅ Portfólio equilibrado. Manter estratégia de investimento diversificada."
    : "✅ Balanced portfolio. Maintain diversified investment strategy.";
}

/**
 * Predictive Financial Analysis
 */

import { BusinessMethod } from "../index";
import { OrchestratorContext } from "../../orchestrator";

export const predictiveMethod: BusinessMethod = {
  id: "predictive",
  name: {
    "pt-br": "Análise Financeira Preditiva",
    "en": "Predictive Financial Analysis",
  },
  description: {
    "pt-br": "Projeções e cenários financeiros futuros.",
    "en": "Future financial projections and scenarios.",
  },
  category: "financial",
  outputType: "markdown",
  complexity: "advanced",
  requiredData: [
    "company.finance.revenue_model",
    "company.finance.runway",
    "company.identity.stage"
  ],
  tags: ["financial", "forecasting", "planning", "scenarios"],

  generate: (ctx: OrchestratorContext, lang: "pt-br" | "en"): string => {
    const c = ctx.company?.company || {};
    const meta = ctx.company?.meta || {};
    const companyName = meta.name || (lang === "pt-br" ? "Sua Empresa" : "Your Company");

    return lang === "pt-br"
      ? `# 🔮 Análise Financeira Preditiva - ${companyName}

## Conceito
Projeções financeiras baseadas em cenários para planejamento estratégico e tomada de decisão.

---

## 📊 Metodologia

### 1. Análise de Tendências Históricas
Baseado nos últimos 6-12 meses, identificar:
- Taxa de crescimento de receita
- Sazonalidade
- Evolução de custos
- Padrões de conversão

### 2. Premissas-Chave
Definir variáveis críticas para as projeções:

| Variável | Pessimista | Base | Otimista |
|----------|------------|------|----------|
| Crescimento MoM | 5% | 10% | 20% |
| Churn mensal | 8% | 5% | 2% |
| Ticket médio | -10% | 0% | +15% |
| CAC | +20% | 0% | -10% |
| Despesas fixas | +15% | +5% | 0% |

---

## 🎯 Cenários de Projeção (12 meses)

### Cenário Pessimista 🔴
*Premissas: crescimento lento, churn alto, mercado difícil*

| Mês | MRR | Clientes | Custo | Resultado |
|-----|-----|----------|-------|-----------|
| M1 | | | | |
| M6 | | | | |
| M12 | | | | |

**Runway projetado:** ___ meses

### Cenário Base 🟡
*Premissas: crescimento estável, execução consistente*

| Mês | MRR | Clientes | Custo | Resultado |
|-----|-----|----------|-------|-----------|
| M1 | | | | |
| M6 | | | | |
| M12 | | | | |

**Runway projetado:** ___ meses

### Cenário Otimista 🟢
*Premissas: crescimento acelerado, produto-market fit forte*

| Mês | MRR | Clientes | Custo | Resultado |
|-----|-----|----------|-------|-----------|
| M1 | | | | |
| M6 | | | | |
| M12 | | | | |

**Runway projetado:** ___ meses

---

## 📈 Projeção Visual de Receita

\`\`\`
Receita ($)
    │
120k│                                          ●  Otimista
    │                                      ●
100k│                                  ●
    │                              ●
 80k│                          ○       ○  Base
    │                      ○
 60k│                  ○
    │              ○
 40k│          ▪       ▪       ▪       ▪  Pessimista
    │      ▪
 20k│  ▪
    │
    └──────────────────────────────────────────
        M1   M3   M6   M9   M12
\`\`\`

---

## 💰 Análise de Break-Even

### Quando atingimos o break-even?

| Cenário | Mês de Break-Even | Requisitos |
|---------|-------------------|------------|
| Pessimista | M18+ | Cortar custos ou captar |
| Base | M12 | Manter execução |
| Otimista | M8 | Investir em crescimento |

### Fórmula:
\`\`\`
Break-Even MRR = Custos Fixos / (1 - % Custos Variáveis)
\`\`\`

---

## 🎲 Análise de Sensibilidade

*Como mudanças em variáveis afetam o resultado:*

### Impacto no MRR (M12)
| Variável | -20% | Base | +20% |
|----------|------|------|------|
| Preço | R$ ___ | R$ ___ | R$ ___ |
| Volume | R$ ___ | R$ ___ | R$ ___ |
| Churn | R$ ___ | R$ ___ | R$ ___ |

### Variáveis mais sensíveis:
1. **___:** Maior impacto no resultado
2. **___:** Segundo maior impacto
3. **___:** Menor impacto

---

## 📊 Necessidade de Capital

| Cenário | Capital Necessário | Uso |
|---------|-------------------|-----|
| Pessimista | R$ ___ | Sobrevivência |
| Base | R$ ___ | Crescimento moderado |
| Otimista | R$ ___ | Aceleração |

### Fontes Potenciais:
- [ ] Receita própria
- [ ] Investidores anjo
- [ ] Venture Capital
- [ ] Empréstimos
- [ ] Incentivos/Subvenções

---

## 🔄 Gatilhos de Decisão

### Se cenário pessimista:
1. Reduzir custos em ____%
2. Pivotar oferta para ____
3. Buscar capital de emergência

### Se cenário base:
1. Manter estratégia atual
2. Investir em ____ para acelerar
3. Monitorar indicadores mensalmente

### Se cenário otimista:
1. Investir agressivamente em crescimento
2. Contratar para ____ posições
3. Expandir para ____

---

## 📋 Plano de Ação

### Curto Prazo (0-3 meses)
- [ ] Validar premissas com dados reais
- [ ] Implementar tracking de métricas
- [ ] Preparar cenário de contingência

### Médio Prazo (3-6 meses)
- [ ] Revisar projeções mensalmente
- [ ] Ajustar estratégia conforme cenário
- [ ] Preparar para captação se necessário

### Longo Prazo (6-12 meses)
- [ ] Atualizar modelo de projeção
- [ ] Planejar próximo ciclo
- [ ] Definir novas metas
`
      : `# 🔮 Predictive Financial Analysis - ${companyName}

## Concept
Financial projections based on scenarios for strategic planning and decision-making.

---

## 📊 Methodology

### 1. Historical Trend Analysis
Based on the last 6-12 months, identify:
- Revenue growth rate
- Seasonality
- Cost evolution
- Conversion patterns

### 2. Key Assumptions
Define critical variables for projections:

| Variable | Pessimistic | Base | Optimistic |
|----------|-------------|------|------------|
| MoM Growth | 5% | 10% | 20% |
| Monthly Churn | 8% | 5% | 2% |
| Average Ticket | -10% | 0% | +15% |
| CAC | +20% | 0% | -10% |
| Fixed Expenses | +15% | +5% | 0% |

---

## 🎯 Projection Scenarios (12 months)

### Pessimistic Scenario 🔴
*Assumptions: slow growth, high churn, difficult market*

| Month | MRR | Customers | Cost | Result |
|-------|-----|-----------|------|--------|
| M1 | | | | |
| M6 | | | | |
| M12 | | | | |

**Projected runway:** ___ months

### Base Scenario 🟡
*Assumptions: stable growth, consistent execution*

| Month | MRR | Customers | Cost | Result |
|-------|-----|-----------|------|--------|
| M1 | | | | |
| M6 | | | | |
| M12 | | | | |

**Projected runway:** ___ months

### Optimistic Scenario 🟢
*Assumptions: accelerated growth, strong product-market fit*

| Month | MRR | Customers | Cost | Result |
|-------|-----|-----------|------|--------|
| M1 | | | | |
| M6 | | | | |
| M12 | | | | |

**Projected runway:** ___ months

---

## 💰 Break-Even Analysis

### When do we reach break-even?

| Scenario | Break-Even Month | Requirements |
|----------|------------------|--------------|
| Pessimistic | M18+ | Cut costs or raise |
| Base | M12 | Maintain execution |
| Optimistic | M8 | Invest in growth |

---

## 🎲 Sensitivity Analysis

*How variable changes affect results:*

### Impact on MRR (M12)
| Variable | -20% | Base | +20% |
|----------|------|------|------|
| Price | $ ___ | $ ___ | $ ___ |
| Volume | $ ___ | $ ___ | $ ___ |
| Churn | $ ___ | $ ___ | $ ___ |

### Most sensitive variables:
1. **___:** Highest result impact
2. **___:** Second highest impact
3. **___:** Lowest impact

---

## 🔄 Decision Triggers

### If pessimistic scenario:
1. Reduce costs by ____%
2. Pivot offering to ____
3. Seek emergency capital

### If base scenario:
1. Maintain current strategy
2. Invest in ____ to accelerate
3. Monitor indicators monthly

### If optimistic scenario:
1. Invest aggressively in growth
2. Hire for ____ positions
3. Expand to ____
`;
  },

  getKnowledge: (lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# Análise Preditiva

## O que é?
Projeções financeiras baseadas em cenários e premissas.

## Componentes:
- Análise de tendências históricas
- Definição de premissas
- Criação de cenários (pessimista, base, otimista)
- Análise de sensibilidade
- Gatilhos de decisão

## Técnicas:
- Regressão linear
- Análise de séries temporais
- Monte Carlo
- Análise de cenários

## Uso:
- Planejamento estratégico
- Captação de investimento
- Decisões de expansão
- Gestão de risco
`
      : `# Predictive Analysis

## What is it?
Financial projections based on scenarios and assumptions.

## Components:
- Historical trend analysis
- Assumption definition
- Scenario creation (pessimistic, base, optimistic)
- Sensitivity analysis
- Decision triggers

## Techniques:
- Linear regression
- Time series analysis
- Monte Carlo
- Scenario analysis

## Use:
- Strategic planning
- Investment raising
- Expansion decisions
- Risk management
`;
  },
};

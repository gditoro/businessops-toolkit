/**
 * Balanced Scorecard
 */

import { BusinessMethod } from "../index";
import { OrchestratorContext } from "../../orchestrator";

export const balancedScorecardMethod: BusinessMethod = {
  id: "balanced-scorecard",
  name: {
    "pt-br": "Balanced Scorecard (BSC)",
    "en": "Balanced Scorecard (BSC)",
  },
  description: {
    "pt-br": "Framework de gestão estratégica com 4 perspectivas equilibradas.",
    "en": "Strategic management framework with 4 balanced perspectives.",
  },
  category: "performance",
  outputType: "markdown",
  complexity: "intermediate",
  requiredData: [
    "company.identity.stage",
    "company.ops.key_challenges",
    "company.finance.funding_status"
  ],
  tags: ["strategy", "performance", "goals", "alignment"],

  generate: (ctx: OrchestratorContext, lang: "pt-br" | "en"): string => {
    const c = ctx.company?.company || {};
    const meta = ctx.company?.meta || {};
    const companyName = meta.name || (lang === "pt-br" ? "Sua Empresa" : "Your Company");

    return lang === "pt-br"
      ? `# ⚖️ Balanced Scorecard - ${companyName}

## Conceito
O Balanced Scorecard (BSC) é um framework que traduz estratégia em objetivos e métricas em 4 perspectivas equilibradas.

---

## 📊 As 4 Perspectivas

\`\`\`
                    ┌─────────────────────┐
                    │     FINANCEIRA      │
                    │   "Para ter sucesso │
                    │   financeiro..."    │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼───────┐    ┌─────────▼─────────┐    ┌───────▼───────┐
│    CLIENTES   │    │   V I S Ã O       │    │   PROCESSOS   │
│ "Para alcançar│◄───│   E               │───►│   INTERNOS    │
│  nossa visão, │    │ ESTRATÉGIA        │    │ "Para satisfa-│
│  como...      │    │                   │    │  zer clientes │
└───────┬───────┘    └─────────┬─────────┘    │  e acionis-   │
        │                      │              │  tas..."      │
        │                      │              └───────┬───────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  APRENDIZADO E      │
                    │   CRESCIMENTO       │
                    │ "Para alcançar      │
                    │  nossa visão..."    │
                    └─────────────────────┘
\`\`\`

---

## 💰 Perspectiva Financeira
*"Como devemos parecer para nossos acionistas?"*

### Objetivos Típicos:
- Aumentar receita
- Melhorar lucratividade
- Otimizar custos
- Maximizar valor

### Indicadores:
| Objetivo | Indicador | Meta |
|----------|-----------|------|
| Crescimento | Receita total | +20% |
| Rentabilidade | Margem líquida | >15% |
| Eficiência | ROI | >25% |
| Valor | EBITDA | +30% |

---

## 👥 Perspectiva do Cliente
*"Como devemos parecer para nossos clientes?"*

### Objetivos Típicos:
- Aumentar satisfação
- Conquistar novos clientes
- Reter clientes atuais
- Fortalecer marca

### Indicadores:
| Objetivo | Indicador | Meta |
|----------|-----------|------|
| Satisfação | NPS | >50 |
| Aquisição | Novos clientes/mês | +15% |
| Retenção | Churn rate | <5% |
| Marca | Brand awareness | +20% |

---

## ⚙️ Perspectiva de Processos Internos
*"Em que processos devemos ser excelentes?"*

### Objetivos Típicos:
- Melhorar eficiência operacional
- Inovar produtos/serviços
- Reduzir defeitos
- Acelerar entrega

### Indicadores:
| Objetivo | Indicador | Meta |
|----------|-----------|------|
| Eficiência | Produtividade | +10% |
| Qualidade | Taxa de defeitos | <1% |
| Velocidade | Lead time | -20% |
| Inovação | Novos produtos/ano | +2 |

---

## 🎓 Perspectiva de Aprendizado e Crescimento
*"Como sustentaremos nossa capacidade de mudar e melhorar?"*

### Objetivos Típicos:
- Desenvolver competências
- Fortalecer cultura
- Investir em tecnologia
- Reter talentos

### Indicadores:
| Objetivo | Indicador | Meta |
|----------|-----------|------|
| Competências | Horas treinamento | 40h/ano |
| Engajamento | eNPS | >30 |
| Tecnologia | Investimento TI | +15% |
| Talentos | Turnover | <10% |

---

## 🗺️ Mapa Estratégico

O mapa estratégico mostra relações de causa-efeito:

\`\`\`
FINANCEIRO:    [Aumentar Receita] ←─────────────────────────┐
                      ↑                                      │
CLIENTES:      [Melhorar NPS] ← [Conquistar Clientes] ←─────┤
                      ↑                ↑                     │
PROCESSOS:     [Acelerar Entrega] ← [Melhorar Qualidade]    │
                      ↑                ↑                     │
APRENDIZADO:   [Treinar Equipe] ← [Investir Tecnologia] ────┘
\`\`\`

---

## 📋 Template BSC

### Perspectiva Financeira
| Objetivo | Indicador | Meta | Iniciativa |
|----------|-----------|------|------------|
| | | | |

### Perspectiva do Cliente
| Objetivo | Indicador | Meta | Iniciativa |
|----------|-----------|------|------------|
| | | | |

### Perspectiva de Processos
| Objetivo | Indicador | Meta | Iniciativa |
|----------|-----------|------|------------|
| | | | |

### Perspectiva de Aprendizado
| Objetivo | Indicador | Meta | Iniciativa |
|----------|-----------|------|------------|
| | | | |

---

## 🔧 Implementação

### Fase 1: Estratégia (Semana 1-2)
- [ ] Definir visão e missão
- [ ] Identificar objetivos estratégicos
- [ ] Validar com liderança

### Fase 2: Indicadores (Semana 3-4)
- [ ] Definir KPIs por perspectiva
- [ ] Estabelecer metas
- [ ] Identificar fonte de dados

### Fase 3: Mapa Estratégico (Semana 5)
- [ ] Criar mapa de causa-efeito
- [ ] Validar relações
- [ ] Comunicar à organização

### Fase 4: Iniciativas (Semana 6-8)
- [ ] Definir projetos por objetivo
- [ ] Alocar recursos
- [ ] Criar cronograma

### Fase 5: Gestão (Contínuo)
- [ ] Reuniões mensais de review
- [ ] Atualizar scorecard
- [ ] Ajustar conforme necessário
`
      : `# ⚖️ Balanced Scorecard - ${companyName}

## Concept
The Balanced Scorecard (BSC) is a framework that translates strategy into objectives and metrics across 4 balanced perspectives.

---

## 📊 The 4 Perspectives

\`\`\`
                    ┌─────────────────────┐
                    │     FINANCIAL       │
                    │   "To succeed       │
                    │   financially..."   │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
┌───────▼───────┐    ┌─────────▼─────────┐    ┌───────▼───────┐
│   CUSTOMER    │    │    V I S I O N    │    │   INTERNAL    │
│ "To achieve   │◄───│    AND            │───►│   PROCESS     │
│  our vision,  │    │  STRATEGY         │    │ "To satisfy   │
│  how..."      │    │                   │    │  customers &  │
└───────┬───────┘    └─────────┬─────────┘    │  sharehold..."│
        │                      │              └───────┬───────┘
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  LEARNING &         │
                    │   GROWTH            │
                    │ "To achieve our     │
                    │  vision..."         │
                    └─────────────────────┘
\`\`\`

---

## 💰 Financial Perspective
*"How should we appear to our shareholders?"*

### Typical Objectives:
- Increase revenue
- Improve profitability
- Optimize costs
- Maximize value

### Indicators:
| Objective | Indicator | Target |
|-----------|-----------|--------|
| Growth | Total revenue | +20% |
| Profitability | Net margin | >15% |
| Efficiency | ROI | >25% |
| Value | EBITDA | +30% |

---

## 👥 Customer Perspective
*"How should we appear to our customers?"*

### Typical Objectives:
- Increase satisfaction
- Acquire new customers
- Retain current customers
- Strengthen brand

### Indicators:
| Objective | Indicator | Target |
|-----------|-----------|--------|
| Satisfaction | NPS | >50 |
| Acquisition | New customers/month | +15% |
| Retention | Churn rate | <5% |
| Brand | Brand awareness | +20% |

---

## ⚙️ Internal Process Perspective
*"What processes must we excel at?"*

### Typical Objectives:
- Improve operational efficiency
- Innovate products/services
- Reduce defects
- Accelerate delivery

### Indicators:
| Objective | Indicator | Target |
|-----------|-----------|--------|
| Efficiency | Productivity | +10% |
| Quality | Defect rate | <1% |
| Speed | Lead time | -20% |
| Innovation | New products/year | +2 |

---

## 🎓 Learning & Growth Perspective
*"How will we sustain our ability to change and improve?"*

### Typical Objectives:
- Develop competencies
- Strengthen culture
- Invest in technology
- Retain talent

### Indicators:
| Objective | Indicator | Target |
|-----------|-----------|--------|
| Competencies | Training hours | 40h/year |
| Engagement | eNPS | >30 |
| Technology | IT investment | +15% |
| Talent | Turnover | <10% |

---

## 🗺️ Strategy Map

The strategy map shows cause-effect relationships:

\`\`\`
FINANCIAL:     [Increase Revenue] ←─────────────────────────┐
                      ↑                                      │
CUSTOMER:      [Improve NPS] ← [Acquire Customers] ←────────┤
                      ↑                ↑                     │
PROCESS:       [Accelerate Delivery] ← [Improve Quality]    │
                      ↑                ↑                     │
LEARNING:      [Train Team] ← [Invest Technology] ──────────┘
\`\`\`

---

## 📋 BSC Template

### Financial Perspective
| Objective | Indicator | Target | Initiative |
|-----------|-----------|--------|------------|
| | | | |

### Customer Perspective
| Objective | Indicator | Target | Initiative |
|-----------|-----------|--------|------------|
| | | | |

### Process Perspective
| Objective | Indicator | Target | Initiative |
|-----------|-----------|--------|------------|
| | | | |

### Learning Perspective
| Objective | Indicator | Target | Initiative |
|-----------|-----------|--------|------------|
| | | | |

---

## 🔧 Implementation

### Phase 1: Strategy (Week 1-2)
- [ ] Define vision and mission
- [ ] Identify strategic objectives
- [ ] Validate with leadership

### Phase 2: Indicators (Week 3-4)
- [ ] Define KPIs per perspective
- [ ] Set targets
- [ ] Identify data source

### Phase 3: Strategy Map (Week 5)
- [ ] Create cause-effect map
- [ ] Validate relationships
- [ ] Communicate to organization

### Phase 4: Initiatives (Week 6-8)
- [ ] Define projects per objective
- [ ] Allocate resources
- [ ] Create timeline

### Phase 5: Management (Ongoing)
- [ ] Monthly review meetings
- [ ] Update scorecard
- [ ] Adjust as needed
`;
  },

  getChecklist: (_ctx: OrchestratorContext, lang: "pt-br" | "en"): string[] => {
    return lang === "pt-br"
      ? [
          "Definir visão e estratégia",
          "Identificar objetivos para cada perspectiva",
          "Criar mapa estratégico",
          "Definir indicadores (KPIs)",
          "Estabelecer metas para cada indicador",
          "Definir iniciativas/projetos",
          "Criar dashboard BSC",
          "Implementar reuniões de review",
        ]
      : [
          "Define vision and strategy",
          "Identify objectives for each perspective",
          "Create strategy map",
          "Define indicators (KPIs)",
          "Set targets for each indicator",
          "Define initiatives/projects",
          "Create BSC dashboard",
          "Implement review meetings",
        ];
  },

  getKnowledge: (lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# Balanced Scorecard

## O que é?
Framework de gestão estratégica criado por Kaplan e Norton (1992).

## As 4 Perspectivas:
1. **Financeira:** Resultados para acionistas
2. **Cliente:** Proposição de valor
3. **Processos Internos:** Excelência operacional
4. **Aprendizado e Crescimento:** Capacidades futuras

## Componentes:
- Objetivos estratégicos
- Indicadores (KPIs)
- Metas
- Iniciativas

## Mapa Estratégico:
Representa relações de causa-efeito entre objetivos

## Benefícios:
- Alinha estratégia e operação
- Equilibra curto e longo prazo
- Comunica estratégia
- Facilita gestão
`
      : `# Balanced Scorecard

## What is it?
Strategic management framework created by Kaplan and Norton (1992).

## The 4 Perspectives:
1. **Financial:** Results for shareholders
2. **Customer:** Value proposition
3. **Internal Processes:** Operational excellence
4. **Learning & Growth:** Future capabilities

## Components:
- Strategic objectives
- Indicators (KPIs)
- Targets
- Initiatives

## Strategy Map:
Represents cause-effect relationships between objectives

## Benefits:
- Aligns strategy and operations
- Balances short and long term
- Communicates strategy
- Facilitates management
`;
  },
};

/**
 * OKR - Objectives and Key Results
 */

import { BusinessMethod } from "../index";
import { OrchestratorContext } from "../../orchestrator";

export const okrMethod: BusinessMethod = {
  id: "okr",
  name: {
    "pt-br": "OKR - Objetivos e Resultados-Chave",
    "en": "OKR - Objectives and Key Results",
  },
  description: {
    "pt-br": "Framework para definir e acompanhar objetivos e resultados mensuráveis.",
    "en": "Framework for defining and tracking objectives and measurable results.",
  },
  category: "performance",
  outputType: "markdown",
  complexity: "intermediate",
  requiredData: [
    "company.identity.stage",
    "company.ops.key_challenges"
  ],
  tags: ["performance", "goals", "strategy", "alignment", "okr", "objectives"],

  generate: (ctx: OrchestratorContext, lang: "pt-br" | "en"): string => {
    const stage = ctx.stage || "traction";
    const company = ctx.company?.company || {};
    const companyName = company.identity?.name || (lang === "pt-br" ? "Sua Empresa" : "Your Company");

    if (lang === "pt-br") {
      return `# 🎯 OKR - Objetivos e Resultados-Chave

## O que são OKRs?

OKR (Objectives and Key Results) é um framework de definição de metas que ajuda organizações a alinhar e engajar equipes em torno de objetivos mensuráveis e ambiciosos.

| Componente | Descrição | Exemplo |
|------------|-----------|---------|
| **Objetivo (O)** | O que queremos alcançar (qualitativo, inspirador) | Tornar-se referência em atendimento ao cliente |
| **Resultado-Chave (KR)** | Como medimos o progresso (quantitativo, mensurável) | NPS de 70+ / Tempo de resposta < 2h |

---

## 📊 Estrutura de OKRs para ${companyName}

### Estágio: ${translateStage(stage)}

${getStageOKRs(stage, lang)}

---

## 🗓️ Cadência Recomendada

| Ciclo | Duração | Uso |
|-------|---------|-----|
| **Anual** | 12 meses | OKRs estratégicos da empresa |
| **Trimestral** | 3 meses | OKRs táticos de times/áreas |
| **Mensal** | Check-ins | Acompanhamento e ajustes |
| **Semanal** | Status | Progresso dos KRs |

---

## ✍️ Como Escrever Bons OKRs

### Objetivos Eficazes

✅ **Bom:**
- "Criar uma experiência de onboarding que encante os clientes"
- "Construir uma cultura de alta performance"
- "Dominar o mercado regional de saúde"

❌ **Evitar:**
- "Aumentar vendas em 20%" ← isso é um KR
- "Fazer mais marketing" ← vago demais
- "Manter operações" ← BAU, não objetivo

### Key Results Eficazes

✅ **Bons KRs (SMART):**
- "Aumentar NPS de 45 para 70"
- "Reduzir churn de 5% para 2%"
- "Atingir R$ 500k de MRR"
- "Contratar e treinar 10 vendedores"

❌ **Evitar:**
- "Melhorar satisfação" ← não mensurável
- "Fazer campanhas" ← atividade, não resultado
- "100% de entregas no prazo" ← pode ser BAU

---

## 📝 Template de OKR

\`\`\`
OBJETIVO: [Verbo inspirador] + [Meta qualitativa]
├── KR1: [Métrica] de [X atual] para [Y desejado]
├── KR2: [Métrica] de [X atual] para [Y desejado]
└── KR3: [Métrica] de [X atual] para [Y desejado]
\`\`\`

### Exemplo Completo

\`\`\`
OBJETIVO: Tornar-se a escolha preferida dos clientes enterprise

├── KR1: Aumentar receita enterprise de R$ 100k para R$ 500k/mês
├── KR2: Fechar 10 novos clientes com ticket médio > R$ 30k
├── KR3: Atingir NPS de 75+ no segmento enterprise
└── KR4: Reduzir ciclo de vendas de 90 para 45 dias
\`\`\`

---

## 📊 Escala de Pontuação

| Score | Significado | Cor |
|-------|-------------|-----|
| 0.0 - 0.3 | Não conseguimos avançar | 🔴 Vermelho |
| 0.4 - 0.6 | Progresso parcial | 🟡 Amarelo |
| 0.7 - 1.0 | Meta atingida ou superada | 🟢 Verde |

**Nota:** OKRs devem ser ambiciosos (stretch goals). Atingir 70% é considerado sucesso!

---

## 🏢 Hierarquia de OKRs

\`\`\`
┌─────────────────────────────────────┐
│      OKRs da Empresa (Anuais)       │
│   Visão estratégica de longo prazo  │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   OKRs de Departamento (Trimestrais)│
│    Alinhados com OKRs da empresa    │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│     OKRs de Time (Trimestrais)      │
│   Contribuem para OKRs do depto.    │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   OKRs Individuais (Opcionais)      │
│    Desenvolvimento pessoal          │
└─────────────────────────────────────┘
\`\`\`

---

## 🔄 Ciclo de OKRs

### 1. Planejamento (Início do Trimestre)
- [ ] Definir 3-5 objetivos por nível
- [ ] Criar 2-4 KRs por objetivo
- [ ] Alinhar com stakeholders
- [ ] Comunicar para toda a organização

### 2. Acompanhamento (Durante o Trimestre)
- [ ] Check-in semanal (atualizar scores)
- [ ] Retrospectiva mensal
- [ ] Ajustar KRs se necessário
- [ ] Remover bloqueios

### 3. Avaliação (Final do Trimestre)
- [ ] Pontuar cada KR (0.0 a 1.0)
- [ ] Calcular média do objetivo
- [ ] Documentar aprendizados
- [ ] Celebrar conquistas

### 4. Retrospectiva
- [ ] O que funcionou?
- [ ] O que poderíamos melhorar?
- [ ] Os OKRs eram ambiciosos o suficiente?
- [ ] Estavam alinhados com a estratégia?

---

## ⚠️ Erros Comuns

| Erro | Problema | Solução |
|------|----------|---------|
| OKRs demais | Falta de foco | Máximo 3-5 objetivos por ciclo |
| KRs binários | Sem gradação | Use métricas contínuas |
| Falta de alinhamento | Silos | Cascade top-down + bottom-up |
| OKRs como tarefas | Confunde output/outcome | Foque em resultados, não atividades |
| Sem check-ins | Esquece até o fim | Rituais semanais obrigatórios |
| Punir não-atingimento | Medo de metas ambiciosas | OKRs ≠ avaliação de desempenho |

---

## 🛠️ Ferramentas

| Ferramenta | Tipo | Destaque |
|------------|------|----------|
| Weekdone | SaaS | Simples, bom para PMEs |
| Perdoo | SaaS | Visual, bom para escalar |
| Gtmhub | Enterprise | Robusto, integrações |
| Ally.io | Enterprise | Microsoft integration |
| Notion/Coda | DIY | Flexível, baixo custo |
| Planilha | Manual | Grátis, simplicidade |

---

## 💡 Dicas de Implementação

1. **Comece pequeno** - Piloto com 1-2 times antes de escalar
2. **Treine líderes** - Eles são multiplicadores
3. **Separe OKRs de avaliação** - Evite sandbagging
4. **Transparência total** - Todos veem todos os OKRs
5. **Celebre aprendizados** - Não apenas sucessos
`;
    } else {
      return `# 🎯 OKR - Objectives and Key Results

## What are OKRs?

OKR (Objectives and Key Results) is a goal-setting framework that helps organizations align and engage teams around measurable, ambitious objectives.

| Component | Description | Example |
|-----------|-------------|---------|
| **Objective (O)** | What we want to achieve (qualitative, inspiring) | Become the reference in customer service |
| **Key Result (KR)** | How we measure progress (quantitative, measurable) | NPS of 70+ / Response time < 2h |

---

## 📊 OKR Structure for ${companyName}

### Stage: ${translateStage(stage)}

${getStageOKRs(stage, lang)}

---

## 🗓️ Recommended Cadence

| Cycle | Duration | Use |
|-------|----------|-----|
| **Annual** | 12 months | Company strategic OKRs |
| **Quarterly** | 3 months | Team/area tactical OKRs |
| **Monthly** | Check-ins | Tracking and adjustments |
| **Weekly** | Status | KR progress |

---

## ✍️ How to Write Good OKRs

### Effective Objectives

✅ **Good:**
- "Create an onboarding experience that delights customers"
- "Build a high-performance culture"
- "Dominate the regional health market"

❌ **Avoid:**
- "Increase sales by 20%" ← this is a KR
- "Do more marketing" ← too vague
- "Maintain operations" ← BAU, not objective

### Effective Key Results

✅ **Good KRs (SMART):**
- "Increase NPS from 45 to 70"
- "Reduce churn from 5% to 2%"
- "Reach $500k MRR"
- "Hire and train 10 salespeople"

❌ **Avoid:**
- "Improve satisfaction" ← not measurable
- "Run campaigns" ← activity, not result
- "100% on-time deliveries" ← may be BAU

---

## 📝 OKR Template

\`\`\`
OBJECTIVE: [Inspiring verb] + [Qualitative goal]
├── KR1: [Metric] from [X current] to [Y desired]
├── KR2: [Metric] from [X current] to [Y desired]
└── KR3: [Metric] from [X current] to [Y desired]
\`\`\`

### Complete Example

\`\`\`
OBJECTIVE: Become the preferred choice for enterprise clients

├── KR1: Increase enterprise revenue from $100k to $500k/month
├── KR2: Close 10 new clients with avg ticket > $30k
├── KR3: Achieve NPS of 75+ in enterprise segment
└── KR4: Reduce sales cycle from 90 to 45 days
\`\`\`

---

## 📊 Scoring Scale

| Score | Meaning | Color |
|-------|---------|-------|
| 0.0 - 0.3 | Couldn't make progress | 🔴 Red |
| 0.4 - 0.6 | Partial progress | 🟡 Yellow |
| 0.7 - 1.0 | Goal achieved or exceeded | 🟢 Green |

**Note:** OKRs should be ambitious (stretch goals). Achieving 70% is considered success!

---

## 🏢 OKR Hierarchy

\`\`\`
┌─────────────────────────────────────┐
│       Company OKRs (Annual)         │
│    Long-term strategic vision       │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Department OKRs (Quarterly)       │
│     Aligned with company OKRs       │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│       Team OKRs (Quarterly)         │
│    Contribute to dept. OKRs         │
└─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│    Individual OKRs (Optional)       │
│       Personal development          │
└─────────────────────────────────────┘
\`\`\`

---

## 🔄 OKR Cycle

### 1. Planning (Quarter Start)
- [ ] Define 3-5 objectives per level
- [ ] Create 2-4 KRs per objective
- [ ] Align with stakeholders
- [ ] Communicate to entire organization

### 2. Tracking (During Quarter)
- [ ] Weekly check-in (update scores)
- [ ] Monthly retrospective
- [ ] Adjust KRs if needed
- [ ] Remove blockers

### 3. Evaluation (Quarter End)
- [ ] Score each KR (0.0 to 1.0)
- [ ] Calculate objective average
- [ ] Document learnings
- [ ] Celebrate achievements

### 4. Retrospective
- [ ] What worked?
- [ ] What could we improve?
- [ ] Were OKRs ambitious enough?
- [ ] Were they aligned with strategy?

---

## ⚠️ Common Mistakes

| Mistake | Problem | Solution |
|---------|---------|----------|
| Too many OKRs | Lack of focus | Max 3-5 objectives per cycle |
| Binary KRs | No gradation | Use continuous metrics |
| Lack of alignment | Silos | Cascade top-down + bottom-up |
| OKRs as tasks | Confuses output/outcome | Focus on results, not activities |
| No check-ins | Forgotten until end | Mandatory weekly rituals |
| Punishing non-achievement | Fear of ambitious goals | OKRs ≠ performance review |

---

## 🛠️ Tools

| Tool | Type | Highlight |
|------|------|-----------|
| Weekdone | SaaS | Simple, good for SMBs |
| Perdoo | SaaS | Visual, good for scaling |
| Gtmhub | Enterprise | Robust, integrations |
| Ally.io | Enterprise | Microsoft integration |
| Notion/Coda | DIY | Flexible, low cost |
| Spreadsheet | Manual | Free, simplicity |

---

## 💡 Implementation Tips

1. **Start small** - Pilot with 1-2 teams before scaling
2. **Train leaders** - They are multipliers
3. **Separate OKRs from reviews** - Avoid sandbagging
4. **Full transparency** - Everyone sees all OKRs
5. **Celebrate learnings** - Not just successes
`;
    }
  },

  getChecklist: (_ctx: OrchestratorContext, lang: "pt-br" | "en"): string[] => {
    return lang === "pt-br"
      ? [
          "Definir visão e missão da empresa (base para OKRs)",
          "Treinar líderes no framework OKR",
          "Escolher ferramenta de acompanhamento",
          "Definir OKRs da empresa (3-5 objetivos anuais)",
          "Cascatear para departamentos/times (trimestrais)",
          "Alinhar todos os níveis (top-down + bottom-up)",
          "Comunicar OKRs para toda organização",
          "Estabelecer ritual de check-in semanal",
          "Criar dashboard de acompanhamento",
          "Definir reunião mensal de retrospectiva",
          "Preparar scoring de final de trimestre",
          "Separar OKRs de avaliação de desempenho",
        ]
      : [
          "Define company vision and mission (OKR foundation)",
          "Train leaders on OKR framework",
          "Choose tracking tool",
          "Define company OKRs (3-5 annual objectives)",
          "Cascade to departments/teams (quarterly)",
          "Align all levels (top-down + bottom-up)",
          "Communicate OKRs to entire organization",
          "Establish weekly check-in ritual",
          "Create tracking dashboard",
          "Define monthly retrospective meeting",
          "Prepare end-of-quarter scoring",
          "Separate OKRs from performance reviews",
        ];
  },

  getKnowledge: (lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# OKR - Objetivos e Resultados-Chave

## Origem
Criado por Andy Grove (Intel) nos anos 70, popularizado pelo Google nos anos 2000.

## Princípios Fundamentais
1. **Objetivos inspiradores** - qualitativos, motivacionais
2. **Key Results mensuráveis** - quantitativos, sem ambiguidade
3. **Transparência** - todos veem todos os OKRs
4. **Ambição** - metas stretch (70% = sucesso)
5. **Desvinculação de compensação** - não usar para bônus

## Fórmula
**Objetivo:** "Onde queremos chegar?"
**Key Results:** "Como sabemos que chegamos?"

## Diferença OKR vs KPI
- **KPI:** Mede saúde operacional (BAU)
- **OKR:** Define metas de mudança/crescimento

## Quando Usar
- Alinhar organização em torno de prioridades
- Criar foco em resultados vs atividades
- Aumentar transparência e accountability
- Escalar sem perder alinhamento
`
      : `# OKR - Objectives and Key Results

## Origin
Created by Andy Grove (Intel) in the 70s, popularized by Google in the 2000s.

## Core Principles
1. **Inspiring objectives** - qualitative, motivational
2. **Measurable Key Results** - quantitative, unambiguous
3. **Transparency** - everyone sees all OKRs
4. **Ambition** - stretch goals (70% = success)
5. **Decoupled from compensation** - don't use for bonuses

## Formula
**Objective:** "Where do we want to go?"
**Key Results:** "How do we know we got there?"

## OKR vs KPI Difference
- **KPI:** Measures operational health (BAU)
- **OKR:** Defines change/growth goals

## When to Use
- Align organization around priorities
- Create focus on results vs activities
- Increase transparency and accountability
- Scale without losing alignment
`;
  },
};

function translateStage(stage: string): string {
  const stages: Record<string, string> = {
    idea: "Ideia / Idea",
    mvp: "MVP",
    traction: "Tração / Traction",
    growth: "Crescimento / Growth",
    scale: "Escala / Scale",
    mature: "Maturidade / Mature",
  };
  return stages[stage] || stage;
}

function getStageOKRs(stage: string, lang: "pt-br" | "en"): string {
  const okrs: Record<string, Record<string, string>> = {
    idea: {
      "pt-br": `### OKRs Sugeridos - Estágio Ideia

**Objetivo 1: Validar a oportunidade de mercado**
- KR1: Entrevistar 30 potenciais clientes do ICP
- KR2: Identificar 3 problemas recorrentes com frequência > 70%
- KR3: Obter 10 cartas de intenção de compra

**Objetivo 2: Construir base técnica sólida**
- KR1: Definir arquitetura escalável documentada
- KR2: Implementar MVP funcional em 8 semanas
- KR3: Atingir 90% de cobertura de testes críticos`,
      en: `### Suggested OKRs - Idea Stage

**Objective 1: Validate market opportunity**
- KR1: Interview 30 potential ICP customers
- KR2: Identify 3 recurring problems with >70% frequency
- KR3: Obtain 10 letters of intent to purchase

**Objective 2: Build solid technical foundation**
- KR1: Define documented scalable architecture
- KR2: Implement functional MVP in 8 weeks
- KR3: Achieve 90% critical test coverage`,
    },
    mvp: {
      "pt-br": `### OKRs Sugeridos - Estágio MVP

**Objetivo 1: Provar que o produto resolve o problema**
- KR1: Atingir 100 usuários ativos na plataforma
- KR2: Obter NPS > 40 dos early adopters
- KR3: Alcançar taxa de retenção D7 > 30%

**Objetivo 2: Estabelecer modelo de aquisição**
- KR1: Testar 3 canais de aquisição diferentes
- KR2: Identificar 1 canal com CAC < LTV/3
- KR3: Gerar 500 leads qualificados`,
      en: `### Suggested OKRs - MVP Stage

**Objective 1: Prove product solves the problem**
- KR1: Reach 100 active users on platform
- KR2: Achieve NPS > 40 from early adopters
- KR3: Achieve D7 retention rate > 30%

**Objective 2: Establish acquisition model**
- KR1: Test 3 different acquisition channels
- KR2: Identify 1 channel with CAC < LTV/3
- KR3: Generate 500 qualified leads`,
    },
    traction: {
      "pt-br": `### OKRs Sugeridos - Estágio Tração

**Objetivo 1: Escalar aquisição de clientes**
- KR1: Crescer MRR de R$ 30k para R$ 100k
- KR2: Reduzir CAC em 30%
- KR3: Aumentar taxa de conversão de 2% para 5%

**Objetivo 2: Construir máquina de crescimento**
- KR1: Contratar e treinar 5 vendedores
- KR2: Implementar playbook de vendas completo
- KR3: Atingir ticket médio de R$ 2.000`,
      en: `### Suggested OKRs - Traction Stage

**Objective 1: Scale customer acquisition**
- KR1: Grow MRR from $30k to $100k
- KR2: Reduce CAC by 30%
- KR3: Increase conversion rate from 2% to 5%

**Objective 2: Build growth engine**
- KR1: Hire and train 5 salespeople
- KR2: Implement complete sales playbook
- KR3: Achieve average ticket of $2,000`,
    },
    growth: {
      "pt-br": `### OKRs Sugeridos - Estágio Crescimento

**Objetivo 1: Dominar o mercado-alvo**
- KR1: Atingir 25% de market share no segmento
- KR2: Crescer ARR de R$ 1M para R$ 5M
- KR3: Expandir para 3 novos mercados geográficos

**Objetivo 2: Construir organização de alta performance**
- KR1: Contratar 20 pessoas mantendo cultura (eNPS > 50)
- KR2: Implementar OKRs em todos os times
- KR3: Atingir índice de produtividade 20% maior`,
      en: `### Suggested OKRs - Growth Stage

**Objective 1: Dominate target market**
- KR1: Achieve 25% market share in segment
- KR2: Grow ARR from $1M to $5M
- KR3: Expand to 3 new geographic markets

**Objective 2: Build high-performance organization**
- KR1: Hire 20 people maintaining culture (eNPS > 50)
- KR2: Implement OKRs across all teams
- KR3: Achieve 20% higher productivity index`,
    },
    scale: {
      "pt-br": `### OKRs Sugeridos - Estágio Escala

**Objetivo 1: Atingir liderança de mercado**
- KR1: Ultrapassar ARR de R$ 50M
- KR2: Expandir para 5 países
- KR3: Atingir reconhecimento de marca > 60% no mercado

**Objetivo 2: Maximizar eficiência operacional**
- KR1: Atingir margem EBITDA de 20%
- KR2: Automatizar 80% dos processos repetitivos
- KR3: Reduzir time-to-market de features em 40%`,
      en: `### Suggested OKRs - Scale Stage

**Objective 1: Achieve market leadership**
- KR1: Exceed $50M ARR
- KR2: Expand to 5 countries
- KR3: Achieve brand recognition > 60% in market

**Objective 2: Maximize operational efficiency**
- KR1: Achieve 20% EBITDA margin
- KR2: Automate 80% of repetitive processes
- KR3: Reduce feature time-to-market by 40%`,
    },
    mature: {
      "pt-br": `### OKRs Sugeridos - Estágio Maturidade

**Objetivo 1: Diversificar e inovar**
- KR1: Lançar 2 novos produtos/verticais
- KR2: Gerar 20% da receita de novos produtos
- KR3: Completar 1 aquisição estratégica

**Objetivo 2: Maximizar valor para stakeholders**
- KR1: Atingir valuation de R$ 500M
- KR2: Distribuir R$ 10M em dividendos
- KR3: Manter crescimento de 20% YoY`,
      en: `### Suggested OKRs - Mature Stage

**Objective 1: Diversify and innovate**
- KR1: Launch 2 new products/verticals
- KR2: Generate 20% of revenue from new products
- KR3: Complete 1 strategic acquisition

**Objective 2: Maximize stakeholder value**
- KR1: Achieve $500M valuation
- KR2: Distribute $10M in dividends
- KR3: Maintain 20% YoY growth`,
    },
  };
  return okrs[stage]?.[lang] || okrs.traction[lang];
}

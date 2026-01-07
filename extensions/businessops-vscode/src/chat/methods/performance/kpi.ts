/**
 * KPI - Key Performance Indicators
 */

import { BusinessMethod } from "../index";
import { OrchestratorContext } from "../../orchestrator";

export const kpiMethod: BusinessMethod = {
  id: "kpi",
  name: {
    "pt-br": "KPIs - Indicadores de Desempenho",
    "en": "KPIs - Key Performance Indicators",
  },
  description: {
    "pt-br": "Definição e gestão de indicadores-chave de performance.",
    "en": "Definition and management of key performance indicators.",
  },
  category: "performance",
  outputType: "markdown",
  complexity: "basic",
  requiredData: [
    "company.identity.stage",
    "company.ops.key_challenges",
    "meta.industry"
  ],
  tags: ["metrics", "performance", "goals", "measurement"],

  generate: (ctx: OrchestratorContext, lang: "pt-br" | "en"): string => {
    const c = ctx.company?.company || {};
    const meta = ctx.company?.meta || {};
    const companyName = meta.name || (lang === "pt-br" ? "Sua Empresa" : "Your Company");
    const stage = c.stage || "STARTUP";

    const kpis = getRecommendedKPIs(stage, lang);

    return lang === "pt-br"
      ? `# 📊 KPIs - Indicadores-Chave de Desempenho

## Conceito
KPIs são métricas que indicam o progresso em direção aos objetivos estratégicos do negócio.

---

## 🎯 Características de um Bom KPI (SMART)

| Critério | Descrição | Exemplo |
|----------|-----------|---------|
| **S**pecific | Específico e claro | "Taxa de conversão de leads" |
| **M**easurable | Mensurável | Número ou percentual |
| **A**chievable | Alcançável | Meta realista |
| **R**elevant | Relevante | Alinhado com estratégia |
| **T**ime-bound | Temporal | Prazo definido |

---

## 📈 KPIs Recomendados para ${companyName}

### ${stage === "STARTUP" ? "Fase: Startup/Early Stage" : "Fase: Crescimento/Escala"}

${Object.entries(kpis).map(([category, items]) => `
### ${category}
| KPI | Fórmula | Meta Sugerida |
|-----|---------|---------------|
${(items as any[]).map(k => `| ${k.name} | ${k.formula} | ${k.target} |`).join("\n")}
`).join("\n")}

---

## 📊 Categorias de KPIs

### 1. 💰 Financeiros
- Receita (MRR/ARR)
- Margem de Lucro
- CAC (Custo de Aquisição)
- LTV (Lifetime Value)
- Burn Rate
- Runway

### 2. 👥 Clientes
- NPS (Net Promoter Score)
- CSAT (Satisfação)
- Churn Rate
- Retention Rate
- Tempo de Resolução

### 3. ⚙️ Operacionais
- Produtividade
- Tempo de Ciclo
- Taxa de Defeitos
- Eficiência
- Uptime

### 4. 🌱 Crescimento
- Taxa de Crescimento MoM
- Novos Clientes
- Expansão de Receita
- Market Share
- Viral Coefficient

### 5. 👨‍💼 Pessoas
- eNPS (Engajamento)
- Turnover
- Produtividade/Funcionário
- Tempo de Contratação
- Treinamentos Concluídos

---

## 🛠️ Framework de Implementação

### Passo 1: Definir Objetivos Estratégicos
- [ ] Quais são os objetivos do negócio?
- [ ] O que significa sucesso?
- [ ] Quais comportamentos queremos incentivar?

### Passo 2: Identificar KPIs
- [ ] Quais métricas indicam progresso?
- [ ] São mensuráveis?
- [ ] Temos dados disponíveis?

### Passo 3: Estabelecer Metas
- [ ] Definir baseline atual
- [ ] Estabelecer meta de curto prazo
- [ ] Definir stretch goal

### Passo 4: Implementar Medição
- [ ] Fonte de dados
- [ ] Frequência de atualização
- [ ] Responsável pela coleta

### Passo 5: Criar Dashboard
- [ ] Visualização clara
- [ ] Atualização automática
- [ ] Acesso para todos

### Passo 6: Revisar e Agir
- [ ] Reuniões regulares de review
- [ ] Análise de tendências
- [ ] Ações corretivas

---

## 📋 Template de Definição de KPI

| Campo | Valor |
|-------|-------|
| **Nome do KPI** | |
| **Definição** | |
| **Fórmula** | |
| **Fonte de Dados** | |
| **Frequência** | |
| **Responsável** | |
| **Meta (Mês)** | |
| **Meta (Ano)** | |
| **Status Atual** | 🔴 🟡 🟢 |

---

## ⚠️ Erros Comuns

1. **Muitos KPIs** → Foco em 5-7 principais
2. **Métricas de vaidade** → Foque em métricas acionáveis
3. **Sem metas** → Sempre defina targets
4. **Sem contexto** → Compare com histórico
5. **Não agir** → KPIs devem gerar ação
`
      : `# 📊 KPIs - Key Performance Indicators

## Concept
KPIs are metrics that indicate progress toward strategic business objectives.

---

## 🎯 Characteristics of a Good KPI (SMART)

| Criterion | Description | Example |
|-----------|-------------|---------|
| **S**pecific | Specific and clear | "Lead conversion rate" |
| **M**easurable | Measurable | Number or percentage |
| **A**chievable | Achievable | Realistic goal |
| **R**elevant | Relevant | Aligned with strategy |
| **T**ime-bound | Time-bound | Defined deadline |

---

## 📈 Recommended KPIs for ${companyName}

### ${stage === "STARTUP" ? "Phase: Startup/Early Stage" : "Phase: Growth/Scale"}

${Object.entries(kpis).map(([category, items]) => `
### ${category}
| KPI | Formula | Suggested Target |
|-----|---------|------------------|
${(items as any[]).map(k => `| ${k.name} | ${k.formula} | ${k.target} |`).join("\n")}
`).join("\n")}

---

## 📊 KPI Categories

### 1. 💰 Financial
- Revenue (MRR/ARR)
- Profit Margin
- CAC (Acquisition Cost)
- LTV (Lifetime Value)
- Burn Rate
- Runway

### 2. 👥 Customer
- NPS (Net Promoter Score)
- CSAT (Satisfaction)
- Churn Rate
- Retention Rate
- Resolution Time

### 3. ⚙️ Operational
- Productivity
- Cycle Time
- Defect Rate
- Efficiency
- Uptime

### 4. 🌱 Growth
- MoM Growth Rate
- New Customers
- Revenue Expansion
- Market Share
- Viral Coefficient

### 5. 👨‍💼 People
- eNPS (Engagement)
- Turnover
- Productivity/Employee
- Time to Hire
- Training Completed

---

## 🛠️ Implementation Framework

### Step 1: Define Strategic Objectives
- [ ] What are the business goals?
- [ ] What does success mean?
- [ ] What behaviors do we want to encourage?

### Step 2: Identify KPIs
- [ ] Which metrics indicate progress?
- [ ] Are they measurable?
- [ ] Do we have data available?

### Step 3: Set Targets
- [ ] Define current baseline
- [ ] Set short-term target
- [ ] Define stretch goal

### Step 4: Implement Measurement
- [ ] Data source
- [ ] Update frequency
- [ ] Person responsible

### Step 5: Create Dashboard
- [ ] Clear visualization
- [ ] Automatic updates
- [ ] Access for everyone

### Step 6: Review and Act
- [ ] Regular review meetings
- [ ] Trend analysis
- [ ] Corrective actions

---

## 📋 KPI Definition Template

| Field | Value |
|-------|-------|
| **KPI Name** | |
| **Definition** | |
| **Formula** | |
| **Data Source** | |
| **Frequency** | |
| **Owner** | |
| **Target (Month)** | |
| **Target (Year)** | |
| **Current Status** | 🔴 🟡 🟢 |

---

## ⚠️ Common Mistakes

1. **Too many KPIs** → Focus on 5-7 main ones
2. **Vanity metrics** → Focus on actionable metrics
3. **No targets** → Always define targets
4. **No context** → Compare with history
5. **Not acting** → KPIs should drive action
`;
  },

  getChecklist: (_ctx: OrchestratorContext, lang: "pt-br" | "en"): string[] => {
    return lang === "pt-br"
      ? [
          "Definir objetivos estratégicos do negócio",
          "Identificar 5-7 KPIs principais",
          "Estabelecer metas SMART",
          "Definir fonte de dados para cada KPI",
          "Designar responsáveis por cada métrica",
          "Criar dashboard de visualização",
          "Estabelecer rotina de review semanal",
          "Documentar ações baseadas nos KPIs",
        ]
      : [
          "Define strategic business objectives",
          "Identify 5-7 main KPIs",
          "Set SMART targets",
          "Define data source for each KPI",
          "Assign owners for each metric",
          "Create visualization dashboard",
          "Establish weekly review routine",
          "Document actions based on KPIs",
        ];
  },

  getKnowledge: (lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# KPIs

## O que são?
Key Performance Indicators - métricas que medem sucesso em objetivos.

## Tipos:
- **Leading:** Indicam tendência futura
- **Lagging:** Medem resultados passados

## Características (SMART):
- Specific (Específico)
- Measurable (Mensurável)
- Achievable (Alcançável)
- Relevant (Relevante)
- Time-bound (Temporal)

## Erros comuns:
- Muitos indicadores
- Métricas de vaidade
- Sem metas claras
- Não agir sobre dados

## Ferramentas:
Google Analytics, Mixpanel, Metabase, Power BI, Tableau
`
      : `# KPIs

## What are they?
Key Performance Indicators - metrics that measure success in objectives.

## Types:
- **Leading:** Indicate future trend
- **Lagging:** Measure past results

## Characteristics (SMART):
- Specific
- Measurable
- Achievable
- Relevant
- Time-bound

## Common mistakes:
- Too many indicators
- Vanity metrics
- No clear targets
- Not acting on data

## Tools:
Google Analytics, Mixpanel, Metabase, Power BI, Tableau
`;
  },
};

function getRecommendedKPIs(stage: string, lang: "pt-br" | "en"): Record<string, any[]> {
  const isPtBr = lang === "pt-br";

  if (stage === "STARTUP") {
    return {
      [isPtBr ? "💰 Financeiro" : "💰 Financial"]: [
        { name: isPtBr ? "MRR" : "MRR", formula: isPtBr ? "Receita recorrente mensal" : "Monthly recurring revenue", target: isPtBr ? "+10% MoM" : "+10% MoM" },
        { name: isPtBr ? "Burn Rate" : "Burn Rate", formula: isPtBr ? "Gastos mensais" : "Monthly expenses", target: isPtBr ? "Estável/Reduzindo" : "Stable/Reducing" },
        { name: isPtBr ? "Runway" : "Runway", formula: isPtBr ? "Caixa / Burn" : "Cash / Burn", target: isPtBr ? ">12 meses" : ">12 months" },
      ],
      [isPtBr ? "🌱 Crescimento" : "🌱 Growth"]: [
        { name: isPtBr ? "Novos usuários" : "New users", formula: isPtBr ? "Sign-ups/mês" : "Sign-ups/month", target: isPtBr ? "+15% MoM" : "+15% MoM" },
        { name: isPtBr ? "Taxa de conversão" : "Conversion rate", formula: isPtBr ? "Pagantes / Leads" : "Paying / Leads", target: ">3%" },
        { name: isPtBr ? "Ativação" : "Activation", formula: isPtBr ? "Usuários ativos / Total" : "Active users / Total", target: ">40%" },
      ],
      [isPtBr ? "👥 Cliente" : "👥 Customer"]: [
        { name: isPtBr ? "Churn" : "Churn", formula: isPtBr ? "Cancelamentos / Total" : "Cancellations / Total", target: "<5%" },
        { name: "NPS", formula: isPtBr ? "Promotores - Detratores" : "Promoters - Detractors", target: ">30" },
      ],
    };
  }

  return {
    [isPtBr ? "💰 Financeiro" : "💰 Financial"]: [
      { name: isPtBr ? "ARR" : "ARR", formula: isPtBr ? "MRR × 12" : "MRR × 12", target: isPtBr ? "+50% YoY" : "+50% YoY" },
      { name: isPtBr ? "Margem Bruta" : "Gross Margin", formula: "(Receita - CMV) / Receita", target: ">70%" },
      { name: isPtBr ? "LTV/CAC" : "LTV/CAC", formula: "LTV ÷ CAC", target: ">3" },
    ],
    [isPtBr ? "🌱 Crescimento" : "🌱 Growth"]: [
      { name: isPtBr ? "Net Revenue Retention" : "Net Revenue Retention", formula: "(MRR início + expansão - churn) / MRR início", target: ">110%" },
      { name: isPtBr ? "Velocidade de vendas" : "Sales velocity", formula: isPtBr ? "Deals × Valor × Win% / Ciclo" : "Deals × Value × Win% / Cycle", target: isPtBr ? "+20% QoQ" : "+20% QoQ" },
    ],
    [isPtBr ? "⚙️ Operacional" : "⚙️ Operational"]: [
      { name: isPtBr ? "Produtividade" : "Productivity", formula: isPtBr ? "Receita / Funcionário" : "Revenue / Employee", target: isPtBr ? "+15% YoY" : "+15% YoY" },
      { name: isPtBr ? "Tempo de implementação" : "Implementation time", formula: isPtBr ? "Dias até go-live" : "Days to go-live", target: isPtBr ? "<30 dias" : "<30 days" },
    ],
  };
}

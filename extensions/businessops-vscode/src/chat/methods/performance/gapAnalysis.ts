/**
 * Gap Analysis
 */

import { BusinessMethod } from "../index";
import { OrchestratorContext } from "../../orchestrator";

export const gapAnalysisMethod: BusinessMethod = {
  id: "gap-analysis",
  name: {
    "pt-br": "Análise de Gap",
    "en": "Gap Analysis",
  },
  description: {
    "pt-br": "Análise da diferença entre estado atual e estado desejado.",
    "en": "Analysis of the difference between current state and desired state.",
  },
  category: "performance",
  outputType: "markdown",
  complexity: "basic",
  requiredData: [
    "company.identity.stage",
    "company.ops.key_challenges",
    "company.compliance.tax_registration"
  ],
  tags: ["planning", "improvement", "assessment", "strategy"],

  generate: (ctx: OrchestratorContext, lang: "pt-br" | "en"): string => {
    const c = ctx.company?.company || {};
    const meta = ctx.company?.meta || {};
    const companyName = meta.name || (lang === "pt-br" ? "Sua Empresa" : "Your Company");

    return lang === "pt-br"
      ? `# 🎯 Análise de Gap - ${companyName}

## Conceito
Gap Analysis identifica a diferença entre onde você está (estado atual) e onde quer chegar (estado desejado), e define ações para fechar essa lacuna.

---

## 📊 Framework de Análise

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ESTADO                              ESTADO                │
│   ATUAL          ←── GAP ──►         DESEJADO              │
│   (Onde estamos)                     (Onde queremos)       │
│                                                             │
│   ┌─────────┐                        ┌─────────┐           │
│   │  📍     │    ═══════════════     │  🎯     │           │
│   │ Situação│    Plano de Ação       │  Meta   │           │
│   │  Atual  │                        │ Futuro  │           │
│   └─────────┘                        └─────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
\`\`\`

---

## 📋 Matriz de Gap Analysis

### Área: [Nome da Área]

| Dimensão | Estado Atual | Estado Desejado | Gap | Prioridade |
|----------|--------------|-----------------|-----|------------|
| | | | | |
| | | | | |

---

## 🔍 Análise por Área

### 1. 📈 Receita e Vendas

| Dimensão | Atual | Meta | Gap |
|----------|-------|------|-----|
| Receita Mensal | R$ _____ | R$ _____ | R$ _____ |
| Clientes ativos | _____ | _____ | _____ |
| Ticket médio | R$ _____ | R$ _____ | R$ _____ |
| Conversão | ____% | ____% | ____% |

**Ações para fechar o gap:**
- [ ] Ação 1
- [ ] Ação 2
- [ ] Ação 3

---

### 2. ⚙️ Operações

| Dimensão | Atual | Meta | Gap |
|----------|-------|------|-----|
| Tempo de entrega | ____ dias | ____ dias | ____ dias |
| Taxa de defeitos | ____% | ____% | ____% |
| Produtividade | ____ | ____ | ____ |
| Automação | ____% | ____% | ____% |

**Ações para fechar o gap:**
- [ ] Ação 1
- [ ] Ação 2
- [ ] Ação 3

---

### 3. 👥 Equipe e Pessoas

| Dimensão | Atual | Meta | Gap |
|----------|-------|------|-----|
| Tamanho da equipe | ____ | ____ | ____ |
| Senioridade média | ____ | ____ | ____ |
| Turnover | ____% | ____% | ____% |
| Engajamento (eNPS) | ____ | ____ | ____ |

**Ações para fechar o gap:**
- [ ] Ação 1
- [ ] Ação 2
- [ ] Ação 3

---

### 4. 💻 Tecnologia

| Dimensão | Atual | Meta | Gap |
|----------|-------|------|-----|
| Stack atualizado | ____% | ____% | ____% |
| Automações | ____ | ____ | ____ |
| Uptime | ____% | ____% | ____% |
| Segurança | ____ | ____ | ____ |

**Ações para fechar o gap:**
- [ ] Ação 1
- [ ] Ação 2
- [ ] Ação 3

---

### 5. 🏢 Processos e Compliance

| Dimensão | Atual | Meta | Gap |
|----------|-------|------|-----|
| Processos documentados | ____% | ____% | ____% |
| Certificações | ____ | ____ | ____ |
| Conformidade | ____% | ____% | ____% |
| Auditorias | ____ | ____ | ____ |

**Ações para fechar o gap:**
- [ ] Ação 1
- [ ] Ação 2
- [ ] Ação 3

---

## 🎯 Priorização de Gaps

Use a matriz Impacto × Esforço:

\`\`\`
            IMPACTO
         Alto      Baixo
      ┌─────────┬─────────┐
Baixo │  FAZER  │ AVALIAR │
ESFORÇO│ PRIMEIRO│         │
      ├─────────┼─────────┤
Alto  │ PLANEJAR│ EVITAR  │
      │         │         │
      └─────────┴─────────┘
\`\`\`

---

## 📊 Resumo de Gaps

| Área | Maior Gap | Impacto | Prioridade |
|------|-----------|---------|------------|
| Vendas | | | 🔴 🟡 🟢 |
| Operações | | | 🔴 🟡 🟢 |
| Pessoas | | | 🔴 🟡 🟢 |
| Tecnologia | | | 🔴 🟡 🟢 |
| Processos | | | 🔴 🟡 🟢 |

---

## 📋 Plano de Ação

### Quick Wins (0-30 dias)
- [ ]
- [ ]
- [ ]

### Médio Prazo (30-90 dias)
- [ ]
- [ ]
- [ ]

### Longo Prazo (90+ dias)
- [ ]
- [ ]
- [ ]

---

## 🔄 Próximos Passos

1. **Completar análise** - Preencher todos os gaps
2. **Priorizar** - Usar matriz impacto × esforço
3. **Planejar** - Definir ações e responsáveis
4. **Executar** - Implementar em sprints
5. **Revisar** - Reavaliar gaps mensalmente
`
      : `# 🎯 Gap Analysis - ${companyName}

## Concept
Gap Analysis identifies the difference between where you are (current state) and where you want to be (desired state), and defines actions to close that gap.

---

## 📊 Analysis Framework

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   CURRENT                              DESIRED              │
│   STATE          ←── GAP ──►          STATE                │
│   (Where we are)                     (Where we want)       │
│                                                             │
│   ┌─────────┐                        ┌─────────┐           │
│   │  📍     │    ═══════════════     │  🎯     │           │
│   │ Current │    Action Plan         │  Target │           │
│   │Situation│                        │ Future  │           │
│   └─────────┘                        └─────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
\`\`\`

---

## 📋 Gap Analysis Matrix

### Area: [Area Name]

| Dimension | Current State | Desired State | Gap | Priority |
|-----------|---------------|---------------|-----|----------|
| | | | | |
| | | | | |

---

## 🔍 Analysis by Area

### 1. 📈 Revenue and Sales

| Dimension | Current | Target | Gap |
|-----------|---------|--------|-----|
| Monthly Revenue | $ _____ | $ _____ | $ _____ |
| Active customers | _____ | _____ | _____ |
| Average ticket | $ _____ | $ _____ | $ _____ |
| Conversion | ____% | ____% | ____% |

**Actions to close the gap:**
- [ ] Action 1
- [ ] Action 2
- [ ] Action 3

---

### 2. ⚙️ Operations

| Dimension | Current | Target | Gap |
|-----------|---------|--------|-----|
| Delivery time | ____ days | ____ days | ____ days |
| Defect rate | ____% | ____% | ____% |
| Productivity | ____ | ____ | ____ |
| Automation | ____% | ____% | ____% |

**Actions to close the gap:**
- [ ] Action 1
- [ ] Action 2
- [ ] Action 3

---

### 3. 👥 Team and People

| Dimension | Current | Target | Gap |
|-----------|---------|--------|-----|
| Team size | ____ | ____ | ____ |
| Average seniority | ____ | ____ | ____ |
| Turnover | ____% | ____% | ____% |
| Engagement (eNPS) | ____ | ____ | ____ |

**Actions to close the gap:**
- [ ] Action 1
- [ ] Action 2
- [ ] Action 3

---

### 4. 💻 Technology

| Dimension | Current | Target | Gap |
|-----------|---------|--------|-----|
| Updated stack | ____% | ____% | ____% |
| Automations | ____ | ____ | ____ |
| Uptime | ____% | ____% | ____% |
| Security | ____ | ____ | ____ |

**Actions to close the gap:**
- [ ] Action 1
- [ ] Action 2
- [ ] Action 3

---

### 5. 🏢 Processes and Compliance

| Dimension | Current | Target | Gap |
|-----------|---------|--------|-----|
| Documented processes | ____% | ____% | ____% |
| Certifications | ____ | ____ | ____ |
| Compliance | ____% | ____% | ____% |
| Audits | ____ | ____ | ____ |

**Actions to close the gap:**
- [ ] Action 1
- [ ] Action 2
- [ ] Action 3

---

## 🎯 Gap Prioritization

Use the Impact × Effort matrix:

\`\`\`
            IMPACT
         High      Low
      ┌─────────┬─────────┐
 Low  │  DO     │ CONSIDER│
EFFORT│  FIRST  │         │
      ├─────────┼─────────┤
 High │  PLAN   │  AVOID  │
      │         │         │
      └─────────┴─────────┘
\`\`\`

---

## 📊 Gaps Summary

| Area | Biggest Gap | Impact | Priority |
|------|-------------|--------|----------|
| Sales | | | 🔴 🟡 🟢 |
| Operations | | | 🔴 🟡 🟢 |
| People | | | 🔴 🟡 🟢 |
| Technology | | | 🔴 🟡 🟢 |
| Processes | | | 🔴 🟡 🟢 |

---

## 📋 Action Plan

### Quick Wins (0-30 days)
- [ ]
- [ ]
- [ ]

### Medium Term (30-90 days)
- [ ]
- [ ]
- [ ]

### Long Term (90+ days)
- [ ]
- [ ]
- [ ]

---

## 🔄 Next Steps

1. **Complete analysis** - Fill in all gaps
2. **Prioritize** - Use impact × effort matrix
3. **Plan** - Define actions and owners
4. **Execute** - Implement in sprints
5. **Review** - Reassess gaps monthly
`;
  },

  getChecklist: (_ctx: OrchestratorContext, lang: "pt-br" | "en"): string[] => {
    return lang === "pt-br"
      ? [
          "Definir áreas para análise",
          "Documentar estado atual de cada área",
          "Estabelecer estado desejado/metas",
          "Quantificar gap entre atual e desejado",
          "Priorizar gaps por impacto e esforço",
          "Definir ações para cada gap",
          "Atribuir responsáveis e prazos",
          "Implementar plano de ação",
          "Revisar gaps mensalmente",
        ]
      : [
          "Define areas for analysis",
          "Document current state of each area",
          "Establish desired state/goals",
          "Quantify gap between current and desired",
          "Prioritize gaps by impact and effort",
          "Define actions for each gap",
          "Assign owners and deadlines",
          "Implement action plan",
          "Review gaps monthly",
        ];
  },

  getKnowledge: (lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# Gap Analysis

## O que é?
Ferramenta para identificar a diferença entre estado atual e desejado.

## Componentes:
1. **Estado Atual:** Onde estamos hoje
2. **Estado Desejado:** Onde queremos chegar
3. **Gap:** A diferença entre os dois
4. **Plano de Ação:** Como fechar o gap

## Tipos de Gap Analysis:
- Performance gap
- Market gap
- Skills gap
- Technology gap
- Compliance gap

## Quando usar:
- Planejamento estratégico
- Projetos de melhoria
- Avaliação de competências
- Análise de mercado

## Dicas:
- Seja específico e mensurável
- Priorize por impacto
- Defina responsáveis
- Acompanhe regularmente
`
      : `# Gap Analysis

## What is it?
Tool to identify the difference between current and desired state.

## Components:
1. **Current State:** Where we are today
2. **Desired State:** Where we want to be
3. **Gap:** The difference between the two
4. **Action Plan:** How to close the gap

## Types of Gap Analysis:
- Performance gap
- Market gap
- Skills gap
- Technology gap
- Compliance gap

## When to use:
- Strategic planning
- Improvement projects
- Competency assessment
- Market analysis

## Tips:
- Be specific and measurable
- Prioritize by impact
- Assign owners
- Monitor regularly
`;
  },
};

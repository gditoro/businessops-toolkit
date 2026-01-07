/**
 * Kanban Method
 */

import { BusinessMethod } from "../index";
import { OrchestratorContext } from "../../orchestrator";

export const kanbanMethod: BusinessMethod = {
  id: "kanban",
  name: {
    "pt-br": "Kanban",
    "en": "Kanban",
  },
  description: {
    "pt-br": "Sistema visual de gestão de fluxo de trabalho baseado em cartões.",
    "en": "Visual workflow management system based on cards.",
  },
  category: "process",
  outputType: "markdown",
  complexity: "basic",
  requiredData: [
    "company.ops.key_challenges",
    "company.identity.stage"
  ],
  tags: ["lean", "agile", "flow", "visual", "continuous"],

  generate: (ctx: OrchestratorContext, lang: "pt-br" | "en"): string => {
    const c = ctx.company?.company || {};
    const ops = c.ops || {};

    return lang === "pt-br"
      ? `# 📋 Sistema Kanban

## Conceito
Kanban é um método visual para gerenciar trabalho à medida que ele se move através de um processo.

---

## 📊 Quadro Kanban Básico

\`\`\`
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  📥 A FAZER │ 🔄 FAZENDO  │  ✅ FEITO   │  📦 ENTREGUE│
│  (Backlog)  │   (WIP: 3)  │  (Review)   │  (Done)     │
├─────────────┼─────────────┼─────────────┼─────────────┤
│             │             │             │             │
│  [Tarefa 1] │  [Tarefa 4] │  [Tarefa 6] │  [Tarefa 8] │
│             │             │             │             │
│  [Tarefa 2] │  [Tarefa 5] │  [Tarefa 7] │  [Tarefa 9] │
│             │             │             │             │
│  [Tarefa 3] │             │             │             │
│             │             │             │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
\`\`\`

---

## 🎯 Princípios do Kanban

### 1. Visualizar o Trabalho
- Tornar todo trabalho visível
- Usar cartões para representar tarefas
- Mostrar bloqueios e dependências

### 2. Limitar Trabalho em Progresso (WIP)
- Definir limites por coluna
- Evitar sobrecarga
- Focar em terminar antes de começar

### 3. Gerenciar o Fluxo
- Medir tempo de ciclo
- Identificar gargalos
- Otimizar continuamente

### 4. Políticas Explícitas
- Definição de "pronto"
- Critérios de aceite
- Regras de priorização

### 5. Feedback Loops
- Reuniões diárias
- Revisões semanais
- Retrospectivas

### 6. Melhoria Colaborativa
- Envolver toda a equipe
- Experimentos controlados
- Kaizen contínuo

---

## 📈 Métricas Kanban

| Métrica | Descrição | Meta Sugerida |
|---------|-----------|---------------|
| Lead Time | Tempo total do pedido à entrega | Reduzir 20%/trimestre |
| Cycle Time | Tempo em execução ativa | Reduzir variabilidade |
| Throughput | Itens entregues por período | Aumentar 10%/mês |
| WIP | Trabalho em progresso | Limite: ${ops.team_size || 3} × 1.5 |
| Bloqueios | Itens bloqueados | Mínimo possível |

---

## 🔧 Implementação Recomendada

### Fase 1: Visualização (Semana 1-2)
- [ ] Criar quadro físico ou digital
- [ ] Mapear fluxo de trabalho atual
- [ ] Definir colunas do quadro
- [ ] Criar cartões para tarefas existentes

### Fase 2: Limites WIP (Semana 3-4)
- [ ] Definir limites iniciais por coluna
- [ ] Monitorar e ajustar
- [ ] Identificar gargalos

### Fase 3: Métricas (Mês 2)
- [ ] Implementar medição de cycle time
- [ ] Criar dashboards
- [ ] Análise de fluxo cumulativo

### Fase 4: Otimização (Contínuo)
- [ ] Retrospectivas regulares
- [ ] Ajuste de políticas
- [ ] Automações

---

## 💡 Dicas de Sucesso

1. **Comece simples** - 3 colunas são suficientes inicialmente
2. **WIP baixo** - Menos é mais
3. **Visualize tudo** - Incluindo bloqueios
4. **Meça para melhorar** - Não para controlar
5. **Evolua gradualmente** - Kanban é evolutivo
`
      : `# 📋 Kanban System

## Concept
Kanban is a visual method for managing work as it moves through a process.

---

## 📊 Basic Kanban Board

\`\`\`
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  📥 TO DO   │ 🔄 DOING    │  ✅ DONE    │  📦 DELIVERED│
│  (Backlog)  │   (WIP: 3)  │  (Review)   │  (Done)     │
├─────────────┼─────────────┼─────────────┼─────────────┤
│             │             │             │             │
│  [Task 1]   │  [Task 4]   │  [Task 6]   │  [Task 8]   │
│             │             │             │             │
│  [Task 2]   │  [Task 5]   │  [Task 7]   │  [Task 9]   │
│             │             │             │             │
│  [Task 3]   │             │             │             │
│             │             │             │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
\`\`\`

---

## 🎯 Kanban Principles

### 1. Visualize Work
- Make all work visible
- Use cards to represent tasks
- Show blockers and dependencies

### 2. Limit Work in Progress (WIP)
- Set limits per column
- Avoid overload
- Focus on finishing before starting

### 3. Manage Flow
- Measure cycle time
- Identify bottlenecks
- Optimize continuously

### 4. Explicit Policies
- Definition of "done"
- Acceptance criteria
- Prioritization rules

### 5. Feedback Loops
- Daily standups
- Weekly reviews
- Retrospectives

### 6. Collaborative Improvement
- Involve the whole team
- Controlled experiments
- Continuous Kaizen

---

## 📈 Kanban Metrics

| Metric | Description | Suggested Target |
|--------|-------------|------------------|
| Lead Time | Total time from request to delivery | Reduce 20%/quarter |
| Cycle Time | Time in active execution | Reduce variability |
| Throughput | Items delivered per period | Increase 10%/month |
| WIP | Work in progress | Limit: ${ops.team_size || 3} × 1.5 |
| Blockers | Blocked items | Minimum possible |

---

## 🔧 Recommended Implementation

### Phase 1: Visualization (Week 1-2)
- [ ] Create physical or digital board
- [ ] Map current workflow
- [ ] Define board columns
- [ ] Create cards for existing tasks

### Phase 2: WIP Limits (Week 3-4)
- [ ] Set initial limits per column
- [ ] Monitor and adjust
- [ ] Identify bottlenecks

### Phase 3: Metrics (Month 2)
- [ ] Implement cycle time measurement
- [ ] Create dashboards
- [ ] Cumulative flow analysis

### Phase 4: Optimization (Ongoing)
- [ ] Regular retrospectives
- [ ] Policy adjustments
- [ ] Automations

---

## 💡 Success Tips

1. **Start simple** - 3 columns are enough initially
2. **Low WIP** - Less is more
3. **Visualize everything** - Including blockers
4. **Measure to improve** - Not to control
5. **Evolve gradually** - Kanban is evolutionary
`;
  },

  getChecklist: (_ctx: OrchestratorContext, lang: "pt-br" | "en"): string[] => {
    return lang === "pt-br"
      ? [
          "Criar quadro Kanban (físico ou digital)",
          "Definir colunas baseadas no fluxo atual",
          "Estabelecer limites de WIP por coluna",
          "Criar cartões para tarefas existentes",
          "Implementar reunião diária de 15 min",
          "Definir políticas de movimentação",
          "Medir lead time e cycle time",
          "Realizar retrospectivas semanais",
        ]
      : [
          "Create Kanban board (physical or digital)",
          "Define columns based on current flow",
          "Establish WIP limits per column",
          "Create cards for existing tasks",
          "Implement 15-min daily standup",
          "Define movement policies",
          "Measure lead time and cycle time",
          "Conduct weekly retrospectives",
        ];
  },

  getKnowledge: (lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# Kanban

## O que é?
Sistema de gestão visual originado no Sistema Toyota de Produção.

## Princípios Fundamentais:
1. Visualizar o trabalho
2. Limitar trabalho em progresso (WIP)
3. Gerenciar o fluxo
4. Tornar políticas explícitas
5. Implementar loops de feedback
6. Melhorar colaborativamente

## Benefícios:
- Maior visibilidade
- Menos sobrecarga
- Entrega mais rápida
- Melhoria contínua
- Flexibilidade

## Ferramentas:
- Trello, Jira, Azure DevOps
- Quadro físico com post-its
- Notion, Asana
`
      : `# Kanban

## What is it?
Visual management system originated in the Toyota Production System.

## Fundamental Principles:
1. Visualize work
2. Limit work in progress (WIP)
3. Manage flow
4. Make policies explicit
5. Implement feedback loops
6. Improve collaboratively

## Benefits:
- Greater visibility
- Less overload
- Faster delivery
- Continuous improvement
- Flexibility

## Tools:
- Trello, Jira, Azure DevOps
- Physical board with sticky notes
- Notion, Asana
`;
  },
};

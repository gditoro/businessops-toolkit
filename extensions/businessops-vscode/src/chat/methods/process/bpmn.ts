/**
 * BPMN - Business Process Model and Notation
 */

import { BusinessMethod } from "../index";
import { OrchestratorContext } from "../../orchestrator";

export const bpmnMethod: BusinessMethod = {
  id: "bpmn",
  name: {
    "pt-br": "BPMN - Modelagem de Processos",
    "en": "BPMN - Process Modeling",
  },
  description: {
    "pt-br": "Notação padrão para modelagem de processos de negócio.",
    "en": "Standard notation for business process modeling.",
  },
  category: "process",
  outputType: "markdown",
  complexity: "intermediate",
  requiredData: [
    "company.ops.delivery_model",
    "company.ops.channels"
  ],
  tags: ["process", "modeling", "workflow", "documentation"],

  generate: (ctx: OrchestratorContext, lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# 📐 BPMN - Business Process Model and Notation

## Conceito
BPMN é uma notação gráfica padronizada para representar processos de negócio de forma visual e compreensível.

---

## 🔷 Elementos Principais

### Eventos (Círculos)
Algo que acontece durante o processo

\`\`\`
  ⃝        ⊙        ⊗
Início    Intermediário   Fim
(vazio)   (borda dupla)  (borda grossa)
\`\`\`

| Tipo | Símbolo | Descrição |
|------|---------|-----------|
| Início | ⃝ | Dispara o processo |
| Timer | ⏱️ | Baseado em tempo |
| Mensagem | ✉️ | Recebe/envia mensagem |
| Erro | ⚠️ | Captura erro |
| Fim | ⊗ | Encerra o processo |

---

### Atividades (Retângulos)
Trabalho realizado

\`\`\`
┌─────────────┐    ┌─────────────┐
│   Tarefa    │    │ + Subproc.  │
│   Simples   │    │ (com detalhe)│
└─────────────┘    └─────────────┘
\`\`\`

| Tipo | Símbolo | Descrição |
|------|---------|-----------|
| Tarefa | □ | Unidade de trabalho |
| Subprocesso | □+ | Processo dentro do processo |
| Tarefa de Usuário | 👤 | Interação humana |
| Tarefa de Serviço | ⚙️ | Automática |
| Tarefa Manual | ✋ | Sem sistema |
| Tarefa de Script | 📜 | Executa script |

---

### Gateways (Losangos)
Decisões e divisões de fluxo

\`\`\`
   ◇        ⊕        ○
Exclusivo  Paralelo  Inclusivo
(XOR)      (AND)     (OR)
\`\`\`

| Tipo | Símbolo | Descrição |
|------|---------|-----------|
| Exclusivo (XOR) | ◇ | Apenas um caminho |
| Paralelo (AND) | ⊕ | Todos os caminhos |
| Inclusivo (OR) | ○ | Um ou mais caminhos |
| Baseado em Evento | ⬡ | Espera por eventos |

---

### Fluxos (Linhas)

| Tipo | Símbolo | Descrição |
|------|---------|-----------|
| Sequência | ──▶ | Ordem de execução |
| Mensagem | - - ▶ | Comunicação |
| Associação | ····▶ | Conecta a artefatos |

---

### Swimlanes (Raias)

Organizam atividades por responsável:

\`\`\`
┌─────────────────────────────────────────┐
│ Pool: Empresa                           │
├───────────┬─────────────────────────────┤
│           │                             │
│ Lane:     │  ⃝──▶[Tarefa 1]──▶[Tarefa 2]│
│ Vendas    │                             │
├───────────┼─────────────────────────────┤
│           │                             │
│ Lane:     │     [Tarefa 3]──▶[Tarefa 4] │
│ Financeiro│                             │
└───────────┴─────────────────────────────┘
\`\`\`

---

## 📊 Exemplo: Processo de Venda

\`\`\`
┌──────────────────────────────────────────────────────────────┐
│                    PROCESSO DE VENDA                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ⃝──▶[Receber│──▶◇──▶[Preparar │──▶[Enviar │──▶⊗           │
│      Pedido ]    │   Proposta ]    Proposta ]               │
│                  │                                           │
│                  │──▶[Recusar e]──▶⊗                        │
│                      Informar                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Legenda:
⃝ = Início    ◇ = Gateway XOR    ⊗ = Fim
[  ] = Tarefa
\`\`\`

---

## 🛠️ Níveis de Modelagem

### Nível 1: Descritivo
- Visão de alto nível
- Para stakeholders
- Pouco detalhado

### Nível 2: Analítico
- Detalhes do fluxo
- Exceções e decisões
- Para analistas

### Nível 3: Executável
- Totalmente detalhado
- Para automação
- Para desenvolvedores

---

## 📋 Como Modelar um Processo

### Passo 1: Definir Escopo
- [ ] Nome do processo
- [ ] Objetivo
- [ ] Início e fim

### Passo 2: Identificar Participantes
- [ ] Quem executa?
- [ ] Quais departamentos?
- [ ] Sistemas envolvidos?

### Passo 3: Mapear Atividades
- [ ] Listar todas as tarefas
- [ ] Ordenar sequência
- [ ] Identificar decisões

### Passo 4: Desenhar
- [ ] Criar swimlanes
- [ ] Adicionar eventos
- [ ] Conectar com fluxos

### Passo 5: Validar
- [ ] Revisar com executores
- [ ] Testar cenários
- [ ] Documentar exceções

---

## 💻 Ferramentas BPMN

| Ferramenta | Tipo | Destaque |
|------------|------|----------|
| Bizagi | Free | Fácil de usar |
| Camunda | Open Source | Automação |
| Signavio | Enterprise | Colaboração |
| draw.io | Free | Simples |
| Lucidchart | Cloud | Colaborativo |
`
      : `# 📐 BPMN - Business Process Model and Notation

## Concept
BPMN is a standardized graphical notation for representing business processes visually and comprehensibly.

---

## 🔷 Main Elements

### Events (Circles)
Something that happens during the process

\`\`\`
  ⃝        ⊙        ⊗
Start  Intermediate   End
(empty) (double edge) (thick edge)
\`\`\`

| Type | Symbol | Description |
|------|--------|-------------|
| Start | ⃝ | Triggers the process |
| Timer | ⏱️ | Time-based |
| Message | ✉️ | Receives/sends message |
| Error | ⚠️ | Catches error |
| End | ⊗ | Ends the process |

---

### Activities (Rectangles)
Work performed

\`\`\`
┌─────────────┐    ┌─────────────┐
│   Simple    │    │ + Subprocess│
│   Task      │    │ (with detail)│
└─────────────┘    └─────────────┘
\`\`\`

| Type | Symbol | Description |
|------|--------|-------------|
| Task | □ | Unit of work |
| Subprocess | □+ | Process within process |
| User Task | 👤 | Human interaction |
| Service Task | ⚙️ | Automatic |
| Manual Task | ✋ | No system |
| Script Task | 📜 | Executes script |

---

### Gateways (Diamonds)
Decisions and flow splits

\`\`\`
   ◇        ⊕        ○
Exclusive  Parallel  Inclusive
(XOR)      (AND)     (OR)
\`\`\`

| Type | Symbol | Description |
|------|--------|-------------|
| Exclusive (XOR) | ◇ | Only one path |
| Parallel (AND) | ⊕ | All paths |
| Inclusive (OR) | ○ | One or more paths |
| Event-Based | ⬡ | Waits for events |

---

### Flows (Lines)

| Type | Symbol | Description |
|------|--------|-------------|
| Sequence | ──▶ | Execution order |
| Message | - - ▶ | Communication |
| Association | ····▶ | Connects to artifacts |

---

### Swimlanes

Organize activities by responsible party:

\`\`\`
┌─────────────────────────────────────────┐
│ Pool: Company                           │
├───────────┬─────────────────────────────┤
│           │                             │
│ Lane:     │  ⃝──▶[Task 1]──▶[Task 2]   │
│ Sales     │                             │
├───────────┼─────────────────────────────┤
│           │                             │
│ Lane:     │     [Task 3]──▶[Task 4]    │
│ Finance   │                             │
└───────────┴─────────────────────────────┘
\`\`\`

---

## 📊 Example: Sales Process

\`\`\`
┌──────────────────────────────────────────────────────────────┐
│                    SALES PROCESS                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ⃝──▶[Receive │──▶◇──▶[Prepare  │──▶[Send    │──▶⊗         │
│       Order  ]    │   Proposal ]    Proposal ]              │
│                   │                                          │
│                   │──▶[Decline &]──▶⊗                       │
│                       Inform                                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Legend:
⃝ = Start    ◇ = XOR Gateway    ⊗ = End
[  ] = Task
\`\`\`

---

## 🛠️ Modeling Levels

### Level 1: Descriptive
- High-level view
- For stakeholders
- Little detail

### Level 2: Analytical
- Flow details
- Exceptions and decisions
- For analysts

### Level 3: Executable
- Fully detailed
- For automation
- For developers

---

## 📋 How to Model a Process

### Step 1: Define Scope
- [ ] Process name
- [ ] Objective
- [ ] Start and end

### Step 2: Identify Participants
- [ ] Who executes?
- [ ] Which departments?
- [ ] Systems involved?

### Step 3: Map Activities
- [ ] List all tasks
- [ ] Order sequence
- [ ] Identify decisions

### Step 4: Draw
- [ ] Create swimlanes
- [ ] Add events
- [ ] Connect with flows

### Step 5: Validate
- [ ] Review with executors
- [ ] Test scenarios
- [ ] Document exceptions

---

## 💻 BPMN Tools

| Tool | Type | Highlight |
|------|------|-----------|
| Bizagi | Free | Easy to use |
| Camunda | Open Source | Automation |
| Signavio | Enterprise | Collaboration |
| draw.io | Free | Simple |
| Lucidchart | Cloud | Collaborative |
`;
  },

  getChecklist: (_ctx: OrchestratorContext, lang: "pt-br" | "en"): string[] => {
    return lang === "pt-br"
      ? [
          "Identificar processos críticos para mapear",
          "Definir escopo e objetivos de cada processo",
          "Entrevistar executores do processo",
          "Identificar participantes (swimlanes)",
          "Listar atividades e ordenar",
          "Identificar pontos de decisão (gateways)",
          "Desenhar diagrama BPMN",
          "Validar com stakeholders",
          "Documentar exceções e regras",
          "Manter diagramas atualizados",
        ]
      : [
          "Identify critical processes to map",
          "Define scope and objectives for each process",
          "Interview process executors",
          "Identify participants (swimlanes)",
          "List and order activities",
          "Identify decision points (gateways)",
          "Draw BPMN diagram",
          "Validate with stakeholders",
          "Document exceptions and rules",
          "Keep diagrams updated",
        ];
  },

  getKnowledge: (lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# BPMN

## O que é?
Business Process Model and Notation - padrão OMG para modelagem de processos.

## Versão Atual:
BPMN 2.0 (desde 2011)

## Elementos Básicos:
- **Eventos:** Início, intermediário, fim
- **Atividades:** Tarefas e subprocessos
- **Gateways:** Decisões e divisões
- **Fluxos:** Sequência e mensagem
- **Swimlanes:** Pools e lanes

## Quando usar:
- Documentar processos
- Analisar melhorias
- Automatizar workflows
- Treinar equipes

## Ferramentas:
Bizagi, Camunda, Signavio, draw.io
`
      : `# BPMN

## What is it?
Business Process Model and Notation - OMG standard for process modeling.

## Current Version:
BPMN 2.0 (since 2011)

## Basic Elements:
- **Events:** Start, intermediate, end
- **Activities:** Tasks and subprocesses
- **Gateways:** Decisions and splits
- **Flows:** Sequence and message
- **Swimlanes:** Pools and lanes

## When to use:
- Document processes
- Analyze improvements
- Automate workflows
- Train teams

## Tools:
Bizagi, Camunda, Signavio, draw.io
`;
  },
};

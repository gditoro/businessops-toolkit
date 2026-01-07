/**
 * Flowchart - Process Visualization
 */

import { BusinessMethod } from "../index";
import { OrchestratorContext } from "../../orchestrator";

export const flowchartMethod: BusinessMethod = {
  id: "flowchart",
  name: {
    "pt-br": "Fluxograma",
    "en": "Flowchart",
  },
  description: {
    "pt-br": "Visualização de processos através de diagramas de fluxo.",
    "en": "Process visualization through flow diagrams.",
  },
  category: "visualization",
  outputType: "mermaid",
  complexity: "basic",
  requiredData: [
    "company.ops.delivery_model",
    "company.ops.channels"
  ],
  tags: ["visualization", "process", "diagram", "documentation"],

  generate: (ctx: OrchestratorContext, lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# 📊 Fluxogramas - Guia de Criação

## Conceito
Fluxogramas são representações visuais de processos, mostrando a sequência de atividades e decisões.

---

## 🔷 Símbolos Básicos

\`\`\`
┌─────────────┐
│   INÍCIO    │  ← Terminal (início/fim): Oval ou retângulo arredondado
└─────────────┘

┌─────────────┐
│   Processo  │  ← Processo/Atividade: Retângulo
└─────────────┘

    ◇
   / \\
  /   \\         ← Decisão: Losango
  \\   /
   \\ /

┌─────────────┐
│  📄         │  ← Documento: Retângulo com base ondulada
│             │
└~~~~~~~~~~~~~┘

    ──────►      ← Fluxo: Seta
\`\`\`

---

## 📋 Exemplo: Processo de Venda

\`\`\`mermaid
flowchart TD
    A[📥 Receber Lead] --> B{Lead qualificado?}
    B -->|Sim| C[📞 Contatar cliente]
    B -->|Não| D[🗑️ Descartar]
    C --> E{Interesse?}
    E -->|Sim| F[📝 Enviar proposta]
    E -->|Não| G[📋 Nurturing]
    F --> H{Aceito?}
    H -->|Sim| I[✅ Fechar venda]
    H -->|Não| J[🔄 Negociar]
    J --> H
    G --> B
    I --> K[🎉 Fim]
\`\`\`

---

## 📋 Exemplo: Onboarding de Cliente

\`\`\`mermaid
flowchart LR
    A[Contrato assinado] --> B[Criar conta]
    B --> C[Configurar ambiente]
    C --> D[Treinamento inicial]
    D --> E{Cliente OK?}
    E -->|Sim| F[Go-live]
    E -->|Não| G[Suporte adicional]
    G --> D
    F --> H[Acompanhamento]
\`\`\`

---

## 📋 Exemplo: Tratamento de Suporte

\`\`\`mermaid
flowchart TD
    A[Ticket recebido] --> B{Urgente?}
    B -->|Sim| C[Atendimento imediato]
    B -->|Não| D[Fila normal]
    C --> E[Resolver]
    D --> E
    E --> F{Resolvido?}
    F -->|Sim| G[Fechar ticket]
    F -->|Não| H[Escalar]
    H --> I[Nível 2]
    I --> E
    G --> J[Pesquisa satisfação]
\`\`\`

---

## 🛠️ Como Criar um Fluxograma

### Passo 1: Definir o Escopo
- [ ] Nome do processo
- [ ] Objetivo
- [ ] Início e fim
- [ ] Nível de detalhe

### Passo 2: Listar Atividades
- [ ] Escrever todas as etapas
- [ ] Identificar decisões
- [ ] Mapear entradas e saídas

### Passo 3: Ordenar a Sequência
- [ ] Definir ordem lógica
- [ ] Identificar paralelismos
- [ ] Marcar loops

### Passo 4: Desenhar
- [ ] Usar símbolos corretos
- [ ] Conectar com setas
- [ ] Manter layout limpo

### Passo 5: Validar
- [ ] Revisar com executores
- [ ] Testar cenários
- [ ] Ajustar conforme feedback

---

## 💡 Dicas de Design

1. **Fluxo de cima para baixo** ou **esquerda para direita**
2. **Uma decisão = duas ou mais saídas**
3. **Evitar cruzamento de linhas**
4. **Usar cores para categorizar**
5. **Incluir responsáveis (swimlanes)**

---

## 🎨 Cores Sugeridas

| Cor | Uso |
|-----|-----|
| 🟢 Verde | Início, sucesso |
| 🔴 Vermelho | Fim, erro |
| 🔵 Azul | Processo normal |
| 🟡 Amarelo | Decisão, atenção |
| 🟣 Roxo | Subprocesso |

---

## 💻 Ferramentas

| Ferramenta | Tipo | Destaque |
|------------|------|----------|
| Mermaid | Código | Integração com docs |
| draw.io | Gratuito | Fácil de usar |
| Lucidchart | Cloud | Colaborativo |
| Visio | Desktop | Padrão corporativo |
| Figma | Design | Visual moderno |
`
      : `# 📊 Flowcharts - Creation Guide

## Concept
Flowcharts are visual representations of processes, showing the sequence of activities and decisions.

---

## 🔷 Basic Symbols

\`\`\`
┌─────────────┐
│   START     │  ← Terminal (start/end): Oval or rounded rectangle
└─────────────┘

┌─────────────┐
│   Process   │  ← Process/Activity: Rectangle
└─────────────┘

    ◇
   / \\
  /   \\         ← Decision: Diamond
  \\   /
   \\ /

┌─────────────┐
│  📄         │  ← Document: Rectangle with wavy base
│             │
└~~~~~~~~~~~~~┘

    ──────►      ← Flow: Arrow
\`\`\`

---

## 📋 Example: Sales Process

\`\`\`mermaid
flowchart TD
    A[📥 Receive Lead] --> B{Lead qualified?}
    B -->|Yes| C[📞 Contact customer]
    B -->|No| D[🗑️ Discard]
    C --> E{Interested?}
    E -->|Yes| F[📝 Send proposal]
    E -->|No| G[📋 Nurturing]
    F --> H{Accepted?}
    H -->|Yes| I[✅ Close sale]
    H -->|No| J[🔄 Negotiate]
    J --> H
    G --> B
    I --> K[🎉 End]
\`\`\`

---

## 📋 Example: Customer Onboarding

\`\`\`mermaid
flowchart LR
    A[Contract signed] --> B[Create account]
    B --> C[Configure environment]
    C --> D[Initial training]
    D --> E{Customer OK?}
    E -->|Yes| F[Go-live]
    E -->|No| G[Additional support]
    G --> D
    F --> H[Follow-up]
\`\`\`

---

## 📋 Example: Support Handling

\`\`\`mermaid
flowchart TD
    A[Ticket received] --> B{Urgent?}
    B -->|Yes| C[Immediate response]
    B -->|No| D[Normal queue]
    C --> E[Resolve]
    D --> E
    E --> F{Resolved?}
    F -->|Yes| G[Close ticket]
    F -->|No| H[Escalate]
    H --> I[Level 2]
    I --> E
    G --> J[Satisfaction survey]
\`\`\`

---

## 🛠️ How to Create a Flowchart

### Step 1: Define Scope
- [ ] Process name
- [ ] Objective
- [ ] Start and end
- [ ] Detail level

### Step 2: List Activities
- [ ] Write all steps
- [ ] Identify decisions
- [ ] Map inputs and outputs

### Step 3: Order the Sequence
- [ ] Define logical order
- [ ] Identify parallelism
- [ ] Mark loops

### Step 4: Draw
- [ ] Use correct symbols
- [ ] Connect with arrows
- [ ] Keep layout clean

### Step 5: Validate
- [ ] Review with executors
- [ ] Test scenarios
- [ ] Adjust based on feedback

---

## 💡 Design Tips

1. **Flow top to bottom** or **left to right**
2. **One decision = two or more outputs**
3. **Avoid crossing lines**
4. **Use colors to categorize**
5. **Include responsibilities (swimlanes)**

---

## 🎨 Suggested Colors

| Color | Use |
|-------|-----|
| 🟢 Green | Start, success |
| 🔴 Red | End, error |
| 🔵 Blue | Normal process |
| 🟡 Yellow | Decision, attention |
| 🟣 Purple | Subprocess |

---

## 💻 Tools

| Tool | Type | Highlight |
|------|------|-----------|
| Mermaid | Code | Doc integration |
| draw.io | Free | Easy to use |
| Lucidchart | Cloud | Collaborative |
| Visio | Desktop | Corporate standard |
| Figma | Design | Modern visual |
`;
  },

  getKnowledge: (lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# Fluxograma

## O que é?
Representação gráfica de um processo mostrando etapas e decisões.

## Símbolos:
- **Oval:** Início/Fim
- **Retângulo:** Processo/Atividade
- **Losango:** Decisão
- **Seta:** Direção do fluxo
- **Documento:** Saída documental

## Tipos:
- Processo simples
- Swimlane (com responsáveis)
- Multifuncional
- Detalhado

## Quando usar:
- Documentar processos
- Treinar equipes
- Identificar melhorias
- Padronizar operações
`
      : `# Flowchart

## What is it?
Graphical representation of a process showing steps and decisions.

## Symbols:
- **Oval:** Start/End
- **Rectangle:** Process/Activity
- **Diamond:** Decision
- **Arrow:** Flow direction
- **Document:** Documentary output

## Types:
- Simple process
- Swimlane (with responsibilities)
- Cross-functional
- Detailed

## When to use:
- Document processes
- Train teams
- Identify improvements
- Standardize operations
`;
  },
};

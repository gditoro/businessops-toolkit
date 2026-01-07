/**
 * Kaizen Method - Continuous Improvement
 */

import { BusinessMethod } from "../index";
import { OrchestratorContext } from "../../orchestrator";

export const kaizenMethod: BusinessMethod = {
  id: "kaizen",
  name: {
    "pt-br": "Kaizen",
    "en": "Kaizen",
  },
  description: {
    "pt-br": "Filosofia de melhoria contínua através de pequenas mudanças incrementais.",
    "en": "Philosophy of continuous improvement through small incremental changes.",
  },
  category: "process",
  outputType: "markdown",
  complexity: "basic",
  requiredData: [
    "company.ops.key_challenges",
    "company.identity.stage"
  ],
  tags: ["lean", "improvement", "continuous", "culture"],

  generate: (ctx: OrchestratorContext, lang: "pt-br" | "en"): string => {
    const c = ctx.company?.company || {};
    const meta = ctx.company?.meta || {};

    const companyName = meta.name || (lang === "pt-br" ? "Sua Empresa" : "Your Company");

    return lang === "pt-br"
      ? `# 🔄 Kaizen - Melhoria Contínua

## Conceito
**Kaizen** (改善) significa "mudança para melhor" em japonês. É uma filosofia que enfatiza melhorias pequenas e contínuas.

---

## 🎯 Princípios do Kaizen

### 1. Melhoria Contínua
- Pequenas melhorias diárias
- Cada dia um pouco melhor
- Foco no processo, não apenas resultados

### 2. Todos Participam
- Do CEO ao operador
- Ideias de todos são valiosas
- Empoderamento da equipe

### 3. Eliminar Desperdícios (Muda)
Os 7 desperdícios:
1. **Superprodução** - Fazer mais do que necessário
2. **Espera** - Tempo ocioso
3. **Transporte** - Movimentação desnecessária
4. **Processamento** - Etapas que não agregam valor
5. **Estoque** - Excesso de materiais
6. **Movimento** - Movimentos desnecessários
7. **Defeitos** - Erros e retrabalho

---

## 📊 Ciclo PDCA (Kaizen)

\`\`\`
        ┌─────────────────┐
        │    PLAN (P)     │
        │    Planejar     │
        └────────┬────────┘
                 │
    ┌────────────┼────────────┐
    │            ▼            │
┌───┴───┐                 ┌───┴───┐
│ACT (A)│                 │DO (D) │
│ Agir  │◄───────────────►│Fazer  │
└───┬───┘                 └───┬───┘
    │            ▲            │
    └────────────┼────────────┘
                 │
        ┌────────┴────────┐
        │   CHECK (C)     │
        │   Verificar     │
        └─────────────────┘
\`\`\`

### Plan (Planejar)
- Identificar problema/oportunidade
- Analisar causa raiz (5 Porquês)
- Definir meta de melhoria

### Do (Fazer)
- Implementar melhoria em pequena escala
- Documentar o processo
- Coletar dados

### Check (Verificar)
- Comparar resultados com meta
- Analisar variações
- Identificar lições aprendidas

### Act (Agir)
- Padronizar se bem-sucedido
- Ajustar e repetir se necessário
- Expandir a melhoria

---

## 🛠️ Ferramentas Kaizen

### 5 Porquês
Técnica para encontrar causa raiz:
1. Por que o problema ocorreu? → Resposta 1
2. Por que isso aconteceu? → Resposta 2
3. Por que? → Resposta 3
4. Por que? → Resposta 4
5. Por que? → Causa Raiz

### Gemba Walk
- Ir ao local onde o trabalho acontece
- Observar processos reais
- Conversar com quem executa

### Eventos Kaizen (Kaizen Blitz)
- Workshop intensivo (3-5 dias)
- Equipe multifuncional
- Melhoria rápida e focada

---

## 📋 Plano de Implementação - ${companyName}

### Fase 1: Cultura (Mês 1)
- [ ] Treinar liderança em Kaizen
- [ ] Comunicar filosofia à equipe
- [ ] Criar quadro de sugestões

### Fase 2: Estrutura (Mês 2)
- [ ] Definir processo de sugestões
- [ ] Estabelecer times de melhoria
- [ ] Implementar reuniões Kaizen semanais

### Fase 3: Prática (Mês 3+)
- [ ] Realizar primeiro Gemba Walk
- [ ] Executar ciclo PDCA completo
- [ ] Celebrar melhorias

---

## 📈 Métricas de Kaizen

| Métrica | Como Medir | Meta |
|---------|------------|------|
| Sugestões/mês | Contador | +10%/mês |
| Implementação | % sugestões aplicadas | >50% |
| Economia | R$ economizado | Tracking |
| Engajamento | % participação | >70% |
`
      : `# 🔄 Kaizen - Continuous Improvement

## Concept
**Kaizen** (改善) means "change for the better" in Japanese. It's a philosophy that emphasizes small, continuous improvements.

---

## 🎯 Kaizen Principles

### 1. Continuous Improvement
- Small daily improvements
- A little better each day
- Focus on process, not just results

### 2. Everyone Participates
- From CEO to operator
- Everyone's ideas are valuable
- Team empowerment

### 3. Eliminate Waste (Muda)
The 7 wastes:
1. **Overproduction** - Making more than needed
2. **Waiting** - Idle time
3. **Transportation** - Unnecessary movement
4. **Processing** - Non-value-adding steps
5. **Inventory** - Excess materials
6. **Motion** - Unnecessary movements
7. **Defects** - Errors and rework

---

## 📊 PDCA Cycle (Kaizen)

\`\`\`
        ┌─────────────────┐
        │    PLAN (P)     │
        │                 │
        └────────┬────────┘
                 │
    ┌────────────┼────────────┐
    │            ▼            │
┌───┴───┐                 ┌───┴───┐
│ACT (A)│                 │DO (D) │
│       │◄───────────────►│       │
└───┬───┘                 └───┬───┘
    │            ▲            │
    └────────────┼────────────┘
                 │
        ┌────────┴────────┐
        │   CHECK (C)     │
        │                 │
        └─────────────────┘
\`\`\`

### Plan
- Identify problem/opportunity
- Analyze root cause (5 Whys)
- Define improvement goal

### Do
- Implement improvement on small scale
- Document the process
- Collect data

### Check
- Compare results with goal
- Analyze variations
- Identify lessons learned

### Act
- Standardize if successful
- Adjust and repeat if needed
- Expand the improvement

---

## 🛠️ Kaizen Tools

### 5 Whys
Technique to find root cause:
1. Why did the problem occur? → Answer 1
2. Why did that happen? → Answer 2
3. Why? → Answer 3
4. Why? → Answer 4
5. Why? → Root Cause

### Gemba Walk
- Go to where work happens
- Observe real processes
- Talk to those who execute

### Kaizen Events (Kaizen Blitz)
- Intensive workshop (3-5 days)
- Cross-functional team
- Fast and focused improvement

---

## 📋 Implementation Plan - ${companyName}

### Phase 1: Culture (Month 1)
- [ ] Train leadership on Kaizen
- [ ] Communicate philosophy to team
- [ ] Create suggestion board

### Phase 2: Structure (Month 2)
- [ ] Define suggestion process
- [ ] Establish improvement teams
- [ ] Implement weekly Kaizen meetings

### Phase 3: Practice (Month 3+)
- [ ] Conduct first Gemba Walk
- [ ] Execute complete PDCA cycle
- [ ] Celebrate improvements

---

## 📈 Kaizen Metrics

| Metric | How to Measure | Target |
|--------|----------------|--------|
| Suggestions/month | Counter | +10%/month |
| Implementation | % suggestions applied | >50% |
| Savings | $ saved | Tracking |
| Engagement | % participation | >70% |
`;
  },

  getChecklist: (_ctx: OrchestratorContext, lang: "pt-br" | "en"): string[] => {
    return lang === "pt-br"
      ? [
          "Treinar equipe nos princípios Kaizen",
          "Criar quadro de sugestões de melhoria",
          "Estabelecer reunião semanal de Kaizen",
          "Implementar processo de sugestões",
          "Realizar Gemba Walk mensal",
          "Aplicar 5 Porquês em problemas",
          "Documentar melhorias implementadas",
          "Celebrar vitórias e reconhecer contribuições",
        ]
      : [
          "Train team on Kaizen principles",
          "Create improvement suggestion board",
          "Establish weekly Kaizen meeting",
          "Implement suggestion process",
          "Conduct monthly Gemba Walk",
          "Apply 5 Whys to problems",
          "Document implemented improvements",
          "Celebrate wins and recognize contributions",
        ];
  },

  getKnowledge: (lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# Kaizen

## O que é?
Filosofia japonesa de melhoria contínua através de pequenas mudanças.

## Origem:
Toyota Production System (TPS), desenvolvido após a Segunda Guerra Mundial.

## Conceitos-Chave:
- **Muda:** Desperdício
- **Mura:** Irregularidade
- **Muri:** Sobrecarga
- **Gemba:** Local de trabalho real
- **PDCA:** Ciclo de melhoria

## Diferença de outros métodos:
- **Kaizen:** Melhorias pequenas e contínuas
- **Kaikaku:** Mudanças radicais e disruptivas

## Benefícios:
- Cultura de melhoria
- Engajamento da equipe
- Redução de desperdícios
- Aumento de eficiência
`
      : `# Kaizen

## What is it?
Japanese philosophy of continuous improvement through small changes.

## Origin:
Toyota Production System (TPS), developed after World War II.

## Key Concepts:
- **Muda:** Waste
- **Mura:** Irregularity
- **Muri:** Overburden
- **Gemba:** Actual workplace
- **PDCA:** Improvement cycle

## Difference from other methods:
- **Kaizen:** Small, continuous improvements
- **Kaikaku:** Radical, disruptive changes

## Benefits:
- Improvement culture
- Team engagement
- Waste reduction
- Increased efficiency
`;
  },
};

/**
 * Six Sigma Methodology
 */

import { BusinessMethod } from "../index";
import { OrchestratorContext } from "../../orchestrator";

export const sixSigmaMethod: BusinessMethod = {
  id: "six-sigma",
  name: {
    "pt-br": "Seis Sigma",
    "en": "Six Sigma",
  },
  description: {
    "pt-br": "Metodologia de melhoria de qualidade focada em redução de defeitos e variabilidade.",
    "en": "Quality improvement methodology focused on defect reduction and variability.",
  },
  category: "process",
  outputType: "markdown",
  complexity: "advanced",
  requiredData: [
    "company.ops.key_challenges",
    "company.identity.stage"
  ],
  tags: ["quality", "statistics", "dmaic", "process-improvement"],

  generate: (ctx: OrchestratorContext, lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# 📊 Seis Sigma (Six Sigma)

## Conceito
Six Sigma é uma metodologia que visa reduzir defeitos a no máximo 3,4 por milhão de oportunidades (99,99966% de qualidade).

---

## 📈 Níveis Sigma

| Sigma | Defeitos/Milhão | Qualidade % |
|-------|-----------------|-------------|
| 1σ | 690.000 | 31% |
| 2σ | 308.000 | 69,2% |
| 3σ | 66.800 | 93,32% |
| 4σ | 6.210 | 99,38% |
| 5σ | 230 | 99,977% |
| **6σ** | **3,4** | **99,99966%** |

---

## 🔄 Ciclo DMAIC

\`\`\`
    ┌─────────────────────────────────────────────────────────┐
    │                       DMAIC                              │
    │                                                          │
    │   ┌────────┐   ┌────────┐   ┌────────┐                  │
    │   │   D    │──►│   M    │──►│   A    │                  │
    │   │DEFINE  │   │MEASURE │   │ANALYZE │                  │
    │   └────────┘   └────────┘   └───┬────┘                  │
    │                                 │                        │
    │                     ┌───────────┘                        │
    │                     ▼                                    │
    │               ┌────────┐   ┌────────┐                   │
    │               │   I    │──►│   C    │                   │
    │               │IMPROVE │   │CONTROL │                   │
    │               └────────┘   └────────┘                   │
    └─────────────────────────────────────────────────────────┘
\`\`\`

---

## D - DEFINE (Definir)

### Objetivo
Definir claramente o problema e escopo do projeto

### Ferramentas
- Project Charter
- SIPOC (Suppliers, Inputs, Process, Outputs, Customers)
- Voice of Customer (VOC)
- CTQ (Critical to Quality)

### Entregas
- [ ] Declaração do problema
- [ ] Escopo do projeto
- [ ] Métricas de sucesso
- [ ] Cronograma e equipe
- [ ] SIPOC do processo

### Template SIPOC:
| S (Fornecedores) | I (Entradas) | P (Processo) | O (Saídas) | C (Clientes) |
|-----------------|--------------|--------------|------------|--------------|
| | | | | |

---

## M - MEASURE (Medir)

### Objetivo
Coletar dados para entender o desempenho atual

### Ferramentas
- Coleta de dados
- Análise de Sistema de Medição (MSA)
- Gráficos de Controle
- Capability Analysis

### Entregas
- [ ] Plano de coleta de dados
- [ ] Baseline do processo
- [ ] Cálculo de Sigma atual
- [ ] Validação do sistema de medição

### Cálculo de Sigma:
\`\`\`
DPU = Defeitos / Unidades
DPO = DPU / Oportunidades
DPMO = DPO × 1.000.000
Sigma = Conversão via tabela
\`\`\`

---

## A - ANALYZE (Analisar)

### Objetivo
Identificar causas raiz dos problemas

### Ferramentas
- Diagrama de Ishikawa (Espinha de Peixe)
- Análise de Pareto
- 5 Porquês
- Análise de Regressão
- FMEA (Failure Mode Effects Analysis)

### Entregas
- [ ] Diagrama de Ishikawa
- [ ] Análise de Pareto
- [ ] Causas raiz identificadas
- [ ] Hipóteses validadas estatisticamente

### Diagrama de Ishikawa:
\`\`\`
    Mão de Obra   Método      Medição
           \\        |         /
            \\       |        /
             \\      |       /
              \\     |      /
               ►────┴─────◄────── PROBLEMA
              /           \\
             /             \\
            /               \\
    Material          Máquina/Tecnologia
\`\`\`

---

## I - IMPROVE (Melhorar)

### Objetivo
Desenvolver e implementar soluções

### Ferramentas
- Brainstorming estruturado
- DOE (Design of Experiments)
- Piloto/Teste A/B
- Análise Custo-Benefício
- Poka-Yoke (à prova de erros)

### Entregas
- [ ] Lista de soluções priorizadas
- [ ] Plano piloto
- [ ] Resultados do piloto
- [ ] Plano de implementação

---

## C - CONTROL (Controlar)

### Objetivo
Sustentar as melhorias ao longo do tempo

### Ferramentas
- Plano de Controle
- Gráficos de Controle (SPC)
- Procedimentos Operacionais Padrão (POPs)
- Treinamento
- Auditorias

### Entregas
- [ ] Plano de controle
- [ ] POPs atualizados
- [ ] Dashboard de monitoramento
- [ ] Documentação do projeto
- [ ] Lições aprendidas

---

## 🎓 Belts do Six Sigma

| Belt | Descrição | Responsabilidade |
|------|-----------|------------------|
| White Belt | Conscientização | Apoio básico |
| Yellow Belt | Conceitos básicos | Participação em projetos |
| Green Belt | Ferramentas | Lidera projetos parcialmente |
| Black Belt | Metodologia completa | Lidera projetos 100% |
| Master Black Belt | Expert | Mentora e treina |

---

## 📊 Ferramentas Estatísticas

### Básicas:
- Histograma
- Diagrama de dispersão
- Gráfico de Pareto
- Boxplot

### Avançadas:
- Testes de hipótese
- ANOVA
- Regressão
- DOE
`
      : `# 📊 Six Sigma

## Concept
Six Sigma is a methodology aimed at reducing defects to a maximum of 3.4 per million opportunities (99.99966% quality).

---

## 📈 Sigma Levels

| Sigma | Defects/Million | Quality % |
|-------|-----------------|-----------|
| 1σ | 690,000 | 31% |
| 2σ | 308,000 | 69.2% |
| 3σ | 66,800 | 93.32% |
| 4σ | 6,210 | 99.38% |
| 5σ | 230 | 99.977% |
| **6σ** | **3.4** | **99.99966%** |

---

## 🔄 DMAIC Cycle

\`\`\`
    ┌─────────────────────────────────────────────────────────┐
    │                       DMAIC                              │
    │                                                          │
    │   ┌────────┐   ┌────────┐   ┌────────┐                  │
    │   │   D    │──►│   M    │──►│   A    │                  │
    │   │DEFINE  │   │MEASURE │   │ANALYZE │                  │
    │   └────────┘   └────────┘   └───┬────┘                  │
    │                                 │                        │
    │                     ┌───────────┘                        │
    │                     ▼                                    │
    │               ┌────────┐   ┌────────┐                   │
    │               │   I    │──►│   C    │                   │
    │               │IMPROVE │   │CONTROL │                   │
    │               └────────┘   └────────┘                   │
    └─────────────────────────────────────────────────────────┘
\`\`\`

---

## D - DEFINE

### Objective
Clearly define the problem and project scope

### Tools
- Project Charter
- SIPOC (Suppliers, Inputs, Process, Outputs, Customers)
- Voice of Customer (VOC)
- CTQ (Critical to Quality)

### Deliverables
- [ ] Problem statement
- [ ] Project scope
- [ ] Success metrics
- [ ] Timeline and team
- [ ] Process SIPOC

### SIPOC Template:
| S (Suppliers) | I (Inputs) | P (Process) | O (Outputs) | C (Customers) |
|--------------|------------|-------------|-------------|---------------|
| | | | | |

---

## M - MEASURE

### Objective
Collect data to understand current performance

### Tools
- Data collection
- Measurement System Analysis (MSA)
- Control Charts
- Capability Analysis

### Deliverables
- [ ] Data collection plan
- [ ] Process baseline
- [ ] Current Sigma calculation
- [ ] Measurement system validation

### Sigma Calculation:
\`\`\`
DPU = Defects / Units
DPO = DPU / Opportunities
DPMO = DPO × 1,000,000
Sigma = Conversion via table
\`\`\`

---

## A - ANALYZE

### Objective
Identify root causes of problems

### Tools
- Ishikawa Diagram (Fishbone)
- Pareto Analysis
- 5 Whys
- Regression Analysis
- FMEA (Failure Mode Effects Analysis)

### Deliverables
- [ ] Ishikawa diagram
- [ ] Pareto analysis
- [ ] Root causes identified
- [ ] Statistically validated hypotheses

### Ishikawa Diagram:
\`\`\`
    People        Method       Measurement
          \\        |          /
           \\       |         /
            \\      |        /
             \\     |       /
              ►────┴──────◄────── PROBLEM
             /            \\
            /              \\
           /                \\
    Material           Machine/Technology
\`\`\`

---

## I - IMPROVE

### Objective
Develop and implement solutions

### Tools
- Structured brainstorming
- DOE (Design of Experiments)
- Pilot/A/B Testing
- Cost-Benefit Analysis
- Poka-Yoke (error-proofing)

### Deliverables
- [ ] Prioritized solutions list
- [ ] Pilot plan
- [ ] Pilot results
- [ ] Implementation plan

---

## C - CONTROL

### Objective
Sustain improvements over time

### Tools
- Control Plan
- Control Charts (SPC)
- Standard Operating Procedures (SOPs)
- Training
- Audits

### Deliverables
- [ ] Control plan
- [ ] Updated SOPs
- [ ] Monitoring dashboard
- [ ] Project documentation
- [ ] Lessons learned

---

## 🎓 Six Sigma Belts

| Belt | Description | Responsibility |
|------|-------------|----------------|
| White Belt | Awareness | Basic support |
| Yellow Belt | Basic concepts | Project participation |
| Green Belt | Tools | Partially leads projects |
| Black Belt | Complete methodology | Leads projects 100% |
| Master Black Belt | Expert | Mentors and trains |

---

## 📊 Statistical Tools

### Basic:
- Histogram
- Scatter diagram
- Pareto chart
- Boxplot

### Advanced:
- Hypothesis testing
- ANOVA
- Regression
- DOE
`;
  },

  getChecklist: (_ctx: OrchestratorContext, lang: "pt-br" | "en"): string[] => {
    return lang === "pt-br"
      ? [
          "DEFINE: Criar Project Charter",
          "DEFINE: Mapear SIPOC do processo",
          "MEASURE: Coletar dados baseline",
          "MEASURE: Calcular nível Sigma atual",
          "ANALYZE: Criar diagrama de Ishikawa",
          "ANALYZE: Identificar causas raiz",
          "IMPROVE: Desenvolver soluções",
          "IMPROVE: Executar piloto",
          "CONTROL: Criar plano de controle",
          "CONTROL: Implementar monitoramento",
        ]
      : [
          "DEFINE: Create Project Charter",
          "DEFINE: Map process SIPOC",
          "MEASURE: Collect baseline data",
          "MEASURE: Calculate current Sigma level",
          "ANALYZE: Create Ishikawa diagram",
          "ANALYZE: Identify root causes",
          "IMPROVE: Develop solutions",
          "IMPROVE: Execute pilot",
          "CONTROL: Create control plan",
          "CONTROL: Implement monitoring",
        ];
  },

  getKnowledge: (lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# Seis Sigma

## O que é?
Metodologia de melhoria de qualidade baseada em estatística.

## Origem:
Motorola (1986), popularizado pela GE.

## DMAIC:
- **D**efine: Definir problema
- **M**easure: Medir situação atual
- **A**nalyze: Analisar causas
- **I**mprove: Melhorar processo
- **C**ontrol: Controlar para manter

## Meta:
3,4 defeitos por milhão de oportunidades

## Integração:
- **Lean Six Sigma:** Combina com Lean
- **DFSS:** Design For Six Sigma (novos produtos)
`
      : `# Six Sigma

## What is it?
Statistics-based quality improvement methodology.

## Origin:
Motorola (1986), popularized by GE.

## DMAIC:
- **D**efine: Define problem
- **M**easure: Measure current situation
- **A**nalyze: Analyze causes
- **I**mprove: Improve process
- **C**ontrol: Control to maintain

## Goal:
3.4 defects per million opportunities

## Integration:
- **Lean Six Sigma:** Combines with Lean
- **DFSS:** Design For Six Sigma (new products)
`;
  },
};

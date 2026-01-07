/**
 * TQM - Total Quality Management
 */

import { BusinessMethod } from "../index";
import { OrchestratorContext } from "../../orchestrator";

export const tqmMethod: BusinessMethod = {
  id: "tqm",
  name: {
    "pt-br": "Gestão da Qualidade Total (TQM)",
    "en": "Total Quality Management (TQM)",
  },
  description: {
    "pt-br": "Abordagem de gestão focada na qualidade em todos os processos organizacionais.",
    "en": "Management approach focused on quality across all organizational processes.",
  },
  category: "process",
  outputType: "markdown",
  complexity: "intermediate",
  requiredData: [
    "company.ops.key_challenges",
    "company.identity.stage"
  ],
  tags: ["quality", "management", "continuous-improvement", "customer"],

  generate: (ctx: OrchestratorContext, lang: "pt-br" | "en"): string => {
    const meta = ctx.company?.meta || {};
    const companyName = meta.name || (lang === "pt-br" ? "Sua Empresa" : "Your Company");

    return lang === "pt-br"
      ? `# 🏆 Gestão da Qualidade Total (TQM)

## Conceito
TQM é uma filosofia de gestão que busca a excelência em todos os aspectos da organização, com foco no cliente e melhoria contínua.

---

## 🎯 8 Princípios do TQM

### 1. Foco no Cliente
- O cliente define qualidade
- Satisfação como métrica principal
- Entender necessidades explícitas e implícitas

### 2. Envolvimento de Todos
- Todos são responsáveis pela qualidade
- Empoderamento dos colaboradores
- Trabalho em equipe

### 3. Abordagem por Processos
- Visão sistêmica
- Inputs → Processos → Outputs
- Eliminar desperdícios

### 4. Abordagem Sistêmica
- Organização como sistema integrado
- Interdependência entre áreas
- Otimização do todo, não das partes

### 5. Melhoria Contínua
- Kaizen como filosofia
- PDCA em todos os níveis
- Nunca estar satisfeito

### 6. Tomada de Decisão Baseada em Dados
- Métricas e indicadores
- Análise estatística
- Fatos, não opiniões

### 7. Comunicação Efetiva
- Transparência
- Feedback constante
- Alinhamento de expectativas

### 8. Gestão de Relacionamentos
- Fornecedores como parceiros
- Relacionamentos ganha-ganha
- Cadeia de valor integrada

---

## 📊 Ferramentas TQM

### As 7 Ferramentas Básicas da Qualidade

| Ferramenta | Uso |
|------------|-----|
| 1. Diagrama de Pareto | Priorizar problemas (80/20) |
| 2. Diagrama de Causa e Efeito | Identificar causas raiz |
| 3. Histograma | Visualizar distribuição |
| 4. Gráfico de Controle | Monitorar variabilidade |
| 5. Diagrama de Dispersão | Correlação entre variáveis |
| 6. Folha de Verificação | Coletar dados |
| 7. Fluxograma | Mapear processos |

### Ferramentas de Gestão

- Diagrama de Afinidades
- Diagrama de Relações
- Diagrama de Árvore
- Diagrama de Matriz
- Análise de Dados de Matriz
- PDPC
- Diagrama de Rede

---

## 📈 Implementação TQM - ${companyName}

### Fase 1: Fundação (Mês 1-3)
- [ ] Comprometimento da alta direção
- [ ] Definir visão de qualidade
- [ ] Formar comitê de qualidade
- [ ] Treinar liderança

### Fase 2: Diagnóstico (Mês 3-4)
- [ ] Mapear processos-chave
- [ ] Identificar indicadores
- [ ] Realizar pesquisa de satisfação
- [ ] Gap analysis

### Fase 3: Planejamento (Mês 4-6)
- [ ] Definir objetivos de qualidade
- [ ] Criar plano de ação
- [ ] Alocar recursos
- [ ] Definir métricas

### Fase 4: Execução (Mês 6+)
- [ ] Implementar melhorias
- [ ] Treinar todos os colaboradores
- [ ] Monitorar indicadores
- [ ] Celebrar conquistas

### Fase 5: Consolidação (Contínuo)
- [ ] Auditorias internas
- [ ] Revisão de processos
- [ ] Benchmarking
- [ ] Buscar certificações (ISO)

---

## 📊 Indicadores TQM

| Categoria | Indicador | Meta |
|-----------|-----------|------|
| Cliente | NPS | >50 |
| Cliente | Satisfação | >85% |
| Processo | Defeitos | <1% |
| Processo | Retrabalho | <5% |
| Pessoas | Engajamento | >80% |
| Pessoas | Sugestões/mês | +10% |
| Financeiro | Custo da Qualidade | <5% receita |
| Financeiro | ROI Qualidade | >200% |

---

## 💡 Custo da Qualidade

### Custos de Prevenção
- Treinamento
- Planejamento da qualidade
- Manutenção preventiva

### Custos de Avaliação
- Inspeções
- Auditorias
- Testes

### Custos de Falhas Internas
- Retrabalho
- Sucata
- Tempo parado

### Custos de Falhas Externas
- Garantia
- Devoluções
- Perda de clientes

**Meta: Aumentar prevenção para reduzir falhas**
`
      : `# 🏆 Total Quality Management (TQM)

## Concept
TQM is a management philosophy seeking excellence in all organizational aspects, focusing on customer and continuous improvement.

---

## 🎯 8 TQM Principles

### 1. Customer Focus
- Customer defines quality
- Satisfaction as main metric
- Understand explicit and implicit needs

### 2. Total Involvement
- Everyone is responsible for quality
- Employee empowerment
- Teamwork

### 3. Process Approach
- Systemic view
- Inputs → Processes → Outputs
- Eliminate waste

### 4. Systemic Approach
- Organization as integrated system
- Interdependence between areas
- Optimize the whole, not parts

### 5. Continuous Improvement
- Kaizen as philosophy
- PDCA at all levels
- Never be satisfied

### 6. Data-Based Decision Making
- Metrics and indicators
- Statistical analysis
- Facts, not opinions

### 7. Effective Communication
- Transparency
- Constant feedback
- Expectation alignment

### 8. Relationship Management
- Suppliers as partners
- Win-win relationships
- Integrated value chain

---

## 📊 TQM Tools

### The 7 Basic Quality Tools

| Tool | Use |
|------|-----|
| 1. Pareto Diagram | Prioritize problems (80/20) |
| 2. Cause and Effect Diagram | Identify root causes |
| 3. Histogram | Visualize distribution |
| 4. Control Chart | Monitor variability |
| 5. Scatter Diagram | Variable correlation |
| 6. Check Sheet | Collect data |
| 7. Flowchart | Map processes |

### Management Tools

- Affinity Diagram
- Relations Diagram
- Tree Diagram
- Matrix Diagram
- Matrix Data Analysis
- PDPC
- Network Diagram

---

## 📈 TQM Implementation - ${companyName}

### Phase 1: Foundation (Month 1-3)
- [ ] Top management commitment
- [ ] Define quality vision
- [ ] Form quality committee
- [ ] Train leadership

### Phase 2: Diagnosis (Month 3-4)
- [ ] Map key processes
- [ ] Identify indicators
- [ ] Conduct satisfaction survey
- [ ] Gap analysis

### Phase 3: Planning (Month 4-6)
- [ ] Define quality objectives
- [ ] Create action plan
- [ ] Allocate resources
- [ ] Define metrics

### Phase 4: Execution (Month 6+)
- [ ] Implement improvements
- [ ] Train all employees
- [ ] Monitor indicators
- [ ] Celebrate achievements

### Phase 5: Consolidation (Ongoing)
- [ ] Internal audits
- [ ] Process reviews
- [ ] Benchmarking
- [ ] Seek certifications (ISO)

---

## 📊 TQM Indicators

| Category | Indicator | Target |
|----------|-----------|--------|
| Customer | NPS | >50 |
| Customer | Satisfaction | >85% |
| Process | Defects | <1% |
| Process | Rework | <5% |
| People | Engagement | >80% |
| People | Suggestions/month | +10% |
| Financial | Cost of Quality | <5% revenue |
| Financial | Quality ROI | >200% |

---

## 💡 Cost of Quality

### Prevention Costs
- Training
- Quality planning
- Preventive maintenance

### Appraisal Costs
- Inspections
- Audits
- Testing

### Internal Failure Costs
- Rework
- Scrap
- Downtime

### External Failure Costs
- Warranty
- Returns
- Lost customers

**Goal: Increase prevention to reduce failures**
`;
  },

  getChecklist: (_ctx: OrchestratorContext, lang: "pt-br" | "en"): string[] => {
    return lang === "pt-br"
      ? [
          "Obter comprometimento da alta direção",
          "Formar comitê de qualidade",
          "Mapear processos críticos",
          "Definir indicadores de qualidade",
          "Treinar equipe em ferramentas da qualidade",
          "Implementar sistema de sugestões",
          "Realizar pesquisa de satisfação",
          "Estabelecer auditorias internas",
          "Calcular custo da qualidade",
          "Buscar certificação ISO",
        ]
      : [
          "Obtain top management commitment",
          "Form quality committee",
          "Map critical processes",
          "Define quality indicators",
          "Train team on quality tools",
          "Implement suggestion system",
          "Conduct satisfaction survey",
          "Establish internal audits",
          "Calculate cost of quality",
          "Pursue ISO certification",
        ];
  },

  getKnowledge: (lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# TQM - Gestão da Qualidade Total

## O que é?
Filosofia de gestão focada em qualidade em toda a organização.

## Origem:
Deming, Juran, Crosby - EUA/Japão pós-guerra

## Pilares:
- Foco no cliente
- Melhoria contínua
- Envolvimento de todos
- Abordagem sistêmica

## Relação com:
- ISO 9001 (certificação)
- Lean (eliminar desperdícios)
- Six Sigma (reduzir variabilidade)

## Benefícios:
- Maior satisfação do cliente
- Redução de custos
- Melhoria de processos
- Engajamento da equipe
`
      : `# TQM - Total Quality Management

## What is it?
Management philosophy focused on quality across the organization.

## Origin:
Deming, Juran, Crosby - USA/Japan post-war

## Pillars:
- Customer focus
- Continuous improvement
- Everyone's involvement
- Systemic approach

## Related to:
- ISO 9001 (certification)
- Lean (eliminate waste)
- Six Sigma (reduce variability)

## Benefits:
- Higher customer satisfaction
- Cost reduction
- Process improvement
- Team engagement
`;
  },
};

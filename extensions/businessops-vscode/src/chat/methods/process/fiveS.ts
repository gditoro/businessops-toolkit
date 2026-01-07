/**
 * 5S Methodology
 */

import { BusinessMethod } from "../index";
import { OrchestratorContext } from "../../orchestrator";

export const fiveSMethod: BusinessMethod = {
  id: "5s",
  name: {
    "pt-br": "5S",
    "en": "5S",
  },
  description: {
    "pt-br": "Metodologia de organização do ambiente de trabalho em 5 etapas.",
    "en": "Workplace organization methodology in 5 steps.",
  },
  category: "process",
  outputType: "markdown",
  complexity: "basic",
  requiredData: [
    "company.ops.key_challenges"
  ],
  tags: ["lean", "organization", "workplace", "efficiency"],

  generate: (ctx: OrchestratorContext, lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# 🧹 Metodologia 5S

## Conceito
O 5S é uma metodologia japonesa de organização do ambiente de trabalho que melhora eficiência, segurança e qualidade.

---

## 📊 Os 5 Sensos

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                         5S                                   │
├─────────────┬─────────────┬─────────────┬─────────────┬─────┤
│    整理     │    整頓     │    清掃     │    清潔     │ 躾  │
│   SEIRI     │   SEITON    │   SEISO     │  SEIKETSU   │SHITS│
│             │             │             │             │UKE  │
│ UTILIZAÇÃO  │ ORGANIZAÇÃO │  LIMPEZA    │PADRONIZAÇÃO │DISCI│
│             │             │             │             │PLINA│
└─────────────┴─────────────┴─────────────┴─────────────┴─────┘
\`\`\`

---

## 1️⃣ SEIRI - Senso de Utilização
**Separar o necessário do desnecessário**

### Perguntas-Chave:
- Este item é necessário?
- Com que frequência é usado?
- Qual a quantidade necessária?

### Ações:
- [ ] Identificar todos os itens do ambiente
- [ ] Classificar por frequência de uso
- [ ] Descartar, doar ou armazenar o desnecessário
- [ ] Usar etiquetas vermelhas para itens em dúvida

### Critério de Classificação:
| Frequência | Ação |
|------------|------|
| Diário | Manter próximo |
| Semanal | Manter no setor |
| Mensal | Armazenamento central |
| Raro/Nunca | Descartar/Doar |

---

## 2️⃣ SEITON - Senso de Organização
**Um lugar para cada coisa, cada coisa em seu lugar**

### Princípios:
- Itens mais usados mais acessíveis
- Identificação visual clara
- Retorno fácil ao lugar correto

### Ações:
- [ ] Definir local para cada item
- [ ] Criar identificação visual (etiquetas, cores)
- [ ] Demarcar áreas no chão
- [ ] Organizar por categoria/frequência

### Dicas:
- Use shadow boards (contornos)
- Aplique gestão visual
- Minimize tempo de busca

---

## 3️⃣ SEISO - Senso de Limpeza
**Manter limpo é não sujar**

### Benefícios:
- Identifica problemas cedo
- Ambiente mais seguro
- Maior vida útil de equipamentos

### Ações:
- [ ] Limpar profundamente todo o ambiente
- [ ] Identificar fontes de sujeira
- [ ] Estabelecer rotina de limpeza
- [ ] Cada um responsável por sua área

### Rotina Sugerida:
| Momento | Ação |
|---------|------|
| Início | Verificação rápida |
| Durante | Limpeza ao usar |
| Final | 5 min de organização |
| Semanal | Limpeza profunda |

---

## 4️⃣ SEIKETSU - Senso de Padronização
**Manter a ordem conquistada**

### Como padronizar:
- Criar checklists visuais
- Definir responsáveis
- Estabelecer rotinas
- Documentar padrões

### Ações:
- [ ] Fotografar estado ideal
- [ ] Criar checklists de verificação
- [ ] Definir responsabilidades
- [ ] Agendar auditorias regulares

### Exemplo de Checklist:
| Item | OK | Observação |
|------|-----|------------|
| Mesa organizada | ☐ | |
| Documentos arquivados | ☐ | |
| Lixo descartado | ☐ | |
| Equipamentos no lugar | ☐ | |

---

## 5️⃣ SHITSUKE - Senso de Disciplina
**Transformar em hábito**

### Elementos:
- Comprometimento de todos
- Exemplo da liderança
- Treinamento contínuo
- Reconhecimento

### Ações:
- [ ] Treinar todos os colaboradores
- [ ] Líderes dando exemplo
- [ ] Auditorias mensais
- [ ] Celebrar conquistas

---

## 📈 Plano de Implementação

### Semana 1-2: SEIRI
Foco em descarte e classificação

### Semana 3-4: SEITON
Foco em organização e identificação

### Semana 5-6: SEISO
Foco em limpeza e rotinas

### Mês 2: SEIKETSU
Foco em padronização

### Contínuo: SHITSUKE
Foco em manutenção e cultura

---

## 📊 Indicadores de Sucesso

| Indicador | Meta | Medição |
|-----------|------|---------|
| Tempo de busca | -50% | Cronometrar |
| Espaço liberado | +30% | Medir m² |
| Satisfação | >80% | Pesquisa |
| Auditorias | >85 pts | Checklist |
`
      : `# 🧹 5S Methodology

## Concept
5S is a Japanese workplace organization methodology that improves efficiency, safety, and quality.

---

## 📊 The 5 Pillars

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                         5S                                   │
├─────────────┬─────────────┬─────────────┬─────────────┬─────┤
│    整理     │    整頓     │    清掃     │    清潔     │ 躾  │
│   SEIRI     │   SEITON    │   SEISO     │  SEIKETSU   │SHITS│
│             │             │             │             │UKE  │
│    SORT     │  SET IN     │   SHINE     │ STANDARDIZE │SUST │
│             │   ORDER     │             │             │AIN  │
└─────────────┴─────────────┴─────────────┴─────────────┴─────┘
\`\`\`

---

## 1️⃣ SEIRI - Sort
**Separate necessary from unnecessary**

### Key Questions:
- Is this item necessary?
- How often is it used?
- What quantity is needed?

### Actions:
- [ ] Identify all items in the environment
- [ ] Classify by usage frequency
- [ ] Discard, donate, or store unnecessary items
- [ ] Use red tags for questionable items

### Classification Criteria:
| Frequency | Action |
|-----------|--------|
| Daily | Keep nearby |
| Weekly | Keep in sector |
| Monthly | Central storage |
| Rare/Never | Discard/Donate |

---

## 2️⃣ SEITON - Set in Order
**A place for everything, everything in its place**

### Principles:
- Most used items most accessible
- Clear visual identification
- Easy return to correct place

### Actions:
- [ ] Define location for each item
- [ ] Create visual identification (labels, colors)
- [ ] Mark floor areas
- [ ] Organize by category/frequency

### Tips:
- Use shadow boards
- Apply visual management
- Minimize search time

---

## 3️⃣ SEISO - Shine
**Keeping clean means not making dirty**

### Benefits:
- Identifies problems early
- Safer environment
- Longer equipment life

### Actions:
- [ ] Deep clean entire environment
- [ ] Identify sources of dirt
- [ ] Establish cleaning routine
- [ ] Everyone responsible for their area

### Suggested Routine:
| Time | Action |
|------|--------|
| Start | Quick check |
| During | Clean while using |
| End | 5 min organization |
| Weekly | Deep cleaning |

---

## 4️⃣ SEIKETSU - Standardize
**Maintain the achieved order**

### How to standardize:
- Create visual checklists
- Define responsibilities
- Establish routines
- Document standards

### Actions:
- [ ] Photograph ideal state
- [ ] Create verification checklists
- [ ] Define responsibilities
- [ ] Schedule regular audits

### Checklist Example:
| Item | OK | Notes |
|------|-----|-------|
| Organized desk | ☐ | |
| Documents filed | ☐ | |
| Trash disposed | ☐ | |
| Equipment in place | ☐ | |

---

## 5️⃣ SHITSUKE - Sustain
**Transform into habit**

### Elements:
- Everyone's commitment
- Leadership example
- Continuous training
- Recognition

### Actions:
- [ ] Train all employees
- [ ] Leaders setting example
- [ ] Monthly audits
- [ ] Celebrate achievements

---

## 📈 Implementation Plan

### Week 1-2: SEIRI
Focus on sorting and classification

### Week 3-4: SEITON
Focus on organization and identification

### Week 5-6: SEISO
Focus on cleaning and routines

### Month 2: SEIKETSU
Focus on standardization

### Ongoing: SHITSUKE
Focus on maintenance and culture

---

## 📊 Success Indicators

| Indicator | Target | Measurement |
|-----------|--------|-------------|
| Search time | -50% | Timing |
| Space freed | +30% | Measure m² |
| Satisfaction | >80% | Survey |
| Audits | >85 pts | Checklist |
`;
  },

  getChecklist: (_ctx: OrchestratorContext, lang: "pt-br" | "en"): string[] => {
    return lang === "pt-br"
      ? [
          "SEIRI: Classificar e descartar itens desnecessários",
          "SEIRI: Aplicar etiquetas vermelhas em itens duvidosos",
          "SEITON: Definir lugar para cada item",
          "SEITON: Criar identificação visual",
          "SEISO: Realizar limpeza profunda",
          "SEISO: Estabelecer rotina de limpeza",
          "SEIKETSU: Fotografar estado ideal",
          "SEIKETSU: Criar checklists de verificação",
          "SHITSUKE: Treinar toda a equipe",
          "SHITSUKE: Realizar auditorias mensais",
        ]
      : [
          "SEIRI: Classify and discard unnecessary items",
          "SEIRI: Apply red tags to questionable items",
          "SEITON: Define place for each item",
          "SEITON: Create visual identification",
          "SEISO: Perform deep cleaning",
          "SEISO: Establish cleaning routine",
          "SEIKETSU: Photograph ideal state",
          "SEIKETSU: Create verification checklists",
          "SHITSUKE: Train entire team",
          "SHITSUKE: Conduct monthly audits",
        ];
  },

  getKnowledge: (lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# 5S

## O que é?
Metodologia japonesa de organização em 5 passos.

## Os 5 Sensos:
1. **Seiri (整理):** Utilização - separar necessário do desnecessário
2. **Seiton (整頓):** Organização - lugar para cada coisa
3. **Seiso (清掃):** Limpeza - manter limpo
4. **Seiketsu (清潔):** Padronização - criar padrões
5. **Shitsuke (躾):** Disciplina - manter hábitos

## Benefícios:
- Ambiente mais organizado
- Maior produtividade
- Menos acidentes
- Melhor qualidade
- Economia de tempo

## Aplicação:
- Escritórios
- Fábricas
- Computadores (5S digital)
- Qualquer ambiente
`
      : `# 5S

## What is it?
Japanese organization methodology in 5 steps.

## The 5 Pillars:
1. **Seiri (整理):** Sort - separate necessary from unnecessary
2. **Seiton (整頓):** Set in Order - a place for everything
3. **Seiso (清掃):** Shine - keep clean
4. **Seiketsu (清潔):** Standardize - create standards
5. **Shitsuke (躾):** Sustain - maintain habits

## Benefits:
- More organized environment
- Higher productivity
- Fewer accidents
- Better quality
- Time savings

## Application:
- Offices
- Factories
- Computers (digital 5S)
- Any environment
`;
  },
};

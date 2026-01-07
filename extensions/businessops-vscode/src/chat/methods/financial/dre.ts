/**
 * DRE - Income Statement
 */

import { BusinessMethod } from "../index";
import { OrchestratorContext } from "../../orchestrator";

export const dreMethod: BusinessMethod = {
  id: "dre",
  name: {
    "pt-br": "DRE - Demonstração do Resultado",
    "en": "Income Statement (P&L)",
  },
  description: {
    "pt-br": "Demonstração do Resultado do Exercício - análise de receitas e despesas.",
    "en": "Income Statement - analysis of revenues and expenses.",
  },
  category: "financial",
  outputType: "markdown",
  complexity: "basic",
  requiredData: [
    "company.finance.revenue_model",
    "company.finance.funding_status"
  ],
  tags: ["financial", "accounting", "profit", "revenue"],

  generate: (ctx: OrchestratorContext, lang: "pt-br" | "en"): string => {
    const c = ctx.company?.company || {};
    const meta = ctx.company?.meta || {};
    const companyName = meta.name || (lang === "pt-br" ? "Sua Empresa" : "Your Company");

    return lang === "pt-br"
      ? `# 📊 DRE - Demonstração do Resultado - ${companyName}

## Conceito
A DRE mostra as receitas, custos e despesas de um período, resultando no lucro ou prejuízo.

---

## 📋 Estrutura da DRE

| Linha | Descrição | Valor (R$) | % Receita |
|-------|-----------|------------|-----------|
| **(+) Receita Bruta** | Vendas totais | | 100% |
| **(-) Deduções** | Impostos, devoluções | | |
| **= Receita Líquida** | Receita após deduções | | |
| **(-) CPV/CMV** | Custo do produto/mercadoria | | |
| **= Lucro Bruto** | Margem bruta | | |
| **(-) Despesas Operacionais** | | | |
| &nbsp;&nbsp;&nbsp; Administrativas | Salários, aluguel, etc | | |
| &nbsp;&nbsp;&nbsp; Comerciais | Marketing, comissões | | |
| &nbsp;&nbsp;&nbsp; P&D | Pesquisa e desenvolvimento | | |
| **= EBITDA** | Lucro antes de juros, impostos, D&A | | |
| **(-) Depreciação/Amortização** | | | |
| **= EBIT** | Lucro operacional | | |
| **(-) Resultado Financeiro** | Juros pagos - recebidos | | |
| **= LAIR** | Lucro antes do IR | | |
| **(-) IR/CSLL** | Impostos sobre lucro | | |
| **= Lucro Líquido** | Resultado final | | |

---

## 📈 Indicadores-Chave

| Indicador | Fórmula | Benchmark |
|-----------|---------|-----------|
| **Margem Bruta** | Lucro Bruto / Receita | SaaS: >70% |
| **Margem EBITDA** | EBITDA / Receita | >20% |
| **Margem Líquida** | Lucro Líquido / Receita | >10% |
| **CAC** | Despesas Comerciais / Novos Clientes | < LTV/3 |

---

## 📊 Template para Preenchimento

### Receitas

| Item | Jan | Fev | Mar | Q1 |
|------|-----|-----|-----|-----|
| Produto/Serviço 1 | | | | |
| Produto/Serviço 2 | | | | |
| **Total Receita** | | | | |

### Custos Variáveis (CPV/CMV)

| Item | Jan | Fev | Mar | Q1 |
|------|-----|-----|-----|-----|
| Custo direto | | | | |
| Comissões | | | | |
| **Total CPV** | | | | |

### Despesas Fixas

| Item | Jan | Fev | Mar | Q1 |
|------|-----|-----|-----|-----|
| Salários | | | | |
| Aluguel | | | | |
| Marketing | | | | |
| Tecnologia | | | | |
| Outros | | | | |
| **Total Despesas** | | | | |

---

## 💡 Análise Vertical

Compare cada linha como % da Receita:

\`\`\`
Receita Bruta         ████████████████████ 100%
(-) Deduções          ██                    10%
Receita Líquida       ██████████████████   90%
(-) CPV               ██████                30%
Lucro Bruto           ████████████         60%
(-) Despesas Oper.    ████████             40%
EBITDA                ████                 20%
(-) D&A               █                     5%
EBIT                  ███                  15%
(-) Financeiro        █                     3%
LAIR                  ██                   12%
(-) Impostos          █                     4%
Lucro Líquido         ██                    8%
\`\`\`

---

## 💡 Análise Horizontal

Compare evolução período a período:

| Item | Q1 | Q2 | Var. |
|------|-----|-----|------|
| Receita | R$ 100k | R$ 120k | +20% |
| Custos | R$ 40k | R$ 45k | +12.5% |
| Lucro Bruto | R$ 60k | R$ 75k | +25% |

---

## ⚠️ Pontos de Atenção

1. **Receita crescendo, lucro caindo?** → Custos aumentando desproporcionalmente
2. **Margem bruta baixa?** → Revisar precificação ou custos
3. **Despesas operacionais altas?** → Buscar eficiência
4. **Resultado financeiro negativo?** → Endividamento alto

---

## 🔧 Próximos Passos

- [ ] Coletar dados do período
- [ ] Preencher template
- [ ] Calcular margens
- [ ] Comparar com períodos anteriores
- [ ] Identificar desvios
- [ ] Definir ações corretivas
`
      : `# 📊 Income Statement (P&L) - ${companyName}

## Concept
The Income Statement shows revenues, costs, and expenses for a period, resulting in profit or loss.

---

## 📋 Income Statement Structure

| Line | Description | Amount ($) | % Revenue |
|------|-------------|------------|-----------|
| **(+) Gross Revenue** | Total sales | | 100% |
| **(-) Deductions** | Taxes, returns | | |
| **= Net Revenue** | Revenue after deductions | | |
| **(-) COGS** | Cost of goods sold | | |
| **= Gross Profit** | Gross margin | | |
| **(-) Operating Expenses** | | | |
| &nbsp;&nbsp;&nbsp; Administrative | Salaries, rent, etc | | |
| &nbsp;&nbsp;&nbsp; Sales & Marketing | Marketing, commissions | | |
| &nbsp;&nbsp;&nbsp; R&D | Research and development | | |
| **= EBITDA** | Earnings before interest, taxes, D&A | | |
| **(-) Depreciation/Amortization** | | | |
| **= EBIT** | Operating income | | |
| **(-) Interest/Financial** | Interest paid - received | | |
| **= EBT** | Earnings before taxes | | |
| **(-) Income Tax** | Taxes on profit | | |
| **= Net Income** | Final result | | |

---

## 📈 Key Indicators

| Indicator | Formula | Benchmark |
|-----------|---------|-----------|
| **Gross Margin** | Gross Profit / Revenue | SaaS: >70% |
| **EBITDA Margin** | EBITDA / Revenue | >20% |
| **Net Margin** | Net Income / Revenue | >10% |
| **CAC** | Sales Expenses / New Customers | < LTV/3 |

---

## 📊 Template for Completion

### Revenues

| Item | Jan | Feb | Mar | Q1 |
|------|-----|-----|-----|-----|
| Product/Service 1 | | | | |
| Product/Service 2 | | | | |
| **Total Revenue** | | | | |

### Variable Costs (COGS)

| Item | Jan | Feb | Mar | Q1 |
|------|-----|-----|-----|-----|
| Direct cost | | | | |
| Commissions | | | | |
| **Total COGS** | | | | |

### Fixed Expenses

| Item | Jan | Feb | Mar | Q1 |
|------|-----|-----|-----|-----|
| Salaries | | | | |
| Rent | | | | |
| Marketing | | | | |
| Technology | | | | |
| Other | | | | |
| **Total Expenses** | | | | |

---

## 💡 Vertical Analysis

Compare each line as % of Revenue:

\`\`\`
Gross Revenue         ████████████████████ 100%
(-) Deductions        ██                    10%
Net Revenue           ██████████████████   90%
(-) COGS              ██████                30%
Gross Profit          ████████████         60%
(-) Operating Exp.    ████████             40%
EBITDA                ████                 20%
(-) D&A               █                     5%
EBIT                  ███                  15%
(-) Interest          █                     3%
EBT                   ██                   12%
(-) Taxes             █                     4%
Net Income            ██                    8%
\`\`\`

---

## 💡 Horizontal Analysis

Compare evolution period over period:

| Item | Q1 | Q2 | Var. |
|------|-----|-----|------|
| Revenue | $100k | $120k | +20% |
| Costs | $40k | $45k | +12.5% |
| Gross Profit | $60k | $75k | +25% |

---

## ⚠️ Warning Signs

1. **Revenue growing, profit falling?** → Costs increasing disproportionately
2. **Low gross margin?** → Review pricing or costs
3. **High operating expenses?** → Seek efficiency
4. **Negative financial result?** → High debt

---

## 🔧 Next Steps

- [ ] Collect period data
- [ ] Fill in template
- [ ] Calculate margins
- [ ] Compare with previous periods
- [ ] Identify deviations
- [ ] Define corrective actions
`;
  },

  getChecklist: (_ctx: OrchestratorContext, lang: "pt-br" | "en"): string[] => {
    return lang === "pt-br"
      ? [
          "Registrar todas as receitas do período",
          "Calcular deduções (impostos sobre vendas)",
          "Apurar custos de produtos/serviços vendidos",
          "Listar despesas operacionais",
          "Calcular EBITDA",
          "Incluir depreciação e amortização",
          "Calcular resultado financeiro",
          "Apurar impostos sobre o lucro",
          "Analisar margens e tendências",
        ]
      : [
          "Record all revenues for the period",
          "Calculate deductions (sales taxes)",
          "Calculate cost of goods/services sold",
          "List operating expenses",
          "Calculate EBITDA",
          "Include depreciation and amortization",
          "Calculate financial result",
          "Calculate income taxes",
          "Analyze margins and trends",
        ];
  },

  getKnowledge: (lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# DRE - Demonstração do Resultado

## O que é?
Relatório contábil que mostra o resultado (lucro/prejuízo) de um período.

## Estrutura:
- Receita Bruta → Receita Líquida → Lucro Bruto → EBITDA → EBIT → Lucro Líquido

## Principais Margens:
- **Margem Bruta:** Lucro Bruto / Receita
- **Margem EBITDA:** EBITDA / Receita
- **Margem Líquida:** Lucro Líquido / Receita

## Análises:
- **Vertical:** Cada item como % da receita
- **Horizontal:** Evolução período a período

## Periodicidade:
Mensal, trimestral, anual
`
      : `# Income Statement (P&L)

## What is it?
Accounting report showing the result (profit/loss) for a period.

## Structure:
- Gross Revenue → Net Revenue → Gross Profit → EBITDA → EBIT → Net Income

## Main Margins:
- **Gross Margin:** Gross Profit / Revenue
- **EBITDA Margin:** EBITDA / Revenue
- **Net Margin:** Net Income / Revenue

## Analyses:
- **Vertical:** Each item as % of revenue
- **Horizontal:** Evolution period over period

## Periodicity:
Monthly, quarterly, annually
`;
  },
};

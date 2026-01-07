/**
 * Balance Sheet
 */

import { BusinessMethod } from "../index";
import { OrchestratorContext } from "../../orchestrator";

export const balanceSheetMethod: BusinessMethod = {
  id: "balance-sheet",
  name: {
    "pt-br": "Balanço Patrimonial",
    "en": "Balance Sheet",
  },
  description: {
    "pt-br": "Demonstração da posição patrimonial e financeira em uma data.",
    "en": "Statement of financial position at a specific date.",
  },
  category: "financial",
  outputType: "markdown",
  complexity: "intermediate",
  requiredData: [
    "company.finance.funding_status",
    "company.identity.stage"
  ],
  tags: ["financial", "accounting", "assets", "liabilities"],

  generate: (ctx: OrchestratorContext, lang: "pt-br" | "en"): string => {
    const meta = ctx.company?.meta || {};
    const companyName = meta.name || (lang === "pt-br" ? "Sua Empresa" : "Your Company");

    return lang === "pt-br"
      ? `# 📊 Balanço Patrimonial - ${companyName}

## Conceito
O Balanço Patrimonial mostra a posição financeira da empresa em uma data específica.

**Equação Fundamental:** ATIVO = PASSIVO + PATRIMÔNIO LÍQUIDO

---

## 📋 Estrutura do Balanço

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    BALANÇO PATRIMONIAL                      │
│                    Data: ___/___/______                     │
├──────────────────────────┬──────────────────────────────────┤
│         ATIVO            │    PASSIVO + PAT. LÍQUIDO        │
├──────────────────────────┼──────────────────────────────────┤
│ ATIVO CIRCULANTE         │ PASSIVO CIRCULANTE               │
│  • Caixa                 │  • Fornecedores                  │
│  • Bancos                │  • Salários a pagar              │
│  • Contas a receber      │  • Impostos a pagar              │
│  • Estoques              │  • Empréstimos CP                │
│                          │                                  │
│ ATIVO NÃO-CIRCULANTE     │ PASSIVO NÃO-CIRCULANTE          │
│  • Realizável LP         │  • Empréstimos LP                │
│  • Investimentos         │  • Financiamentos                │
│  • Imobilizado           │                                  │
│  • Intangível            │ PATRIMÔNIO LÍQUIDO              │
│                          │  • Capital social                │
│                          │  • Reservas                      │
│                          │  • Lucros acumulados             │
├──────────────────────────┼──────────────────────────────────┤
│ TOTAL ATIVO: R$ _____    │ TOTAL PASSIVO + PL: R$ _____    │
└──────────────────────────┴──────────────────────────────────┘
\`\`\`

---

## 📊 Template para Preenchimento

### ATIVO

| Conta | Valor (R$) | % Total |
|-------|------------|---------|
| **ATIVO CIRCULANTE** | | |
| Caixa e equivalentes | | |
| Contas a receber | | |
| Estoques | | |
| Outros circulantes | | |
| **Subtotal Circulante** | | |
| **ATIVO NÃO-CIRCULANTE** | | |
| Realizável a longo prazo | | |
| Investimentos | | |
| Imobilizado | | |
| Intangível | | |
| **Subtotal Não-Circulante** | | |
| **TOTAL DO ATIVO** | | 100% |

### PASSIVO

| Conta | Valor (R$) | % Total |
|-------|------------|---------|
| **PASSIVO CIRCULANTE** | | |
| Fornecedores | | |
| Salários a pagar | | |
| Impostos a pagar | | |
| Empréstimos curto prazo | | |
| **Subtotal Circulante** | | |
| **PASSIVO NÃO-CIRCULANTE** | | |
| Empréstimos longo prazo | | |
| Financiamentos | | |
| Provisões | | |
| **Subtotal Não-Circulante** | | |
| **PATRIMÔNIO LÍQUIDO** | | |
| Capital social | | |
| Reservas de capital | | |
| Lucros acumulados | | |
| **Subtotal PL** | | |
| **TOTAL PASSIVO + PL** | | 100% |

---

## 📈 Indicadores de Análise

| Indicador | Fórmula | Benchmark |
|-----------|---------|-----------|
| **Liquidez Corrente** | AC / PC | >1,5 |
| **Liquidez Seca** | (AC - Estoques) / PC | >1,0 |
| **Liquidez Imediata** | Caixa / PC | >0,2 |
| **Endividamento** | Passivo / Ativo | <50% |
| **Composição Endividamento** | PC / (PC + PNC) | <60% |
| **ROE** | Lucro Líquido / PL | >15% |
| **ROA** | Lucro Líquido / Ativo | >10% |

Legenda: AC = Ativo Circulante, PC = Passivo Circulante, PNC = Passivo Não-Circulante

---

## 💡 Análise da Estrutura

### Composição do Ativo
\`\`\`
Ativo Circulante      ████████████     60%
Ativo Não-Circulante  ████████         40%
\`\`\`

### Composição do Financiamento
\`\`\`
Passivo Circulante    ████████         40%
Passivo Não-Circulante████             20%
Patrimônio Líquido    ████████         40%
\`\`\`

---

## ⚠️ Pontos de Atenção

1. **Liquidez baixa?** → Risco de não pagar dívidas de curto prazo
2. **Endividamento alto?** → Dependência de terceiros
3. **PL negativo?** → Empresa tecnicamente insolvente
4. **Imobilizado excessivo?** → Capital imobilizado, pouca flexibilidade

---

## 🔧 Próximos Passos

- [ ] Coletar saldos de todas as contas
- [ ] Verificar se Ativo = Passivo + PL
- [ ] Calcular indicadores de liquidez
- [ ] Analisar estrutura de capital
- [ ] Comparar com períodos anteriores
`
      : `# 📊 Balance Sheet - ${companyName}

## Concept
The Balance Sheet shows the financial position of the company at a specific date.

**Fundamental Equation:** ASSETS = LIABILITIES + EQUITY

---

## 📋 Balance Sheet Structure

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                      BALANCE SHEET                          │
│                    Date: ___/___/______                     │
├──────────────────────────┬──────────────────────────────────┤
│         ASSETS           │    LIABILITIES + EQUITY          │
├──────────────────────────┼──────────────────────────────────┤
│ CURRENT ASSETS           │ CURRENT LIABILITIES              │
│  • Cash                  │  • Accounts payable              │
│  • Bank accounts         │  • Accrued wages                 │
│  • Accounts receivable   │  • Taxes payable                 │
│  • Inventory             │  • Short-term loans              │
│                          │                                  │
│ NON-CURRENT ASSETS       │ NON-CURRENT LIABILITIES         │
│  • Long-term receivables │  • Long-term loans               │
│  • Investments           │  • Bonds payable                 │
│  • Property & equipment  │                                  │
│  • Intangibles           │ SHAREHOLDERS' EQUITY             │
│                          │  • Share capital                 │
│                          │  • Reserves                      │
│                          │  • Retained earnings             │
├──────────────────────────┼──────────────────────────────────┤
│ TOTAL ASSETS: $ _____    │ TOTAL LIAB + EQUITY: $ _____    │
└──────────────────────────┴──────────────────────────────────┘
\`\`\`

---

## 📊 Template for Completion

### ASSETS

| Account | Amount ($) | % Total |
|---------|------------|---------|
| **CURRENT ASSETS** | | |
| Cash and equivalents | | |
| Accounts receivable | | |
| Inventory | | |
| Other current assets | | |
| **Subtotal Current** | | |
| **NON-CURRENT ASSETS** | | |
| Long-term receivables | | |
| Investments | | |
| Property & equipment | | |
| Intangibles | | |
| **Subtotal Non-Current** | | |
| **TOTAL ASSETS** | | 100% |

### LIABILITIES

| Account | Amount ($) | % Total |
|---------|------------|---------|
| **CURRENT LIABILITIES** | | |
| Accounts payable | | |
| Accrued wages | | |
| Taxes payable | | |
| Short-term loans | | |
| **Subtotal Current** | | |
| **NON-CURRENT LIABILITIES** | | |
| Long-term loans | | |
| Bonds payable | | |
| Provisions | | |
| **Subtotal Non-Current** | | |
| **SHAREHOLDERS' EQUITY** | | |
| Share capital | | |
| Capital reserves | | |
| Retained earnings | | |
| **Subtotal Equity** | | |
| **TOTAL LIAB + EQUITY** | | 100% |

---

## 📈 Analysis Indicators

| Indicator | Formula | Benchmark |
|-----------|---------|-----------|
| **Current Ratio** | CA / CL | >1.5 |
| **Quick Ratio** | (CA - Inventory) / CL | >1.0 |
| **Cash Ratio** | Cash / CL | >0.2 |
| **Debt Ratio** | Liabilities / Assets | <50% |
| **Debt Composition** | CL / (CL + NCL) | <60% |
| **ROE** | Net Income / Equity | >15% |
| **ROA** | Net Income / Assets | >10% |

Legend: CA = Current Assets, CL = Current Liabilities, NCL = Non-Current Liabilities

---

## ⚠️ Warning Signs

1. **Low liquidity?** → Risk of not paying short-term debts
2. **High debt?** → Dependency on third parties
3. **Negative equity?** → Technically insolvent
4. **Excessive fixed assets?** → Capital locked up, low flexibility
`;
  },

  getKnowledge: (lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# Balanço Patrimonial

## O que é?
Demonstração financeira que mostra a posição patrimonial em uma data.

## Equação:
ATIVO = PASSIVO + PATRIMÔNIO LÍQUIDO

## Componentes:
- **Ativo:** Bens e direitos
- **Passivo:** Obrigações com terceiros
- **Patrimônio Líquido:** Recursos dos sócios

## Classificação:
- **Circulante:** Realizável em até 12 meses
- **Não-Circulante:** Realizável após 12 meses

## Indicadores:
- Liquidez (corrente, seca, imediata)
- Endividamento
- ROE, ROA
`
      : `# Balance Sheet

## What is it?
Financial statement showing financial position at a date.

## Equation:
ASSETS = LIABILITIES + EQUITY

## Components:
- **Assets:** Resources owned
- **Liabilities:** Obligations to third parties
- **Equity:** Owners' resources

## Classification:
- **Current:** Realizable within 12 months
- **Non-Current:** Realizable after 12 months

## Indicators:
- Liquidity (current, quick, cash)
- Debt ratios
- ROE, ROA
`;
  },
};

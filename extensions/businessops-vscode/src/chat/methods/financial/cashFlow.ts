/**
 * Cash Flow Statement
 */

import { BusinessMethod } from "../index";
import { OrchestratorContext } from "../../orchestrator";

export const cashFlowMethod: BusinessMethod = {
  id: "cash-flow",
  name: {
    "pt-br": "Fluxo de Caixa",
    "en": "Cash Flow Statement",
  },
  description: {
    "pt-br": "Demonstração dos fluxos de entrada e saída de caixa.",
    "en": "Statement of cash inflows and outflows.",
  },
  category: "financial",
  outputType: "markdown",
  complexity: "intermediate",
  requiredData: [
    "company.finance.runway",
    "company.finance.payment_methods"
  ],
  tags: ["financial", "cash", "liquidity", "planning"],

  generate: (ctx: OrchestratorContext, lang: "pt-br" | "en"): string => {
    const meta = ctx.company?.meta || {};
    const companyName = meta.name || (lang === "pt-br" ? "Sua Empresa" : "Your Company");

    return lang === "pt-br"
      ? `# 💰 Fluxo de Caixa - ${companyName}

## Conceito
O Fluxo de Caixa mostra as entradas e saídas de dinheiro em um período, classificadas em três atividades.

---

## 📊 Estrutura do Fluxo de Caixa

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DE CAIXA                           │
├─────────────────────────────────────────────────────────────┤
│  📥 ATIVIDADES OPERACIONAIS                                 │
│     Recebimentos de clientes                                │
│     Pagamentos a fornecedores e funcionários                │
│     Outros pagamentos operacionais                          │
│     = Caixa líquido das operações                           │
├─────────────────────────────────────────────────────────────┤
│  🏗️ ATIVIDADES DE INVESTIMENTO                              │
│     Compra de equipamentos                                  │
│     Venda de ativos                                         │
│     Investimentos financeiros                               │
│     = Caixa líquido de investimentos                        │
├─────────────────────────────────────────────────────────────┤
│  🏦 ATIVIDADES DE FINANCIAMENTO                             │
│     Empréstimos obtidos                                     │
│     Pagamento de empréstimos                                │
│     Aporte de capital                                       │
│     Dividendos pagos                                        │
│     = Caixa líquido de financiamento                        │
├─────────────────────────────────────────────────────────────┤
│  = VARIAÇÃO LÍQUIDA DO CAIXA                                │
│  + SALDO INICIAL                                            │
│  = SALDO FINAL                                              │
└─────────────────────────────────────────────────────────────┘
\`\`\`

---

## 📋 Template de Fluxo de Caixa

### Mês: ___________

| Categoria | Valor (R$) |
|-----------|------------|
| **SALDO INICIAL** | |
| | |
| **ATIVIDADES OPERACIONAIS** | |
| (+) Recebimento de vendas | |
| (+) Outros recebimentos | |
| (-) Pagamento a fornecedores | |
| (-) Salários e encargos | |
| (-) Impostos | |
| (-) Aluguel e utilidades | |
| (-) Marketing | |
| (-) Outros operacionais | |
| **= Subtotal Operacional** | |
| | |
| **ATIVIDADES DE INVESTIMENTO** | |
| (-) Compra de equipamentos | |
| (-) Desenvolvimento de software | |
| (+) Venda de ativos | |
| **= Subtotal Investimento** | |
| | |
| **ATIVIDADES DE FINANCIAMENTO** | |
| (+) Empréstimos obtidos | |
| (+) Aporte de sócios | |
| (-) Pagamento de empréstimos | |
| (-) Distribuição de lucros | |
| **= Subtotal Financiamento** | |
| | |
| **= VARIAÇÃO DO PERÍODO** | |
| **SALDO FINAL** | |

---

## 📈 Fluxo de Caixa Projetado (12 meses)

| Mês | Operacional | Investimento | Financiamento | Saldo |
|-----|-------------|--------------|---------------|-------|
| M1 | | | | |
| M2 | | | | |
| M3 | | | | |
| M4 | | | | |
| M5 | | | | |
| M6 | | | | |
| M7 | | | | |
| M8 | | | | |
| M9 | | | | |
| M10 | | | | |
| M11 | | | | |
| M12 | | | | |

---

## 📊 Indicadores de Caixa

| Indicador | Fórmula | Meta |
|-----------|---------|------|
| **Burn Rate** | Saídas mensais | Estável/Reduzindo |
| **Runway** | Caixa / Burn Rate | >12 meses |
| **FCO positivo** | Fluxo operacional | >0 |
| **Dias de caixa** | Caixa / (Despesas/30) | >60 dias |

---

## 💡 Análise Visual

### Fluxo por Tipo
\`\`\`
Operacional:   ████████████████  R$ 50.000
Investimento:  ████▌             R$ -15.000
Financiamento: ██████            R$ -20.000
─────────────────────────────────────────────
Variação:      ████████          R$ 15.000
\`\`\`

### Saldo Projetado
\`\`\`
M1  ████████████████████████  R$ 100k
M2  ██████████████████████    R$ 90k
M3  ████████████████████      R$ 80k
M4  ██████████████████        R$ 75k
M5  ████████████████████      R$ 80k  ← Ponto de virada
M6  ██████████████████████    R$ 90k
\`\`\`

---

## ⚠️ Alertas de Caixa

1. **FCO negativo contínuo** → Operação não gera caixa
2. **Runway < 6 meses** → Urgente buscar capital
3. **Dependência de financiamento** → Modelo não sustentável
4. **Sazonalidade** → Planejar reservas

---

## 🔧 Modelo de Gestão

### Diário
- [ ] Conferir saldo bancário
- [ ] Registrar movimentações

### Semanal
- [ ] Projetar próximos 30 dias
- [ ] Identificar gaps

### Mensal
- [ ] Analisar realizado vs. projetado
- [ ] Atualizar projeção 12 meses
- [ ] Revisar runway
`
      : `# 💰 Cash Flow Statement - ${companyName}

## Concept
The Cash Flow Statement shows cash inflows and outflows in a period, classified into three activities.

---

## 📊 Cash Flow Structure

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                    CASH FLOW STATEMENT                      │
├─────────────────────────────────────────────────────────────┤
│  📥 OPERATING ACTIVITIES                                    │
│     Receipts from customers                                 │
│     Payments to suppliers and employees                     │
│     Other operating payments                                │
│     = Net cash from operations                              │
├─────────────────────────────────────────────────────────────┤
│  🏗️ INVESTING ACTIVITIES                                    │
│     Purchase of equipment                                   │
│     Sale of assets                                          │
│     Financial investments                                   │
│     = Net cash from investing                               │
├─────────────────────────────────────────────────────────────┤
│  🏦 FINANCING ACTIVITIES                                    │
│     Loans obtained                                          │
│     Loan repayments                                         │
│     Capital contributions                                   │
│     Dividends paid                                          │
│     = Net cash from financing                               │
├─────────────────────────────────────────────────────────────┤
│  = NET CHANGE IN CASH                                       │
│  + BEGINNING BALANCE                                        │
│  = ENDING BALANCE                                           │
└─────────────────────────────────────────────────────────────┘
\`\`\`

---

## 📋 Cash Flow Template

### Month: ___________

| Category | Amount ($) |
|----------|------------|
| **BEGINNING BALANCE** | |
| | |
| **OPERATING ACTIVITIES** | |
| (+) Sales receipts | |
| (+) Other receipts | |
| (-) Supplier payments | |
| (-) Salaries and benefits | |
| (-) Taxes | |
| (-) Rent and utilities | |
| (-) Marketing | |
| (-) Other operating | |
| **= Operating Subtotal** | |
| | |
| **INVESTING ACTIVITIES** | |
| (-) Equipment purchases | |
| (-) Software development | |
| (+) Asset sales | |
| **= Investing Subtotal** | |
| | |
| **FINANCING ACTIVITIES** | |
| (+) Loans obtained | |
| (+) Capital contributions | |
| (-) Loan repayments | |
| (-) Profit distribution | |
| **= Financing Subtotal** | |
| | |
| **= PERIOD CHANGE** | |
| **ENDING BALANCE** | |

---

## 📈 Projected Cash Flow (12 months)

| Month | Operating | Investing | Financing | Balance |
|-------|-----------|-----------|-----------|---------|
| M1 | | | | |
| M2 | | | | |
| M3 | | | | |
| M4 | | | | |
| M5 | | | | |
| M6 | | | | |
| M7 | | | | |
| M8 | | | | |
| M9 | | | | |
| M10 | | | | |
| M11 | | | | |
| M12 | | | | |

---

## 📊 Cash Indicators

| Indicator | Formula | Target |
|-----------|---------|--------|
| **Burn Rate** | Monthly outflows | Stable/Reducing |
| **Runway** | Cash / Burn Rate | >12 months |
| **Positive CFO** | Operating cash flow | >0 |
| **Days of cash** | Cash / (Expenses/30) | >60 days |

---

## ⚠️ Cash Alerts

1. **Continuous negative CFO** → Operations not generating cash
2. **Runway < 6 months** → Urgent need for capital
3. **Financing dependency** → Unsustainable model
4. **Seasonality** → Plan for reserves

---

## 🔧 Management Model

### Daily
- [ ] Check bank balance
- [ ] Record transactions

### Weekly
- [ ] Project next 30 days
- [ ] Identify gaps

### Monthly
- [ ] Analyze actual vs. projected
- [ ] Update 12-month projection
- [ ] Review runway
`;
  },

  getKnowledge: (lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# Fluxo de Caixa

## O que é?
Demonstração das entradas e saídas de dinheiro.

## Tipos:
- **Direto:** Registra movimentações reais
- **Indireto:** Parte do lucro e ajusta

## Atividades:
1. **Operacionais:** Dia a dia do negócio
2. **Investimento:** Compra/venda de ativos
3. **Financiamento:** Empréstimos, aportes, dividendos

## Métricas:
- **Burn Rate:** Quanto gasta por mês
- **Runway:** Meses de sobrevivência
- **FCO:** Fluxo de caixa operacional

## Importância:
"Lucro é opinião, caixa é fato"
`
      : `# Cash Flow

## What is it?
Statement of cash inflows and outflows.

## Types:
- **Direct:** Records actual transactions
- **Indirect:** Starts from profit and adjusts

## Activities:
1. **Operating:** Day-to-day business
2. **Investing:** Asset purchases/sales
3. **Financing:** Loans, contributions, dividends

## Metrics:
- **Burn Rate:** Monthly spending
- **Runway:** Months of survival
- **CFO:** Cash flow from operations

## Importance:
"Profit is opinion, cash is fact"
`;
  },
};

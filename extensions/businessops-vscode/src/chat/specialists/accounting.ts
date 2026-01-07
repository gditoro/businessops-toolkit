/**
 * Accounting Specialist Agent
 *
 * Focus areas: Bookkeeping, tax compliance, financial reporting,
 * chart of accounts, cost accounting, auditing preparation.
 */

import { OrchestratorContext } from "../orchestrator";
import { getSpecialistMethodRecommendations, formatMethodSuggestions } from "../methodAdvisor";

export interface AccountingAdvice {
  topic: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
  category: "tax" | "bookkeeping" | "reporting" | "compliance" | "cost" | "audit";
}

export function generateAccountingAnalysis(
  ctx: OrchestratorContext,
  lang: "pt-br" | "en"
): string {
  const company = ctx.company?.company || {};
  const stage = ctx.stage || company.stage || "idea";
  const country = ctx.country_mode || company.country || "BR";
  const employees = company.employees?.current || 0;
  const sector = ctx.industry || company.sector || "general";
  const businessModel = ctx.business_model || company.business_model || "b2b";

  if (lang === "pt-br") {
    return `# 📒 Análise Contábil

## Perfil da Empresa
- **Estágio:** ${translateStage(stage, lang)}
- **Funcionários:** ${employees}
- **País:** ${country}
- **Setor:** ${sector}

---

## 📊 Regime Tributário Recomendado

${getTaxRegimeRecommendation(stage, employees, country, lang)}

---

## 📋 Plano de Contas Essencial

### Ativo
| Código | Conta | Descrição |
|--------|-------|-----------|
| 1.1 | Ativo Circulante | Bens de curto prazo |
| 1.1.1 | Caixa e Equivalentes | Dinheiro disponível |
| 1.1.2 | Contas a Receber | Vendas a prazo |
| 1.1.3 | Estoques | Mercadorias para venda |
| 1.2 | Ativo Não Circulante | Bens de longo prazo |
| 1.2.1 | Imobilizado | Máquinas, equipamentos |
| 1.2.2 | Intangível | Software, marcas |

### Passivo
| Código | Conta | Descrição |
|--------|-------|-----------|
| 2.1 | Passivo Circulante | Obrigações de curto prazo |
| 2.1.1 | Fornecedores | Compras a prazo |
| 2.1.2 | Obrigações Trabalhistas | Salários, FGTS |
| 2.1.3 | Obrigações Fiscais | Impostos a pagar |
| 2.2 | Passivo Não Circulante | Dívidas de longo prazo |

### Patrimônio Líquido
| Código | Conta | Descrição |
|--------|-------|-----------|
| 3.1 | Capital Social | Investimento dos sócios |
| 3.2 | Reservas | Lucros retidos |
| 3.3 | Prejuízos Acumulados | Perdas acumuladas |

### Resultado
| Código | Conta | Descrição |
|--------|-------|-----------|
| 4.1 | Receita Bruta | Vendas totais |
| 4.2 | Deduções | Impostos sobre vendas |
| 5.1 | CMV/CPV | Custo da mercadoria |
| 5.2 | Despesas Operacionais | Salários, aluguel, etc. |
| 5.3 | Despesas Financeiras | Juros, taxas |

---

## 🗓️ Calendário Fiscal

${getFiscalCalendar(country, lang)}

---

## 📈 Indicadores Contábeis Essenciais

${getAccountingKPIs(lang)}

---

## ✅ Checklist de Conformidade

${getComplianceChecklist(stage, employees, country, lang)}

---

## 🎯 Recomendações por Estágio

${getStageRecommendations(stage, lang)}

---

## 💡 Boas Práticas

1. **Separação de contas:** Nunca misture pessoal e empresa
2. **Documentação:** Guarde todos os comprovantes por 5 anos
3. **Conciliação:** Faça conciliação bancária mensal
4. **Backup:** Mantenha backup dos dados contábeis
5. **Atualização:** Revise o plano de contas anualmente

---

## ⚠️ Alertas para seu Estágio

${getStageAlerts(stage, employees, country, lang)}

${formatMethodSuggestions(getSpecialistMethodRecommendations(ctx, "ACCOUNTING"), lang)}
`;
  } else {
    return `# 📒 Accounting Analysis

## Company Profile
- **Stage:** ${translateStage(stage, lang)}
- **Employees:** ${employees}
- **Country:** ${country}
- **Sector:** ${sector}

---

## 📊 Recommended Tax Regime

${getTaxRegimeRecommendation(stage, employees, country, lang)}

---

## 📋 Essential Chart of Accounts

### Assets
| Code | Account | Description |
|------|---------|-------------|
| 1.1 | Current Assets | Short-term assets |
| 1.1.1 | Cash & Equivalents | Available cash |
| 1.1.2 | Accounts Receivable | Credit sales |
| 1.1.3 | Inventory | Goods for sale |
| 1.2 | Non-Current Assets | Long-term assets |
| 1.2.1 | Fixed Assets | Machinery, equipment |
| 1.2.2 | Intangible | Software, brands |

### Liabilities
| Code | Account | Description |
|------|---------|-------------|
| 2.1 | Current Liabilities | Short-term obligations |
| 2.1.1 | Accounts Payable | Credit purchases |
| 2.1.2 | Payroll Liabilities | Wages, benefits |
| 2.1.3 | Tax Liabilities | Taxes payable |
| 2.2 | Non-Current Liabilities | Long-term debt |

### Equity
| Code | Account | Description |
|------|---------|-------------|
| 3.1 | Share Capital | Owner investment |
| 3.2 | Retained Earnings | Accumulated profits |
| 3.3 | Accumulated Deficit | Accumulated losses |

### Income Statement
| Code | Account | Description |
|------|---------|-------------|
| 4.1 | Gross Revenue | Total sales |
| 4.2 | Deductions | Sales taxes |
| 5.1 | COGS | Cost of goods sold |
| 5.2 | Operating Expenses | Salaries, rent, etc. |
| 5.3 | Financial Expenses | Interest, fees |

---

## 🗓️ Fiscal Calendar

${getFiscalCalendar(country, lang)}

---

## 📈 Essential Accounting KPIs

${getAccountingKPIs(lang)}

---

## ✅ Compliance Checklist

${getComplianceChecklist(stage, employees, country, lang)}

---

## 🎯 Stage-Specific Recommendations

${getStageRecommendations(stage, lang)}

---

## 💡 Best Practices

1. **Account separation:** Never mix personal and business
2. **Documentation:** Keep all receipts for 5+ years
3. **Reconciliation:** Do monthly bank reconciliation
4. **Backup:** Maintain accounting data backups
5. **Review:** Update chart of accounts annually

---

## ⚠️ Alerts for Your Stage

${getStageAlerts(stage, employees, country, lang)}

${formatMethodSuggestions(getSpecialistMethodRecommendations(ctx, "ACCOUNTING"), lang)}
`;
  }
}

function translateStage(stage: string, lang: "pt-br" | "en"): string {
  const stages: Record<string, Record<string, string>> = {
    idea: { "pt-br": "Ideia", en: "Idea" },
    mvp: { "pt-br": "MVP", en: "MVP" },
    traction: { "pt-br": "Tração", en: "Traction" },
    growth: { "pt-br": "Crescimento", en: "Growth" },
    scale: { "pt-br": "Escala", en: "Scale" },
    mature: { "pt-br": "Maturidade", en: "Mature" },
  };
  return stages[stage]?.[lang] || stage;
}

function getTaxRegimeRecommendation(
  stage: string,
  employees: number,
  country: string,
  lang: "pt-br" | "en"
): string {
  if (country === "BR") {
    if (lang === "pt-br") {
      if (stage === "idea" || stage === "mvp") {
        return `### MEI (Microempreendedor Individual)
- **Faturamento máximo:** R$ 81.000/ano
- **Custo fixo mensal:** ~R$ 70
- **Ideal para:** Início de operação, validação

### Simples Nacional (após formalização)
- **Faturamento máximo:** R$ 4,8 milhões/ano
- **Alíquota inicial:** 4% a 15% (depende do anexo)
- **Vantagem:** Imposto único, menos burocracia`;
      } else if (stage === "traction" || stage === "growth") {
        return `### Simples Nacional
- **Faturamento máximo:** R$ 4,8 milhões/ano
- **Alíquotas:** Variam por faixa e anexo
- **Recomendado quando:** Margens baixas, folha salarial alta

### Lucro Presumido
- **Faturamento máximo:** R$ 78 milhões/ano
- **Base de cálculo:** Presunção sobre receita
- **Recomendado quando:** Margens altas, menos despesas

⚠️ **Faça simulação comparativa antes de escolher!**`;
      } else {
        return `### Lucro Presumido
- **Faturamento máximo:** R$ 78 milhões/ano
- **Ideal para:** Empresas com margens altas

### Lucro Real
- **Obrigatório para:** Faturamento > R$ 78 milhões
- **Vantagem:** Tributa o lucro efetivo
- **Complexidade:** Requer contabilidade robusta

⚠️ **Avalie com contador especializado!**`;
      }
    } else {
      return `### Tax Regime Options (Brazil)
Based on your stage (${stage}) and size (${employees} employees):

- **Simples Nacional:** Unified tax for small businesses
- **Lucro Presumido:** Presumed profit margin taxation
- **Lucro Real:** Actual profit taxation

⚠️ Consult a local accountant for the best option.`;
    }
  } else if (country === "US") {
    if (lang === "en") {
      return `### LLC (Limited Liability Company)
- **Pass-through taxation:** Profits taxed on personal return
- **Flexibility:** Can elect S-Corp or C-Corp status
- **Best for:** Most startups

### S-Corporation
- **Self-employment savings:** Salary + distributions
- **Requirements:** US shareholders, max 100
- **Best for:** Profitable companies with owner salaries

### C-Corporation
- **Separate taxation:** 21% federal rate
- **Double taxation:** On dividends
- **Best for:** Seeking VC investment, going public`;
    }
  }

  return lang === "pt-br"
    ? "Consulte um contador local para recomendações específicas do seu país."
    : "Consult a local accountant for country-specific recommendations.";
}

function getFiscalCalendar(country: string, lang: "pt-br" | "en"): string {
  if (country === "BR") {
    if (lang === "pt-br") {
      return `| Obrigação | Periodicidade | Prazo |
|-----------|---------------|-------|
| DAS (Simples) | Mensal | Dia 20 |
| IRRF | Mensal | Dia 20 |
| FGTS | Mensal | Dia 7 |
| GPS (INSS) | Mensal | Dia 20 |
| DCTF | Mensal | Dia 15 |
| EFD-Contribuições | Mensal | Dia 10 |
| ECF | Anual | Julho |
| ECD | Anual | Maio |
| DIRF | Anual | Fevereiro |
| RAIS | Anual | Março |`;
    } else {
      return `| Obligation | Frequency | Deadline |
|------------|-----------|----------|
| DAS (Simples) | Monthly | 20th |
| IRRF | Monthly | 20th |
| FGTS | Monthly | 7th |
| GPS (INSS) | Monthly | 20th |
| DCTF | Monthly | 15th |
| EFD-Contributions | Monthly | 10th |
| ECF | Annual | July |
| ECD | Annual | May |
| DIRF | Annual | February |
| RAIS | Annual | March |`;
    }
  } else if (country === "US") {
    return lang === "en"
      ? `| Obligation | Frequency | Deadline |
|------------|-----------|----------|
| Payroll Taxes | Bi-weekly/Monthly | Per schedule |
| Quarterly Estimates | Quarterly | 15th of Apr, Jun, Sep, Jan |
| Form 941 | Quarterly | End of month after quarter |
| W-2/W-3 | Annual | January 31 |
| 1099s | Annual | January 31 |
| Corporate Tax | Annual | April 15 (or March 15 S-Corp) |
| Form 5500 (401k) | Annual | July 31 |`
      : `| Obrigação | Periodicidade | Prazo |
|-----------|---------------|-------|
| Payroll Taxes | Quinzenal/Mensal | Conforme calendário |
| Quarterly Estimates | Trimestral | Dia 15 Abr, Jun, Set, Jan |
| Form 941 | Trimestral | Fim do mês após trimestre |
| W-2/W-3 | Anual | 31 de Janeiro |`;
  }

  return lang === "pt-br"
    ? "Verifique o calendário fiscal do seu país."
    : "Check the fiscal calendar for your country.";
}

function getAccountingKPIs(lang: "pt-br" | "en"): string {
  if (lang === "pt-br") {
    return `| Indicador | Fórmula | Meta |
|-----------|---------|------|
| Margem Bruta | (Receita - CMV) / Receita | > 40% |
| Margem Líquida | Lucro Líquido / Receita | > 10% |
| Liquidez Corrente | Ativo Circulante / Passivo Circulante | > 1,5 |
| Endividamento | Passivo Total / Ativo Total | < 50% |
| ROE | Lucro Líquido / PL | > 15% |
| Ciclo Operacional | PMR + PME | < 60 dias |
| Ciclo Financeiro | Ciclo Op. - PMP | < 30 dias |`;
  } else {
    return `| Indicator | Formula | Target |
|-----------|---------|--------|
| Gross Margin | (Revenue - COGS) / Revenue | > 40% |
| Net Margin | Net Income / Revenue | > 10% |
| Current Ratio | Current Assets / Current Liabilities | > 1.5 |
| Debt Ratio | Total Liabilities / Total Assets | < 50% |
| ROE | Net Income / Equity | > 15% |
| Operating Cycle | DSO + DIO | < 60 days |
| Cash Conversion | Op. Cycle - DPO | < 30 days |`;
  }
}

function getComplianceChecklist(
  stage: string,
  employees: number,
  country: string,
  lang: "pt-br" | "en"
): string {
  if (lang === "pt-br") {
    let checklist = `### Básico
- [ ] CNPJ ativo e regularizado
- [ ] Contrato social atualizado
- [ ] Certificado digital válido
- [ ] Alvará de funcionamento
- [ ] Inscrição estadual/municipal

### Contábil
- [ ] Livro diário escriturado
- [ ] Balancete mensal conciliado
- [ ] Notas fiscais emitidas
- [ ] Guias de impostos pagas`;

    if (employees > 0) {
      checklist += `

### Trabalhista
- [ ] eSocial atualizado
- [ ] Folha de pagamento processada
- [ ] FGTS depositado
- [ ] Férias e 13º provisionados
- [ ] CAGED/RAIS enviados`;
    }

    if (stage === "growth" || stage === "scale" || stage === "mature") {
      checklist += `

### Societário
- [ ] Atas de reunião arquivadas
- [ ] Alterações contratuais registradas
- [ ] Distribuição de lucros documentada`;
    }

    return checklist;
  } else {
    let checklist = `### Basic
- [ ] Business registration active
- [ ] Operating agreement updated
- [ ] Business licenses valid
- [ ] State/local registrations

### Accounting
- [ ] Books maintained
- [ ] Monthly reconciliation done
- [ ] Invoices issued
- [ ] Taxes paid on time`;

    if (employees > 0) {
      checklist += `

### Payroll
- [ ] Payroll processed
- [ ] Payroll taxes deposited
- [ ] W-4s on file
- [ ] I-9s completed
- [ ] Benefits enrolled`;
    }

    return checklist;
  }
}

function getStageRecommendations(stage: string, lang: "pt-br" | "en"): string {
  const recs: Record<string, Record<string, string>> = {
    idea: {
      "pt-br": `- Use MEI se possível (simplicidade)
- Mantenha separação pessoal/empresa desde o início
- Use apps simples para controle financeiro
- Guarde todos os comprovantes (mesmo informais)`,
      en: `- Use simple sole proprietorship if possible
- Maintain personal/business separation from start
- Use simple apps for financial tracking
- Keep all receipts (even informal ones)`,
    },
    mvp: {
      "pt-br": `- Formalize a empresa (CNPJ)
- Contrate contador ou use contabilidade online
- Implemente controle de fluxo de caixa
- Emita notas fiscais corretamente`,
      en: `- Formalize the business entity
- Hire accountant or use online accounting
- Implement cash flow control
- Issue invoices properly`,
    },
    traction: {
      "pt-br": `- Revise o regime tributário (simulação)
- Implemente sistema ERP básico
- Faça conciliação bancária semanal
- Estruture centro de custos`,
      en: `- Review tax regime (run simulations)
- Implement basic ERP system
- Do weekly bank reconciliation
- Structure cost centers`,
    },
    growth: {
      "pt-br": `- Automatize processos contábeis
- Implemente controladoria
- Prepare para auditoria
- Considere CFO part-time`,
      en: `- Automate accounting processes
- Implement controllership
- Prepare for audit
- Consider part-time CFO`,
    },
    scale: {
      "pt-br": `- CFO dedicado ou fractional
- Governança financeira formal
- Auditoria externa anual
- Planejamento tributário avançado`,
      en: `- Dedicated or fractional CFO
- Formal financial governance
- Annual external audit
- Advanced tax planning`,
    },
    mature: {
      "pt-br": `- Auditoria Big Four
- Compliance SOX se necessário
- Tax planning internacional
- M&A readiness`,
      en: `- Big Four audit
- SOX compliance if needed
- International tax planning
- M&A readiness`,
    },
  };
  return recs[stage]?.[lang] || "";
}

function getStageAlerts(
  stage: string,
  employees: number,
  country: string,
  lang: "pt-br" | "en"
): string {
  const alerts: string[] = [];

  if (lang === "pt-br") {
    if (stage === "idea" || stage === "mvp") {
      alerts.push("⚠️ Não misture contas pessoais e da empresa");
      alerts.push("⚠️ Formalize antes de faturar regularmente");
    }
    if (employees > 0 && employees < 5) {
      alerts.push("⚠️ Atenção às obrigações trabalhistas (eSocial, FGTS)");
    }
    if (stage === "traction") {
      alerts.push("⚠️ Hora de revisar se o Simples ainda é vantajoso");
      alerts.push("⚠️ Implemente controles internos básicos");
    }
    if (stage === "growth" || stage === "scale") {
      alerts.push("⚠️ Prepare-se para due diligence de investidores");
      alerts.push("⚠️ Documente todas as decisões financeiras");
    }
    if (country === "BR") {
      alerts.push("⚠️ Mantenha o certificado digital sempre válido");
      alerts.push("⚠️ Atenção aos prazos do SPED");
    }
  } else {
    if (stage === "idea" || stage === "mvp") {
      alerts.push("⚠️ Don't mix personal and business accounts");
      alerts.push("⚠️ Formalize before regular invoicing");
    }
    if (employees > 0) {
      alerts.push("⚠️ Pay attention to payroll tax deadlines");
    }
    if (stage === "growth" || stage === "scale") {
      alerts.push("⚠️ Prepare for investor due diligence");
      alerts.push("⚠️ Document all financial decisions");
    }
  }

  return alerts.join("\n");
}

export function getAccountingPrompt(lang: "pt-br" | "en"): string {
  return lang === "pt-br"
    ? `Você é um especialista em contabilidade empresarial, com foco em:
- Escrituração contábil e fiscal
- Regimes tributários (Simples, Lucro Presumido, Lucro Real)
- Obrigações acessórias (SPED, eSocial, etc.)
- Planejamento tributário legal
- Custos e formação de preços
- Preparação para auditoria
- Controles internos

Responda de forma prática e objetiva, considerando a legislação brasileira.
Sempre alerte sobre prazos e riscos de não conformidade.`
    : `You are an accounting specialist focusing on:
- Bookkeeping and tax accounting
- Tax regimes and entity selection
- Tax compliance and reporting
- Legal tax planning
- Cost accounting and pricing
- Audit preparation
- Internal controls

Respond practically and objectively.
Always alert about deadlines and non-compliance risks.`;
}

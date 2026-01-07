import { Command } from "commander";
import chalk from "chalk";
import fs from "fs-extra";
import path from "node:path";
import { findRepoRoot } from "../lib/repoRoot.js";
import { readYaml } from "../lib/yaml.js";

function fillGeneratedBlock(template: string, generated: string) {
  const begin = "<!-- BO:BEGIN GENERATED -->";
  const end = "<!-- BO:END GENERATED -->";

  if (template.includes(begin) && template.includes(end)) {
    const before = template.split(begin)[0] + begin;
    const after = end + template.split(end)[1];
    return `${before}\n${generated}\n${after}`;
  }

  // If markers missing, append safely
  return `${template}\n\n${begin}\n${generated}\n${end}\n`;
}

// Helper to format array values
function formatArray(arr: any[], lang: "en" | "pt-br"): string {
  if (!arr || arr.length === 0) return lang === "en" ? "Not specified" : "Não especificado";
  return arr.join(", ");
}

// Helper to format boolean/status values
function formatStatus(val: string, lang: "en" | "pt-br"): string {
  if (!val) return lang === "en" ? "Not specified" : "Não especificado";
  const statusMap: Record<string, Record<string, string>> = {
    YES: { en: "Yes", "pt-br": "Sim" },
    NO: { en: "No", "pt-br": "Não" },
    IN_PROGRESS: { en: "In progress", "pt-br": "Em andamento" },
    UNKNOWN: { en: "Unknown", "pt-br": "Desconhecido" },
    NOT_APPLICABLE: { en: "Not applicable", "pt-br": "Não aplicável" },
  };
  return statusMap[val]?.[lang] || val;
}

// Generate comprehensive company overview
function makeOverview(lang: "en" | "pt-br", company: any, answers: any) {
  const c = company?.company || {};
  const meta = company?.meta || {};
  const identity = c.identity || {};
  const compliance = c.compliance || {};
  const ops = c.ops || {};
  const finance = c.finance || {};
  const legal = c.legal || {};

  const name = identity.name || "Company";
  const one = identity.one_liner || "";
  const pack = (meta.packs || []).join(", ");
  const mode = meta.country_mode || "BR";
  const stage = identity.stage || "EARLY";
  const headcount = identity.headcount_range || "";
  const businessModel = c.business_model || "";
  const industry = meta.industry || "";

  // Check completeness
  const hasCompliance = Object.keys(compliance).length > 0;
  const hasOps = Object.keys(ops).length > 0;
  const hasFinance = Object.keys(finance).length > 0;
  const hasLegal = Object.keys(legal).length > 0;
  const isDeepIntake = hasCompliance || hasOps || hasFinance || hasLegal;

  if (lang === "en") {
    let doc = `## ${name}

**One-liner:** ${one}

### Company Profile

| Attribute | Value |
|-----------|-------|
| Country/Mode | ${mode} |
| Industry | ${industry || "Not specified"} |
| Pack(s) | ${pack || "industry-neutral"} |
| Stage | ${stage} |
| Headcount | ${headcount || "Not specified"} |
| Business Model | ${businessModel || "Not specified"} |
| Lifecycle | ${c.lifecycle_mode || "Not specified"} |

`;

    if (hasOps) {
      doc += `### Operations

| Area | Details |
|------|---------|
| Outsourced Services | ${formatArray(ops.outsourced_services, lang)} |
| Sales Channels | ${formatArray(ops.sales_channels, lang)} |
| Inventory Model | ${ops.inventory_model || "N/A"} |
| Service Delivery | ${ops.service_delivery || "N/A"} |
| Key Challenges | ${formatArray(ops.key_challenges, lang)} |

`;
    }

    if (hasCompliance) {
      doc += `### Compliance & Legal Entity

| Area | Status |
|------|--------|
| Entity Type | ${compliance.entity_type || "Not defined"} |
| Tax Registration | ${formatStatus(compliance.tax_registration, lang)} |
| Tax Regime | ${compliance.br_tax_regime || compliance.us_state || "N/A"} |
| Data Privacy (LGPD/GDPR) | ${formatStatus(compliance.data_privacy, lang)} |
`;
      if (compliance.anvisa_license) {
        doc += `| ANVISA License | ${compliance.anvisa_license} |
`;
      }
      if (compliance.product_registration) {
        doc += `| Product Registration | ${compliance.product_registration} |
`;
      }
      if (compliance.radar) {
        doc += `| RADAR (Siscomex) | ${compliance.radar} |
`;
      }
      doc += "\n";
    }

    if (hasFinance) {
      doc += `### Finance

| Area | Details |
|------|---------|
| Funding Status | ${finance.funding_status || "Not specified"} |
| Revenue Status | ${finance.revenue_status || "Not specified"} |
| Revenue Model | ${finance.revenue_model || "Not specified"} |
| Bank Account | ${finance.bank_account || "Not specified"} |
| Payment Methods | ${formatArray(finance.payment_methods, lang)} |
| Financial Tools | ${formatArray(finance.tools, lang)} |
`;
      if (finance.runway) {
        doc += `| Runway | ${finance.runway} |
`;
      }
      doc += "\n";
    }

    if (hasLegal) {
      doc += `### Legal Structure

| Area | Details |
|------|---------|
| Founders | ${legal.founders || "Not specified"} |
| Partnership Agreement | ${formatStatus(legal.partnership_agreement, lang)} |
| IP Assets | ${formatArray(legal.ip_assets, lang)} |
| Key Contracts | ${formatArray(legal.key_contracts, lang)} |
| Legal Support | ${legal.legal_support || "Not specified"} |
| Insurance | ${formatArray(legal.insurance, lang)} |
`;
      if (legal.vesting) {
        doc += `| Vesting | ${formatStatus(legal.vesting, lang)} |
`;
      }
      doc += "\n";
    }

    doc += `### Next Recommended Steps

`;
    if (!isDeepIntake) {
      doc += `- Run \`/intake\` to complete the deep intake for detailed analysis
- Chat with specialists: \`@businessops /compliance\`, \`/finance\`, \`/legal\`, \`/ops\`
`;
    } else {
      doc += `- Run \`@businessops /diagnose\` for organizational diagnostic
- Run \`@businessops /plan\` for execution planning (7/30/90 days)
- Run \`@businessops /swot\` for SWOT analysis
- Run \`@businessops /canvas\` for Business Model Canvas
`;
    }
    doc += `- Define ICP and customer pains
- Set 90-day goals and KPIs
`;

    return doc;
  }

  // PT-BR version
  let doc = `## ${name}

**Resumo:** ${one}

### Perfil da Empresa

| Atributo | Valor |
|----------|-------|
| País/Modo | ${mode} |
| Indústria | ${industry || "Não especificado"} |
| Pack(s) | ${pack || "industry-neutral"} |
| Estágio | ${stage} |
| Tamanho | ${headcount || "Não especificado"} |
| Modelo de Negócio | ${businessModel || "Não especificado"} |
| Ciclo de Vida | ${c.lifecycle_mode || "Não especificado"} |

`;

  if (hasOps) {
    doc += `### Operações

| Área | Detalhes |
|------|----------|
| Serviços Terceirizados | ${formatArray(ops.outsourced_services, lang)} |
| Canais de Venda | ${formatArray(ops.sales_channels, lang)} |
| Modelo de Estoque | ${ops.inventory_model || "N/A"} |
| Entrega de Serviços | ${ops.service_delivery || "N/A"} |
| Desafios Principais | ${formatArray(ops.key_challenges, lang)} |

`;
  }

  if (hasCompliance) {
    doc += `### Compliance & Entidade Legal

| Área | Status |
|------|--------|
| Tipo de Entidade | ${compliance.entity_type || "Não definido"} |
| Regularização Fiscal | ${formatStatus(compliance.tax_registration, lang)} |
| Regime Tributário | ${compliance.br_tax_regime || compliance.us_state || "N/A"} |
| Privacidade de Dados (LGPD/GDPR) | ${formatStatus(compliance.data_privacy, lang)} |
`;
    if (compliance.anvisa_license) {
      doc += `| Licença ANVISA | ${compliance.anvisa_license} |
`;
    }
    if (compliance.product_registration) {
      doc += `| Registro de Produtos | ${compliance.product_registration} |
`;
    }
    if (compliance.radar) {
      doc += `| RADAR (Siscomex) | ${compliance.radar} |
`;
    }
    doc += "\n";
  }

  if (hasFinance) {
    doc += `### Finanças

| Área | Detalhes |
|------|----------|
| Status de Financiamento | ${finance.funding_status || "Não especificado"} |
| Status de Receita | ${finance.revenue_status || "Não especificado"} |
| Modelo de Receita | ${finance.revenue_model || "Não especificado"} |
| Conta Bancária | ${finance.bank_account || "Não especificado"} |
| Formas de Pagamento | ${formatArray(finance.payment_methods, lang)} |
| Ferramentas Financeiras | ${formatArray(finance.tools, lang)} |
`;
    if (finance.runway) {
      doc += `| Runway | ${finance.runway} |
`;
    }
    doc += "\n";
  }

  if (hasLegal) {
    doc += `### Estrutura Legal

| Área | Detalhes |
|------|----------|
| Sócios/Fundadores | ${legal.founders || "Não especificado"} |
| Acordo de Sócios | ${formatStatus(legal.partnership_agreement, lang)} |
| Ativos de PI | ${formatArray(legal.ip_assets, lang)} |
| Contratos-Chave | ${formatArray(legal.key_contracts, lang)} |
| Suporte Jurídico | ${legal.legal_support || "Não especificado"} |
| Seguros | ${formatArray(legal.insurance, lang)} |
`;
    if (legal.vesting) {
      doc += `| Vesting | ${formatStatus(legal.vesting, lang)} |
`;
    }
    doc += "\n";
  }

  doc += `### Próximos Passos Recomendados

`;
  if (!isDeepIntake) {
    doc += `- Rode \`/intake\` para completar o intake profundo para análise detalhada
- Converse com especialistas: \`@businessops /compliance\`, \`/finance\`, \`/legal\`, \`/ops\`
`;
  } else {
    doc += `- Rode \`@businessops /diagnose\` para diagnóstico organizacional
- Rode \`@businessops /plan\` para planejamento de execução (7/30/90 dias)
- Rode \`@businessops /swot\` para análise SWOT
- Rode \`@businessops /canvas\` para Business Model Canvas
`;
  }
  doc += `- Definir ICP e dores do cliente
- Definir metas e KPIs de 90 dias
`;

  return doc;
}

export const generateCommand = new Command("generate")
  .description("Generate docs from templates + company.yaml (deterministic)")
  .action(async () => {
    const root = findRepoRoot();

    const companyPath = path.join(root, "businessops", "state", "company.yaml");
    const answersPath = path.join(root, "businessops", "state", "answers.yaml");

    const company = await readYaml<any>(companyPath);
    const answers = await readYaml<any>(answersPath);

    if (!company) {
      console.log(chalk.red("Missing company.yaml. Run init first:"));
      console.log(chalk.yellow("  npm run dev --prefix cli -- init"));
      process.exit(1);
    }

    const languagePref = company?.meta?.language_preference || "BILINGUAL";

    const templateBase = path.join(root, "businessops", "templates", "docs");
    const outBase = path.join(root, "businessops", "docs");

    const langs: Array<"en" | "pt-br"> =
      languagePref === "EN" ? ["en"] : languagePref === "PT-BR" ? ["pt-br"] : ["en", "pt-br"];

    for (const lang of langs) {
      const tplDir = path.join(templateBase, lang);
      const outDir = path.join(outBase, lang);

      await fs.ensureDir(outDir);

      // copy templates first (if they exist)
      if (await fs.pathExists(tplDir)) {
        await fs.copy(tplDir, outDir, { overwrite: true });
      }

      // ensure overview exists
      const overviewPath = path.join(outDir, "overview.md");
      const overviewTplExists = await fs.pathExists(overviewPath);

      const overviewTpl = overviewTplExists ? await fs.readFile(overviewPath, "utf8") : `# Overview\n\n<!-- BO:BEGIN GENERATED -->\n<!-- BO:END GENERATED -->\n`;
      const generated = makeOverview(lang, company, answers);

      const next = fillGeneratedBlock(overviewTpl, generated);
      await fs.writeFile(overviewPath, next, "utf8");

      console.log(chalk.green("Generated:"), path.relative(root, overviewPath));
    }

    console.log(chalk.green("\nDocs generated ✅"));
    console.log(chalk.gray("Output folder:"), chalk.yellow("businessops/docs/"));
  });

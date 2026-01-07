/**
 * Method Advisor - Smart Recommendations
 *
 * Analyzes company context and recommends appropriate business methods.
 * Integrates with specialists and orchestrator to provide intelligent suggestions.
 */

import { OrchestratorContext } from "./orchestrator";
import { BusinessMethod, methodsRegistry, getMethod, canApplyMethod, getMethodsByCategory } from "./methods";

export interface MethodRecommendation {
  method: BusinessMethod;
  reason: {
    "pt-br": string;
    "en": string;
  };
  priority: "high" | "medium" | "low";
  missingData?: string[]; // Required data not yet collected
}

export interface MethodAdvisorResult {
  recommendations: MethodRecommendation[];
  missingDataPrompt?: {
    "pt-br": string;
    "en": string;
  };
}

/**
 * Analyze context and recommend methods based on:
 * - Company stage (idea, mvp, traction, growth, scale, mature)
 * - Identified challenges (from ops.key_challenges)
 * - Industry and business model
 * - Current gaps and risks
 */
export function getMethodRecommendations(
  ctx: OrchestratorContext,
  options?: {
    category?: string;
    maxRecommendations?: number;
    includeAdvanced?: boolean;
  }
): MethodAdvisorResult {
  const recommendations: MethodRecommendation[] = [];
  const company = ctx.company?.company || {};
  const answers = ctx.answers?.answers || {};
  const stage = ctx.stage || company.stage || "idea";
  const challenges = company.ops?.key_challenges || answers["ops.key_challenges"] || [];
  const industry = ctx.industry || company.sector || "";

  // Stage-based recommendations
  addStageRecommendations(recommendations, stage, ctx);

  // Challenge-based recommendations
  addChallengeRecommendations(recommendations, challenges, ctx);

  // Industry-specific recommendations
  addIndustryRecommendations(recommendations, industry, ctx);

  // Gap-based recommendations (from missing data)
  addGapRecommendations(recommendations, ctx);

  // Filter by category if specified
  let filtered = recommendations;
  if (options?.category) {
    filtered = recommendations.filter(r => r.method.category === options.category);
  }

  // Filter out advanced if not included
  if (!options?.includeAdvanced) {
    filtered = filtered.filter(r => r.method.complexity !== "advanced");
  }

  // Sort by priority and deduplicate
  filtered = deduplicateAndSort(filtered);

  // Limit recommendations
  const max = options?.maxRecommendations || 5;
  filtered = filtered.slice(0, max);

  return {
    recommendations: filtered,
    missingDataPrompt: filtered.some(r => r.missingData?.length)
      ? {
          "pt-br": "Alguns métodos precisam de mais informações. Complete o intake para melhores resultados.",
          "en": "Some methods need more information. Complete the intake for better results."
        }
      : undefined
  };
}

/**
 * Get method recommendations for a specific specialist domain
 */
export function getSpecialistMethodRecommendations(
  ctx: OrchestratorContext,
  specialist: "OPS" | "COMPLIANCE" | "FINANCE" | "LEGAL" | "ACCOUNTING" | "LOGISTICS"
): MethodRecommendation[] {
  const recommendations: MethodRecommendation[] = [];

  switch (specialist) {
    case "OPS":
      addOpsMethodRecommendations(recommendations, ctx);
      break;
    case "COMPLIANCE":
      addComplianceMethodRecommendations(recommendations, ctx);
      break;
    case "FINANCE":
      addFinanceMethodRecommendations(recommendations, ctx);
      break;
    case "LEGAL":
      addLegalMethodRecommendations(recommendations, ctx);
      break;
    case "ACCOUNTING":
      addAccountingMethodRecommendations(recommendations, ctx);
      break;
    case "LOGISTICS":
      addLogisticsMethodRecommendations(recommendations, ctx);
      break;
  }

  return deduplicateAndSort(recommendations).slice(0, 5);
}

/**
 * Check if a method can be fully applied with current data
 */
export function checkMethodReadiness(
  methodId: string,
  ctx: OrchestratorContext
): { ready: boolean; missingData: string[]; suggestedQuestions: string[] } {
  const method = getMethod(methodId);
  if (!method) {
    return { ready: false, missingData: [], suggestedQuestions: [] };
  }

  const missingData: string[] = [];
  const suggestedQuestions: string[] = [];

  for (const path of method.requiredData) {
    const value = getByPath(ctx, path);
    if (value === undefined || value === null) {
      missingData.push(path);
      // Map data paths to question IDs
      const questionId = mapDataPathToQuestionId(path);
      if (questionId) suggestedQuestions.push(questionId);
    }
  }

  return {
    ready: missingData.length === 0,
    missingData,
    suggestedQuestions
  };
}

/**
 * Generate a smart prompt for method suggestion based on conversation context
 */
export function getMethodSuggestionPrompt(
  ctx: OrchestratorContext,
  lang: "pt-br" | "en"
): string {
  const result = getMethodRecommendations(ctx, { maxRecommendations: 3 });

  if (result.recommendations.length === 0) {
    return "";
  }

  const methodsList = result.recommendations
    .map(r => `\`/method ${r.method.id}\` → ${r.method.name[lang]} (${r.reason[lang]})`)
    .join("\n");

  if (lang === "pt-br") {
    return `\n\n---\n💡 **Métodos Recomendados:**\n${methodsList}\n`;
  }
  return `\n\n---\n💡 **Recommended Methods:**\n${methodsList}\n`;
}

// ===== Internal Helpers =====

function addStageRecommendations(
  recommendations: MethodRecommendation[],
  stage: string,
  ctx: OrchestratorContext
) {
  const stageNorm = stage.toLowerCase();

  // Early stages (idea, mvp) - focus on strategic clarity
  if (stageNorm === "idea" || stageNorm === "mvp" || stageNorm === "early") {
    addRecommendation(recommendations, "swot", {
      "pt-br": "Essencial para entender seu posicionamento inicial",
      "en": "Essential to understand your initial positioning"
    }, "high", ctx);

    addRecommendation(recommendations, "canvas", {
      "pt-br": "Estrutura seu modelo de negócio desde o início",
      "en": "Structure your business model from the start"
    }, "high", ctx);

    addRecommendation(recommendations, "okr", {
      "pt-br": "Define objetivos claros para validação",
      "en": "Define clear objectives for validation"
    }, "medium", ctx);
  }

  // Traction - focus on processes and optimization
  if (stageNorm === "traction") {
    addRecommendation(recommendations, "kanban", {
      "pt-br": "Organize o fluxo de trabalho crescente",
      "en": "Organize growing workflow"
    }, "high", ctx);

    addRecommendation(recommendations, "kpi", {
      "pt-br": "Defina métricas para acompanhar tração",
      "en": "Define metrics to track traction"
    }, "high", ctx);

    addRecommendation(recommendations, "balanced-scorecard", {
      "pt-br": "Visão equilibrada de performance",
      "en": "Balanced performance view"
    }, "medium", ctx);
  }

  // Growth - focus on scaling and competition
  if (stageNorm === "growth") {
    addRecommendation(recommendations, "porter", {
      "pt-br": "Entenda forças competitivas para escalar",
      "en": "Understand competitive forces for scaling"
    }, "high", ctx);

    addRecommendation(recommendations, "ansoff", {
      "pt-br": "Estratégias de crescimento estruturadas",
      "en": "Structured growth strategies"
    }, "high", ctx);

    addRecommendation(recommendations, "six-sigma", {
      "pt-br": "Otimize processos para escala",
      "en": "Optimize processes for scale"
    }, "medium", ctx);
  }

  // Scale/Mature - focus on optimization and efficiency
  if (stageNorm === "scale" || stageNorm === "mature") {
    addRecommendation(recommendations, "value-chain", {
      "pt-br": "Otimize toda a cadeia de valor",
      "en": "Optimize entire value chain"
    }, "high", ctx);

    addRecommendation(recommendations, "bcg", {
      "pt-br": "Gerencie portfólio de produtos/unidades",
      "en": "Manage product/unit portfolio"
    }, "high", ctx);

    addRecommendation(recommendations, "tqm", {
      "pt-br": "Excelência operacional contínua",
      "en": "Continuous operational excellence"
    }, "medium", ctx);
  }
}

function addChallengeRecommendations(
  recommendations: MethodRecommendation[],
  challenges: string[],
  ctx: OrchestratorContext
) {
  if (!Array.isArray(challenges)) return;

  for (const challenge of challenges) {
    const c = challenge.toUpperCase();

    if (c === "PROCESSES") {
      addRecommendation(recommendations, "kanban", {
        "pt-br": "Visualize e organize processos desorganizados",
        "en": "Visualize and organize messy processes"
      }, "high", ctx);

      addRecommendation(recommendations, "five-s", {
        "pt-br": "Elimine desperdícios e organize ambiente",
        "en": "Eliminate waste and organize environment"
      }, "high", ctx);

      addRecommendation(recommendations, "bpmn", {
        "pt-br": "Documente e mapeie processos críticos",
        "en": "Document and map critical processes"
      }, "medium", ctx);
    }

    if (c === "CASH_FLOW") {
      addRecommendation(recommendations, "cash-flow", {
        "pt-br": "Analise e projete fluxo de caixa",
        "en": "Analyze and project cash flow"
      }, "high", ctx);

      addRecommendation(recommendations, "dre", {
        "pt-br": "Entenda receitas vs despesas",
        "en": "Understand revenue vs expenses"
      }, "high", ctx);
    }

    if (c === "SCALE") {
      addRecommendation(recommendations, "six-sigma", {
        "pt-br": "Otimize processos para escala",
        "en": "Optimize processes for scale"
      }, "high", ctx);

      addRecommendation(recommendations, "kaizen", {
        "pt-br": "Melhoria contínua sistemática",
        "en": "Systematic continuous improvement"
      }, "medium", ctx);
    }

    if (c === "SALES" || c === "CUSTOMER_ACQUISITION") {
      addRecommendation(recommendations, "porter", {
        "pt-br": "Entenda o ambiente competitivo",
        "en": "Understand competitive environment"
      }, "high", ctx);

      addRecommendation(recommendations, "ansoff", {
        "pt-br": "Estratégias de penetração e desenvolvimento",
        "en": "Penetration and development strategies"
      }, "medium", ctx);
    }

    if (c === "SUPPLY_CHAIN") {
      addRecommendation(recommendations, "value-chain", {
        "pt-br": "Analise toda a cadeia de valor",
        "en": "Analyze entire value chain"
      }, "high", ctx);

      addRecommendation(recommendations, "kanban", {
        "pt-br": "Gerencie fluxo de materiais",
        "en": "Manage material flow"
      }, "medium", ctx);
    }

    if (c === "TECHNOLOGY") {
      addRecommendation(recommendations, "gap-analysis", {
        "pt-br": "Identifique lacunas tecnológicas",
        "en": "Identify technology gaps"
      }, "high", ctx);
    }

    if (c === "HIRING") {
      addRecommendation(recommendations, "okr", {
        "pt-br": "Alinhe objetivos para novas contratações",
        "en": "Align objectives for new hires"
      }, "medium", ctx);
    }
  }
}

function addIndustryRecommendations(
  recommendations: MethodRecommendation[],
  industry: string,
  ctx: OrchestratorContext
) {
  const ind = (industry || "").toUpperCase();

  if (ind === "HEALTHCARE" || ind === "HEALTH-IMPORT") {
    addRecommendation(recommendations, "five-s", {
      "pt-br": "Essencial para ambiente de saúde regulado",
      "en": "Essential for regulated healthcare environment"
    }, "medium", ctx);

    addRecommendation(recommendations, "tqm", {
      "pt-br": "Qualidade total para área de saúde",
      "en": "Total quality for healthcare"
    }, "medium", ctx);
  }

  if (ind === "MANUFACTURING") {
    addRecommendation(recommendations, "six-sigma", {
      "pt-br": "Redução de defeitos na produção",
      "en": "Defect reduction in production"
    }, "high", ctx);

    addRecommendation(recommendations, "kanban", {
      "pt-br": "Gestão visual da produção",
      "en": "Visual production management"
    }, "high", ctx);

    addRecommendation(recommendations, "kaizen", {
      "pt-br": "Melhoria contínua na linha de produção",
      "en": "Continuous improvement in production line"
    }, "medium", ctx);
  }

  if (ind === "RETAIL" || ind === "ECOMMERCE") {
    addRecommendation(recommendations, "value-chain", {
      "pt-br": "Otimize da compra à entrega",
      "en": "Optimize from purchase to delivery"
    }, "high", ctx);

    addRecommendation(recommendations, "bcg", {
      "pt-br": "Gerencie portfólio de produtos",
      "en": "Manage product portfolio"
    }, "medium", ctx);
  }

  if (ind === "TECHNOLOGY" || ind === "SAAS") {
    addRecommendation(recommendations, "okr", {
      "pt-br": "Framework padrão para tech/startups",
      "en": "Standard framework for tech/startups"
    }, "high", ctx);

    addRecommendation(recommendations, "kanban", {
      "pt-br": "Gestão ágil de desenvolvimento",
      "en": "Agile development management"
    }, "high", ctx);
  }

  if (ind === "SERVICES" || ind === "CONSULTING") {
    addRecommendation(recommendations, "kpi", {
      "pt-br": "Métricas de qualidade de serviço",
      "en": "Service quality metrics"
    }, "high", ctx);

    addRecommendation(recommendations, "balanced-scorecard", {
      "pt-br": "Visão balanceada de performance",
      "en": "Balanced performance view"
    }, "medium", ctx);
  }
}

function addGapRecommendations(
  recommendations: MethodRecommendation[],
  ctx: OrchestratorContext
) {
  const company = ctx.company?.company || {};
  const compliance = company.compliance || {};
  const ops = company.ops || {};
  const finance = company.finance || {};
  const legal = company.legal || {};

  // Financial gaps
  if (!finance.revenue_model || finance.revenue_model === "NOT_DEFINED") {
    addRecommendation(recommendations, "canvas", {
      "pt-br": "Defina seu modelo de receita",
      "en": "Define your revenue model"
    }, "high", ctx);
  }

  if (finance.runway === "LESS_3M") {
    addRecommendation(recommendations, "cash-flow", {
      "pt-br": "Runway crítico - projete fluxo de caixa",
      "en": "Critical runway - project cash flow"
    }, "high", ctx);
  }

  // Ops gaps
  if (!ops.sales_channels || ops.sales_channels.length === 0) {
    addRecommendation(recommendations, "ansoff", {
      "pt-br": "Defina estratégia de canais",
      "en": "Define channel strategy"
    }, "medium", ctx);
  }

  // Strategic gaps
  if (!company.identity?.one_liner) {
    addRecommendation(recommendations, "swot", {
      "pt-br": "Comece com análise estratégica básica",
      "en": "Start with basic strategic analysis"
    }, "high", ctx);
  }
}

// Specialist-specific recommendations

function addOpsMethodRecommendations(
  recommendations: MethodRecommendation[],
  ctx: OrchestratorContext
) {
  addRecommendation(recommendations, "kanban", {
    "pt-br": "Visualize e otimize fluxos de trabalho",
    "en": "Visualize and optimize workflows"
  }, "high", ctx);

  addRecommendation(recommendations, "five-s", {
    "pt-br": "Organize ambiente e elimine desperdícios",
    "en": "Organize environment and eliminate waste"
  }, "high", ctx);

  addRecommendation(recommendations, "kaizen", {
    "pt-br": "Cultura de melhoria contínua",
    "en": "Continuous improvement culture"
  }, "medium", ctx);

  addRecommendation(recommendations, "bpmn", {
    "pt-br": "Documente processos operacionais",
    "en": "Document operational processes"
  }, "medium", ctx);

  addRecommendation(recommendations, "value-chain", {
    "pt-br": "Análise da cadeia de valor",
    "en": "Value chain analysis"
  }, "medium", ctx);
}

function addComplianceMethodRecommendations(
  recommendations: MethodRecommendation[],
  ctx: OrchestratorContext
) {
  addRecommendation(recommendations, "gap-analysis", {
    "pt-br": "Identifique lacunas de conformidade",
    "en": "Identify compliance gaps"
  }, "high", ctx);

  addRecommendation(recommendations, "pestle", {
    "pt-br": "Análise do ambiente regulatório",
    "en": "Regulatory environment analysis"
  }, "high", ctx);

  addRecommendation(recommendations, "bpmn", {
    "pt-br": "Documente processos de compliance",
    "en": "Document compliance processes"
  }, "medium", ctx);
}

function addFinanceMethodRecommendations(
  recommendations: MethodRecommendation[],
  ctx: OrchestratorContext
) {
  addRecommendation(recommendations, "dre", {
    "pt-br": "Análise de demonstração de resultados",
    "en": "Income statement analysis"
  }, "high", ctx);

  addRecommendation(recommendations, "cash-flow", {
    "pt-br": "Projeção de fluxo de caixa",
    "en": "Cash flow projection"
  }, "high", ctx);

  addRecommendation(recommendations, "balance-sheet", {
    "pt-br": "Análise patrimonial",
    "en": "Balance sheet analysis"
  }, "medium", ctx);

  addRecommendation(recommendations, "predictive", {
    "pt-br": "Projeções financeiras",
    "en": "Financial projections"
  }, "medium", ctx);

  addRecommendation(recommendations, "kpi", {
    "pt-br": "KPIs financeiros essenciais",
    "en": "Essential financial KPIs"
  }, "medium", ctx);
}

function addLegalMethodRecommendations(
  recommendations: MethodRecommendation[],
  ctx: OrchestratorContext
) {
  addRecommendation(recommendations, "vrio", {
    "pt-br": "Analise vantagens competitivas protegíveis",
    "en": "Analyze protectable competitive advantages"
  }, "medium", ctx);

  addRecommendation(recommendations, "gap-analysis", {
    "pt-br": "Identifique lacunas jurídicas",
    "en": "Identify legal gaps"
  }, "high", ctx);
}

function addAccountingMethodRecommendations(
  recommendations: MethodRecommendation[],
  ctx: OrchestratorContext
) {
  addRecommendation(recommendations, "dre", {
    "pt-br": "Estruture demonstração de resultados",
    "en": "Structure income statement"
  }, "high", ctx);

  addRecommendation(recommendations, "balance-sheet", {
    "pt-br": "Análise de balanço patrimonial",
    "en": "Balance sheet analysis"
  }, "high", ctx);

  addRecommendation(recommendations, "cash-flow", {
    "pt-br": "Demonstração de fluxo de caixa",
    "en": "Cash flow statement"
  }, "high", ctx);

  addRecommendation(recommendations, "kpi", {
    "pt-br": "Indicadores financeiros essenciais",
    "en": "Essential financial indicators"
  }, "medium", ctx);
}

function addLogisticsMethodRecommendations(
  recommendations: MethodRecommendation[],
  ctx: OrchestratorContext
) {
  addRecommendation(recommendations, "kanban", {
    "pt-br": "Gestão visual de estoque e fluxo",
    "en": "Visual inventory and flow management"
  }, "high", ctx);

  addRecommendation(recommendations, "value-chain", {
    "pt-br": "Otimize toda a cadeia de suprimentos",
    "en": "Optimize entire supply chain"
  }, "high", ctx);

  addRecommendation(recommendations, "five-s", {
    "pt-br": "Organize armazéns e centros de distribuição",
    "en": "Organize warehouses and distribution centers"
  }, "medium", ctx);

  addRecommendation(recommendations, "six-sigma", {
    "pt-br": "Reduza erros e variabilidade",
    "en": "Reduce errors and variability"
  }, "medium", ctx);
}

// Utility functions

function addRecommendation(
  recommendations: MethodRecommendation[],
  methodId: string,
  reason: { "pt-br": string; "en": string },
  priority: "high" | "medium" | "low",
  ctx: OrchestratorContext
) {
  const method = getMethod(methodId);
  if (!method) return;

  // Check for missing data
  const { missingData } = checkMethodReadiness(methodId, ctx);

  recommendations.push({
    method,
    reason,
    priority,
    missingData: missingData.length > 0 ? missingData : undefined
  });
}

function deduplicateAndSort(recommendations: MethodRecommendation[]): MethodRecommendation[] {
  // Deduplicate by method ID, keeping highest priority
  const byId = new Map<string, MethodRecommendation>();

  const priorityOrder = { high: 0, medium: 1, low: 2 };

  for (const rec of recommendations) {
    const existing = byId.get(rec.method.id);
    if (!existing || priorityOrder[rec.priority] < priorityOrder[existing.priority]) {
      byId.set(rec.method.id, rec);
    }
  }

  // Sort by priority
  return Array.from(byId.values()).sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function getByPath(obj: any, path: string): any {
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function mapDataPathToQuestionId(path: string): string | null {
  // Map common data paths to question IDs
  const mapping: Record<string, string> = {
    // Identity
    "company.identity.stage": "stage",
    "company.identity.name": "company_name",
    "company.identity.location": "location",
    // Meta
    "meta.industry": "industry",
    "meta.country_mode": "country_mode",
    // Business model
    "company.business_model": "business_model",
    // Ops
    "company.ops.key_challenges": "ops.key_challenges",
    "company.ops.channels": "ops.channels",
    "company.ops.outsourced_services": "ops.outsourced_services",
    "company.ops.delivery_model": "ops.delivery_model",
    // Finance
    "company.finance.funding_status": "finance.funding_status",
    "company.finance.revenue_model": "finance.revenue_model",
    "company.finance.runway": "finance.runway",
    "company.finance.payment_methods": "finance.payment_methods",
    // Compliance
    "company.compliance.entity_type": "compliance.entity_type",
    "company.compliance.tax_registration": "compliance.tax_registration",
    "company.compliance.regulatory_licenses": "compliance.regulatory_licenses",
    // Legal
    "company.legal.partnership_agreement": "legal.partnership_agreement",
    "company.legal.ip_assets": "legal.ip_assets",
  };

  return mapping[path] || null;
}

/**
 * Generate method suggestions formatted for inclusion in specialist responses
 */
export function formatMethodSuggestions(
  recommendations: MethodRecommendation[],
  lang: "pt-br" | "en"
): string {
  if (recommendations.length === 0) return "";

  const header = lang === "pt-br"
    ? "\n\n---\n## 💡 Métodos Recomendados\n"
    : "\n\n---\n## 💡 Recommended Methods\n";

  const items = recommendations.map(r => {
    const status = r.missingData?.length
      ? (lang === "pt-br" ? " _(dados pendentes)_" : " _(pending data)_")
      : "";
    return `- \`/method ${r.method.id}\` → **${r.method.name[lang]}**${status}\n  ${r.reason[lang]}`;
  }).join("\n\n");

  const footer = lang === "pt-br"
    ? "\n\n_Use `/methods` para ver todos os métodos disponíveis._"
    : "\n\n_Use `/methods` to see all available methods._";

  return header + items + footer;
}

/**
 * Agent Data Helper
 *
 * Provides tools for specialists/agents to:
 * 1. Request custom data from users
 * 2. Save custom data to state
 * 3. Check what data is available
 * 4. Generate prompts for missing information
 */

import { OrchestratorContext } from "./orchestrator";
import {
  saveCustomData,
  queueCustomDataRequest,
  CustomDataRequest,
  getPendingCustomRequests,
  clearCustomRequest
} from "./saveDynamic";

export interface DataRequirement {
  /** Path in company.yaml where data should be stored */
  path: string;
  /** Human-readable label */
  label: {
    "pt-br": string;
    "en": string;
  };
  /** Why is this data needed */
  reason: {
    "pt-br": string;
    "en": string;
  };
  /** Expected type */
  type: "text" | "number" | "boolean" | "list" | "date" | "currency";
  /** Is this required or optional */
  required: boolean;
  /** Validation hint */
  hint?: {
    "pt-br": string;
    "en": string;
  };
}

export interface AgentDataResult {
  /** Current value (if any) */
  value: any;
  /** Whether the data exists */
  exists: boolean;
  /** Whether this was custom data added by an agent */
  isCustom: boolean;
  /** Source that added this data */
  source?: string;
}

/**
 * Check if a data path exists in the context
 */
export function checkDataExists(ctx: OrchestratorContext, path: string): AgentDataResult {
  const value = getByPath(ctx.company, path);
  const customMeta = ctx.answers?.answers?._custom_meta?.[path];

  return {
    value,
    exists: value !== undefined && value !== null,
    isCustom: !!customMeta,
    source: customMeta?.source
  };
}

/**
 * Check multiple data requirements and return missing ones
 */
export function checkRequirements(
  ctx: OrchestratorContext,
  requirements: DataRequirement[]
): { met: DataRequirement[]; missing: DataRequirement[] } {
  const met: DataRequirement[] = [];
  const missing: DataRequirement[] = [];

  for (const req of requirements) {
    const result = checkDataExists(ctx, req.path);
    if (result.exists) {
      met.push(req);
    } else {
      missing.push(req);
    }
  }

  return { met, missing };
}

/**
 * Generate a prompt asking user for missing data
 */
export function generateDataPrompt(
  missing: DataRequirement[],
  lang: "pt-br" | "en",
  source: string
): string {
  if (missing.length === 0) return "";

  const header = lang === "pt-br"
    ? `\n\n---\n## ❓ Informações Necessárias\n\n_Para uma análise mais completa, preciso de algumas informações adicionais:_\n`
    : `\n\n---\n## ❓ Required Information\n\n_For a more complete analysis, I need some additional information:_\n`;

  const items = missing.map((req, i) => {
    const typeHint = getTypeHint(req.type, lang);
    const hint = req.hint ? ` _(${req.hint[lang]})_` : "";
    return `${i + 1}. **${req.label[lang]}**${hint}\n   ${req.reason[lang]}\n   _Tipo: ${typeHint}_`;
  }).join("\n\n");

  const footer = lang === "pt-br"
    ? `\n\n_Responda com as informações acima ou digite \`/skip\` para continuar sem elas._`
    : `\n\n_Reply with the information above or type \`/skip\` to continue without it._`;

  return header + items + footer;
}

/**
 * Parse user response and extract data values
 */
export function parseDataResponse(
  response: string,
  requirements: DataRequirement[]
): Map<string, any> {
  const results = new Map<string, any>();

  // Simple numbered format: "1. value\n2. value"
  const lines = response.split("\n").filter(l => l.trim());

  for (const line of lines) {
    const match = line.match(/^(\d+)[\.\)\:]?\s*(.+)$/);
    if (match) {
      const index = parseInt(match[1]) - 1;
      const value = match[2].trim();

      if (index >= 0 && index < requirements.length) {
        const req = requirements[index];
        results.set(req.path, parseValue(value, req.type));
      }
    }
  }

  // Also try key-value format: "label: value"
  for (const req of requirements) {
    if (results.has(req.path)) continue;

    for (const line of lines) {
      const labelPtBr = req.label["pt-br"].toLowerCase();
      const labelEn = req.label.en.toLowerCase();
      const lineLower = line.toLowerCase();

      if (lineLower.startsWith(labelPtBr + ":") || lineLower.startsWith(labelEn + ":")) {
        const value = line.substring(line.indexOf(":") + 1).trim();
        results.set(req.path, parseValue(value, req.type));
        break;
      }
    }
  }

  return results;
}

/**
 * Save custom data from an agent
 */
export async function agentSaveData(
  path: string,
  value: any,
  source: string,
  options?: { append?: boolean }
): Promise<void> {
  await saveCustomData(path, value, {
    source,
    appendIfArray: options?.append
  });
}

/**
 * Queue a data request for the user
 */
export async function agentRequestData(
  requirements: DataRequirement[],
  source: string
): Promise<void> {
  for (const req of requirements) {
    const request: CustomDataRequest = {
      id: `${source}_${req.path}`,
      source,
      prompt: req.label,
      savePath: req.path,
      type: req.type === "list" ? "list" : req.type === "currency" || req.type === "date" ? "text" : req.type,
      reason: req.reason,
    };
    await queueCustomDataRequest(request);
  }
}

/**
 * Get pending data requests for a source
 */
export async function getAgentPendingRequests(source?: string): Promise<CustomDataRequest[]> {
  const all = await getPendingCustomRequests();
  if (source) {
    return all.filter(r => r.source === source);
  }
  return all;
}

/**
 * Clear a completed request
 */
export async function agentClearRequest(requestId: string): Promise<void> {
  await clearCustomRequest(requestId);
}

/**
 * Common data requirements by specialist domain
 */
export const SPECIALIST_DATA_REQUIREMENTS: Record<string, DataRequirement[]> = {
  OPS: [
    {
      path: "company.ops.team_size",
      label: { "pt-br": "Tamanho da equipe", en: "Team size" },
      reason: { "pt-br": "Para dimensionar processos e recursos", en: "To size processes and resources" },
      type: "number",
      required: false,
    },
    {
      path: "company.ops.main_bottleneck",
      label: { "pt-br": "Principal gargalo", en: "Main bottleneck" },
      reason: { "pt-br": "Para priorizar melhorias", en: "To prioritize improvements" },
      type: "text",
      required: false,
    },
  ],
  COMPLIANCE: [
    {
      path: "company.compliance.last_audit_date",
      label: { "pt-br": "Data da última auditoria", en: "Last audit date" },
      reason: { "pt-br": "Para avaliar necessidade de revisão", en: "To assess review needs" },
      type: "date",
      required: false,
    },
    {
      path: "company.compliance.certification_goals",
      label: { "pt-br": "Certificações desejadas", en: "Desired certifications" },
      reason: { "pt-br": "Para planejar roadmap de conformidade", en: "To plan compliance roadmap" },
      type: "list",
      required: false,
    },
  ],
  FINANCE: [
    {
      path: "company.finance.monthly_revenue",
      label: { "pt-br": "Receita mensal média", en: "Average monthly revenue" },
      reason: { "pt-br": "Para análise financeira", en: "For financial analysis" },
      type: "currency",
      required: false,
      hint: { "pt-br": "Aproximado, se não souber exato", en: "Approximate if unsure" },
    },
    {
      path: "company.finance.monthly_costs",
      label: { "pt-br": "Custos mensais médios", en: "Average monthly costs" },
      reason: { "pt-br": "Para calcular margens", en: "To calculate margins" },
      type: "currency",
      required: false,
    },
    {
      path: "company.finance.break_even_date",
      label: { "pt-br": "Previsão de break-even", en: "Break-even forecast" },
      reason: { "pt-br": "Para análise de viabilidade", en: "For viability analysis" },
      type: "date",
      required: false,
    },
  ],
  LEGAL: [
    {
      path: "company.legal.pending_disputes",
      label: { "pt-br": "Disputas pendentes", en: "Pending disputes" },
      reason: { "pt-br": "Para avaliar riscos legais", en: "To assess legal risks" },
      type: "text",
      required: false,
    },
    {
      path: "company.legal.contract_renewal_dates",
      label: { "pt-br": "Datas de renovação de contratos", en: "Contract renewal dates" },
      reason: { "pt-br": "Para planejar renegociações", en: "To plan renegotiations" },
      type: "list",
      required: false,
    },
  ],
  ACCOUNTING: [
    {
      path: "company.accounting.fiscal_year_end",
      label: { "pt-br": "Fim do ano fiscal", en: "Fiscal year end" },
      reason: { "pt-br": "Para planejar fechamentos", en: "To plan closings" },
      type: "date",
      required: false,
    },
    {
      path: "company.accounting.accounting_software",
      label: { "pt-br": "Software contábil", en: "Accounting software" },
      reason: { "pt-br": "Para recomendações de integração", en: "For integration recommendations" },
      type: "text",
      required: false,
    },
  ],
  LOGISTICS: [
    {
      path: "company.logistics.avg_order_volume",
      label: { "pt-br": "Volume médio de pedidos/mês", en: "Avg monthly order volume" },
      reason: { "pt-br": "Para dimensionar operações", en: "To size operations" },
      type: "number",
      required: false,
    },
    {
      path: "company.logistics.main_carriers",
      label: { "pt-br": "Principais transportadoras", en: "Main carriers" },
      reason: { "pt-br": "Para análise de custos", en: "For cost analysis" },
      type: "list",
      required: false,
    },
    {
      path: "company.logistics.warehouse_locations",
      label: { "pt-br": "Locais de armazenamento", en: "Warehouse locations" },
      reason: { "pt-br": "Para otimizar distribuição", en: "To optimize distribution" },
      type: "list",
      required: false,
    },
  ],
};

// ===== Internal Helpers =====

function getByPath(obj: any, path: string): any {
  if (!obj) return undefined;
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

function getTypeHint(type: DataRequirement["type"], lang: "pt-br" | "en"): string {
  const hints: Record<string, Record<string, string>> = {
    text: { "pt-br": "texto", en: "text" },
    number: { "pt-br": "número", en: "number" },
    boolean: { "pt-br": "sim/não", en: "yes/no" },
    list: { "pt-br": "lista (separada por vírgula)", en: "list (comma-separated)" },
    date: { "pt-br": "data (DD/MM/AAAA)", en: "date (MM/DD/YYYY)" },
    currency: { "pt-br": "valor monetário", en: "currency value" },
  };
  return hints[type]?.[lang] || type;
}

function parseValue(value: string, type: DataRequirement["type"]): any {
  switch (type) {
    case "number":
      return parseFloat(value.replace(/[^\d.-]/g, "")) || 0;
    case "boolean":
      return /^(sim|yes|true|1|s|y)$/i.test(value);
    case "list":
      return value.split(/[,;]/).map(v => v.trim()).filter(Boolean);
    case "currency":
      return parseFloat(value.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
    default:
      return value;
  }
}

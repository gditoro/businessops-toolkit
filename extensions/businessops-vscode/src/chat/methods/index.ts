/**
 * Business Methods & Frameworks Registry
 *
 * This module provides a comprehensive collection of business analysis methods,
 * frameworks, and tools that can be applied to company data.
 *
 * Categories:
 * - Strategic Analysis (SWOT, PESTLE, Porter, BCG, Ansoff, VRIO, Value Chain)
 * - Process Improvement (Kanban, Kaizen, 5S, 6 Sigma, TQM, BPMN)
 * - Performance Management (KPIs, Balanced Scorecard, Gap Analysis)
 * - Financial Analysis (DRE, Balance Sheet, Cash Flow, Predictive)
 * - Visualization (Flowcharts, Diagrams, Matrices)
 */

import { OrchestratorContext } from "../orchestrator";

export type MethodCategory =
  | "strategic"
  | "process"
  | "performance"
  | "financial"
  | "visualization";

export type MethodOutput =
  | "markdown"
  | "mermaid"
  | "table"
  | "checklist"
  | "scorecard";

export interface BusinessMethod {
  id: string;
  name: {
    "pt-br": string;
    "en": string;
  };
  description: {
    "pt-br": string;
    "en": string;
  };
  category: MethodCategory;
  outputType: MethodOutput;
  complexity: "basic" | "intermediate" | "advanced";
  requiredData: string[]; // dot paths to required company data
  tags: string[];
  /** Generate output for this method given company context */
  generate: (ctx: OrchestratorContext, lang: "pt-br" | "en") => string;
  /** Get checklist for implementing this method */
  getChecklist?: (ctx: OrchestratorContext, lang: "pt-br" | "en") => string[];
  /** Get knowledge base content for this method */
  getKnowledge?: (lang: "pt-br" | "en") => string;
}

// Import all method implementations
import { swotMethod } from "./strategic/swot";
import { pestleMethod } from "./strategic/pestle";
import { porterMethod } from "./strategic/porter";
import { bcgMethod } from "./strategic/bcg";
import { ansoffMethod } from "./strategic/ansoff";
import { vrioMethod } from "./strategic/vrio";
import { valueChainMethod } from "./strategic/valueChain";
import { kanbanMethod } from "./process/kanban";
import { kaizenMethod } from "./process/kaizen";
import { fiveSMethod } from "./process/fiveS";
import { sixSigmaMethod } from "./process/sixSigma";
import { tqmMethod } from "./process/tqm";
import { bpmnMethod } from "./process/bpmn";
import { kpiMethod } from "./performance/kpi";
import { balancedScorecardMethod } from "./performance/balancedScorecard";
import { gapAnalysisMethod } from "./performance/gapAnalysis";
import { okrMethod } from "./performance/okr";
import { dreMethod } from "./financial/dre";
import { balanceSheetMethod } from "./financial/balanceSheet";
import { cashFlowMethod } from "./financial/cashFlow";
import { predictiveMethod } from "./financial/predictive";
import { flowchartMethod } from "./visualization/flowchart";

/**
 * Registry of all available business methods
 */
export const methodsRegistry: BusinessMethod[] = [
  // Strategic Analysis
  swotMethod,
  pestleMethod,
  porterMethod,
  bcgMethod,
  ansoffMethod,
  vrioMethod,
  valueChainMethod,

  // Process Improvement
  kanbanMethod,
  kaizenMethod,
  fiveSMethod,
  sixSigmaMethod,
  tqmMethod,
  bpmnMethod,

  // Performance Management
  kpiMethod,
  balancedScorecardMethod,
  gapAnalysisMethod,
  okrMethod,

  // Financial Analysis
  dreMethod,
  balanceSheetMethod,
  cashFlowMethod,
  predictiveMethod,

  // Visualization
  flowchartMethod,
];

/**
 * Get a method by ID
 */
export function getMethod(id: string): BusinessMethod | undefined {
  return methodsRegistry.find(m => m.id === id);
}

/**
 * Get methods by category
 */
export function getMethodsByCategory(category: MethodCategory): BusinessMethod[] {
  return methodsRegistry.filter(m => m.category === category);
}

/**
 * Get methods by tag
 */
export function getMethodsByTag(tag: string): BusinessMethod[] {
  return methodsRegistry.filter(m => m.tags.includes(tag));
}

/**
 * Get all method IDs grouped by category
 */
export function getMethodsGrouped(): Record<MethodCategory, string[]> {
  const grouped: Record<MethodCategory, string[]> = {
    strategic: [],
    process: [],
    performance: [],
    financial: [],
    visualization: [],
  };

  for (const method of methodsRegistry) {
    grouped[method.category].push(method.id);
  }

  return grouped;
}

/**
 * Check if a method can be applied given current company data
 */
export function canApplyMethod(method: BusinessMethod, ctx: OrchestratorContext): boolean {
  // Check if all required data is available
  for (const path of method.requiredData) {
    const value = getByPath(ctx, path);
    if (value === undefined || value === null) {
      return false;
    }
  }
  return true;
}

/**
 * Get applicable methods for current company context
 */
export function getApplicableMethods(ctx: OrchestratorContext): BusinessMethod[] {
  return methodsRegistry.filter(m => canApplyMethod(m, ctx));
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

/**
 * Generate help text listing all available methods
 */
export function getMethodsHelpText(lang: "pt-br" | "en"): string {
  const grouped = getMethodsGrouped();

  if (lang === "pt-br") {
    return `# 📚 Métodos e Frameworks Disponíveis

## 🎯 Análise Estratégica
${grouped.strategic.map(id => {
  const m = getMethod(id)!;
  return `- \`/method ${id}\` → ${m.name["pt-br"]}`;
}).join("\n")}

## ⚙️ Melhoria de Processos
${grouped.process.map(id => {
  const m = getMethod(id)!;
  return `- \`/method ${id}\` → ${m.name["pt-br"]}`;
}).join("\n")}

## 📊 Gestão de Performance
${grouped.performance.map(id => {
  const m = getMethod(id)!;
  return `- \`/method ${id}\` → ${m.name["pt-br"]}`;
}).join("\n")}

## 💰 Análise Financeira
${grouped.financial.map(id => {
  const m = getMethod(id)!;
  return `- \`/method ${id}\` → ${m.name["pt-br"]}`;
}).join("\n")}

## 📈 Visualização
${grouped.visualization.map(id => {
  const m = getMethod(id)!;
  return `- \`/method ${id}\` → ${m.name["pt-br"]}`;
}).join("\n")}

_Use \`/method <id>\` para aplicar um método ou \`/method <id> --explain\` para saber mais._
`;
  }

  return `# 📚 Available Methods & Frameworks

## 🎯 Strategic Analysis
${grouped.strategic.map(id => {
  const m = getMethod(id)!;
  return `- \`/method ${id}\` → ${m.name["en"]}`;
}).join("\n")}

## ⚙️ Process Improvement
${grouped.process.map(id => {
  const m = getMethod(id)!;
  return `- \`/method ${id}\` → ${m.name["en"]}`;
}).join("\n")}

## 📊 Performance Management
${grouped.performance.map(id => {
  const m = getMethod(id)!;
  return `- \`/method ${id}\` → ${m.name["en"]}`;
}).join("\n")}

## 💰 Financial Analysis
${grouped.financial.map(id => {
  const m = getMethod(id)!;
  return `- \`/method ${id}\` → ${m.name["en"]}`;
}).join("\n")}

## 📈 Visualization
${grouped.visualization.map(id => {
  const m = getMethod(id)!;
  return `- \`/method ${id}\` → ${m.name["en"]}`;
}).join("\n")}

_Use \`/method <id>\` to apply a method or \`/method <id> --explain\` to learn more._
`;
}

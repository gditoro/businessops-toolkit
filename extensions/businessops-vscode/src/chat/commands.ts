import * as vscode from "vscode";
import { md, Lang, hasAnyAnswers, isCoreIntakeComplete } from "./helpers";

// -----------------------------
// Command Definitions
// -----------------------------

export interface CommandDefinition {
  id: string;
  aliases: string[];
  label: Record<string, string>;
  description: Record<string, string>;
  requiresAnswers: boolean;
  handler: string; // Handler function name
}

export const COMMANDS: CommandDefinition[] = [
  {
    id: "intake",
    aliases: ["start", "começar", "iniciar"],
    label: { "pt-br": "Intake", "en": "Intake" },
    description: { "pt-br": "Iniciar ou continuar o questionário", "en": "Start or continue the questionnaire" },
    requiresAnswers: false,
    handler: "handleIntake"
  },
  {
    id: "generate",
    aliases: ["render", "gerar", "criar"],
    label: { "pt-br": "Gerar", "en": "Generate" },
    description: { "pt-br": "Gerar documentação", "en": "Generate documentation" },
    requiresAnswers: true,
    handler: "handleGenerate"
  },
  {
    id: "diagnose",
    aliases: ["diagnostico", "diagnóstico", "analysis"],
    label: { "pt-br": "Diagnóstico", "en": "Diagnose" },
    description: { "pt-br": "Diagnóstico organizacional", "en": "Organizational diagnostic" },
    requiresAnswers: true,
    handler: "handleDiagnose"
  },
  {
    id: "plan",
    aliases: ["plano", "roadmap", "planejamento"],
    label: { "pt-br": "Plano", "en": "Plan" },
    description: { "pt-br": "Plano de execução 7/30/90 dias", "en": "7/30/90 day execution plan" },
    requiresAnswers: true,
    handler: "handlePlan"
  },
  {
    id: "swot",
    aliases: ["forças", "fraquezas"],
    label: { "pt-br": "SWOT", "en": "SWOT" },
    description: { "pt-br": "Análise SWOT", "en": "SWOT analysis" },
    requiresAnswers: true,
    handler: "handleSwot"
  },
  {
    id: "canvas",
    aliases: ["bmc", "modelo de negócio"],
    label: { "pt-br": "Canvas", "en": "Canvas" },
    description: { "pt-br": "Business Model Canvas", "en": "Business Model Canvas" },
    requiresAnswers: true,
    handler: "handleCanvas"
  },
  {
    id: "methods",
    aliases: ["métodos", "metodos", "ferramentas", "tools"],
    label: { "pt-br": "Métodos", "en": "Methods" },
    description: { "pt-br": "Ver métodos de análise disponíveis", "en": "View available analysis methods" },
    requiresAnswers: false,
    handler: "handleMethods"
  },
  {
    id: "status",
    aliases: ["progresso", "progress"],
    label: { "pt-br": "Status", "en": "Status" },
    description: { "pt-br": "Ver progresso do questionário", "en": "View questionnaire progress" },
    requiresAnswers: false,
    handler: "handleStatus"
  },
  {
    id: "help",
    aliases: ["ajuda", "comandos", "commands"],
    label: { "pt-br": "Ajuda", "en": "Help" },
    description: { "pt-br": "Ver todos os comandos", "en": "View all commands" },
    requiresAnswers: false,
    handler: "handleHelp"
  }
];

// -----------------------------
// Help Command
// -----------------------------

export function showHelp(stream: any, lang: Lang, answers: any) {
  const hasAnswers = hasAnyAnswers(answers);
  const isComplete = isCoreIntakeComplete(answers, {} as any);

  if (lang === "pt-br") {
    md(stream, `## 📚 Comandos do BusinessOps\n\n`);

    md(stream, `### 🎯 Intake\n`);
    md(stream, `- \`/intake\` → iniciar ou continuar questionário\n`);
    md(stream, `- \`STATUS\` → ver progresso\n`);
    md(stream, `- \`VOLTAR\` → pergunta anterior\n`);
    md(stream, `- \`PULAR\` → pular pergunta atual\n`);
    md(stream, `- \`RECOMEÇAR\` → reiniciar questionário\n\n`);

    if (hasAnswers) {
      md(stream, `### 📄 Documentos\n`);
      md(stream, `- \`/generate\` → gerar documentação\n`);
      md(stream, `- \`/diagnose\` → diagnóstico organizacional\n`);
      md(stream, `- \`/plan\` → plano de execução\n`);
      md(stream, `- \`/swot\` → análise SWOT\n`);
      md(stream, `- \`/canvas\` → Business Model Canvas\n\n`);
    }

    md(stream, `### 👨‍💼 Especialistas\n`);
    md(stream, `- \`/finance\` → consultor financeiro\n`);
    md(stream, `- \`/legal\` → consultor jurídico\n`);
    md(stream, `- \`/compliance\` → regulamentação\n`);
    md(stream, `- \`/ops\` → operações\n\n`);

    md(stream, `### 🔧 Métodos\n`);
    md(stream, `- \`/methods\` → ver todos os métodos\n`);
    md(stream, `- \`/porter\` → 5 Forças de Porter\n`);
    md(stream, `- \`/bcg\` → Matriz BCG\n`);
    md(stream, `- \`/okr\` → OKRs\n`);
    md(stream, `- \`/kpi\` → KPIs\n`);
  } else {
    md(stream, `## 📚 BusinessOps Commands\n\n`);

    md(stream, `### 🎯 Intake\n`);
    md(stream, `- \`/intake\` → start or continue questionnaire\n`);
    md(stream, `- \`STATUS\` → view progress\n`);
    md(stream, `- \`BACK\` → previous question\n`);
    md(stream, `- \`SKIP\` → skip current question\n`);
    md(stream, `- \`RESTART\` → restart questionnaire\n\n`);

    if (hasAnswers) {
      md(stream, `### 📄 Documents\n`);
      md(stream, `- \`/generate\` → generate documentation\n`);
      md(stream, `- \`/diagnose\` → organizational diagnostic\n`);
      md(stream, `- \`/plan\` → execution plan\n`);
      md(stream, `- \`/swot\` → SWOT analysis\n`);
      md(stream, `- \`/canvas\` → Business Model Canvas\n\n`);
    }

    md(stream, `### 👨‍💼 Specialists\n`);
    md(stream, `- \`/finance\` → financial consultant\n`);
    md(stream, `- \`/legal\` → legal consultant\n`);
    md(stream, `- \`/compliance\` → regulations\n`);
    md(stream, `- \`/ops\` → operations\n\n`);

    md(stream, `### 🔧 Methods\n`);
    md(stream, `- \`/methods\` → view all methods\n`);
    md(stream, `- \`/porter\` → Porter's 5 Forces\n`);
    md(stream, `- \`/bcg\` → BCG Matrix\n`);
    md(stream, `- \`/okr\` → OKRs\n`);
    md(stream, `- \`/kpi\` → KPIs\n`);
  }
}

// -----------------------------
// Methods Command
// -----------------------------

export function showMethods(stream: any, lang: Lang) {
  if (lang === "pt-br") {
    md(stream, `## 🔧 Métodos de Análise\n\n`);

    md(stream, `### 📊 Estratégico\n`);
    md(stream, `- \`/swot\` → Análise SWOT\n`);
    md(stream, `- \`/porter\` → 5 Forças de Porter\n`);
    md(stream, `- \`/pestle\` → Análise PESTLE\n`);
    md(stream, `- \`/bcg\` → Matriz BCG\n`);
    md(stream, `- \`/ansoff\` → Matriz de Ansoff\n`);
    md(stream, `- \`/vrio\` → Framework VRIO\n`);
    md(stream, `- \`/valuechain\` → Cadeia de Valor\n\n`);

    md(stream, `### 📈 Performance\n`);
    md(stream, `- \`/okr\` → OKRs\n`);
    md(stream, `- \`/kpi\` → KPIs\n`);
    md(stream, `- \`/bsc\` → Balanced Scorecard\n`);
    md(stream, `- \`/gap\` → Análise de Gap\n\n`);

    md(stream, `### ⚙️ Processos\n`);
    md(stream, `- \`/bpmn\` → Modelagem BPMN\n`);
    md(stream, `- \`/kanban\` → Sistema Kanban\n`);
    md(stream, `- \`/kaizen\` → Melhoria Contínua\n`);
    md(stream, `- \`/sixsigma\` → Six Sigma\n`);
    md(stream, `- \`/5s\` → Metodologia 5S\n\n`);

    md(stream, `### 💰 Financeiro\n`);
    md(stream, `- \`/dre\` → DRE\n`);
    md(stream, `- \`/balancesheet\` → Balanço\n`);
    md(stream, `- \`/cashflow\` → Fluxo de Caixa\n`);
    md(stream, `- \`/predictive\` → Análise Preditiva\n`);
  } else {
    md(stream, `## 🔧 Analysis Methods\n\n`);

    md(stream, `### 📊 Strategic\n`);
    md(stream, `- \`/swot\` → SWOT Analysis\n`);
    md(stream, `- \`/porter\` → Porter's 5 Forces\n`);
    md(stream, `- \`/pestle\` → PESTLE Analysis\n`);
    md(stream, `- \`/bcg\` → BCG Matrix\n`);
    md(stream, `- \`/ansoff\` → Ansoff Matrix\n`);
    md(stream, `- \`/vrio\` → VRIO Framework\n`);
    md(stream, `- \`/valuechain\` → Value Chain\n\n`);

    md(stream, `### 📈 Performance\n`);
    md(stream, `- \`/okr\` → OKRs\n`);
    md(stream, `- \`/kpi\` → KPIs\n`);
    md(stream, `- \`/bsc\` → Balanced Scorecard\n`);
    md(stream, `- \`/gap\` → Gap Analysis\n\n`);

    md(stream, `### ⚙️ Processes\n`);
    md(stream, `- \`/bpmn\` → BPMN Modeling\n`);
    md(stream, `- \`/kanban\` → Kanban System\n`);
    md(stream, `- \`/kaizen\` → Continuous Improvement\n`);
    md(stream, `- \`/sixsigma\` → Six Sigma\n`);
    md(stream, `- \`/5s\` → 5S Methodology\n\n`);

    md(stream, `### 💰 Financial\n`);
    md(stream, `- \`/dre\` → Income Statement\n`);
    md(stream, `- \`/balancesheet\` → Balance Sheet\n`);
    md(stream, `- \`/cashflow\` → Cash Flow\n`);
    md(stream, `- \`/predictive\` → Predictive Analysis\n`);
  }
}

// -----------------------------
// Requires Answers Check
// -----------------------------

export function checkRequiresAnswers(
  commandId: string,
  stream: any,
  lang: Lang,
  answers: any
): boolean {
  const cmd = COMMANDS.find(c => c.id === commandId);

  if (!cmd || !cmd.requiresAnswers) {
    return true; // Can proceed
  }

  if (!hasAnyAnswers(answers)) {
    md(stream, lang === "pt-br"
      ? `⚠️ Este comando requer dados do questionário.\n\nUse \`/intake\` primeiro.\n`
      : `⚠️ This command requires questionnaire data.\n\nUse \`/intake\` first.\n`
    );
    return false;
  }

  return true;
}

// -----------------------------
// Command Resolution
// -----------------------------

export function resolveCommand(input: string): CommandDefinition | null {
  const t = input.toLowerCase().trim().replace(/^\//, "");

  for (const cmd of COMMANDS) {
    if (cmd.id === t || cmd.aliases.includes(t)) {
      return cmd;
    }
  }

  return null;
}

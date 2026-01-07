import { Question } from "./schema";

/**
 * WizardState controla o "estado" do wizard do toolkit:
 * - fila de perguntas
 * - o que já foi perguntado
 * - em qual pergunta estamos
 * - flags de reset/resume
 * - seleção de próximos passos
 * - logs de ações assistidas por AI (explicar/reformular/sugerir)
 *
 * Ele é persistido em answers.yaml em:
 *   wizard: ...
 *
 * Version: 0.2 - Now supports any company/industry
 */
export type WizardState = {
  // Identidade do workflow
  workflow_id: string; // ex: "businessops_wizard"
  version: number;     // ex: 0.2
  mode: "robust" | "light" | "minimal" | string;

  // Controle de fluxo
  dynamic_enabled: boolean;

  /**
   * Se true, há respostas existentes e estamos aguardando
   * o usuário escolher: CONTINUAR / RESETAR / SAIR
   */
  pending_reset_prompt: boolean;

  /**
   * Id do step/questão que estamos aguardando responder.
   * Normalmente é igual a current_question_id
   */
  awaiting_answer_for: string | null;

  /**
   * Última questão exibida no chat.
   * Armazenada para re-render e validações.
   */
  last_question: Question | null;

  /**
   * Id da questão corrente (a que está na tela).
   */
  current_question_id: string | null;

  /**
   * Fila de perguntas. Cada item é uma Question completa.
   * A fila é recalculada/atualizada pelo orchestrator.
   * Questions are sorted by priority (higher = first).
   */
  queue: Question[];

  /**
   * Lista dos IDs das perguntas já perguntadas.
   * (Não necessariamente respondidas — mas normalmente sim.)
   */
  asked: string[];

  /**
   * Se true, indica que o intake (core) terminou.
   * Isso não significa que o deep intake terminou.
   */
  completed: boolean;

  /**
   * Data (YYYY-MM-DD) em que o intake terminou.
   */
  completed_at: string | null;

  /**
   * Stage selector flag:
   * após o intake básico terminar, o wizard pergunta:
   *   APROFUNDAR / GERAR_DOCS / SAIR
   */
  awaiting_stage_choice?: boolean;

  /**
   * Specialist selector flag:
   * quando o usuário quer conversar com um especialista específico
   */
  awaiting_specialist_choice?: boolean;

  /**
   * Logs de uso das ações assistidas por AI:
   * - EXPLICAR
   * - REFORMULAR
   * - SUGERIR
   *
   * Mantemos para auditoria / debugging / futuros refinamentos
   */
  help_events?: Array<{
    question_id: string;
    action: "EXPLICAR" | "REFORMULAR" | "SUGERIR";
    at: string;     // ISO timestamp
    output: string; // markdown que foi exibido
  }>;

  /**
   * Current active stage in the intake flow.
   * Tracks progress through different phases.
   */
  active_stage?:
    | "CORE_INTAKE"      // Initial core questions
    | "STAGE_SELECTOR"   // Choosing next phase
    | "DEEP_INTAKE"      // Deep dive with specialists
    | "COMPLIANCE"       // Compliance-focused questions
    | "OPS"              // Operations-focused questions
    | "FINANCE"          // Finance-focused questions
    | "LEGAL"            // Legal-focused questions
    | string;            // Future extensibility
};

/**
 * Conveniência: tipo do arquivo answers.yaml (parte da extensão)
 */
export type AnswersStateFile = {
  wizard?: WizardState;
  answers?: Record<string, any>;
};

/**
 * Conveniência: tipo do arquivo company.yaml
 */
export type CompanyStateFile = {
  company?: {
    lifecycle_mode?: string;
    identity?: {
      name?: string;
      short_name?: string;
      one_liner?: string;
      stage?: string;
      headcount_range?: string;
    };
    business_model?: string;
    contact?: {
      owner?: string;
      email?: string;
    };
    compliance?: Record<string, any>;
    ops?: Record<string, any>;
    finance?: Record<string, any>;
    legal?: Record<string, any>;
  };
  meta?: {
    country_mode?: string;
    language_preference?: string;
    industry?: string;
    compliance?: string[];
    modules?: string[];
    packs?: string[];
  };
};

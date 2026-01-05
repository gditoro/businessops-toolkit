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
 */
export type WizardState = {
  // Identidade do workflow
  workflow_id: string; // ex: "businessops_wizard"
  version: number;     // ex: 0.1
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
   * Campo opcional para evolução futura:
   * - permite marcar "sub-flows" ativos, como deep compliance, ops etc.
   */
  active_stage?: "CORE_INTAKE" | "STAGE_SELECTOR" | "DEEP_INTAKE" | "COMPLIANCE" | "OPS" | "FINANCE" | string;
};

/**
 * Conveniência: tipo do arquivo answers.yaml (parte da extensão)
 */
export type AnswersStateFile = {
  wizard?: WizardState;
  answers?: Record<string, any>;
};

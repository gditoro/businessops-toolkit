/**
 * BusinessOps Chat Modules
 *
 * This index re-exports all chat-related modules for clean imports.
 *
 * Module structure:
 * - helpers.ts      → Utility functions (md, norm, lang detection, etc.)
 * - intentHandler.ts → LLM-powered intent detection and responses
 * - navigation.ts   → Back, skip, restart, status handlers
 * - stages.ts       → Stage/specialist selection logic
 * - intake.ts       → Question rendering, validation, flow control
 * - commands.ts     → Command definitions and help displays
 */

// Helpers
export {
  md,
  norm,
  upper,
  sanitizeUserInput,
  getLang,
  hasAnyAnswers,
  saveWizardOnly,
  getProgressInfo,
  renderProgressBar,
  isDeepIntakeComplete,
  isCoreIntakeComplete,
  buildFollowup,
  ensureWizard,
  type Lang
} from "./helpers";

// Intent Handler (LLM-powered)
export { handleUnknownInput } from "./intentHandler";

// Navigation
export {
  handleBack,
  handleSkip,
  handleRestart,
  showStatus,
  handleDeepIntake,
  detectNavigationCommand,
  NAVIGATION_KEYWORDS
} from "./navigation";

// Stages
export {
  showStageSelector,
  handleStageChoice,
  showSpecialistSelector,
  handleSpecialistChoice,
  detectBestStage,
  STAGES,
  SPECIALISTS,
  type StageOption
} from "./stages";

// Intake
export {
  renderQuestion,
  renderQuestionWithProgress,
  validateAnswer,
  showCoreComplete,
  showDeepComplete,
  showAnswerConfirmation,
  type QuestionContext,
  type ValidationResult
} from "./intake";

// Commands
export {
  showHelp,
  showMethods,
  checkRequiresAnswers,
  resolveCommand,
  COMMANDS,
  type CommandDefinition
} from "./commands";

// Re-export from existing modules
export { Question, validateQuestion } from "./schema";
export { refreshWizardQueue, refreshWizardQueueAdvanced } from "./orchestrator";

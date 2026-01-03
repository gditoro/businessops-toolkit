export type LanguagePreference = "PT-BR" | "EN" | "BILINGUAL" | "UNKNOWN";

export function resolveWizardLanguage(pref: LanguagePreference | undefined): "pt-br" | "en" {
  // Wizard follows language_preference, but PT-BR default in BILINGUAL
  if (!pref || pref === "UNKNOWN") return "pt-br";
  if (pref === "EN") return "en";
  return "pt-br";
}

export function t(lang: "pt-br" | "en", key: string): string {
  const dict: Record<string, Record<string, string>> = {
    "pt-br": {
      title: "BusinessOps Wizard (Intake)",
      reset: "Resetar",
      continue: "Continuar",
      save: "Salvar",
      generate: "Gerar docs",
      next: "Próximo",
      back: "Voltar"
    },
    en: {
      title: "BusinessOps Wizard (Intake)",
      reset: "Reset",
      continue: "Continue",
      save: "Save",
      generate: "Generate docs",
      next: "Next",
      back: "Back"
    }
  };

  return dict[lang][key] ?? key;
}

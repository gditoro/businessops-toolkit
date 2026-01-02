import { setByPath } from "./objectPath.js";

export function compileCompanyFromAnswers(answers: any): any {
  const company: any = {
    company: {
      lifecycle_mode: answers.lifecycle_mode ?? "NEW",
      identity: {
        name: answers.company_name ?? "",
        country: answers.country_specific ?? "",
        one_liner: answers.one_liner ?? "",
        stage: answers.stage ?? "EARLY",
        headcount_range: answers.headcount_range ?? "SMALL",
        company_age: answers.company_age ?? ""
      },
      market: {
        customer_type: answers.customer_type ?? [],
        icp: answers.icp ?? "",
        customer_pains: answers.top_pains ?? "",
        positioning: answers.positioning ?? "",
        acquisition_channels: answers.acquisition_channels ?? []
      },
      revenue: {
        model: answers.revenue_model ?? "TRANSACTIONAL"
      },
      pricing: {
        model: answers.pricing_model ?? "NEGOTIATED",
        discounting: answers.discounting ?? "UNKNOWN"
      },
      ops: {
        delivery_type: answers.delivery_type ?? "INVENTORY",
        complexity: answers.supply_chain_complexity ?? "UNKNOWN",
        outsourcing_level: answers.outsourcing_level ?? "SOME",
        bottleneck: answers.biggest_ops_problem ?? "",
        outsourced_services: answers.outsourced_services ?? []
      },
      processes: {
        order_to_cash_steps: answers.order_to_cash_steps ?? []
      },
      finance: {
        payment_terms: answers.payment_terms ?? "",
        revenue_range: answers.revenue_range ?? "",
        gross_margin_range: answers.gross_margin_range ?? ""
      },
      reporting: {
        kpis_tracked_today: answers.kpis_tracked ?? ""
      },
      compliance: {
        regulated: answers.regulated ?? "UNKNOWN"
      },
      risks: {
        top: answers.top_risks ?? ""
      },
      goals: {
        days_90: answers.goals_90 ?? "",
        days_180: answers.goals_180 ?? "",
        days_365: answers.goals_365 ?? ""
      }
    },
    meta: {
      country_mode: answers.country_mode ?? "GLOBAL",
      language_preference: answers.language_preference ?? "BILINGUAL",
      packs: [answers.industry_pack ?? "industry-neutral"]
    }
  };

  // Infer country if empty
  if (!company.company.identity.country) {
    company.company.identity.country =
      company.meta.country_mode === "BR" ? "Brazil" : "Global";
  }

  return company;
}

/**
 * Optional: apply map_to rules if you later want to compile strictly from wizard.yaml.
 * For v0.1 we keep explicit mapping above for clarity and stability.
 */
export function applyMapTo(target: any, mapToPath: string, value: any) {
  setByPath(target, mapToPath, value);
}

/**
 * PESTLE Analysis Method
 * Political, Economic, Social, Technological, Legal, Environmental
 */

import { BusinessMethod } from "../index";
import { OrchestratorContext } from "../../orchestrator";

export const pestleMethod: BusinessMethod = {
  id: "pestle",
  name: {
    "pt-br": "Análise PESTLE",
    "en": "PESTLE Analysis",
  },
  description: {
    "pt-br": "Análise de fatores Políticos, Econômicos, Sociais, Tecnológicos, Legais e Ambientais.",
    "en": "Analysis of Political, Economic, Social, Technological, Legal, and Environmental factors.",
  },
  category: "strategic",
  outputType: "markdown",
  complexity: "intermediate",
  requiredData: [
    "meta.industry",
    "meta.country_mode",
    "company.compliance.regulatory_licenses"
  ],
  tags: ["strategy", "macro", "environment", "external"],

  generate: (ctx: OrchestratorContext, lang: "pt-br" | "en"): string => {
    const meta = ctx.company?.meta || {};
    const country = meta.country_mode || "BR";
    const industry = meta.industry || "";

    // Generate country-specific PESTLE factors
    const factors = generatePestleFactors(country, industry, lang);

    return lang === "pt-br"
      ? `# 🌍 Análise PESTLE

## 🏛️ Político (Political)
${factors.political.map(f => `- ${f}`).join("\n")}

## 💰 Econômico (Economic)
${factors.economic.map(f => `- ${f}`).join("\n")}

## 👥 Social (Social)
${factors.social.map(f => `- ${f}`).join("\n")}

## 💻 Tecnológico (Technological)
${factors.technological.map(f => `- ${f}`).join("\n")}

## ⚖️ Legal (Legal)
${factors.legal.map(f => `- ${f}`).join("\n")}

## 🌱 Ambiental (Environmental)
${factors.environmental.map(f => `- ${f}`).join("\n")}

---

## 📋 Impacto no Negócio

| Fator | Impacto | Ação Sugerida |
|-------|---------|---------------|
| Político | ${factors.politicalImpact} | Monitorar mudanças |
| Econômico | ${factors.economicImpact} | Planejar cenários |
| Social | ${factors.socialImpact} | Adaptar proposta de valor |
| Tecnológico | ${factors.techImpact} | Investir em inovação |
| Legal | ${factors.legalImpact} | Garantir compliance |
| Ambiental | ${factors.envImpact} | Sustentabilidade |

_Análise baseada no país: ${country} e indústria: ${industry || "Geral"}_
`
      : `# 🌍 PESTLE Analysis

## 🏛️ Political
${factors.political.map(f => `- ${f}`).join("\n")}

## 💰 Economic
${factors.economic.map(f => `- ${f}`).join("\n")}

## 👥 Social
${factors.social.map(f => `- ${f}`).join("\n")}

## 💻 Technological
${factors.technological.map(f => `- ${f}`).join("\n")}

## ⚖️ Legal
${factors.legal.map(f => `- ${f}`).join("\n")}

## 🌱 Environmental
${factors.environmental.map(f => `- ${f}`).join("\n")}

---

## 📋 Business Impact

| Factor | Impact | Suggested Action |
|--------|--------|------------------|
| Political | ${factors.politicalImpact} | Monitor changes |
| Economic | ${factors.economicImpact} | Scenario planning |
| Social | ${factors.socialImpact} | Adapt value proposition |
| Technological | ${factors.techImpact} | Invest in innovation |
| Legal | ${factors.legalImpact} | Ensure compliance |
| Environmental | ${factors.envImpact} | Sustainability focus |

_Analysis based on country: ${country} and industry: ${industry || "General"}_
`;
  },

  getKnowledge: (lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# Análise PESTLE

## O que é?
PESTLE é uma ferramenta de análise macro-ambiental que examina fatores externos que podem impactar uma organização.

## Componentes:
- **P**olítico: Políticas governamentais, estabilidade, regulamentação
- **E**conômico: Taxas de juros, inflação, crescimento, câmbio
- **S**ocial: Demografia, cultura, tendências de consumo
- **T**ecnológico: Inovação, automação, P&D
- **L**egal: Leis trabalhistas, tributárias, comerciais
- **E**cológico/Ambiental: Sustentabilidade, regulações ambientais

## Quando usar?
- Planejamento estratégico de longo prazo
- Expansão para novos mercados/países
- Análise de riscos macro
- Decisões de investimento
`
      : `# PESTLE Analysis

## What is it?
PESTLE is a macro-environmental analysis tool that examines external factors that may impact an organization.

## Components:
- **P**olitical: Government policies, stability, regulations
- **E**conomic: Interest rates, inflation, growth, exchange rates
- **S**ocial: Demographics, culture, consumption trends
- **T**echnological: Innovation, automation, R&D
- **L**egal: Labor, tax, commercial laws
- **E**nvironmental: Sustainability, environmental regulations

## When to use?
- Long-term strategic planning
- Expansion to new markets/countries
- Macro risk analysis
- Investment decisions
`;
  },
};

function generatePestleFactors(country: string, industry: string, lang: "pt-br" | "en") {
  // Brazil-specific factors
  if (country === "BR") {
    return {
      political: lang === "pt-br"
        ? ["Reforma tributária em andamento", "Instabilidade política", "Políticas de comércio exterior", "Incentivos fiscais setoriais"]
        : ["Ongoing tax reform", "Political instability", "Foreign trade policies", "Sector tax incentives"],
      economic: lang === "pt-br"
        ? ["Taxa Selic e custo de capital", "Inflação e poder de compra", "Câmbio USD/BRL volátil", "Crescimento do PIB"]
        : ["Selic rate and cost of capital", "Inflation and purchasing power", "Volatile USD/BRL exchange", "GDP growth"],
      social: lang === "pt-br"
        ? ["Envelhecimento populacional", "Crescimento da classe C", "Urbanização", "Consumo consciente"]
        : ["Population aging", "Growing middle class", "Urbanization", "Conscious consumption"],
      technological: lang === "pt-br"
        ? ["Transformação digital acelerada", "Fintechs e Pix", "Indústria 4.0", "5G e conectividade"]
        : ["Accelerated digital transformation", "Fintechs and Pix", "Industry 4.0", "5G and connectivity"],
      legal: lang === "pt-br"
        ? ["LGPD (proteção de dados)", "Reforma trabalhista", "Marco legal das startups", "Regulamentação setorial"]
        : ["LGPD (data protection)", "Labor reform", "Startup legal framework", "Sector regulations"],
      environmental: lang === "pt-br"
        ? ["ESG como diferencial", "Regulamentações ambientais", "Economia circular", "Créditos de carbono"]
        : ["ESG as differentiator", "Environmental regulations", "Circular economy", "Carbon credits"],
      politicalImpact: lang === "pt-br" ? "Médio-Alto" : "Medium-High",
      economicImpact: lang === "pt-br" ? "Alto" : "High",
      socialImpact: lang === "pt-br" ? "Médio" : "Medium",
      techImpact: lang === "pt-br" ? "Alto" : "High",
      legalImpact: lang === "pt-br" ? "Alto" : "High",
      envImpact: lang === "pt-br" ? "Médio" : "Medium",
    };
  }

  // US-specific factors
  if (country === "US") {
    return {
      political: lang === "pt-br"
        ? ["Políticas comerciais", "Regulamentação setorial", "Incentivos fiscais", "Política de imigração"]
        : ["Trade policies", "Sector regulations", "Tax incentives", "Immigration policy"],
      economic: lang === "pt-br"
        ? ["Taxas de juros Fed", "Mercado de trabalho", "Inflação", "Crescimento econômico"]
        : ["Fed interest rates", "Labor market", "Inflation", "Economic growth"],
      social: lang === "pt-br"
        ? ["Diversidade e inclusão", "Trabalho remoto", "Saúde mental", "Gen Z no mercado"]
        : ["Diversity and inclusion", "Remote work", "Mental health", "Gen Z in workforce"],
      technological: lang === "pt-br"
        ? ["IA e Machine Learning", "Cloud computing", "Cibersegurança", "Automação"]
        : ["AI and Machine Learning", "Cloud computing", "Cybersecurity", "Automation"],
      legal: lang === "pt-br"
        ? ["CCPA/privacidade", "Leis antitruste", "Regulação de dados", "Propriedade intelectual"]
        : ["CCPA/privacy", "Antitrust laws", "Data regulation", "Intellectual property"],
      environmental: lang === "pt-br"
        ? ["Regulações EPA", "Energia limpa", "ESG investing", "Sustentabilidade corporativa"]
        : ["EPA regulations", "Clean energy", "ESG investing", "Corporate sustainability"],
      politicalImpact: lang === "pt-br" ? "Médio" : "Medium",
      economicImpact: lang === "pt-br" ? "Alto" : "High",
      socialImpact: lang === "pt-br" ? "Médio-Alto" : "Medium-High",
      techImpact: lang === "pt-br" ? "Muito Alto" : "Very High",
      legalImpact: lang === "pt-br" ? "Alto" : "High",
      envImpact: lang === "pt-br" ? "Médio" : "Medium",
    };
  }

  // Generic/Global factors
  return {
    political: lang === "pt-br"
      ? ["Estabilidade governamental", "Políticas comerciais", "Regulamentação", "Relações internacionais"]
      : ["Government stability", "Trade policies", "Regulations", "International relations"],
    economic: lang === "pt-br"
      ? ["Crescimento econômico", "Taxas de juros", "Inflação", "Desemprego"]
      : ["Economic growth", "Interest rates", "Inflation", "Unemployment"],
    social: lang === "pt-br"
      ? ["Tendências demográficas", "Mudanças culturais", "Educação", "Saúde pública"]
      : ["Demographic trends", "Cultural changes", "Education", "Public health"],
    technological: lang === "pt-br"
      ? ["Inovação tecnológica", "Automação", "Digitalização", "P&D"]
      : ["Technological innovation", "Automation", "Digitalization", "R&D"],
    legal: lang === "pt-br"
      ? ["Leis trabalhistas", "Proteção ao consumidor", "Regulamentação setorial", "Propriedade intelectual"]
      : ["Labor laws", "Consumer protection", "Sector regulations", "Intellectual property"],
    environmental: lang === "pt-br"
      ? ["Mudanças climáticas", "Regulações ambientais", "Sustentabilidade", "Energia renovável"]
      : ["Climate change", "Environmental regulations", "Sustainability", "Renewable energy"],
    politicalImpact: lang === "pt-br" ? "Médio" : "Medium",
    economicImpact: lang === "pt-br" ? "Alto" : "High",
    socialImpact: lang === "pt-br" ? "Médio" : "Medium",
    techImpact: lang === "pt-br" ? "Alto" : "High",
    legalImpact: lang === "pt-br" ? "Médio" : "Medium",
    envImpact: lang === "pt-br" ? "Médio" : "Medium",
  };
}

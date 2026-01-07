/**
 * VRIO Framework Analysis
 */

import { BusinessMethod } from "../index";
import { OrchestratorContext } from "../../orchestrator";

export const vrioMethod: BusinessMethod = {
  id: "vrio",
  name: {
    "pt-br": "Análise VRIO",
    "en": "VRIO Analysis",
  },
  description: {
    "pt-br": "Framework para avaliar recursos e capacidades como fonte de vantagem competitiva.",
    "en": "Framework to evaluate resources and capabilities as sources of competitive advantage.",
  },
  category: "strategic",
  outputType: "markdown",
  complexity: "intermediate",
  requiredData: [
    "company.legal.ip_assets",
    "company.ops.outsourced_services",
    "company.identity.stage"
  ],
  tags: ["strategy", "resources", "competitive-advantage", "capabilities"],

  generate: (ctx: OrchestratorContext, lang: "pt-br" | "en"): string => {
    const c = ctx.company?.company || {};
    const meta = ctx.company?.meta || {};
    const ops = c.ops || {};

    const companyName = meta.name || (lang === "pt-br" ? "Sua Empresa" : "Your Company");

    // Identify and analyze resources
    const resources = identifyResources(c, ops, lang);

    return lang === "pt-br"
      ? `# 🏆 Análise VRIO - ${companyName}

## Conceito
O framework VRIO avalia recursos e capacidades através de 4 critérios:
- **V**alor: O recurso permite explorar oportunidades ou neutralizar ameaças?
- **R**aridade: É raro entre os concorrentes?
- **I**mitabilidade: É difícil de imitar?
- **O**rganização: A empresa está organizada para explorar o recurso?

---

## 📊 Análise de Recursos

${resources.map(r => `
### ${r.icon} ${r.name}
| Critério | Avaliação |
|----------|-----------|
| **V**alor | ${r.valuable ? "✅ Sim" : "❌ Não"} |
| **R**aridade | ${r.rare ? "✅ Sim" : "❌ Não"} |
| **I**mitabilidade | ${r.costly ? "✅ Difícil" : "❌ Fácil"} |
| **O**rganização | ${r.organized ? "✅ Sim" : "❌ Não"} |

**Resultado:** ${r.result}
**Implicação:** ${r.implication}
`).join("\n")}

---

## 📈 Matriz de Vantagem Competitiva

| Recurso | V | R | I | O | Status |
|---------|---|---|---|---|--------|
${resources.map(r => `| ${r.name} | ${r.valuable ? "✅" : "❌"} | ${r.rare ? "✅" : "❌"} | ${r.costly ? "✅" : "❌"} | ${r.organized ? "✅" : "❌"} | ${r.status} |`).join("\n")}

---

## 💡 Implicações Estratégicas

### Recursos de Vantagem Sustentável
${resources.filter(r => r.level === "sustained").map(r => `- **${r.name}:** Proteger e explorar ao máximo`).join("\n") || "- *Nenhum identificado - desenvolver recursos únicos*"}

### Recursos de Vantagem Temporária
${resources.filter(r => r.level === "temporary").map(r => `- **${r.name}:** Explorar rapidamente e fortalecer`).join("\n") || "- *Nenhum identificado*"}

### Paridade Competitiva
${resources.filter(r => r.level === "parity").map(r => `- **${r.name}:** Manter eficiência`).join("\n") || "- *Nenhum identificado*"}

### Ações Recomendadas
1. Investir em recursos que podem se tornar raros
2. Desenvolver barreiras de imitação
3. Alinhar organização para explorar recursos valiosos
`
      : `# 🏆 VRIO Analysis - ${companyName}

## Concept
The VRIO framework evaluates resources and capabilities through 4 criteria:
- **V**alue: Does the resource enable exploiting opportunities or neutralizing threats?
- **R**areness: Is it rare among competitors?
- **I**mitability: Is it difficult to imitate?
- **O**rganization: Is the company organized to exploit the resource?

---

## 📊 Resource Analysis

${resources.map(r => `
### ${r.icon} ${r.name}
| Criterion | Evaluation |
|-----------|------------|
| **V**alue | ${r.valuable ? "✅ Yes" : "❌ No"} |
| **R**areness | ${r.rare ? "✅ Yes" : "❌ No"} |
| **I**mitability | ${r.costly ? "✅ Difficult" : "❌ Easy"} |
| **O**rganization | ${r.organized ? "✅ Yes" : "❌ No"} |

**Result:** ${r.result}
**Implication:** ${r.implication}
`).join("\n")}

---

## 📈 Competitive Advantage Matrix

| Resource | V | R | I | O | Status |
|----------|---|---|---|---|--------|
${resources.map(r => `| ${r.name} | ${r.valuable ? "✅" : "❌"} | ${r.rare ? "✅" : "❌"} | ${r.costly ? "✅" : "❌"} | ${r.organized ? "✅" : "❌"} | ${r.status} |`).join("\n")}

---

## 💡 Strategic Implications

### Sustained Advantage Resources
${resources.filter(r => r.level === "sustained").map(r => `- **${r.name}:** Protect and exploit maximally`).join("\n") || "- *None identified - develop unique resources*"}

### Temporary Advantage Resources
${resources.filter(r => r.level === "temporary").map(r => `- **${r.name}:** Exploit quickly and strengthen`).join("\n") || "- *None identified*"}

### Competitive Parity
${resources.filter(r => r.level === "parity").map(r => `- **${r.name}:** Maintain efficiency`).join("\n") || "- *None identified*"}

### Recommended Actions
1. Invest in resources that can become rare
2. Develop imitation barriers
3. Align organization to exploit valuable resources
`;
  },

  getKnowledge: (lang: "pt-br" | "en"): string => {
    return lang === "pt-br"
      ? `# Análise VRIO

## O que é?
Framework desenvolvido por Jay Barney para análise de vantagem competitiva baseada em recursos.

## Os 4 Critérios:
1. **Valor:** Permite explorar oportunidades ou neutralizar ameaças?
2. **Raridade:** Poucos concorrentes possuem?
3. **Imitabilidade:** É caro ou difícil de copiar?
4. **Organização:** A empresa pode explorar o recurso?

## Resultados Possíveis:
- **Desvantagem:** Não tem valor
- **Paridade:** Valioso mas comum
- **Vantagem Temporária:** Valioso e raro, mas imitável
- **Vantagem Sustentável:** Valioso, raro, difícil de imitar e bem organizado

## Tipos de Recursos:
- Tangíveis: equipamentos, localização, capital
- Intangíveis: marca, patentes, cultura
- Capacidades: processos, conhecimento, relacionamentos
`
      : `# VRIO Analysis

## What is it?
Framework developed by Jay Barney for resource-based competitive advantage analysis.

## The 4 Criteria:
1. **Value:** Enables exploiting opportunities or neutralizing threats?
2. **Rareness:** Few competitors have it?
3. **Imitability:** Is it costly or difficult to copy?
4. **Organization:** Can the company exploit the resource?

## Possible Results:
- **Disadvantage:** Has no value
- **Parity:** Valuable but common
- **Temporary Advantage:** Valuable and rare, but imitable
- **Sustained Advantage:** Valuable, rare, difficult to imitate and well organized

## Resource Types:
- Tangible: equipment, location, capital
- Intangible: brand, patents, culture
- Capabilities: processes, knowledge, relationships
`;
  },
};

interface VRIOResource {
  name: string;
  icon: string;
  valuable: boolean;
  rare: boolean;
  costly: boolean;
  organized: boolean;
  result: string;
  implication: string;
  status: string;
  level: "disadvantage" | "parity" | "temporary" | "sustained";
}

function identifyResources(company: any, ops: any, lang: "pt-br" | "en"): VRIOResource[] {
  const resources: VRIOResource[] = [];

  // Analyze team/human resources
  const team = ops.team || {};
  resources.push({
    name: lang === "pt-br" ? "Capital Humano" : "Human Capital",
    icon: "👥",
    valuable: true,
    rare: team.founder_skills ? true : false,
    costly: team.key_positions ? true : false,
    organized: true,
    ...getVRIOResult(true, !!team.founder_skills, !!team.key_positions, true, lang),
  });

  // Analyze technology
  const tech = ops.technology || {};
  resources.push({
    name: lang === "pt-br" ? "Tecnologia" : "Technology",
    icon: "💻",
    valuable: true,
    rare: tech.proprietary || false,
    costly: tech.patents || false,
    organized: true,
    ...getVRIOResult(true, !!tech.proprietary, !!tech.patents, true, lang),
  });

  // Analyze brand
  const brand = company.brand || {};
  resources.push({
    name: lang === "pt-br" ? "Marca/Reputação" : "Brand/Reputation",
    icon: "🏷️",
    valuable: true,
    rare: brand.established || false,
    costly: true,
    organized: brand.guidelines || false,
    ...getVRIOResult(true, !!brand.established, true, !!brand.guidelines, lang),
  });

  // Analyze processes
  const processes = ops.processes || {};
  resources.push({
    name: lang === "pt-br" ? "Processos Operacionais" : "Operational Processes",
    icon: "⚙️",
    valuable: true,
    rare: processes.unique || false,
    costly: processes.documented || false,
    organized: processes.optimized || false,
    ...getVRIOResult(true, !!processes.unique, !!processes.documented, !!processes.optimized, lang),
  });

  // Analyze relationships/network
  resources.push({
    name: lang === "pt-br" ? "Rede de Relacionamentos" : "Relationship Network",
    icon: "🤝",
    valuable: true,
    rare: company.partnerships || false,
    costly: true,
    organized: company.crm || false,
    ...getVRIOResult(true, !!company.partnerships, true, !!company.crm, lang),
  });

  // Analyze data/IP
  resources.push({
    name: lang === "pt-br" ? "Dados e Propriedade Intelectual" : "Data and Intellectual Property",
    icon: "📊",
    valuable: true,
    rare: company.data_advantage || false,
    costly: company.ip_protection || false,
    organized: company.data_management || false,
    ...getVRIOResult(true, !!company.data_advantage, !!company.ip_protection, !!company.data_management, lang),
  });

  return resources;
}

function getVRIOResult(v: boolean, r: boolean, i: boolean, o: boolean, lang: "pt-br" | "en"): {
  result: string;
  implication: string;
  status: string;
  level: "disadvantage" | "parity" | "temporary" | "sustained";
} {
  if (!v) {
    return {
      result: lang === "pt-br" ? "Desvantagem Competitiva" : "Competitive Disadvantage",
      implication: lang === "pt-br" ? "Eliminar ou transformar" : "Eliminate or transform",
      status: "❌ Desvant.",
      level: "disadvantage",
    };
  }

  if (!r) {
    return {
      result: lang === "pt-br" ? "Paridade Competitiva" : "Competitive Parity",
      implication: lang === "pt-br" ? "Manter eficiência, buscar diferenciação" : "Maintain efficiency, seek differentiation",
      status: "⚖️ Paridade",
      level: "parity",
    };
  }

  if (!i) {
    return {
      result: lang === "pt-br" ? "Vantagem Temporária" : "Temporary Advantage",
      implication: lang === "pt-br" ? "Explorar rápido, criar barreiras" : "Exploit quickly, create barriers",
      status: "⏳ Temporária",
      level: "temporary",
    };
  }

  if (!o) {
    return {
      result: lang === "pt-br" ? "Vantagem Potencial Não-Explorada" : "Unexploited Potential Advantage",
      implication: lang === "pt-br" ? "Reorganizar para explorar" : "Reorganize to exploit",
      status: "🔓 Potencial",
      level: "temporary",
    };
  }

  return {
    result: lang === "pt-br" ? "Vantagem Competitiva Sustentável" : "Sustained Competitive Advantage",
    implication: lang === "pt-br" ? "Proteger e maximizar" : "Protect and maximize",
    status: "🏆 Sustentável",
    level: "sustained",
  };
}

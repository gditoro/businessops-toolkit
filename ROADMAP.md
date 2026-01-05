# 🧭 BusinessOps Toolkit — Roadmap (v0.1 → v0.4)

## 🎯 Visão

Criar um **Business Operating System (BOS)** para fundadores e equipes pequenas, com:

- **Wizard guiado no GitHub Copilot Chat** (Safe Mode: 1 pergunta por vez)
- **Orquestração por múltiplos agentes especialistas** (Ops, Finance, Compliance, Sales etc.)
- **Geração automática de documentação, workflows e planos operacionais** versionados no repositório
- **Compatível com VS Code Extension + CLI** (CLI para scaffolding; Chat Wizard como fluxo principal)

---

## ✅ Princípios do Produto

1) **AI-first**: IA é o padrão (wizard determinístico é suporte, não o produto).  
2) **Founder-friendly**: setup mínimo; sem exigir stack técnico complexo.  
3) **Safe Mode**: 1 pergunta por vez + botões + validação forte + checkpoint após cada resposta.  
4) **Versionado e auditável**: tudo persiste em YAML/Markdown no repo.  
5) **Flexível e extensível**: packs por indústria e por país (“BR” e “GLOBAL”).  
6) **Controle do usuário**: IA sugere; usuário confirma; nada “roda sozinho”.

---

## ✅ Estado Atual (v0.1) — MVP Funcional

### ✅ Entregue

- **CLI Node.js + TypeScript**
  - `init` → scaffolding e templates
  - `generate` → gera docs em PT-BR/EN
- **YAML workflow core** (intake curto, multilíngue)
- **State persistido**
  - `answers.yaml` (respostas + estado do wizard)
  - `company.yaml` (modelo normalizado)
- **Extensão VS Code**
  - commands: abrir wizard, gerar docs, abrir docs
  - integração com CLI para geração
- **Copilot Chat participant (@BusinessOps)**
  - `/intake` (safe mode)
  - `/render` (gera docs via comando)
  - botões/sugestões de resposta (followups)
  - reset/resume + progresso persistido
- **Geração funcional de docs** (pelo menos overview)

### ⚠️ Lacunas principais

- “IA real” ainda está incompleta: ações como `EXPLICAR/REFORMULAR/SUGERIR` são heurísticas ou superficiais.
- Deep intake e comandos avançados (`/diagnose`, `/plan`, `/compliance`) ainda não estão completos.
- UX precisa ser mais fluida e contínua: sempre mostrar próximos passos com botões.
- Melhor tolerância a respostas abertas (“Outros”, “Todos”, “Nenhum”).

---

# 🚀 v0.2 — AI-first Experience (Wizard + Orquestrador)

**Objetivo:** transformar o toolkit em uma experiência centrada no chat, com IA “no volante”, mas com controle total do usuário.

---

## ✅ v0.2.0 — Refactor e estabilização (Core)

- [ ] Consolidar `WizardState` como contrato único (schema + defaults)
- [ ] Garantir que qualquer estado YAML incompleto seja “normalizado” no runtime
- [ ] Separar claramente:
  - CLI = scaffolding/automation
  - Extension = UI + ponte
  - Copilot Chat = fluxo principal (wizard AI)
- [ ] Implementar scripts de root e workspaces (ideal):
  - `npm run bo:init`
  - `npm run bo:generate`
  - `npm run bo:dev`
- [ ] Versionamento e migração:
  - `schema-version.yaml`
  - mecanismo de migração simples quando `wizard.version` mudar

**Deliverables**
- [ ] `types.ts` + `stateQueue.ts` estabilizados
- [ ] `orchestrator.ts` com filas consistentes e deduplicação forte
- [ ] `intake.core.yaml` multilíngue consistente + versionado

---

## ✅ v0.2.1 — Stage Selector + “Próximos passos” sempre visíveis (UX contínua)

Após intake, sempre perguntar:

**“Aprofundar agora?”**
- `APROFUNDAR` (recomendado)
- `GERAR_DOCS`
- `SAIR`

Após cada etapa, sempre mostrar botões:
- `GERAR DOCS`
- `ABRIR DOCS`
- `DIAGNOSTICAR`
- `PLANEJAR`
- `APROFUNDAR`

**Deliverables**
- [ ] stage selector persistido no `answers.yaml`
- [ ] followups sempre consistentes (sem duplicar @BusinessOps)
- [ ] UX “nunca termina em dead-end”

---

## ✅ v0.2.2 — Ações assistidas por IA em toda pergunta

Durante perguntas do wizard:
- `EXPLICAR` → explica opções
- `REFORMULAR` → reescreve a pergunta (mais clara, mais curta)
- `SUGERIR` → sugere resposta com base no contexto atual

✅ Persistir essas ações no YAML:
- `wizard.help_events[]`
- `wizard.reframes[]`
- `wizard.suggestions[]`

**Deliverables**
- [ ] suporte no `participant.ts` para ações em qualquer pergunta ativa
- [ ] logs persistidos (auditável)
- [ ] tolerância a respostas aproximadas (“alguns”, “depende”)

---

## ✅ v0.2.3 — Inputs abertos + opções “Outros / Todos / Nenhum”

Para perguntas enum/multi:
- [ ] adicionar opções:
  - `ALL`
  - `NONE`
  - `OTHER` → abre input livre
- [ ] parsing tolerante:
  - “registro e notificação” → pede seleção ou cria multi-valor
  - “alguns sim” → sugere UNKNOWN ou abre OTHER
- [ ] normalização consistente (arrays em multiselect)

**Deliverables**
- [ ] schema suportando `other_prompt`
- [ ] persistência de resposta + justificativa
- [ ] compatibilidade com geração de docs

---

## ✅ v0.2.4 — Orquestrador e múltiplos agentes (primeira versão)

Implementar agentes especialistas mínimos, acionados pelo orquestrador:
- `ops`
- `finance`
- `compliance`
- `sales`

O orquestrador decide quais rodar baseado em:
- `country_mode`
- `industry_pack`
- lacunas identificadas em answers/company

**Deliverables**
- [ ] `specialists/*.ts` com interface única (ex: `getQuestions(context)`)
- [ ] `orchestrator.ts` decide ordem e prioridade
- [ ] perguntas dinâmicas persistidas em `wizard.dynamic_questions[]`

---

# 📈 v0.3 — Deep Intake + Consultoria Automatizada

**Objetivo:** entregar valor real de gestão: diagnóstico + plano + processos + compliance, com saída em docs e checklists.

---

## ✅ v0.3.0 — /diagnose (Diagnóstico organizacional)

- [ ] Lê `company.yaml + answers.yaml`
- [ ] Identifica:
  - gaps críticos
  - riscos
  - prioridades
  - quick wins
- [ ] Produz relatórios:
  - `diagnose.md`
  - `priorities.md`
  - `risk-register.md`

**Output**
- [ ] `businessops/docs/<lang>/diagnose.md`
- [ ] `businessops/docs/<lang>/priorities.md`
- [ ] `businessops/docs/<lang>/risk-register.md`

---

## ✅ v0.3.1 — /plan (Plano de execução em horizontes)

Gera plano por:
- 7 dias
- 30 dias
- 90 dias

Com:
- objetivos
- entregáveis
- owners
- KPIs
- cadência de revisão

**Output**
- [ ] `plan-7d.md`
- [ ] `plan-30d.md`
- [ ] `plan-30d.md`
- [ ] `plan-90d.md`

---

## ✅ v0.3.2 — Packs por indústria + país (Health Import BR)

Implementar pack robusto para:
- importação e distribuição de materiais médicos no Brasil

Mas em stages:
- core intake = básico e geral
- deep intake = compliance, anvisa, logística, import

**Output**
- [ ] `compliance-anvisa-checklist.md`
- [ ] `import-process.md`
- [ ] `quality-system.md` (opcional)
- [ ] `roles-and-responsibilities.md`

---

## ✅ v0.3.3 — “BusinessOps Score” (Maturidade)

Gerar uma pontuação por área:
- Ops
- Finance
- Sales
- Compliance
- People

Com:
- score 0–5
- gaps
- recomendações
- quick wins

**Output**
- [ ] `maturity-scorecard.md`

---

# 🧠 v0.4 — Toolkit como Produto (Ecosistema + Integrações)

**Objetivo:** transformar o BOS em uma plataforma extensível e compartilhável.

---

## ✅ v0.4.0 — Plugin System para packs e workflows

- [ ] Packs instaláveis (ex: `businessops/packs/`)
- [ ] Cada pack inclui:
  - YAML workflows
  - templates
  - specialists
  - docs extras
- [ ] CLI suporta:
  - `businessops add-pack health-import`

---

## ✅ v0.4.1 — Knowledge Sources (opcional e leve)

- [ ] Lista indexada de fontes externas por pack
- [ ] Sem exigir DB: usar cache local + markdown index
- [ ] Possibilidade de “snapshot” versionado
- [ ] Ex: ANVISA, Receita Federal, Incoterms, etc.

---

## ✅ v0.4.2 — Integração com ferramentas externas (opcional)

- [ ] Import/export:
  - Notion
  - Google Drive
  - Airtable
  - Slack/Teams

⚠️ manter como opcional para não complicar o setup.

---

## ✅ v0.4.3 — Public Template / Starter

- [ ] repo template pronto com:
  - workflows
  - commands
  - docs
  - extension + CLI
- [ ] onboarding “1 minuto”

---

# 🧩 Backlog Técnico Contínuo

## CLI
- [ ] logs estruturados
- [ ] `--resume`, `--reset` e `--dry-run`
- [ ] melhorar scaffolding de workflows e docs

## VS Code Extension
- [ ] activation events robustos
- [ ] debug / Dev Host confiável
- [ ] melhor experiência de terminal
- [ ] “Open Docs” com auto-detect de idioma

## Copilot Chat
- [ ] autocomplete de `/commands` (quando API permitir)
- [ ] melhorias nos followups (botões contextuais)
- [ ] prompts padronizados por comando

---

# ✅ Roadmap (Resumo em Milestones)

### **Milestone v0.2 — AI-first Wizard**
- stage selector + próximos passos
- ai actions em perguntas
- input humano (outros/all/none)
- orchestrator + specialists mínimos

### **Milestone v0.3 — Deep Intake + Diagnose/Plan**
- /diagnose
- /plan
- compliance pack BR
- scorecard maturidade

### **Milestone v0.4 — Packs + Productization**
- plugin system packs
- sources cache/index
- template público
- integrações opcionais

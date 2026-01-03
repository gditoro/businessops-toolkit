# /intake — Build Company Context (Safe Mode)

> Este comando pode ser invocado como:
>
> - `/intake`
> - `@businessops /intake`

## Objetivo

Construir um contexto robusto e utilizável da empresa, de forma guiada e **à prova de erro**.
Este é o principal “wizard” do toolkit — pensado para fundadores.

✅ Safe Mode (obrigatório):

- 1 pergunta por vez
- opções curtas (para virar botões quando possível)
- aceita texto como fallback
- validação forte (não avança com resposta inválida)
- salva progresso (checkpoint) após cada resposta

✅ Política A (obrigatória):

- **Nunca rodar `/generate` automaticamente sem permissão.**
- Sempre perguntar `YES/NO` antes.

---

## Inputs que você deve ler

1) `businessops/AGENTS.md`
2) `businessops/workflows/wizard.yaml`
3) `businessops/state/answers.yaml` (se existir)
4) `businessops/state/company.yaml` (se existir)

## Outputs que você deve atualizar

- `businessops/state/answers.yaml`
- `businessops/state/company.yaml`

Após atualizar:

- **não rode `/generate` automaticamente sem permissão**
- ao final do intake, pergunte `YES/NO` antes de gerar docs
- se `NO`, instrua o comando manual para o usuário rodar

---

## Regra de Reset / Resume (IMPORTANTE)

Se `businessops/state/answers.yaml` existir:

1) diga: “Encontrei respostas existentes.”
2) pergunte (1 por vez, com opções):
   - `CONTINUE` (manter)
   - `RESET` (começar do zero)
   - `EXIT` (sair)

Se `CONTINUE`:

- continue perguntando **apenas o que estiver faltando** (ou confirme itens críticos se houver conflito).

Se `RESET`:

- sobrescreva `answers.yaml` com respostas vazias
- sobrescreva `company.yaml`, mantendo apenas `meta.*` se o usuário quiser.

---

## Como perguntar (padrão obrigatório)

- Pergunte **uma coisa por vez**
- Mostre opções com valores exatos
- Frase padrão:
  **“Clique numa opção ou responda com o valor exato.”**
- Se vier resposta inválida, repita com calma e não avance
- Após cada resposta:
  - confirme em 1 linha (“Perfeito — anotei: ...”)
  - atualize `answers.yaml` (checkpoint)

### Regra obrigatória sobre /generate (política A)

- Só rode `/generate` se o usuário autorizar explicitamente.
- Sempre pergunte `YES/NO` antes de gerar docs automaticamente.
- Exceção: se o usuário tiver digitado `/generate` diretamente.

---

## Etapa 0 — Reset/Resume (se existir answers.yaml)

Se não existir, pule.

## Pergunta 0.1

**Encontrei respostas anteriores. O que você quer fazer?**
(Clique numa opção ou responda com o valor exato)

- `CONTINUE` — continuar com o que já existe
- `RESET` — apagar e começar do zero
- `EXIT` — sair agora

✅ Se `RESET`, confirme:
**Tem certeza? Isso apaga as respostas. (YES/NO)**

---

## Etapa 1 — Configuração essencial (3 perguntas, 1 por vez)

### Pergunta 1.1 — Lifecycle

**A empresa é nova ou já existente?**
(Clique numa opção ou responda com o valor exato)

- `NEW` — ainda está começando (ou não opera de verdade ainda)
- `EXISTING` — já opera / já vende / já tem clientes
- `UNKNOWN` — não tenho certeza

✅ Após resposta:
“Perfeito — anotei: lifecycle_mode = EXISTING.”

Salvar checkpoint:

- answers.lifecycle_mode

---

### Pergunta 1.2 — Country Mode

**Qual o modo de país/regras?**
(Clique numa opção ou responda com o valor exato)

- `BR` — foco Brasil (tributação, importação, ANVISA etc.)
- `GLOBAL` — múltiplos países / foco internacional
- `UNKNOWN` — não tenho certeza

✅ Após resposta:
“Fechado — country_mode = BR.”

Salvar checkpoint:

- answers.country_mode
- meta.country_mode

---

### Pergunta 1.3 — Idioma dos documentos

**Qual idioma você quer para os documentos gerados?**
(Clique numa opção ou responda com o valor exato)

- `PT-BR` — só português
- `EN` — só inglês
- `BILINGUAL` — português + inglês (recomendado se você lida com fora)
- `UNKNOWN`

✅ Após resposta:
“Show — language_preference = PT-BR.”

Salvar checkpoint:

- answers.language_preference
- meta.language_preference

---

### Checkpoint de confirmação (obrigatório)

✅ “Resumo até aqui: `{{lifecycle}} + {{country_mode}} + {{language_pref}}`
Confirmo essas escolhas?”

- `CONFIRM` — seguir
- `CHANGE` — voltar e ajustar

Se `CHANGE`, pergunte qual item mudar:

- lifecycle
- country_mode
- language
E refaça apenas aquele item.

---

## Etapa 2 — Pack (indústria)

### Pergunta 2.1 — Pacote

**Qual pacote você quer ativar?**
(Clique numa opção ou responda com o valor exato)

- `industry-neutral` — padrão (recomendado)
- `health-import` — importação e materiais médicos (Brasil ou global)
- `UNKNOWN` — ainda não sei

✅ Após resposta:
“Beleza — pack = health-import.”

Salvar checkpoint:

- answers.industry_pack
- meta.packs = [pack]

---

## Etapa 3 — Identidade (1 por vez)

### Pergunta 3.1 — Nome

**Qual é o nome da empresa?**
(responda com texto; se não quiser agora, responda `SKIP`)
Exemplo: “Gamma Crucis”

Salvar checkpoint:

- answers.company_name
- company.identity.name (se fornecido)

---

### Pergunta 3.2 — One-liner (obrigatório)

**Em 1 frase: o que a empresa faz?**
Exemplo: “Importação e distribuição de materiais médicos descartáveis no Brasil.”
Se quiser, eu posso sugerir 3 versões para você escolher.

- Responda com texto, ou `SUGGEST` para eu sugerir.

Salvar checkpoint:

- answers.one_liner
- company.identity.one_liner

---

### Pergunta 3.3 — Estágio

**Em que estágio você está?**
(Clique ou responda com o valor exato)

- `IDEA` — ainda validando
- `EARLY` — já começou, ainda pequeno
- `GROWTH` — crescendo e estruturando
- `SCALE` — operação madura e escalando
- `UNKNOWN`

Salvar checkpoint:

- answers.stage
- company.identity.stage

---

### Pergunta 3.4 — Tamanho do time

**Qual o tamanho do time hoje?**
(Clique ou responda com o valor exato)

- `SOLO` — só eu
- `SMALL` — 2 a 10
- `MEDIUM` — 11 a 50
- `LARGE` — 51+
- `UNKNOWN`

Salvar checkpoint:

- answers.headcount_range
- company.identity.headcount_range

---

## Etapa 4 — Terceirização (1 por vez)

### Pergunta 4.1 — Serviços terceirizados

**O que é terceirizado hoje?**
(Clique ou responda com valores separados por vírgula)

Opções comuns:

- `ACCOUNTING`
- `CUSTOMS_BROKER`
- `WAREHOUSE_3PL`
- `LEGAL`
- `HR`
- `MARKETING`
- `IT`
- `NONE`
- `UNKNOWN`

Salvar checkpoint:

- answers.outsourced_services (lista)
- company.ops.outsourced_services (lista)

---

## Etapa 5 — Mercado (1 por vez)

### Pergunta 5.1 — Tipo de cliente

**Quem compra de você hoje (ou quem você quer que compre primeiro)?**
(Clique ou responda com valores separados por vírgula)

- `HOSPITALS`
- `CLINICS`
- `DISTRIBUTORS`
- `GOVERNMENT`
- `CONSUMERS`
- `OTHER`
- `UNKNOWN`

Salvar checkpoint:

- answers.customer_type
- company.market.customer_type

---

### Pergunta 5.2 — ICP (perfil ideal)

**Qual é o seu cliente ideal?**
Exemplo: “Clínicas de médio porte que compram mensalmente e valorizam entrega rápida.”
(responda com texto curto ou `UNKNOWN`)

Salvar checkpoint:

- answers.icp
- company.market.icp

---

### Pergunta 5.3 — Dor principal do cliente

**Qual é a dor principal que você resolve?**
Exemplos: “faltas frequentes”, “preço instável”, “entrega lenta”, “qualidade inconsistente”.
(responda com texto curto ou `UNKNOWN`)

Salvar checkpoint:

- answers.customer_pains
- company.market.customer_pains

---

### Pergunta 5.4 — Posicionamento

**Como você quer ser escolhido?**
Exemplos: “melhor custo-benefício”, “entrega mais confiável”, “qualidade premium”, “compliance impecável”.
(responda com texto curto ou `UNKNOWN`)

Salvar checkpoint:

- answers.positioning
- company.market.positioning

---

### Pergunta 5.5 — Aquisição de clientes

**Como você consegue clientes hoje?**
(Clique ou responda com valores separados por vírgula)

- `OUTBOUND_SALES`
- `INBOUND_MARKETING`
- `PARTNERSHIPS`
- `REFERRALS`
- `MARKETPLACES`
- `TENDERS`
- `UNKNOWN`

Salvar checkpoint:

- answers.acquisition_channels
- company.market.acquisition_channels

---

## Etapa 6 — Receita e precificação (1 por vez)

### Pergunta 6.1 — Modelo de receita

**Como a empresa ganha dinheiro?**
(Clique ou responda com o valor exato)

- `TRANSACTIONAL` — venda por pedido
- `RECURRING` — assinatura/contrato recorrente
- `MIXED` — mistura
- `UNKNOWN`

Salvar checkpoint:

- answers.revenue_model
- company.revenue.model

---

### Pergunta 6.2 — Modelo de preço

**Como você define preço na prática?**
(Clique ou responda com o valor exato)

- `FIXED` — tabela fixa
- `NEGOTIATED` — negociação por cliente/pedido
- `COST_PLUS` — custo + margem
- `MARKET_REFERENCE` — baseado em concorrência/mercado
- `UNKNOWN`

Salvar checkpoint:

- answers.pricing_model
- company.pricing.model

---

### Pergunta 6.3 — Condições de pagamento

**Qual é a condição de pagamento típica?**
Exemplos: “à vista”, “30 dias”, “15/30/45”, “PIX + boleto”
(responda com texto curto ou `UNKNOWN`)

Salvar checkpoint:

- answers.payment_terms
- company.finance.payment_terms

---

## Etapa 7 — Operações (1 por vez)

### Pergunta 7.1 — Tipo de entrega / fulfillment

**Você entrega com base em estoque ou sob encomenda?**
(Clique ou responda com o valor exato)

- `INVENTORY` — tem estoque e entrega rápido
- `MAKE_TO_ORDER` — compra/importa após pedido
- `MIXED` — ambos
- `UNKNOWN`

Salvar checkpoint:

- answers.delivery_type
- company.ops.delivery_type

---

### Pergunta 7.2 — Complexidade da cadeia

**Quão complexa é sua cadeia de suprimentos hoje?**
(Clique ou responda com o valor exato)

- `LOW`
- `MEDIUM`
- `HIGH`
- `UNKNOWN`

Salvar checkpoint:

- answers.supply_chain_complexity
- company.ops.complexity

---

### Pergunta 7.3 — Gargalo atual

**Qual é o maior gargalo operacional hoje?**
Exemplos: “previsão de demanda”, “estoque”, “desembaraço”, “fluxo de caixa”, “vendas”, “prazos”.
(responda com texto curto ou `UNKNOWN`)

Salvar checkpoint:

- answers.biggest_ops_problem
- company.ops.bottleneck

---

### Pergunta 7.4 — Fluxo Order-to-Cash (O2C)

**Como é seu fluxo do pedido até receber o dinheiro?**
Se quiser, responda com uma lista simples: “pedido → faturamento → entrega → cobrança”.
(responda com texto curto ou `UNKNOWN`)

Salvar checkpoint:

- answers.order_to_cash_steps
- company.processes.order_to_cash_steps (lista se possível)

---

## Etapa 8 — Riscos e compliance (1 por vez)

### Pergunta 8.1 — Regulatório

**Seu negócio é regulado (por exemplo, ANVISA) ou exige documentação formal?**
(Clique ou responda com o valor exato)

- `YES`
- `NO`
- `UNKNOWN`

Salvar checkpoint:

- answers.regulated
- company.compliance.regulated

---

### Pergunta 8.2 — Top 3 riscos

**Quais são os 3 maiores riscos hoje?**
Exemplos: “câmbio”, “atraso importação”, “inadimplência”, “avaria”, “dependência fornecedor”.
(responda em bullets ou texto; se não souber, `UNKNOWN`)

Salvar checkpoint:

- answers.top_risks
- company.risks.top

---

## Etapa 9 — Metas (90/180/365)

### Pergunta 9.1 — Meta 90 dias

**Qual é o objetivo mais importante para os próximos 90 dias?**
Exemplos: “fechar X clientes”, “reduzir rupturas”, “padronizar importação”, “aumentar margem”.
(responda com texto curto ou `UNKNOWN`)

Salvar checkpoint:

- answers.goals_90
- company.goals.days_90

---

### Pergunta 9.2 — Meta 180 dias

**E para 180 dias?**
(responda com texto curto ou `UNKNOWN`)

Salvar checkpoint:

- answers.goals_180
- company.goals.days_180

---

### Pergunta 9.3 — Meta 365 dias

**E para 365 dias?**
(responda com texto curto ou `UNKNOWN`)

Salvar checkpoint:

- answers.goals_365
- company.goals.days_365

---

### Etapa 10 — Finalização + geração de docs (gating)

Quando os campos mínimos estiverem preenchidos:

1) Compile e atualize `businessops/state/company.yaml` com base nas respostas.
2) Salve checkpoint final em `businessops/state/answers.yaml`.

### Pergunta final (obrigatória)

**Quer que eu rode o gerador agora para criar/atualizar os docs?**
(Clique numa opção ou responda com o valor exato)

- `YES` — rodar `/generate` agora
- `NO` — não rodar agora (você pode rodar depois)

Se `YES`:

- execute `/generate` (CLI generator)
- confirme os arquivos atualizados (paths)

Se `NO`:

- instrua o comando exato:
  - `npm run dev --prefix cli -- generate`

### Próximo passo sugerido

Sugira no máximo 2:

- `/structure` — papéis + reuniões + governança terceirizados
- `/diagnose` — riscos + gaps + prioridades
- `/plan` — plano 90/180/365
- `/clarify` — completar lacunas essenciais

---

## Critério de conclusão mínimo do Intake

✅ Tem que existir:

- lifecycle_mode
- country_mode
- language_preference
- industry_pack (ou meta.packs)
- one_liner
- stage
- headcount_range

Se faltar algo essencial:

- pergunte só o que falta antes de encerrar.

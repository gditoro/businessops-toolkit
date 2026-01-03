# /structure — Estrutura organizacional + papéis + cadência (Safe Mode)

## Objetivo

Criar uma estrutura organizacional mínima e prática para a empresa,
com papéis, responsabilidades e cadência operacional.

✅ Este comando deve produzir:

- sugestão de departamentos e papéis (para o estágio atual)
- mini-RACI (quem decide, executa, apoia)
- operating rhythm (reuniões essenciais)
- governança de terceirizados (como controlar contabilidade, despachante, armazém)
- atualizações no estado e docs

Tudo de forma **realista, simples e executável**, sem burocracia.

---

## Inputs obrigatórios

1) `businessops/state/company.yaml`
2) `businessops/state/answers.yaml` (se existir)
3) docs atuais em `businessops/docs/*` (se existirem)
4) `meta.packs` (ex.: `health-import`)

---

## Outputs obrigatórios

Atualize os seguintes docs:

- `businessops/docs/pt-br/org.md` (sempre, se PT-BR ou BILINGUAL)
- `businessops/docs/en/org.md` (se EN ou BILINGUAL)
- `businessops/docs/pt-br/meetings.md` e `businessops/docs/en/meetings.md`

Atualize também:

- `businessops/state/company.yaml` (se novos papéis/departamentos forem definidos)

Depois disso, rode `/generate` para garantir consistência (se aplicável).

---

## Safe Mode (obrigatório)

Antes de gerar estrutura:

1) Leia `company.yaml` e identifique:
   - estágio (stage)
   - tamanho do time (headcount_range)
   - serviços terceirizados
   - gargalo operacional (bottleneck)
   - pack (industry-neutral / health-import)

2) Se faltar informação essencial para estruturar:
   - pergunte **apenas 1 pergunta por vez**
   - e no máximo 3 perguntas no total
   - exemplos e opções curtas

Exemplo de pergunta essencial:
“Hoje você tem mais gente em vendas ou em operação? (SALES / OPS / BOTH / UNKNOWN)”

Se ainda faltar info, use [ASSUMPTION].

---

## Princípios de estrutura (importante)

- Estrutura deve caber no tamanho atual da empresa.
- Se for `SOLO` ou `SMALL`:
  - papéis são “chapéus” (um dono com múltiplas funções)
- Se for `MEDIUM` ou maior:
  - separar por áreas e líderes

Sempre inclua:

- **Owner** (quem é responsável)
- **KPIs básicos** por área
- **Interfaces** com terceirizados

---

## Entregáveis (o que você deve escrever nos docs)

### 1) Departamentos sugeridos (mínimo)

Crie uma lista curta (máximo 6 áreas), por exemplo:

- Direção / Administração
- Comercial
- Operações (Importação + Logística + Estoque)
- Financeiro
- Qualidade & Compliance (se health-import)
- Atendimento / Pós-venda

Para cada área:

- objetivo
- responsabilidades
- KPIs

---

### 2) Papéis (por estágio)

Defina papéis mínimos e explique:

- quando contratar (gatilho)
- se pode ser terceirizado

Inclua explicitamente:

- Fundador / CEO (ou Direção)
- Ops Lead (import/logística)
- Comercial Lead
- Finance/Admin (interno ou terceirizado)
- Quality/Regulatory (se pack health-import)

---

### 3) Mini-RACI (super prático)

Crie uma tabela curta do tipo:

| Processo | Responsável (R) | Aprovador (A) | Consultado (C) | Informado (I) |
|---|---|---|---|---|
| Compra internacional | ... | ... | ... | ... |
| Desembaraço | ... | ... | ... | ... |
| Gestão de estoque | ... | ... | ... | ... |
| Faturamento | ... | ... | ... | ... |
| Pagamentos | ... | ... | ... | ... |
| Atendimento | ... | ... | ... | ... |

---

### 4) Operating Rhythm (cadência mínima)

Criar uma cadência simples, por exemplo:

- Diário (15 min): Operações + status pedidos/importações (se aplicável)
- Semanal: Pipeline comercial + previsões + estoque
- Quinzenal: Financeiro + contas a pagar/receber + fluxo de caixa
- Mensal: Resultados + KPIs + riscos + decisões estratégicas

Para cada reunião:

- objetivo
- participantes
- pauta fixa
- métricas revisadas
- outputs (ex.: lista de decisões)

---

### 5) Governança de terceirizados (essencial para seu caso)

Como a empresa tem contabilidade / despacho / 3PL terceirizados, crie um bloco com:

- responsabilidades do fornecedor
- responsabilidades internas (quem cobra, quem confere)
- SLAs básicos (ex.: prazo de fechamento contábil, status de DI, acuracidade de estoque)
- checklist mensal
- riscos e mitigação

Exemplo:

- Contabilidade: fechamento até dia X, conciliação, DRE, impostos
- Despachante: status diário, documentos, alertas de atraso
- 3PL: inventário, acuracidade, avarias, picking

---

## Pack health-import (se ativo)

Se `meta.packs` inclui `health-import`, inclua adicionalmente:

- papel “Regulatório/Qualidade”
- processos mínimos de compliance (por exemplo: rastreabilidade lote, documentos ANVISA, controle de não conformidade)
- risco de importação + mitigação (documentação, lead time, dólar, dependência de fornecedor)

Marque como [VERIFY] qualquer detalhe regulatório específico.

---

## Como escrever nos arquivos (regra)

1) Atualize `org.md` com:
   - Estrutura
   - Papéis
   - Mini-RACI
   - Plano de contratação (gatilhos)
2) Atualize `meetings.md` com:
   - cadência de reuniões
   - templates de pauta
   - outputs esperados

Respeite os markers:
<!-- BO:BEGIN GENERATED -->
<!-- BO:END GENERATED -->

---

## Finalização (Safe Mode — obrigatório)

Ao concluir:

1) Diga quais arquivos foram atualizados (paths) e o que mudou (resumo curto).

2) Pergunte (1 pergunta, com opções):
**Quer que eu rode o gerador agora para sincronizar os docs?**
(Clique numa opção ou responda com o valor exato)

- `YES` — rodar `/generate` agora
- `NO` — não rodar agora (você pode rodar depois)

Se `YES`:

- execute `/generate` (CLI generator)
- confirme os arquivos atualizados

Se `NO`:

- instrua o comando exato:
  - `npm run dev --prefix cli -- generate`

1) Sugira o próximo passo (escolha 1 ou 2 no máximo):

- `/diagnose` — gaps + riscos + prioridades
- `/plan` — plano 90/180/365
- `/clarify` — se faltou info essencial

---

## Critério de conclusão

✅ Org + meetings docs atualizados
✅ Estrutura prática + clara
✅ Governança de terceirizados incluída
✅ Próximo passo recomendado

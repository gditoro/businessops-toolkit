# /clarify — Perguntas de alto impacto (Safe Mode, máx 3)

## Objetivo

Fazer no máximo **3 perguntas** que aumentem muito a qualidade do resultado (docs + plano + estrutura),
sem cansar o usuário.

✅ Safe Mode:

- 1 pergunta por vez
- opções quando fizer sentido
- exemplos curtos
- validação
- checkpoint após cada resposta

---

## Inputs

- `businessops/state/company.yaml`
- `businessops/state/answers.yaml`
- `businessops/docs/*` (se existirem)

## Outputs

- atualizar `answers.yaml` e `company.yaml`
- executar `/generate`

---

## Como escolher perguntas (máx 3)

Escolha apenas as perguntas que:

1) desbloqueiam decisões
2) reduzem risco
3) melhoram a estrutura operacional

Exemplos de gaps comuns:

- ICP indefinido
- riscos principais não listados
- gargalo operacional vazio
- modelo de receita/preço mal definido
- objetivos 90 dias vagos

---

## Execução (passo a passo)

1) Leia `company.yaml`
2) Identifique 1–3 gaps de alto impacto
3) Pergunte 1 por vez, com exemplos
4) Após cada resposta:
   - confirme (“Anotei: ...”)
   - salve checkpoint em `answers.yaml`
5) No final:
   - normalize em `company.yaml`
   - rode `/generate`
   - sugira próxima etapa: `/structure` ou `/diagnose` ou `/plan`

---

## Formato das perguntas (PT-BR friendly)

Use sempre este padrão:

**Pergunta X — [Tema]**
[Texto simples]
Exemplos: (ex1, ex2, ex3...)
(responda com texto curto; se não souber, responda `UNKNOWN`)

---

## Critério de conclusão

✅ 1–3 respostas adicionadas
✅ `company.yaml` mais completo
✅ docs regenerados
✅ próximo passo recomendado

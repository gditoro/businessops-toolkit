# /generate — Atualizar docs via CLI generator (Safe Mode)

## Objetivo

Gerar/atualizar documentos do BusinessOps usando o gerador oficial do CLI (determinístico),
a partir de:

- `businessops/state/company.yaml`
- templates em `businessops/templates/docs/*`

✅ Por padrão, este comando **não** edita docs manualmente.
Ele aciona o gerador do CLI.

---

## Inputs obrigatórios

1) `businessops/state/company.yaml`
2) `businessops/state/schema-version.yaml` (se existir)
3) templates em `businessops/templates/docs/en/` e `businessops/templates/docs/pt-br/`

## Outputs

- `businessops/docs/en/*.md`
- `businessops/docs/pt-br/*.md`

---

## Regra de segurança (markers)

Os docs gerados devem respeitar os blocos:

<!-- BO:BEGIN GENERATED -->
<!-- BO:END GENERATED -->

O gerador deve atualizar apenas o conteúdo dentro desses markers,
preservando notas do usuário fora do bloco.

Se o gerador não respeitar isso, interrompa e reporte como bug.

---

## Safe Mode (obrigatório)

Antes de gerar:

1) Faça um checklist rápido:
   - `company.yaml` existe?
   - `templates/docs/*` existem?
2) Se algo estiver faltando:
   - explique em PT-BR o que falta
   - ofereça passos exatos

---

## Execução padrão (recomendado)

Instrua o usuário a rodar o CLI no terminal do repo (raiz):

### Windows / PowerShell

```powershell
npm run dev --prefix cli -- generate

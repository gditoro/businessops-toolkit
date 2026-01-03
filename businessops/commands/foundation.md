# /foundation — Initialize BusinessOps Context

## Purpose

Set working rules for this repository and confirm the baseline configuration:

- language preference
- country mode (Brazil or Global)
- industry pack selection
- confirm how docs should be generated and maintained

## Inputs to read

1) `businessops/AGENTS.md`
2) `businessops/workflows/wizard.yaml` (for available questions)
3) `businessops/state/company.yaml` (if exists)
4) `businessops/state/answers.yaml` (if exists)

## Output files to update

- `businessops/state/company.yaml` (only meta defaults if missing)
- `businessops/state/answers.yaml` (record baseline answers)

## Instructions (do these steps)

1) Summarize what this toolkit does in 2 lines.
2) Check whether `company.yaml` already exists.
3) If `company.yaml` does not exist:
   - Ask the user:
     - Preferred output language: PT-BR / EN / Bilingual
     - Country mode: Brazil / Global
     - Industry pack: industry-neutral / health-import
   - Use neutral friendly PT-BR unless user asks otherwise.
4) Save those as:
   - `meta.language_preference`
   - `meta.country_mode`
   - `meta.packs`
5) If `company.yaml` exists:
   - Show current `meta.*` values
   - Ask: “Do you want to keep them or change them?”
6) End by suggesting the next command:
   - “Next: run `/intake` to build full company context.”

## Constraints

- Keep it simple. Avoid technical language.
- Ask no more than 3 questions at once.
- If user is unsure, recommend defaults:
  - language: BILINGUAL
  - country_mode: BR
  - pack: industry-neutral

## Completion criteria

- `company.yaml` exists with `meta.*` filled
- `answers.yaml` exists with foundation answers
- user has clear next step: `/intake`

# BusinessOps Toolkit — Agent System (AGENTS.md)

You are operating inside a BusinessOps Toolkit repository.
Your mission is to help a founder build and maintain a Business Operating System for a company.

Canonical outputs:
- businessops/state/company.yaml
- businessops/state/answers.yaml
- businessops/docs/en/*.md
- businessops/docs/pt-br/*.md

This repo uses a Spec Kit–style command system:
- businessops/commands/

If the user types /intake, load .copilot/commands/intake.md and follow it strictly.

Key rules:
1) Be practical. Avoid theory. Always produce actionable outputs.
2) If info is missing: use [ASSUMPTION] and continue; add “Questions to refine”.
3) Separate ESSENTIAL vs RECOMMENDED.
4) Don’t invent legal claims; mark as [VERIFY] when needed.
5) Friendly PT-BR by default when BILINGUAL.
6) Ask max 3 clarification questions at a time.
7) Update repo files; don’t keep important outputs only in chat.

Generated content must stay inside markers:
<!-- BO:BEGIN GENERATED -->
<!-- BO:END GENERATED -->

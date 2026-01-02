# BusinessOps Toolkit (v0.1)

A toolkit (inspired by spec-kit / bmad) for founders to **structure, plan, and operate a business** using:
- a guided wizard (NEW vs EXISTING),
- bilingual docs (EN + PT-BR),
- machine-readable company state (YAML),
- consistent templates (consulting-grade),
- and workflows optimized for **GitHub Copilot in VS Code**.

---

## What this toolkit produces

After you run the wizard, the toolkit generates:

✅ **Human-readable documentation**
- Company Overview
- Org structure + roles
- Process map (high level)
- KPI starter pack
- Policies (starter)
- Meeting cadence
- Roadmap (90 / 180 / 365)

✅ **Machine-readable state**
- `businessops/state/company.yaml` (canonical company context)
- `businessops/state/answers.yaml` (raw wizard answers)

✅ **Reports**
- `businessops/reports/audit.md` (completeness check)
- `businessops/reports/gaps.json` (missing information)

✅ **Diagrams**
- Mermaid diagrams embedded in docs or saved under `businessops/diagrams/`

Everything is version-controlled and diff-friendly.

---

## Who is this for?

### Primary user: Founder
Use it to:
- build an operating system for a new company
- restructure an existing business
- improve processes and governance
- create consistent docs and planning artifacts
- maintain a single source of truth for decisions and operating routines

---

## Quick Start (non-technical)

### 1) Install prerequisites
- VS Code
- GitHub Copilot (recommended)
- Node.js (for the CLI)

### 2) Initialize the workspace
```bash
npx businessops init

# Organization & Roles

<!-- BO:BEGIN GENERATED -->
## Current / Planned Structure (High-Level)
- Lifecycle mode: **NEW**
- Stage: **EARLY**
- Team size: **SMALL**
- Packs: **industry-neutral**
- Delivery: **INVENTORY**
- Outsourcing: **SOME**

### Outsourced services
- ACCOUNTING

### Bottleneck
- [ASSUMPTION] Current bottleneck is unclear ownership + cadence.

## Suggested departments (minimum executable)
> Max 6 areas. At **SMALL** size, treat these as “hats” (one person can own multiple).

### Direction / Administration
- **Objective:** Align priorities and decisions; allocate resources.
- **Owner:** Founder / CEO
- **KPIs:** `decisions_per_week`, `actions_on_time_pct`, `runway_months`
- **Cost/complexity:** [ASSUMPTION] low–medium
- **Risk mitigated:** [ASSUMPTION] unpredictability / rework / cash risk
- **Expected impact:** [ASSUMPTION] more consistent execution

### Commercial (Sales)
- **Objective:** Generate predictable revenue.
- **Owner:** Sales owner
- **KPIs:** `qualified_leads_per_week`, `conversion_rate`, `sales_cycle_days`, `closed_revenue_month`
- **Cost/complexity:** [ASSUMPTION] low–medium
- **Risk mitigated:** [ASSUMPTION] unpredictability / rework / cash risk
- **Expected impact:** [ASSUMPTION] more consistent execution

### Operations (Inventory + Fulfillment)
- **Objective:** Deliver on time with accuracy and controlled costs.
- **Owner:** Ops owner
- **KPIs:** `otif_pct`, `inventory_accuracy_pct`, `stockout_pct`, `order_lead_time_days`, `return_rate_pct`
- **Cost/complexity:** [ASSUMPTION] low–medium
- **Risk mitigated:** [ASSUMPTION] unpredictability / rework / cash risk
- **Expected impact:** [ASSUMPTION] more consistent execution

### Finance & Admin
- **Objective:** Protect cash and provide minimum controls.
- **Owner:** Finance owner
- **KPIs:** `cash_projection_weeks`, `dso_days`, `gross_margin_pct`, `on_time_payments_pct`
- **Cost/complexity:** [ASSUMPTION] low–medium
- **Risk mitigated:** [ASSUMPTION] unpredictability / rework / cash risk
- **Expected impact:** [ASSUMPTION] more consistent execution

### Customer Support / Post-sales
- **Objective:** Resolve issues fast and reduce rework.
- **Owner:** Support owner
- **KPIs:** `first_response_time_hours`, `resolution_time_hours`, `return_rate_pct`
- **Cost/complexity:** [ASSUMPTION] low–medium
- **Risk mitigated:** [ASSUMPTION] unpredictability / rework / cash risk
- **Expected impact:** [ASSUMPTION] more consistent execution


## Roles (by stage) + hiring triggers
> In **EARLY/SMALL**, make ownership explicit even if one person wears multiple hats.

| Role | Area | Summary | Hiring trigger | Outsource-friendly? |
|---|---|---|---|---|
| Founder / CEO | Direction / Administration | Strategy, trade-offs, and final decisions. | When 2+ functional leads exist and decisions stall | NO |
| Ops Lead | Operations (Inventory + Fulfillment) | Owns OTIF, inventory, and fulfillment cadence. | When OTIF drops or stockouts/incidents become recurring | NO |
| Commercial Lead | Commercial (Sales) | Owns pipeline, forecasting, and pricing execution. | When pipeline requires daily follow-up and forecast misses persist | NO |
| Finance/Admin Owner | Finance & Admin | Owns AP/AR, cash projection, and basic controls. | When AP/AR discipline slips or cash can’t be projected 8–12 weeks | NO |
| Support Owner | Customer Support / Post-sales | Owns support SLAs and feedback loop to ops. | When support becomes a bottleneck affecting ops/sales | YES |

## Mini-RACI (super practical)
Roles:
- **DIR** = Founder/Direction
- **SAL** = Sales owner
- **OPS** = Ops owner
- **FIN** = Finance owner
- **ACC(V)** = Accounting vendor
- **3PL(V)** = Warehouse/3PL vendor (if any)
- **BROKER(V)** = Customs broker vendor (if any)

| Process | R | A | C | I |
|---|---|---|---|---|
| Lead → Qualification | SAL | SAL | DIR | FIN, OPS |
| Proposal / Pricing | SAL | DIR | FIN | OPS |
| Order confirmation | SAL | SAL | OPS | FIN |
| Invoicing / Taxes | FIN | FIN | ACC(V), SAL | OPS |
| Fulfillment (pick/ship) | OPS (or 3PL(V)) | OPS | SAL | FIN, DIR |
| Collections / Receipts | FIN | FIN | SAL | DIR |
| Replenishment / Purchasing | OPS | DIR | FIN, SAL | ACC(V) |
| Inventory / Accuracy | OPS (or 3PL(V)) | OPS | FIN | DIR |
| Monthly close + filings | ACC(V) | FIN | DIR | OPS, SAL |
| Support / Returns | Support | OPS | SAL | FIN |

## Outsourced governance (ready-to-run)
### Accounting — ESSENTIAL
- **Objective:** predictable close and filings.
- **Internal owner:** Finance owner.
- **Suggested SLAs:** close by **D+10**; responses in **1 business day**; tax guides with **3 business days** lead time. [ASSUMPTION]
- **Monthly checklist:** reconciliation; taxes; invoicing; expenses; accruals; P&L; open issues.
- **Vendor KPIs:** days to close; rework rate; fines/late filings = 0.

### Warehouse/3PL — if applicable
- **Internal owner:** Ops owner.
- **SLAs:** inventory accuracy; OTIF; damages; ship time.

### Customs broker — if applicable
- **Internal owner:** Ops owner.
- **SLAs:** daily status; documentation alerts; predictable clearance.

## Questions to refine (one round)
1) Besides accounting, do you use a **warehouse/3PL** and/or a **customs broker**? (NONE / 3PL / BROKER / BOTH / NOT SURE)
<!-- BO:END GENERATED -->

## Notes (editable)
Add your actual org chart, role descriptions, or hiring plan here.

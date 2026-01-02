# Organização e Papéis

<!-- BO:BEGIN GENERATED -->
## Estrutura Atual / Planejada (Alto Nível)
- Modo: **NEW**
- Estágio: **EARLY**
- Tamanho do time: **SMALL**
- Packs: **industry-neutral**
- Entrega: **INVENTORY**
- Terceirização: **SOME**

### Serviços Terceirizados
- ACCOUNTING

### Gargalo (bottleneck)
- [ASSUMPTION] Gargalo principal hoje é clareza de dono por área + cadência.

## Departamentos sugeridos (mínimo executável)
> Máximo de 6 áreas. Em **SMALL**, isso vira “chapéus” (uma pessoa pode acumular).

### 1) Direção / Administração
- **Objetivo:** alinhar prioridades, decisões e alocação de recursos.
- **Responsabilidades:** estratégia trimestral, decisões de trade-off, gestão de riscos, aprovações fora do padrão.
- **Owner:** Fundador / CEO.
- **KPIs:** decisões fechadas/semana; % ações no prazo; runway (meses).
- **Custo/complexidade:** baixo.
- **Risco mitigado:** caos de prioridades; decisões “no escuro”.
- **Impacto esperado:** foco e velocidade.

### 2) Comercial (Vendas)
- **Objetivo:** gerar e fechar receita com previsibilidade.
- **Responsabilidades:** pipeline, propostas, negociação, forecast, handoff para operação.
- **Owner:** Dono de Vendas (pode ser o fundador no início).
- **KPIs:** leads qualificados/semana; conversão; ciclo de vendas; receita fechada/mês.
- **Custo/complexidade:** baixo–médio.
- **Risco mitigado:** receita imprevisível; descontos sem governança.
- **Impacto esperado:** crescimento previsível.

### 3) Operações (Estoque + Fulfillment)
- **Objetivo:** entregar no prazo com acuracidade e custo controlado.
- **Responsabilidades:** compras/reabastecimento, recebimento, estoque, separação/expedição, transportadoras, devoluções.
- **Owner:** Dono de Operações.
- **KPIs:** OTIF; acuracidade de estoque; ruptura (% SKUs); lead time do pedido; devoluções.
- **Custo/complexidade:** médio.
- **Risco mitigado:** ruptura; excesso de estoque; perda de margem.
- **Impacto esperado:** menos incêndios e melhor experiência do cliente.

### 4) Financeiro & Rotinas Administrativas
- **Objetivo:** manter caixa, cobrança e controles mínimos para decisão.
- **Responsabilidades:** AP/AR, conciliação, faturamento e impostos (com contabilidade), margem básica.
- **Owner:** Dono do Financeiro (interno).
- **KPIs:** caixa projetado 8–12 semanas; inadimplência; prazo médio de recebimento; % pagamentos em dia.
- **Custo/complexidade:** baixo–médio.
- **Risco mitigado:** quebra de caixa; obrigações fora do prazo.
- **Impacto esperado:** previsibilidade financeira.

### 5) Atendimento / Pós-venda
- **Objetivo:** resolver problemas rápido e reduzir retrabalho.
- **Responsabilidades:** suporte, status de pedido, reclamações, devoluções, feedback para operações.
- **Owner:** Dono de Atendimento (pode ser OPS no início).
- **KPIs:** tempo de 1ª resposta; tempo de resolução; % devoluções.
- **Custo/complexidade:** baixo.
- **Risco mitigado:** churn/recompra baixa; retrabalho.
- **Impacto esperado:** fidelização e redução de custo oculto.

### 6) Qualidade & Compliance (RECOMENDADO quando regulado)
- **Objetivo:** reduzir risco regulatório/contratual.
- **Responsabilidades:** documentação, rastreabilidade (se aplicável), não conformidades.
- **Owner:** Fundador (até haver especialista).
- **KPIs:** não conformidades abertas; tempo de fechamento; % documentos críticos atualizados.
- **Custo/complexidade:** baixo (no início).
- **Risco mitigado:** multas/embargos/contingências. **[VERIFY]** conforme setor.
- **Impacto esperado:** menos risco e mais confiança em grandes contas.

## Papéis (por estágio) + gatilhos de contratação
> Em **EARLY/SMALL**, trate como “chapéus” com dono claro.

| Papel | Área | Quando separar/contratar | Terceirizável? |
|---|---|---|---|
| Fundador / CEO | Direção | Quando 2+ líderes funcionais existirem e decisões travarem | NÃO |
| Ops Lead (Estoque/Fulfillment) | Operações | Quando OTIF cair / ruptura virar recorrente / rotina diária falhar | Parcial (execução), dono não |
| Comercial Lead | Comercial | Quando pipeline exigir follow-up diário e forecast falhar | NÃO |
| Finance/Admin Owner | Financeiro | Quando houver atraso em cobranças/pagamentos ou sem visão de caixa 8–12 semanas | Parcial (contabilidade), dono não |
| Atendimento Owner | Atendimento | Quando suporte virar gargalo e afetar operação/vendas | SIM (BPO), se houver dono interno |

## Mini-RACI (super prático)
Papéis usados:
- **DIR** = Fundador/Direção
- **SAL** = Dono de Vendas
- **OPS** = Dono de Operações
- **FIN** = Dono do Financeiro
- **ACC(V)** = Contabilidade (fornecedor)
- **3PL(V)** = Armazém/3PL (fornecedor, se existir)
- **BROKER(V)** = Despachante (fornecedor, se existir)

| Processo | R | A | C | I |
|---|---|---|---|---|
| Lead → Qualificação | SAL | SAL | DIR | FIN, OPS |
| Proposta / Precificação | SAL | DIR | FIN | OPS |
| Pedido / Confirmação | SAL | SAL | OPS | FIN |
| Emissão de NF / Faturamento | FIN | FIN | ACC(V), SAL | OPS |
| Separação/Expedição (fulfillment) | OPS (ou 3PL(V)) | OPS | SAL | FIN, DIR |
| Cobrança / Recebimento | FIN | FIN | SAL | DIR |
| Reabastecimento / Compras | OPS | DIR | FIN, SAL | ACC(V) |
| Inventário / Acuracidade | OPS (ou 3PL(V)) | OPS | FIN | DIR |
| Fechamento mensal + impostos | ACC(V) | FIN | DIR | OPS, SAL |
| Atendimento / Devoluções | Atendimento | OPS | SAL | FIN |

## Governança de terceirizados (modelo pronto)
### Contabilidade — ESSENCIAL
- **Objetivo:** fechamento correto e previsível; obrigações em dia.
- **Owner interno:** Dono do Financeiro.
- **SLAs sugeridos:** fechamento mensal até **D+10**; resposta em **1 dia útil**; guias com **3 dias úteis** de antecedência. [ASSUMPTION]
- **Checklist mensal:** conciliação; impostos; notas; despesas; provisões; DRE; pendências.
- **KPIs do fornecedor:** dias para fechar; retrabalho; multas/atrasos = 0.

### Armazém/3PL — se aplicável
- **Owner interno:** Dono de Operações.
- **SLAs:** acuracidade de estoque; OTIF; avarias; tempo de expedição.

### Despachante — se aplicável
- **Owner interno:** Dono de Operações.
- **SLAs:** status diário; alertas de documentação; previsibilidade de desembaraço.

## Perguntas para refinar (1 rodada)
1) Além de contabilidade, você usa **3PL/armazém** e/ou **despachante**? (NENHUM / 3PL / DESPACHANTE / AMBOS / NÃO SEI)
<!-- BO:END GENERATED -->

## Notas (editável)
Adicione organograma real, descrições de cargos e plano de contratações.

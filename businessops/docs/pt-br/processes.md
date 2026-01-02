# Processos (Alto Nível)

<!-- BO:BEGIN GENERATED -->
## Pedido → Recebimento (Order-to-Cash)
Etapas selecionadas:
LEAD,QUOTE,ORDER,INVOICE,DELIVERY,COLLECTION,SUPPORT

| Processo | Gatilho | Entradas | Etapas | Saídas | Dono | Sistemas | Riscos | Controles |
|---|---|---|---|---|---|---|---|---|
| Pedido → Recebimento | Pedido do cliente | Proposta, dados do pedido | Lead → Proposta → Pedido → Faturamento → Entrega → Recebimento → Suporte | Pedido entregue e pago | Vendas + Financeiro | CRM/ERP/Excel | Atrasos, preço errado | Política de crédito, limites de aprovação |

## Compras (Inicial)
| Processo | Gatilho | Entradas | Etapas | Saídas | Dono | Sistemas | Riscos | Controles |
|---|---|---|---|---|---|---|---|---|
| Compra → Pagamento | Necessidade de compra | Fornecedor, orçamento | Solicitar → Aprovar → Comprar → Receber → Pagar | Compra concluída | Operações + Financeiro | Email/ERP | Excesso de gasto, risco fornecedor | Matriz de aprovação, lista de fornecedores |

## Controles (Inicial)
- **Matriz de aprovação:** gastos e preços
- **Consistência documental:** notas fiscais, contratos, pedidos
- **Gestão de incidentes:** falhas de entrega e reclamações

## Gargalo


## Recomendações
### ESSENCIAL
- Definir donos para os fluxos principais.
- Escrever um SOP mínimo por fluxo.
- Implementar revisão operacional semanal.

### RECOMENDADO
- Criar dashboards de SLA para parceiros terceirizados.
- Automatizar integração de pedidos e faturamento via ERP/CRM.
<!-- BO:END GENERATED -->

## Notas (editável)
Adicione SOPs detalhados, diagramas e etapas reais do fluxo.

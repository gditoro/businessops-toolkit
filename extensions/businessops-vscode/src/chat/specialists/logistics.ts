/**
 * Logistics & Supply Chain Specialist Agent
 *
 * Focus areas: Supply chain management, inventory, warehousing,
 * distribution, procurement, last-mile delivery, logistics optimization.
 */

import { OrchestratorContext } from "../orchestrator";
import { getSpecialistMethodRecommendations, formatMethodSuggestions } from "../methodAdvisor";

export interface LogisticsAdvice {
  topic: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
  category: "inventory" | "supply-chain" | "distribution" | "procurement" | "warehouse";
}

export function generateLogisticsAnalysis(
  ctx: OrchestratorContext,
  lang: "pt-br" | "en"
): string {
  const company = ctx.company?.company || {};
  const stage = ctx.stage || company.stage || "idea";
  const businessModel = ctx.business_model || company.business_model || "b2b";
  const sector = ctx.industry || company.sector || "general";
  const products = company.products || [];
  const isPhysicalProduct = hasPhysicalProducts(sector, businessModel, products);

  if (lang === "pt-br") {
    return `# 🚚 Análise de Logística e Supply Chain

## Perfil da Empresa
- **Estágio:** ${translateStage(stage, lang)}
- **Modelo de negócio:** ${businessModel.toUpperCase()}
- **Setor:** ${sector}
- **Produtos físicos:** ${isPhysicalProduct ? "Sim" : "Não identificado"}

---

## 📦 Modelo de Cadeia de Suprimentos

${getSupplyChainModel(stage, businessModel, isPhysicalProduct, lang)}

---

## 📊 Gestão de Estoque

${getInventoryManagement(stage, lang)}

---

## 🏭 Estratégia de Fulfillment

${getFulfillmentStrategy(stage, businessModel, lang)}

---

## 🚛 Distribuição e Last-Mile

${getDistributionStrategy(businessModel, lang)}

---

## 📈 KPIs de Logística

${getLogisticsKPIs(lang)}

---

## 🔄 Otimização de Processos

${getOptimizationStrategies(stage, lang)}

---

## ✅ Checklist por Estágio

${getStageChecklist(stage, lang)}

---

## ⚠️ Riscos e Mitigação

${getRiskMitigation(stage, lang)}

---

## 💡 Tecnologias Recomendadas

${getTechRecommendations(stage, lang)}

${formatMethodSuggestions(getSpecialistMethodRecommendations(ctx, "LOGISTICS"), lang)}
`;
  } else {
    return `# 🚚 Logistics & Supply Chain Analysis

## Company Profile
- **Stage:** ${translateStage(stage, lang)}
- **Business Model:** ${businessModel.toUpperCase()}
- **Sector:** ${sector}
- **Physical Products:** ${isPhysicalProduct ? "Yes" : "Not identified"}

---

## 📦 Supply Chain Model

${getSupplyChainModel(stage, businessModel, isPhysicalProduct, lang)}

---

## 📊 Inventory Management

${getInventoryManagement(stage, lang)}

---

## 🏭 Fulfillment Strategy

${getFulfillmentStrategy(stage, businessModel, lang)}

---

## 🚛 Distribution & Last-Mile

${getDistributionStrategy(businessModel, lang)}

---

## 📈 Logistics KPIs

${getLogisticsKPIs(lang)}

---

## 🔄 Process Optimization

${getOptimizationStrategies(stage, lang)}

---

## ✅ Stage Checklist

${getStageChecklist(stage, lang)}

---

## ⚠️ Risk Mitigation

${getRiskMitigation(stage, lang)}

---

## 💡 Recommended Technologies

${getTechRecommendations(stage, lang)}

${formatMethodSuggestions(getSpecialistMethodRecommendations(ctx, "LOGISTICS"), lang)}
`;
  }
}

function translateStage(stage: string, lang: "pt-br" | "en"): string {
  const stages: Record<string, Record<string, string>> = {
    idea: { "pt-br": "Ideia", en: "Idea" },
    mvp: { "pt-br": "MVP", en: "MVP" },
    traction: { "pt-br": "Tração", en: "Traction" },
    growth: { "pt-br": "Crescimento", en: "Growth" },
    scale: { "pt-br": "Escala", en: "Scale" },
    mature: { "pt-br": "Maturidade", en: "Mature" },
  };
  return stages[stage]?.[lang] || stage;
}

function hasPhysicalProducts(
  sector: string,
  businessModel: string,
  products: string[]
): boolean {
  const physicalSectors = ["retail", "manufacturing", "ecommerce", "food", "consumer"];
  const physicalModels = ["d2c", "b2c", "retail", "ecommerce"];
  return (
    physicalSectors.some((s) => sector.toLowerCase().includes(s)) ||
    physicalModels.some((m) => businessModel.toLowerCase().includes(m)) ||
    products.some((p) =>
      ["product", "hardware", "device", "goods"].some((k) =>
        p.toLowerCase().includes(k)
      )
    )
  );
}

function getSupplyChainModel(
  stage: string,
  businessModel: string,
  isPhysical: boolean,
  lang: "pt-br" | "en"
): string {
  if (!isPhysical) {
    return lang === "pt-br"
      ? `### Negócio Digital/Serviços
Como seu negócio parece não envolver produtos físicos, foque em:

- **Supply chain de serviços:** Gestão de capacidade e recursos
- **Fornecedores de tecnologia:** Cloud, APIs, integrações
- **Vendor management:** Avaliação e gestão de fornecedores
- **SLAs:** Acordos de nível de serviço claros`
      : `### Digital/Services Business
Since your business doesn't seem to involve physical products, focus on:

- **Service supply chain:** Capacity and resource management
- **Technology vendors:** Cloud, APIs, integrations
- **Vendor management:** Evaluation and management
- **SLAs:** Clear service level agreements`;
  }

  if (lang === "pt-br") {
    return `### Modelo Recomendado: ${stage === "idea" || stage === "mvp" ? "Dropshipping/3PL" : stage === "traction" ? "Híbrido" : "Operação Própria + 3PL"}

\`\`\`
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Fornecedor  │ →  │  Produção/  │ →  │   Centro    │ →  │   Cliente   │
│             │    │  Estoque    │    │ Distribuição│    │    Final    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       ↑                  ↑                  ↑                  ↑
   Sourcing          Fulfillment        Transporte         Entrega
\`\`\`

### Opções de Modelo

| Modelo | Vantagem | Quando Usar |
|--------|----------|-------------|
| **Dropshipping** | Sem estoque | MVP, validação |
| **3PL** | Escala sem investimento | Tração, crescimento |
| **Próprio** | Controle total | Escala, margens altas |
| **Híbrido** | Flexibilidade | Crescimento |`;
  } else {
    return `### Recommended Model: ${stage === "idea" || stage === "mvp" ? "Dropshipping/3PL" : stage === "traction" ? "Hybrid" : "Own Operations + 3PL"}

\`\`\`
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Supplier   │ →  │ Production/ │ →  │ Distribution│ →  │    End      │
│             │    │  Inventory  │    │   Center    │    │  Customer   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       ↑                  ↑                  ↑                  ↑
   Sourcing          Fulfillment        Transport         Delivery
\`\`\`

### Model Options

| Model | Advantage | When to Use |
|-------|-----------|-------------|
| **Dropshipping** | No inventory | MVP, validation |
| **3PL** | Scale without investment | Traction, growth |
| **Own** | Full control | Scale, high margins |
| **Hybrid** | Flexibility | Growth |`;
  }
}

function getInventoryManagement(stage: string, lang: "pt-br" | "en"): string {
  if (lang === "pt-br") {
    return `### Métodos de Gestão

| Método | Descrição | Ideal Para |
|--------|-----------|------------|
| **PEPS (FIFO)** | Primeiro a entrar, primeiro a sair | Perecíveis |
| **UEPS (LIFO)** | Último a entrar, primeiro a sair | Não perecíveis |
| **Custo Médio** | Média ponderada | Commodities |
| **Just-in-Time** | Estoque mínimo | Alta previsibilidade |
| **Safety Stock** | Estoque de segurança | Alta variabilidade |

### Fórmulas Essenciais

\`\`\`
Giro de Estoque = CMV / Estoque Médio
Dias de Estoque = 365 / Giro de Estoque
Ponto de Pedido = (Demanda Diária × Lead Time) + Estoque Segurança
Lote Econômico (EOQ) = √(2 × Demanda Anual × Custo Pedido / Custo Armazenagem)
\`\`\`

### Classificação ABC

| Classe | % dos Itens | % do Valor | Controle |
|--------|-------------|------------|----------|
| A | 20% | 80% | Rígido |
| B | 30% | 15% | Moderado |
| C | 50% | 5% | Simples |`;
  } else {
    return `### Management Methods

| Method | Description | Ideal For |
|--------|-------------|-----------|
| **FIFO** | First in, first out | Perishables |
| **LIFO** | Last in, first out | Non-perishables |
| **Weighted Average** | Weighted average cost | Commodities |
| **Just-in-Time** | Minimal inventory | High predictability |
| **Safety Stock** | Buffer inventory | High variability |

### Essential Formulas

\`\`\`
Inventory Turnover = COGS / Average Inventory
Days of Inventory = 365 / Inventory Turnover
Reorder Point = (Daily Demand × Lead Time) + Safety Stock
EOQ = √(2 × Annual Demand × Order Cost / Holding Cost)
\`\`\`

### ABC Classification

| Class | % of Items | % of Value | Control |
|-------|------------|------------|---------|
| A | 20% | 80% | Tight |
| B | 30% | 15% | Moderate |
| C | 50% | 5% | Simple |`;
  }
}

function getFulfillmentStrategy(
  stage: string,
  businessModel: string,
  lang: "pt-br" | "en"
): string {
  if (lang === "pt-br") {
    const strategies: Record<string, string> = {
      idea: `### Estágio Ideia
- **Recomendação:** Dropshipping ou parcerias
- **Foco:** Validar demanda sem investir em estoque
- **Parceiros:** AliExpress, fornecedores locais com consignação`,
      mvp: `### Estágio MVP
- **Recomendação:** 3PL (Third-Party Logistics)
- **Foco:** Testar operação sem estrutura própria
- **Parceiros:** Melhor Envio, Loggi, B2W Fulfillment`,
      traction: `### Estágio Tração
- **Recomendação:** Híbrido (3PL + operação básica)
- **Foco:** Balancear custo e controle
- **Estrutura:** Micro-fulfillment para top sellers`,
      growth: `### Estágio Crescimento
- **Recomendação:** Centro de distribuição próprio + 3PL
- **Foco:** Otimizar custos e SLAs
- **Estrutura:** CD regional + parceiros para capilaridade`,
      scale: `### Estágio Escala
- **Recomendação:** Rede de CDs + Dark Stores
- **Foco:** Last-mile rápido
- **Estrutura:** Multi-CD com automação`,
      mature: `### Estágio Maturidade
- **Recomendação:** Operação verticalmente integrada
- **Foco:** Excelência operacional
- **Estrutura:** Automação full, frota própria opcional`,
    };
    return strategies[stage] || strategies.traction;
  } else {
    const strategies: Record<string, string> = {
      idea: `### Idea Stage
- **Recommendation:** Dropshipping or partnerships
- **Focus:** Validate demand without inventory investment
- **Partners:** Alibaba, local consignment suppliers`,
      mvp: `### MVP Stage
- **Recommendation:** 3PL (Third-Party Logistics)
- **Focus:** Test operations without own structure
- **Partners:** ShipBob, Fulfillment by Amazon, etc.`,
      traction: `### Traction Stage
- **Recommendation:** Hybrid (3PL + basic operations)
- **Focus:** Balance cost and control
- **Structure:** Micro-fulfillment for top sellers`,
      growth: `### Growth Stage
- **Recommendation:** Own distribution center + 3PL
- **Focus:** Optimize costs and SLAs
- **Structure:** Regional DC + partners for reach`,
      scale: `### Scale Stage
- **Recommendation:** DC network + Dark Stores
- **Focus:** Fast last-mile
- **Structure:** Multi-DC with automation`,
      mature: `### Mature Stage
- **Recommendation:** Vertically integrated operation
- **Focus:** Operational excellence
- **Structure:** Full automation, optional own fleet`,
    };
    return strategies[stage] || strategies.traction;
  }
}

function getDistributionStrategy(
  businessModel: string,
  lang: "pt-br" | "en"
): string {
  const isB2C = ["b2c", "d2c", "ecommerce"].some((m) =>
    businessModel.toLowerCase().includes(m)
  );

  if (lang === "pt-br") {
    if (isB2C) {
      return `### Estratégia B2C/D2C

| Canal | SLA Típico | Custo Relativo | Quando Usar |
|-------|------------|----------------|-------------|
| **Correios** | 3-15 dias | Baixo | Brasil todo, baixo ticket |
| **Transportadoras** | 2-7 dias | Médio | Volumes, B2B |
| **Same-day** | Mesmo dia | Alto | Capitais, premium |
| **Próprio** | Variável | Variável | Alto volume local |
| **Pickup points** | Cliente retira | Baixo | Conveniência |

### Otimização Last-Mile
- Roteirização inteligente
- Janelas de entrega
- Rastreamento em tempo real
- Comunicação proativa com cliente`;
    } else {
      return `### Estratégia B2B

| Modalidade | Uso | Considerações |
|------------|-----|---------------|
| **CIF** | Entrega inclusa | Controle de custo |
| **FOB** | Cliente busca | Menor responsabilidade |
| **Cross-docking** | Alto giro | Eficiência de custo |
| **Milk run** | Coletas programadas | Otimização de rotas |

### Gestão de Fretes
- Tabelas negociadas por volume
- Consolidação de cargas
- Gestão de devoluções`;
    }
  } else {
    if (isB2C) {
      return `### B2C/D2C Strategy

| Channel | Typical SLA | Relative Cost | When to Use |
|---------|-------------|---------------|-------------|
| **Postal** | 3-15 days | Low | Nationwide, low ticket |
| **Carriers** | 2-7 days | Medium | Volumes, B2B |
| **Same-day** | Same day | High | Major cities, premium |
| **Own fleet** | Variable | Variable | High local volume |
| **Pickup points** | Customer picks up | Low | Convenience |

### Last-Mile Optimization
- Smart routing
- Delivery windows
- Real-time tracking
- Proactive customer communication`;
    } else {
      return `### B2B Strategy

| Mode | Use | Considerations |
|------|-----|----------------|
| **CIF** | Delivery included | Cost control |
| **FOB** | Customer picks up | Less responsibility |
| **Cross-docking** | High turnover | Cost efficiency |
| **Milk run** | Scheduled pickups | Route optimization |

### Freight Management
- Volume-negotiated rates
- Load consolidation
- Returns management`;
    }
  }
}

function getLogisticsKPIs(lang: "pt-br" | "en"): string {
  if (lang === "pt-br") {
    return `| KPI | Fórmula/Descrição | Meta |
|-----|-------------------|------|
| **OTIF** | On-Time In-Full | > 95% |
| **Fill Rate** | Pedidos completos / Total | > 98% |
| **Custo por Pedido** | Custo logístico / Pedidos | Reduzir 10%/ano |
| **Lead Time** | Pedido → Entrega | < 48h capitais |
| **Acurácia Estoque** | Físico = Sistema | > 99% |
| **Devolução** | Devoluções / Entregas | < 3% |
| **Custo Frete/Receita** | Frete / Faturamento | < 5-8% |
| **Produtividade CD** | Pedidos / Funcionário / Hora | Benchmark setor |`;
  } else {
    return `| KPI | Formula/Description | Target |
|-----|---------------------|--------|
| **OTIF** | On-Time In-Full | > 95% |
| **Fill Rate** | Complete orders / Total | > 98% |
| **Cost per Order** | Logistics cost / Orders | Reduce 10%/year |
| **Lead Time** | Order → Delivery | < 48h major cities |
| **Inventory Accuracy** | Physical = System | > 99% |
| **Return Rate** | Returns / Deliveries | < 3% |
| **Freight/Revenue** | Freight / Revenue | < 5-8% |
| **DC Productivity** | Orders / Employee / Hour | Industry benchmark |`;
  }
}

function getOptimizationStrategies(stage: string, lang: "pt-br" | "en"): string {
  if (lang === "pt-br") {
    return `### Estratégias de Otimização

#### 📍 Localização
- Análise de centro de gravidade
- Proximidade de fornecedores vs clientes
- Custos fiscais (ICMS no Brasil)

#### 📦 Picking & Packing
- Slotting otimizado (ABC)
- Batch picking para multipedidos
- Zone picking para alto volume
- Pack station eficiente

#### 🚛 Transporte
- Consolidação de cargas
- Roteirização dinâmica
- Backhaul (carga de retorno)
- Gestão de frota própria vs terceiros

#### 🔄 Reversa
- Processo claro de devolução
- Triagem rápida
- Recondicionamento quando possível
- Destino sustentável para descarte`;
  } else {
    return `### Optimization Strategies

#### 📍 Location
- Center of gravity analysis
- Proximity to suppliers vs customers
- Tax considerations

#### 📦 Picking & Packing
- Optimized slotting (ABC)
- Batch picking for multi-orders
- Zone picking for high volume
- Efficient pack station

#### 🚛 Transportation
- Load consolidation
- Dynamic routing
- Backhaul (return cargo)
- Own fleet vs third-party management

#### 🔄 Reverse Logistics
- Clear return process
- Quick sorting
- Refurbishment when possible
- Sustainable disposal`;
  }
}

function getStageChecklist(stage: string, lang: "pt-br" | "en"): string {
  const checklists: Record<string, Record<string, string>> = {
    idea: {
      "pt-br": `### Checklist Estágio Ideia
- [ ] Mapear potenciais fornecedores
- [ ] Pesquisar opções de dropshipping
- [ ] Estimar custos logísticos no preço
- [ ] Definir área de atuação inicial`,
      en: `### Idea Stage Checklist
- [ ] Map potential suppliers
- [ ] Research dropshipping options
- [ ] Estimate logistics costs in pricing
- [ ] Define initial coverage area`,
    },
    mvp: {
      "pt-br": `### Checklist Estágio MVP
- [ ] Escolher parceiro 3PL
- [ ] Definir SLAs de entrega
- [ ] Implementar rastreamento
- [ ] Criar política de devolução
- [ ] Testar fluxo end-to-end`,
      en: `### MVP Stage Checklist
- [ ] Choose 3PL partner
- [ ] Define delivery SLAs
- [ ] Implement tracking
- [ ] Create return policy
- [ ] Test end-to-end flow`,
    },
    traction: {
      "pt-br": `### Checklist Estágio Tração
- [ ] Avaliar custo 3PL vs próprio
- [ ] Implementar WMS básico
- [ ] Otimizar embalagens
- [ ] Negociar contratos de frete
- [ ] Estruturar gestão de estoque`,
      en: `### Traction Stage Checklist
- [ ] Evaluate 3PL cost vs own
- [ ] Implement basic WMS
- [ ] Optimize packaging
- [ ] Negotiate freight contracts
- [ ] Structure inventory management`,
    },
    growth: {
      "pt-br": `### Checklist Estágio Crescimento
- [ ] Planejar CD próprio ou expandir 3PL
- [ ] Automatizar processos repetitivos
- [ ] Implementar OMS completo
- [ ] Expandir cobertura geográfica
- [ ] Desenvolver fornecedores alternativos`,
      en: `### Growth Stage Checklist
- [ ] Plan own DC or expand 3PL
- [ ] Automate repetitive processes
- [ ] Implement full OMS
- [ ] Expand geographic coverage
- [ ] Develop alternative suppliers`,
    },
    scale: {
      "pt-br": `### Checklist Estágio Escala
- [ ] Rede de CDs regionais
- [ ] Automação avançada (sortation, conveyor)
- [ ] Same-day em mercados-chave
- [ ] TMS integrado
- [ ] Sustentabilidade na operação`,
      en: `### Scale Stage Checklist
- [ ] Regional DC network
- [ ] Advanced automation (sortation, conveyor)
- [ ] Same-day in key markets
- [ ] Integrated TMS
- [ ] Sustainability in operations`,
    },
    mature: {
      "pt-br": `### Checklist Estágio Maturidade
- [ ] Excelência operacional (Six Sigma)
- [ ] Frota própria vs híbrida
- [ ] Internacionalização
- [ ] IoT e visibilidade total
- [ ] Carbono neutro na logística`,
      en: `### Mature Stage Checklist
- [ ] Operational excellence (Six Sigma)
- [ ] Own fleet vs hybrid
- [ ] Internationalization
- [ ] IoT and full visibility
- [ ] Carbon neutral logistics`,
    },
  };
  return checklists[stage]?.[lang] || checklists.traction[lang];
}

function getRiskMitigation(stage: string, lang: "pt-br" | "en"): string {
  if (lang === "pt-br") {
    return `### Riscos e Mitigação

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| **Ruptura de estoque** | Perda de vendas | Safety stock, multi-fornecedor |
| **Atraso fornecedor** | SLA cliente | Buffer de lead time, alternativas |
| **Dano no transporte** | Custo, reputação | Embalagem adequada, seguro |
| **Roubo de carga** | Perda financeira | Rastreamento, escolta, seguro |
| **Greve transportes** | Paralização | Multi-modal, estoque estratégico |
| **Dependência fornecedor** | Risco operacional | Dual sourcing |
| **Obsolescência** | Capital parado | Gestão de ciclo de vida |

### Plano de Contingência
1. Manter estoque de segurança para itens A
2. Lista de fornecedores alternativos homologados
3. Rotas alternativas de transporte
4. Seguro de carga adequado
5. Backup de sistemas críticos`;
  } else {
    return `### Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Stockout** | Lost sales | Safety stock, multi-supplier |
| **Supplier delay** | Customer SLA | Lead time buffer, alternatives |
| **Transport damage** | Cost, reputation | Proper packaging, insurance |
| **Cargo theft** | Financial loss | Tracking, escort, insurance |
| **Transport strike** | Shutdown | Multi-modal, strategic stock |
| **Supplier dependency** | Operational risk | Dual sourcing |
| **Obsolescence** | Tied capital | Lifecycle management |

### Contingency Plan
1. Maintain safety stock for A items
2. List of approved alternative suppliers
3. Alternative transport routes
4. Adequate cargo insurance
5. Critical system backups`;
  }
}

function getTechRecommendations(stage: string, lang: "pt-br" | "en"): string {
  if (lang === "pt-br") {
    const techByStage: Record<string, string> = {
      idea: `| Sistema | Opção | Custo |
|---------|-------|-------|
| Controle estoque | Planilha | Grátis |
| Integração marketplace | Bling, Tiny | Baixo |`,
      mvp: `| Sistema | Opção | Custo |
|---------|-------|-------|
| ERP básico | Bling, Tiny, Omie | R$99-299/mês |
| Etiquetas | Melhor Envio | Por uso |
| Rastreamento | Apps nativos | Grátis |`,
      traction: `| Sistema | Opção | Custo |
|---------|-------|-------|
| ERP completo | Omie, ContaAzul | R$199-499/mês |
| WMS básico | GTI Plug, VTEX | Variável |
| TMS | Intelipost, Frete Rápido | Por uso |`,
      growth: `| Sistema | Opção | Custo |
|---------|-------|-------|
| ERP robusto | SAP B1, Oracle NetSuite | Enterprise |
| WMS dedicado | Manhattan, Körber | Implementação |
| OMS | Bling Pro, VTEX OMS | Customizado |`,
      scale: `| Sistema | Opção | Custo |
|---------|-------|-------|
| ERP enterprise | SAP S/4, Oracle | Enterprise |
| WMS avançado | Blue Yonder, Manhattan | Alto |
| TMS enterprise | Oracle TMS, SAP TM | Alto |
| Automação | Sortation, AGVs | CAPEX |`,
      mature: `| Sistema | Opção | Custo |
|---------|-------|-------|
| Supply Chain Suite | SAP SCM, Oracle SCM | Enterprise |
| Control Tower | Project44, FourKites | Premium |
| IoT/ML | Custom + parceiros | Investimento |`,
    };
    return techByStage[stage] || techByStage.traction;
  } else {
    const techByStage: Record<string, string> = {
      idea: `| System | Option | Cost |
|--------|--------|------|
| Inventory control | Spreadsheet | Free |
| Marketplace integration | Basic tools | Low |`,
      mvp: `| System | Option | Cost |
|--------|--------|------|
| Basic ERP | Odoo, Zoho | $50-200/mo |
| Shipping | ShipStation, Shippo | Per use |
| Tracking | Native apps | Free |`,
      traction: `| System | Option | Cost |
|--------|--------|------|
| Full ERP | NetSuite, Sage | $500+/mo |
| Basic WMS | Fishbowl, Cin7 | Variable |
| TMS | Flexport, Shipwell | Per use |`,
      growth: `| System | Option | Cost |
|--------|--------|------|
| Robust ERP | SAP B1, NetSuite | Enterprise |
| Dedicated WMS | Manhattan, Körber | Implementation |
| OMS | Shopify Plus, BigCommerce | Custom |`,
      scale: `| System | Option | Cost |
|--------|--------|------|
| Enterprise ERP | SAP S/4, Oracle | Enterprise |
| Advanced WMS | Blue Yonder, Manhattan | High |
| Enterprise TMS | Oracle TMS, SAP TM | High |
| Automation | Sortation, AGVs | CAPEX |`,
      mature: `| System | Option | Cost |
|--------|--------|------|
| Supply Chain Suite | SAP SCM, Oracle SCM | Enterprise |
| Control Tower | Project44, FourKites | Premium |
| IoT/ML | Custom + partners | Investment |`,
    };
    return techByStage[stage] || techByStage.traction;
  }
}

export function getLogisticsPrompt(lang: "pt-br" | "en"): string {
  return lang === "pt-br"
    ? `Você é um especialista em logística e supply chain, com foco em:
- Gestão de estoque e armazenagem
- Estratégias de fulfillment e distribuição
- Otimização de transporte e last-mile
- Sourcing e gestão de fornecedores
- Logística reversa
- Tecnologias WMS, TMS, OMS
- Métricas e KPIs logísticos

Responda de forma prática com foco em eficiência operacional e custos.
Considere o contexto brasileiro quando relevante (ICMS, modais, etc.).`
    : `You are a logistics and supply chain specialist focusing on:
- Inventory and warehouse management
- Fulfillment and distribution strategies
- Transportation and last-mile optimization
- Sourcing and supplier management
- Reverse logistics
- WMS, TMS, OMS technologies
- Logistics metrics and KPIs

Respond practically with focus on operational efficiency and costs.
Consider local context when relevant.`;
}

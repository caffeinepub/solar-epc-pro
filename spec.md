# Solar EPC Pro

## Current State
Full-stack solar EPC platform with: Project Wizard (4-step: Info → Load+Specs → MOQ → Quotation), MOQ generation engine, Brand Catalog, Product Master (76+ products), Inventory, Procurement, Vendor Ledger, Material Consumed, Site Execution, Quotations (PDF export, approval, revision, numbering), Users, Audit Log. Mobile-ready PWA with bottom tab nav.

Backend has `generateMOQ` and `generateMOQWithProducts` using fixed panel wattage (540W), simple battery sizing (kw*2), and flat pricing. No AI-specific backend functions exist yet.

## Requested Changes (Diff)

### Add
- `getAIInsights` backend query: returns computed AI insights object (procurement forecast, recommended product suggestions, ROI yield estimate, load optimization tips) derived from existing projects, inventory, MOQ, and product master data
- `analyzeLoadAndSuggest` backend query: takes system size kW + system type + installation type, returns AI suggestion struct (recommended panel type/wattage, inverter type/size, battery config, estimated yield kWh/year, payback years, IRR, 25-year savings)
- Smarter `generateMOQ` engine: correct DC/AC ratio (1.1–1.25), string configuration based on selected panel wattage, battery Ah sizing from backup hours + DoD (80%), inverter kW sizing = systemKW * 1.1 rounded up
- `AIInsightsPanel` component on Dashboard: dedicated card showing AI procurement forecast, top product recommendations, pipeline summary, yield estimate
- `AILoadSuggestion` component in Project Wizard Step 2 (Load): after load input is filled, shows dismissible AI suggestion card ("AI suggests X kW system with Y kWh battery for this load profile")
- `AIProductRecommendation` component in Project Wizard Brand Reference step: after spec selectors, shows AI-suggested best-value product from Product Master ("AI recommends Waaree 545W TOPCon @ ₹21,500 for this load profile")
- `AIROICard` component in Quotations page: per-quotation AI-computed ROI insight card (yield estimate, enhanced payback, carbon savings)
- `AIProcurementForecast` section in Inventory page: AI forecast card showing predicted material needs based on pending/active project pipeline

### Modify
- `generateMOQ` backend: smarter panel quantity calc using selected wattage (from product), proper string config, correct battery Ah sizing
- Dashboard component: add AI Insights panel widget below existing stats cards
- ProjectWizard Step 2: add AI load suggestion card after system size input
- ProjectWizard Brand Reference: add AI product recommendation card after spec selectors
- QuotationsPage: add AI ROI insight per quotation
- InventoryPage: add AI procurement forecast section

### Remove
- Nothing removed

## Implementation Plan
1. Add `getAIInsights` and `analyzeLoadAndSuggest` query functions to backend (Motoko)
2. Update `generateMOQ` and `generateMOQWithProducts` with smarter calculations
3. Create `AIInsightsPanel` component (Dashboard widget)
4. Create `useAIInsights` hook calling backend query with static fallback
5. Update Dashboard to include AIInsightsPanel
6. Update ProjectWizard Step 2 to show AI load suggestion card (client-side computation)
7. Update ProjectWizard Brand Reference to show AI product recommendation card
8. Update QuotationsPage with per-quotation AI ROI insight
9. Update InventoryPage with AI procurement forecast section
10. All AI suggestion cards: dismissible, clearly labeled "AI Suggestion", user can override

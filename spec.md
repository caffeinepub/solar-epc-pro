# Solar EPC Pro

## Current State

Full-stack solar EPC platform with 14 pages: Dashboard, Projects, Project Wizard (4-step), Quotations, MOQ Manager, Inventory, Brand Catalog, Product Master, Site Execution, Procurement, Vendor Ledger, Material Consumed, Users, Audit Log.

Current layout:
- Fixed sidebar (collapsible on desktop, hamburger slide-out on mobile)
- Top header bar with role selector and gear icon
- All tables are full-width with no horizontal scroll containers
- Inline editing in MOQ Manager and Inventory tables (small inputs directly in table cells)
- Wizard steps use card layout that stacks vertically
- No bottom tab bar on mobile
- Tap targets on mobile are small (standard button/input sizing)

## Requested Changes (Diff)

### Add
- **Bottom tab bar** on mobile (screens < md) for the 6 main navigation items: Dashboard, Projects, Quotations, Inventory, Operations (grouped), and a "More" tab that opens the hamburger drawer for secondary pages
- **Mobile slide-out drawer** for secondary/overflow pages (MOQ Manager, Brand Catalog, Product Master, Site Execution, Procurement, Vendor Ledger, Material Consumed, Users, Audit Log) triggered by the "More" tab
- **Tap-to-edit bottom sheet/drawer** on mobile for inline editing in MOQ Manager (price, qty, name, brand, spec fields) and Inventory (qty editing) -- replaces inline inputs on small screens
- **Horizontal scroll wrapper** on all Table components on mobile with a subtle left-right fade scroll hint
- **Touch-optimized tap targets**: minimum 44px height for all buttons, inputs, and interactive elements on mobile

### Modify
- **App.tsx**: Add mobile bottom tab bar component, integrate slide-out "More" drawer, keep existing desktop sidebar unchanged. On mobile hide the top-left hamburger and replace with bottom tabs.
- **All Table components** (Quotations, MOQ Manager, Inventory, Procurement, Vendor Ledger, Material Consumed, Audit Log, Brand Catalog, Product Master, Site Execution, Users): Wrap table in `overflow-x-auto` with `min-w-[600px]` on the inner table. Add scroll hint gradient overlays on left/right edges.
- **MOQManagerPage.tsx**: Edit drawer for mobile -- when on mobile, clicking edit opens a bottom Drawer (shadcn) instead of inline editing. Fields: item name, category, brand, quantity, unit, unit price. Desktop retains current Dialog behavior.
- **InventoryPage.tsx**: EditableQtyCell on mobile becomes a tap-to-open small Drawer with a number input. Desktop retains current inline behavior.
- **ProjectWizard.tsx**: Ensure all form inputs have `min-h-[44px]`, labels are adequately sized, step navigation buttons are full-width on mobile, step indicator is compact (icon + number only) on mobile.
- **Dashboard.tsx**: Stat cards go to 2-column grid on mobile (currently likely already responsive -- verify and fix if not).
- **Top header**: On mobile, hide the sidebar toggle button (the desktop Menu icon). Keep role selector but make it compact (icon + abbreviated text or just icon) on very small screens (< sm).

### Remove
- Nothing removed -- desktop experience stays identical

## Implementation Plan

1. **App.tsx -- Mobile navigation overhaul**
   - Create `MobileBottomNav` component: fixed bottom bar (z-50, safe-area-inset-bottom) with 5 tabs: Dashboard, Projects, Quotations, Inventory, More
   - "More" tab opens a slide-up Drawer listing all secondary nav items (Operations group + Admin group)
   - Show `MobileBottomNav` only on `md:hidden`; desktop sidebar unchanged
   - Add `pb-16 md:pb-0` to main content area so content isn't hidden behind bottom bar
   - Remove the mobile hamburger Menu button from top header on mobile (bottom nav replaces it)

2. **Horizontal scroll tables -- all pages**
   - Wrap every `<Table>` in a `<div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">` container
   - Add `className="min-w-[640px] w-full"` to every `<table>` element
   - Add left/right scroll fade hints using CSS gradient overlays (pseudo-element via a wrapper div with `relative` + `before/after` gradients using inline style or a utility class)

3. **Touch-optimized inputs and buttons**
   - Add `min-h-[44px]` to all `<Input>`, `<Button>`, `<SelectTrigger>` usages in wizard and form pages
   - Wizard step nav buttons: `w-full sm:w-auto` for Prev/Next on mobile
   - Wizard step indicator: on mobile show just icon+number in a horizontal scroll row

4. **MOQ Manager -- mobile edit drawer**
   - Detect mobile with `useMediaQuery('(max-width: 768px)')` hook (or a simple `window.innerWidth` check in state)
   - On mobile: clicking any edit icon on a row opens a `<Drawer>` (shadcn drawer, slides from bottom) with all editable fields
   - Drawer has Save and Cancel buttons (full-width, 44px+ height)
   - Desktop: existing Dialog behavior unchanged

5. **Inventory -- mobile qty drawer**
   - Same pattern: `EditableQtyCell` on mobile opens a small bottom Drawer with a number input for new quantity
   - Desktop: existing inline input behavior unchanged

6. **Dashboard stat cards**
   - Ensure `grid-cols-2 md:grid-cols-4` for stat cards (2-up on mobile)
   - Recent activity list: full-width cards on mobile

7. **General mobile polish**
   - `p-4 md:p-6` on all page containers (already done in App.tsx main, verify in each page)
   - Form card padding: `p-4 md:p-6` on all CardContent in wizard and forms
   - Text truncation on long client names / item names in tables using `truncate max-w-[120px] md:max-w-none`

# Solar EPC Pro

## Current State
- Projects are created via a 5-step wizard that auto-generates an MOQ (Bill of Materials) per project.
- MOQ items have: id, projectId, itemName, category, quantity, unit, brand, unitPrice, totalPrice.
- In the Project Wizard Step 3, users can only edit unit prices (inline input on blur).
- There is no way to add new MOQ items, delete items, or update itemName/category/unit/brand.
- Backend `updateMOQItem(id, quantity, unitPrice)` only accepts quantity and unitPrice -- no other fields.
- No dedicated MOQ management page exists outside the wizard.
- There is no `addMOQItem` or `deleteMOQItem` backend function.

## Requested Changes (Diff)

### Add
- `addMOQItem(projectId, itemName, category, quantity, unit, brand, unitPrice)` backend function
- `deleteMOQItem(id)` backend function
- Full `updateMOQItem` that accepts all editable fields: itemName, category, quantity, unit, brand, unitPrice
- A dedicated **MOQ Manager** page (accessible from the sidebar) that:
  - Lists all projects, lets user select one to view/edit its MOQ
  - Shows all MOQ items grouped by category in an editable table
  - Inline editing of: itemName, category, quantity, unit, brand, unitPrice (all fields)
  - "Add Item" button to add a new custom MOQ line item via a form/dialog
  - Delete button per row to remove an item
  - Total cost recalculates live
  - Works for ALL projects (not just the wizard in progress)

### Modify
- `updateMOQItem` backend function signature extended to: `(id, itemName, category, quantity, unit, brand, unitPrice)`
- Project Wizard Step 3: update inline price edit onBlur call to pass all fields (not just quantity + unitPrice) so it uses the new updateMOQItem signature
- Sidebar navigation: add "MOQ Manager" item
- App routing: add `moqManager` page case

### Remove
- Nothing removed

## Implementation Plan
1. Update backend `main.mo`:
   - Change `updateMOQItem` to accept all 7 fields
   - Add `addMOQItem` public shared function
   - Add `deleteMOQItem` public shared function
2. Create `MOQManagerPage.tsx`:
   - Project selector (dropdown or list) at top
   - MOQ items table with inline editing for all fields
   - Add Item dialog/form (itemName, category, quantity, unit, brand, unitPrice)
   - Delete button per row with confirmation
   - Live total at bottom
3. Update `useQueries.ts`: add `useAddMOQItem`, `useDeleteMOQItem`, update `useUpdateMOQItem` mutation
4. Update `ProjectWizard.tsx` Step 3: fix onBlur to pass all fields to new updateMOQItem
5. Update `App.tsx`: add `moqManager` to Page type, add nav item, add renderPage case

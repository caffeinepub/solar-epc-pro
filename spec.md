# Origin Solar EPC Pro

## Current State
The app is a full-stack solar EPC platform (Motoko backend + React frontend) with all 9 modules: Dashboard, Project Wizard, MOQ Manager, Inventory, Brand Catalog, Product Master, Procurement, Vendor Ledger, Material Consumed, Site Execution, Quotations, Users, Audit Log. It has PWA support (manifest.json, sw.js, icons). The app name throughout is "Solar EPC Pro".

## Requested Changes (Diff)

### Add
- `capacitor.config.ts` at project root with appId `com.originsolar.epcpro`, appName `Origin Solar EPC Pro`, webDir pointing to the Vite dist output
- `capacitor.config.android.ts` with Android-specific overrides (server allowNavigation for ICP calls)
- Capacitor-specific `package.json` entries and install instructions in a `CAPACITOR_BUILD.md` guide
- Updated app icons and splash assets references (same icons, new name)
- iOS Info.plist overrides for camera usage description (invoice scanning)
- Android permissions in AndroidManifest overlay (CAMERA, READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE, INTERNET)

### Modify
- `index.html`: title and meta tags → "Origin Solar EPC Pro"
- `public/manifest.json`: name, short_name → "Origin Solar EPC Pro" / "OriginSolar"
- `App.tsx`: all references to "Solar EPC Pro" → "Origin Solar EPC Pro"
- `src/frontend/src/components/*`: any hardcoded "Solar EPC Pro" strings → "Origin Solar EPC Pro"
- PWA install banner text updated

### Remove
- Nothing removed

## Implementation Plan
1. Update `index.html` meta tags and title to "Origin Solar EPC Pro"
2. Update `manifest.json` name and short_name
3. Update `App.tsx` all display strings (logo text, badges, error screens)
4. Scan and update all component files for "Solar EPC Pro" string references
5. Create `capacitor.config.ts` at project root with correct appId, appName, webDir
6. Create `CAPACITOR_BUILD.md` with step-by-step Android Studio + Xcode build guide
7. Update PWA service worker and manifest for new name
8. Generate updated app icon with "Origin Solar EPC Pro" branding

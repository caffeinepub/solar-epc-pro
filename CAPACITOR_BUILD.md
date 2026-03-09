# Origin Solar EPC Pro — Native App Build Guide

This guide walks you through building the Android (.aab) and iOS (.ipa) packages
for submission to Google Play Store and Apple App Store.

---

## Prerequisites

| Requirement | Android | iOS |
|---|---|---|
| Node.js 18+ | ✅ | ✅ |
| Java 17 (JDK) | ✅ | — |
| Android Studio (latest) | ✅ | — |
| macOS with Xcode 15+ | — | ✅ |
| Apple Developer Account ($99/yr) | — | ✅ |
| Google Play Developer Account ($25 one-time) | ✅ | — |

---

## Step 1 — Install Capacitor dependencies

```bash
cd src/frontend
npm install @capacitor/core @capacitor/cli \
  @capacitor/android @capacitor/ios \
  @capacitor/camera @capacitor/filesystem \
  @capacitor/share @capacitor/splash-screen \
  @capacitor/status-bar
```

---

## Step 2 — Build the web app

```bash
cd src/frontend
npm run build
# Output: src/frontend/dist/
```

---

## Step 3 — Initialize Capacitor (first time only)

From the **project root** (where `capacitor.config.ts` lives):

```bash
npx cap init "Origin Solar EPC Pro" com.originsolar.epcpro --web-dir src/frontend/dist
```

---

## Step 4 — Add platforms (first time only)

```bash
npx cap add android
npx cap add ios
```

This creates `android/` and `ios/` folders in the project root.

---

## Step 5 — Sync web assets to native projects

Run this every time you update the web app:

```bash
npm run build           # rebuild web
npx cap sync            # copy dist/ into android/ and ios/
```

---

## Step 6 — Android: Build & Upload to Play Store

### Open in Android Studio
```bash
npx cap open android
```

### Configure Signing
1. In Android Studio: **Build → Generate Signed Bundle / APK**
2. Choose **Android App Bundle (.aab)**
3. Create or use your existing **Keystore** (keep this safe — you need it for every update)
4. Fill in Key Alias, Key Password, Store Password
5. Select **Release** build variant
6. Click **Finish** — output: `android/app/release/app-release.aab`

### Required Permissions (already in AndroidManifest.xml after cap add)
- `CAMERA` — invoice photo capture
- `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` — PDF/Excel export
- `INTERNET` — ICP backend calls

### Upload to Play Store
1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app
3. **Production → Create new release → Upload** the `.aab` file
4. Fill in app description, screenshots (use browser DevTools mobile view), privacy policy URL
5. App category: **Business** or **Productivity**
6. Submit for review (typically 1-3 days)

---

## Step 7 — iOS: Build & Upload to App Store

> macOS with Xcode required for this step.

### Open in Xcode
```bash
npx cap open ios
```

### Configure Bundle ID & Signing
1. In Xcode, select the project root (`App`) in the file tree
2. Under **Signing & Capabilities**: set Team to your Apple Developer account
3. Bundle Identifier: `com.originsolar.epcpro`
4. Enable **Automatically manage signing**

### Configure Camera Permission (add to Info.plist)
```xml
<key>NSCameraUsageDescription</key>
<string>Origin Solar EPC Pro uses the camera to capture tax invoices for procurement entry.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Origin Solar EPC Pro needs photo library access to attach invoice images to procurement records.</string>
```

### Build Archive
1. Set scheme to **App** and destination to **Any iOS Device (arm64)**
2. **Product → Archive**
3. In **Organizer → Archives**: click **Distribute App → App Store Connect → Upload**

### Upload to App Store Connect
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new app with Bundle ID `com.originsolar.epcpro`
3. Fill in metadata, screenshots (use Xcode Simulator for 6.5" and 5.5" screenshots)
4. Select the uploaded build and submit for review (typically 1-3 days)

---

## App Store Listing Recommendations

**Category:** Business  
**App Name:** Origin Solar EPC Pro  
**Subtitle:** Solar Design & Estimation Platform  
**Keywords:** solar, EPC, inverter, MOQ, quotation, rooftop, off-grid, hybrid, estimation, BOM  
**Privacy Policy:** Required — host a simple privacy policy page before submission  

---

## Updating the App

Every time you deploy a new version:
```bash
# 1. Update the web app (via Caffeine platform)
# 2. Build and sync
npm run build
npx cap sync
# 3. Increment versionCode (Android) or CFBundleShortVersionString (iOS)
# 4. Build new release and upload
```

---

## Support
For Capacitor documentation: https://capacitorjs.com/docs

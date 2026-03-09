import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Origin Solar EPC Pro – Capacitor Configuration
 *
 * This config wraps the Vite-built web app into a native Android / iOS shell.
 *
 * To build:
 *   1. Install deps:  npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
 *   2. Build web:     npm run build          (outputs to src/frontend/dist)
 *   3. Add platforms: npx cap add android && npx cap add ios
 *   4. Sync:          npx cap sync
 *   5. Open native:   npx cap open android   (needs Android Studio)
 *                     npx cap open ios       (needs Xcode on macOS)
 */
const config: CapacitorConfig = {
  appId: 'com.originsolar.epcpro',
  appName: 'Origin Solar EPC Pro',
  webDir: 'src/frontend/dist',
  bundledWebRuntime: false,
  server: {
    // Allow the app to make calls to the Internet Computer (ICP) backend
    allowNavigation: [
      '*.ic0.app',
      '*.icp0.io',
      '*.internetcomputer.org',
      '*.caffeine.ai',
    ],
    // Uncomment below for local development with DFX
    // url: 'http://10.0.2.2:5173',
    // cleartext: true,
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: false,
  },
  ios: {
    contentInset: 'always',
    scrollEnabled: true,
  },
  plugins: {
    Camera: {
      // Required for invoice photo capture
    },
    Filesystem: {
      // Required for PDF/Excel export downloads
    },
    Share: {
      // Required for sharing quotation PDFs
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1e3a5f',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#1e3a5f',
    },
  },
};

export default config;

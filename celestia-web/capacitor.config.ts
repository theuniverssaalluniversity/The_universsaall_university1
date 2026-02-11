import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.universsaall.university',
  appName: 'The Universsaall University',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#09090b", // zinc-950
      androidSplashResourceName: "splash_background",
      showSpinner: false,
    },
  }
};

export default config;

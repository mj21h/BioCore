import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.biohacker.app',
  appName: 'Biohacker App',
  webDir: 'dist',
  backgroundColor: '#111317',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#111317",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#111317",
      overlaysWebView: false
    }
  }
};

export default config;

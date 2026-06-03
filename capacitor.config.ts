import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.biohacker.app',
  appName: 'Biohacker App',
  webDir: 'dist',
  backgroundColor: '#0a0a0a',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0a0a0a",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0a0a0a",
      overlaysWebView: false
    }
  }
};

export default config;

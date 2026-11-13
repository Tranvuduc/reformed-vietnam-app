import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.reformedvietnam.app',
  appName: 'Reformed Vietnam',
  webDir: 'www',
  backgroundColor: '#f7f2e9',
  server: {
    // The app loads the live website; nothing is bundled except this
    // fallback page (www/index.html), shown only when the site cannot
    // be reached (e.g. no network).
    url: 'https://reformedvietnam.com',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#f7f2e9',
      showSpinner: false,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#f7f2e9',
    },
  },
};

export default config;

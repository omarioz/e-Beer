import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ebeer.agricultural',
  appName: 'e-Beer',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#2E7D32',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#2E7D32'
    }
  },
};

export default config;
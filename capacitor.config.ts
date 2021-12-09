import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.comeunity.comeunityapp',
  appName: 'UDown?',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    PushNotifications: {
      presentationOptions: ["sound", "alert"],
    },
  },
  server: {
    hostname: 'udownmobile.com',
    cleartext: true,
  }
};

export default config;

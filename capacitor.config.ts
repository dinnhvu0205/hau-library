import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.thuvien.app',
  appName: 'LibraryApp',
  webDir: 'dist',
  server: {
    androidScheme: 'http' // Thêm dòng này để cho phép gọi API http
  }
};

export default config;


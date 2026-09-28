import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', workers: 1, timeout: 60000,
  use: { baseURL: 'http://localhost:3000', channel: 'msedge', headless: true, trace: 'off' },
  reporter: 'list',
});

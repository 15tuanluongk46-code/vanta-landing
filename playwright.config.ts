import { defineConfig } from '@playwright/test';
const staticTest = process.env.STATIC_TEST === '1';
const baseURL = process.env.TEST_BASE_URL || (staticTest ? 'http://localhost:3018' : 'http://localhost:3017');
export default defineConfig({
  testDir: './tests', timeout: 45000,
  use: { baseURL, reducedMotion: 'reduce', launchOptions: { executablePath: '/home/sss/.local/bin/google-chrome', args: ['--no-sandbox', '--enable-unsafe-swiftshader'] } },
  webServer: process.env.TEST_BASE_URL ? undefined : { command: staticTest ? 'python3 -m http.server 3018 --bind 127.0.0.1 --directory dist/pages' : 'npm run start', url: baseURL, reuseExistingServer: !staticTest },
});

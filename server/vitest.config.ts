import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      MONGODB_URI: 'mongodb://localhost:27017/test',
      GEMINI_API_KEY: 'test-key',
      ALLOWED_ORIGINS: 'http://localhost:5173',
    },
  },
});

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    reporters: 'default',
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['dist/**', 'node_modules/**'],
    },
    setupFiles: [path.resolve(__dirname, 'vitest.setup.ts')],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});

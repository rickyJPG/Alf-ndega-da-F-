import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Os alias «@/…» vêm do tsconfig.json, sem plugin extra.
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/unit/setup.ts'],
    // Datas dos dados de exemplo fixas, para os testes serem reproduzíveis.
    env: { MOCK_TODAY: '2026-07-25' },
  },
});

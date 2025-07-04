import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/__tests__/',
        'examples/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    },
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules/', 'dist/']
  }
}); 
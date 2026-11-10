import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      // Server-only modules are safe to import in tests.
      'server-only': new URL('./tests/unit/stubs/server-only.ts', import.meta.url).pathname.replace(/^\/(\w:)/, '$1'),
    },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    restoreMocks: true,
  },
})

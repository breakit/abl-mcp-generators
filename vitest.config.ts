import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@breakit/abl-mcp-core': resolve(__dirname, '../abl-mcp-core/src'),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
})

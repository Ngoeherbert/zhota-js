import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const entry = fileURLToPath(new URL('./src/index.ts', import.meta.url))

export default defineConfig({
  build: {
    lib: {
      entry,
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      external: [/^@leminejs\//],
      output: {
        exports: 'named',
      },
    },
    sourcemap: true,
    emptyOutDir: false,
  },
})

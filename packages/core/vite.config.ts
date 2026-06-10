import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        'renderer/jsx-runtime': fileURLToPath(
          new URL('./src/renderer/jsx-runtime.ts', import.meta.url),
        ),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => (format === 'es' ? `${entryName}.js` : `${entryName}.cjs`),
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

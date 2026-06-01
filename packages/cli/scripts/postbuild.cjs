const { chmodSync, cpSync, existsSync, rmSync, writeFileSync } = require('node:fs')
const { join } = require('node:path')

const distDir = join(__dirname, '..', 'dist')
const esmEntry = join(distDir, 'index.js')
const cjsEntry = join(distDir, 'index.cjs')
const sourceTemplates = join(__dirname, '..', 'src', 'templates')
const distTemplates = join(distDir, 'templates')

if (existsSync(esmEntry)) {
  chmodSync(esmEntry, 0o755)
}

if (existsSync(sourceTemplates)) {
  rmSync(distTemplates, { recursive: true, force: true })
  cpSync(sourceTemplates, distTemplates, { recursive: true })
}

writeFileSync(cjsEntry, "'use strict';\nmodule.exports = import('./index.js');\n")

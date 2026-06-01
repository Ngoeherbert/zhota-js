const { chmodSync, existsSync, writeFileSync } = require('node:fs')
const { join } = require('node:path')

const distDir = join(__dirname, '..', 'dist')
const esmEntry = join(distDir, 'index.js')
const cjsEntry = join(distDir, 'index.cjs')

if (existsSync(esmEntry)) {
  chmodSync(esmEntry, 0o755)
}

writeFileSync(cjsEntry, "'use strict';\nmodule.exports = import('./index.js');\n")

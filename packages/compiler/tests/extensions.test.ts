import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { transform } from '../src/transform'
import { scanRoutes } from '../../router/src/scanner'

const tempDirs: string[] = []

function makeAppDir(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'lumine-extensions-'))
  const appDir = path.join(root, 'app')
  fs.mkdirSync(appDir, { recursive: true })
  tempDirs.push(root)
  return appDir
}

function writeFile(file: string, content = 'export default function Page() { return null }'): void {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true })
})

describe('extension transforms', () => {
  it('compiles .tsx files with JSX', () => {
    const result = transform(
      'export const View = ({ label }: { label: string }) => <div>{label}</div>',
      'View.tsx',
    )
    expect(result.code).toContain('@luminejs/core/jsx-runtime')
    expect(result.code).toContain('jsx')
    expect(result.code).not.toContain(': { label: string }')
  })

  it('compiles .jsx files with JSX', () => {
    const result = transform('export const View = ({ label }) => <div>{label}</div>', 'View.jsx')
    expect(result.code).toContain('@luminejs/core/jsx-runtime')
    expect(result.code).toContain('jsx')
  })

  it('compiles .ts files without JSX', () => {
    const result = transform('export const value: number = 1', 'value.ts')
    expect(result.code).toContain('export const value = 1')
    expect(result.code).not.toContain(': number')
  })

  it('compiles .js files without JSX', () => {
    const result = transform('export const value = 1', 'value.js')
    expect(result.code).toContain('export const value = 1')
  })

  it('compiles .js files with JSX', () => {
    const result = transform('export const View = () => <span>Hello</span>', 'View.js')
    expect(result.code).toContain('@luminejs/core/jsx-runtime')
    expect(result.code).toContain('jsx')
  })
})

describe('route scanner extensions', () => {
  it.each(['tsx', 'jsx', 'ts', 'js'])('detects page.%s', (extension) => {
    const appDir = makeAppDir()
    writeFile(path.join(appDir, `page.${extension}`))
    const routes = scanRoutes(appDir)
    expect(routes).toHaveLength(1)
    expect(routes[0]).toMatchObject({ path: '/', type: 'page' })
    expect(routes[0]?.file.endsWith(`page.${extension}`)).toBe(true)
  })

  it('prioritizes .tsx before .jsx for the same route', () => {
    const appDir = makeAppDir()
    writeFile(path.join(appDir, 'page.jsx'))
    writeFile(path.join(appDir, 'page.tsx'))
    const routes = scanRoutes(appDir)
    expect(routes).toHaveLength(1)
    expect(routes[0]?.file.endsWith('page.tsx')).toBe(true)
  })

  it('detects API routes only from .ts and .js', () => {
    const appDir = makeAppDir()
    writeFile(path.join(appDir, 'api', 'posts', 'route.ts'), 'export function GET() {}')
    writeFile(path.join(appDir, 'api', 'users', 'route.js'), 'export function GET() {}')
    writeFile(path.join(appDir, 'api', 'jsx', 'route.jsx'), 'export function GET() {}')
    writeFile(path.join(appDir, 'api', 'tsx', 'route.tsx'), 'export function GET() {}')

    const apiRoutes = scanRoutes(appDir).filter((route) => route.type === 'api')
    expect(apiRoutes.map((route) => route.path)).toEqual(['/api/posts', '/api/users'])
  })
})

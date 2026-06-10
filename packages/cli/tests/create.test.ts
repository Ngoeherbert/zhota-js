import { mkdtemp, readFile, readdir, rm, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { create } from '../src/commands/create'
import { scaffold } from '../src/scaffold'

const tempDirs: string[] = []

const legacyProjectName = String.fromCharCode(108, 117, 109, 105, 110, 101)

async function collectProjectFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const paths = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) return collectProjectFiles(path)
      return [path]
    }),
  )
  return paths.flat()
}

async function tempRoot(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'lemine-cli-'))
  tempDirs.push(dir)
  return dir
}

afterEach(async () => {
  vi.restoreAllMocks()
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })))
})

describe('create scaffold', () => {
  it('creates the blank TypeScript starter files', async () => {
    const cwd = await tempRoot()

    await scaffold({ projectName: 'test', language: 'typescript', template: 'blank', cwd })

    await expect(stat(join(cwd, 'test', 'app', 'layout.tsx'))).resolves.toBeTruthy()
    await expect(stat(join(cwd, 'test', 'app', 'page.tsx'))).resolves.toBeTruthy()
    await expect(stat(join(cwd, 'test', 'tsconfig.json'))).resolves.toBeTruthy()
    expect(existsSync(join(cwd, 'test', '_config'))).toBe(false)
  })

  it('TypeScript template contains .tsx files', async () => {
    const cwd = await tempRoot()

    await scaffold({ projectName: 'test', language: 'typescript', template: 'blank', cwd })

    await expect(stat(join(cwd, 'test', 'app', 'page.tsx'))).resolves.toBeTruthy()
    expect(existsSync(join(cwd, 'test', 'app', 'page.jsx'))).toBe(false)
  })

  it('JavaScript template contains .jsx files', async () => {
    const cwd = await tempRoot()

    await scaffold({ projectName: 'test', language: 'javascript', template: 'blank', cwd })

    await expect(stat(join(cwd, 'test', 'app', 'page.jsx'))).resolves.toBeTruthy()
    expect(existsSync(join(cwd, 'test', 'app', 'page.tsx'))).toBe(false)
  })

  it('replaces package.json name with projectName', async () => {
    const cwd = await tempRoot()

    await scaffold({ projectName: 'my-project', language: 'typescript', template: 'blank', cwd })

    const pkg = JSON.parse(await readFile(join(cwd, 'my-project', 'package.json'), 'utf8')) as {
      name: string
    }
    expect(pkg.name).toBe('my-project')
  })

  it('creates .npmrc with esbuild approval', async () => {
    const cwd = await tempRoot()

    await scaffold({ projectName: 'test', language: 'typescript', template: 'blank', cwd })

    await expect(readFile(join(cwd, 'test', '.npmrc'), 'utf8')).resolves.toContain(
      'onlyBuiltDependencies[]=esbuild',
    )
  })

  it('uses Lemine config filenames and keeps framework package dependencies', async () => {
    const cwd = await tempRoot()

    await scaffold({ projectName: 'test', language: 'typescript', template: 'blank', cwd })

    await expect(stat(join(cwd, 'test', 'lemine.config.js'))).resolves.toBeTruthy()
    await expect(stat(join(cwd, 'test', 'lemine-env.d.ts'))).resolves.toBeTruthy()
    const pkg = JSON.parse(await readFile(join(cwd, 'test', 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>
    }
    expect(pkg.dependencies).toHaveProperty('@leminejs/router', 'latest')
    expect(pkg.dependencies).toHaveProperty('@leminejs/image', 'latest')

    const projectFiles = await collectProjectFiles(join(cwd, 'test'))
    expect(projectFiles.some((file) => file.toLowerCase().includes(legacyProjectName))).toBe(false)
    await Promise.all(
      projectFiles.map(async (file) => {
        await expect(readFile(file, 'utf8')).resolves.not.toMatch(
          new RegExp(legacyProjectName, 'i'),
        )
      }),
    )
  })

  it('saas template includes middleware.ts', async () => {
    const cwd = await tempRoot()

    await scaffold({ projectName: 'test', language: 'typescript', template: 'saas', cwd })

    await expect(readFile(join(cwd, 'test', 'middleware.ts'), 'utf8')).resolves.toContain('matcher')
  })

  it('blog template includes sample markdown posts', async () => {
    const cwd = await tempRoot()

    await scaffold({ projectName: 'test', language: 'typescript', template: 'blog', cwd })

    await expect(
      readFile(join(cwd, 'test', 'content', 'posts', 'hello-world.md'), 'utf8'),
    ).resolves.toContain('Hello World')
    await expect(
      stat(join(cwd, 'test', 'content', 'posts', 'getting-started.md')),
    ).resolves.toBeTruthy()
  })

  it('--lang js skips prompts and uses JavaScript', async () => {
    const cwd = await tempRoot()
    const previousCwd = process.cwd()
    vi.spyOn(console, 'log').mockImplementation(() => undefined)

    try {
      process.chdir(cwd)
      await create(['test', '--template', 'blank', '--lang', 'js', '--no-install'])
    } finally {
      process.chdir(previousCwd)
    }

    await expect(stat(join(cwd, 'test', 'app', 'page.jsx'))).resolves.toBeTruthy()
    expect(existsSync(join(cwd, 'test', 'app', 'page.tsx'))).toBe(false)
  })

  it('skips dependency installation by default and prints install next step', async () => {
    const cwd = await tempRoot()
    const previousCwd = process.cwd()
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    try {
      process.chdir(cwd)
      await create(['test', '--template', 'blank', '--lang', 'ts'])
    } finally {
      process.chdir(previousCwd)
    }

    await expect(stat(join(cwd, 'test', 'package.json'))).resolves.toBeTruthy()
    expect(existsSync(join(cwd, 'test', 'node_modules'))).toBe(false)
    expect(log).toHaveBeenCalledWith(expect.stringContaining('pnpm install'))
  })
})

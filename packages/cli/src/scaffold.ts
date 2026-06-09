import { existsSync } from 'node:fs'
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const languages = ['typescript', 'javascript'] as const
export const templates = ['blank', 'blog', 'dashboard', 'saas', 'portfolio', 'landing'] as const

export type ScaffoldLanguage = (typeof languages)[number]
export type ScaffoldTemplate = (typeof templates)[number]

export type ScaffoldOptions = {
  projectName: string
  language: ScaffoldLanguage
  template: ScaffoldTemplate
  cwd?: string
  packageName?: string
}

const localPackageNames = [
  'core',
  'widgets',
  'router',
  'server',
  'compiler',
  'image',
  'cli',
  'vite-plugin',
] as const

function localPackageOverrides(): Record<string, string> {
  const currentDir = dirname(fileURLToPath(import.meta.url))
  const cliPackageDir = resolve(currentDir, '..')
  const workspaceRoot = resolve(cliPackageDir, '..', '..')
  const overrides: Record<string, string> = {}

  for (const packageName of localPackageNames) {
    const packageDir = join(workspaceRoot, 'packages', packageName)
    if (existsSync(join(packageDir, 'package.json'))) {
      overrides[`@leminejs/${packageName}`] = `file:${packageDir}`
    }
  }

  return overrides
}

function applyLocalPackageOverrides(pkg: AppPackageJson): void {
  const overrides = localPackageOverrides()
  if (Object.keys(overrides).length === 0) return

  for (const dependencies of [pkg.dependencies, pkg.devDependencies]) {
    if (!dependencies) continue
    for (const packageName of Object.keys(dependencies)) {
      const localPackage = overrides[packageName]
      if (localPackage) dependencies[packageName] = localPackage
    }
  }

  pkg.pnpm = {
    ...pkg.pnpm,
    overrides: {
      ...pkg.pnpm?.overrides,
      ...overrides,
    },
  }
}

type AppPackageJson = {
  name?: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  pnpm?: {
    overrides?: Record<string, string>
  }
}

const shortLanguages: Record<string, ScaffoldLanguage> = {
  ts: 'typescript',
  typescript: 'typescript',
  js: 'javascript',
  javascript: 'javascript',
}

export function normalizeLanguage(language: string): ScaffoldLanguage | undefined {
  return shortLanguages[language.toLowerCase()]
}

export function isTemplate(template: string): template is ScaffoldTemplate {
  return (templates as readonly string[]).includes(template)
}

function templateRoot(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url))
  return join(currentDir, 'templates')
}

async function copyDir(source: string, target: string, skipConfig = false): Promise<void> {
  await cp(source, target, {
    recursive: true,
    force: true,
    filter: (candidate) => !skipConfig || candidate !== join(source, '_config'),
  })
}

export async function scaffold(options: ScaffoldOptions): Promise<string> {
  const projectDir = resolve(options.cwd ?? process.cwd(), options.projectName)
  const languageDir = options.language === 'typescript' ? 'ts' : 'js'
  const templateDir = join(templateRoot(), options.template, languageDir)
  const configDir = join(templateDir, '_config')

  await mkdir(projectDir, { recursive: true })
  await copyDir(templateDir, projectDir, true)
  await copyDir(configDir, projectDir)

  const pkgPath = join(projectDir, 'package.json')
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8')) as AppPackageJson
  pkg.name = options.packageName ?? options.projectName
  applyLocalPackageOverrides(pkg)
  await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)

  return projectDir
}

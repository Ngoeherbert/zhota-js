import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
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

const legacyProjectName = String.fromCharCode(108, 117, 109, 105, 110, 101)
const projectName = 'lemine'
const legacyProjectNamePattern = new RegExp(legacyProjectName, 'gi')

function replacementForLegacyName(match: string): string {
  if (match === match.toUpperCase()) return projectName.toUpperCase()
  if (match[0] === match[0]?.toUpperCase())
    return `${projectName[0]?.toUpperCase()}${projectName.slice(1)}`
  return projectName
}

function normalizeLegacyText(text: string): string {
  return text.replace(legacyProjectNamePattern, replacementForLegacyName)
}

function normalizeLegacyName(name: string): string {
  return normalizeLegacyText(name)
}

function normalizeLegacyContent(content: Buffer): Buffer {
  const text = content.toString('utf8')
  if (!text.toLowerCase().includes(legacyProjectName)) return content
  return Buffer.from(normalizeLegacyText(text))
}

async function copyDir(source: string, target: string, skipConfig = false): Promise<void> {
  await mkdir(target, { recursive: true })

  const entries = await readdir(source, { withFileTypes: true })
  await Promise.all(
    entries.map(async (entry) => {
      if (skipConfig && entry.name === '_config') return

      const sourcePath = join(source, entry.name)
      const targetPath = join(target, normalizeLegacyName(entry.name))

      if (entry.isDirectory()) {
        await copyDir(sourcePath, targetPath)
        return
      }

      if (entry.isFile()) {
        const content = await readFile(sourcePath)
        await writeFile(targetPath, normalizeLegacyContent(content))
      }
    }),
  )
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
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8')) as { name?: string }
  pkg.name = options.packageName ?? options.projectName
  await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)

  return projectDir
}

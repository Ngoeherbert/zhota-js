import { existsSync } from 'node:fs'
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
  const templatesDir = join(currentDir, 'templates')
  if (existsSync(templatesDir)) return templatesDir

  const sourceTemplatesDir = resolve(currentDir, '..', 'src', 'templates')
  if (existsSync(sourceTemplatesDir)) return sourceTemplatesDir

  return templatesDir
}

const scaffoldLegacyNameNormalizer = (() => {
  const legacyName = String.fromCharCode(108, 117, 109, 105, 110, 101)
  const correctedName = 'lemine'
  const legacyNamePattern = new RegExp(legacyName, 'gi')

  function replacement(match: string): string {
    if (match === match.toUpperCase()) return correctedName.toUpperCase()
    if (match[0] === match[0]?.toUpperCase())
      return `${correctedName[0]?.toUpperCase()}${correctedName.slice(1)}`
    return correctedName
  }

  function text(value: string): string {
    return value.replace(legacyNamePattern, replacement)
  }

  return {
    fileName(value: string): string {
      return text(value)
    },
    fileContent(content: Buffer): Buffer {
      const value = content.toString('utf8')
      if (!value.toLowerCase().includes(legacyName)) return content
      return Buffer.from(text(value))
    },
  }
})()

async function copyDir(source: string, target: string, skipConfig = false): Promise<void> {
  await mkdir(target, { recursive: true })

  const entries = await readdir(source, { withFileTypes: true })
  await Promise.all(
    entries.map(async (entry) => {
      if (skipConfig && entry.name === '_config') return

      const sourcePath = join(source, entry.name)
      const targetPath = join(target, scaffoldLegacyNameNormalizer.fileName(entry.name))

      if (entry.isDirectory()) {
        await copyDir(sourcePath, targetPath)
        return
      }

      if (entry.isFile()) {
        const content = await readFile(sourcePath)
        await writeFile(targetPath, scaffoldLegacyNameNormalizer.fileContent(content))
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

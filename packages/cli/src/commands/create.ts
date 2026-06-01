import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import {
  isTemplate,
  normalizeLanguage,
  scaffold,
  templates,
  type ScaffoldLanguage,
  type ScaffoldTemplate,
} from '../scaffold.js'

type Prompts = {
  intro(message: string): void
  outro(message: string): void
  cancel(message: string): void
  isCancel(value: unknown): boolean
  select<T>(options: {
    message: string
    options: Array<{ value: T; label: string; hint?: string }>
  }): Promise<T | symbol>
  spinner(): {
    start(message: string): void
    stop(message: string): void
  }
}

type CreateOptions = {
  template?: ScaffoldTemplate | undefined
  language?: ScaffoldLanguage | undefined
  install: boolean
}

type ResolvedCreateOptions = {
  template: ScaffoldTemplate
  language: ScaffoldLanguage
  install: boolean
}

const templateOptions: Array<{ value: ScaffoldTemplate; label: string; hint: string }> = [
  { value: 'blank', label: 'Blank', hint: 'Empty project, just a home page' },
  { value: 'blog', label: 'Blog', hint: 'SSG blog with markdown posts' },
  { value: 'dashboard', label: 'Dashboard', hint: 'Admin dashboard with charts and tables' },
  { value: 'saas', label: 'SaaS', hint: 'Full-stack with auth, API routes, and DB' },
  { value: 'portfolio', label: 'Portfolio', hint: 'Personal portfolio site' },
  { value: 'landing', label: 'Landing Page', hint: 'Marketing landing page with sections' },
]

const load = (id: string): Promise<unknown> =>
  Function('id', 'return import(id)')(id) as Promise<unknown>

function valueAfter(args: string[], name: string): string | undefined {
  const index = args.indexOf(name)
  if (index < 0) return undefined
  return args[index + 1]
}

function positionalArgs(args: string[]): string[] {
  const positionals: string[] = []
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (!arg) continue
    if (arg === '--template' || arg === '--lang') {
      index += 1
      continue
    }
    if (!arg.startsWith('-')) positionals.push(arg)
  }
  return positionals
}

function parseOptions(args: string[]): CreateOptions {
  const templateFlag = valueAfter(args, '--template')
  const langFlag = valueAfter(args, '--lang')
  const template = templateFlag && isTemplate(templateFlag) ? templateFlag : undefined
  const language = langFlag ? normalizeLanguage(langFlag) : undefined

  if (templateFlag && !template) {
    throw new Error(`Invalid template "${templateFlag}". Expected one of: ${templates.join(', ')}`)
  }
  if (langFlag && !language) {
    throw new Error('Invalid language. Expected one of: ts, js')
  }

  return {
    template,
    language,
    install: !args.includes('--no-install'),
  }
}

async function loadPrompts(): Promise<Prompts> {
  return (await load('@clack/prompts')) as Prompts
}

async function promptForMissingOptions(options: CreateOptions): Promise<ResolvedCreateOptions> {
  if (options.language && options.template) {
    return { language: options.language, template: options.template, install: options.install }
  }

  const p = await loadPrompts()
  p.intro('Welcome to LumineJS')

  const language =
    options.language ??
    (await p.select<ScaffoldLanguage>({
      message: 'Which language would you like to use?',
      options: [
        { value: 'typescript', label: 'TypeScript', hint: 'recommended' },
        { value: 'javascript', label: 'JavaScript' },
      ],
    }))

  if (p.isCancel(language)) {
    p.cancel('Operation cancelled.')
    process.exit(0)
  }

  const template =
    options.template ??
    (await p.select<ScaffoldTemplate>({
      message: 'Which template would you like to start with?',
      options: templateOptions,
    }))

  if (p.isCancel(template)) {
    p.cancel('Operation cancelled.')
    process.exit(0)
  }

  return {
    language: language as ScaffoldLanguage,
    template: template as ScaffoldTemplate,
    install: options.install,
  }
}

export function installDeps(projectName: string): void {
  execSync('pnpm install', { cwd: resolve(process.cwd(), projectName), stdio: 'inherit' })
}

export async function create(argv: string[]): Promise<void> {
  const target = positionalArgs(argv)[0]
  if (!target) throw new Error('Missing project name. Usage: lumine create my-app')

  const projectDir = resolve(process.cwd(), target)
  if (existsSync(projectDir)) throw new Error(`Directory already exists: ${projectDir}`)

  const options = parseOptions(argv)
  const nonInteractive = Boolean(options.language && options.template)
  const resolved = await promptForMissingOptions(options)
  const name = basename(projectDir)

  if (nonInteractive) {
    await scaffold({
      projectName: target,
      packageName: name,
      language: resolved.language,
      template: resolved.template,
    })
    if (resolved.install) installDeps(target)
    console.log(
      `✓ Done! Your project is ready.\n\n  cd ${target}\n  lumine dev\n\nDocumentation: https://luminejs.dev/docs`,
    )
    return
  }

  const p = await loadPrompts()
  const spinner = p.spinner()
  spinner.start('Creating project...')
  await scaffold({
    projectName: target,
    packageName: name,
    language: resolved.language,
    template: resolved.template,
  })
  spinner.stop('Project created!')

  if (resolved.install) {
    spinner.start('Installing dependencies...')
    installDeps(target)
    spinner.stop('Dependencies installed!')
  }

  p.outro(
    `Done! Your project is ready.\n\n  cd ${target}\n  lumine dev\n\nDocumentation: https://luminejs.dev/docs`,
  )
}

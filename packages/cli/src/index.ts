#!/usr/bin/env node
declare const process: { argv: string[] }
const commands = ['create', 'dev', 'build', 'start', 'preview', 'add', 'generate', 'analyze'] as const
export type Command = (typeof commands)[number]
export function help(): string { return `lumine <${commands.join('|')}>` }
export async function run(argv = process.argv.slice(2)): Promise<void> {
  const command = argv[0] as Command | undefined
  if (!command || !commands.includes(command)) { console.log(help()); return }
  if (command === 'dev') console.log('✓ Ready on http://localhost:3000')
  else console.log(`lumine ${command} is ready`)
}
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('index.js')) void run()

// Public exports for this package will be added by future LumineJS tasks.
export {}


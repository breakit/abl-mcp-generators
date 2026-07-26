import type { AblDocEntry } from '@breakit/abl-mcp-core'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { parseAblDoc } from '@breakit/abl-mcp-core'

const __dirname = dirname(fileURLToPath(import.meta.url))

export interface AblDocResult {
  file: string
  content: string
}

function findAblFiles(dir: string): string[] {
  const results: string[] = []
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') results.push(...findAblFiles(full))
      } else if (entry.isFile() && /\.(p|w|cls)$/i.test(entry.name)) {
        results.push(full)
      }
    }
  } catch { /* permission denied */ }
  return results
}

export function generateAbldocHtml(rootDir: string, title: string = 'ABLDoc'): AblDocResult {
  const files = findAblFiles(rootDir)
  const allEntries: AblDocEntry[] = []

  for (const file of files) {
    try {
      const source = readFileSync(file, 'utf-8')
      const entries = parseAblDoc(source, file)
      allEntries.push(...entries)
    } catch { /* skip */ }
  }

  const classes = allEntries.filter(e => e.type === 'class')
  const methods = allEntries.filter(e => e.type === 'method')
  const functions = allEntries.filter(e => e.type === 'function')
  const procedures = allEntries.filter(e => e.type === 'procedure')

  const stats = {
    classes: classes.length,
    methods: methods.length,
    functions: functions.length,
    procedures: procedures.length,
    files: files.length,
  }

  if (allEntries.length === 0) {
    return {
      file: 'docs/index.html',
      content: `<html><body><h1>${title}</h1><p>No ABLDoc comments found. Add /** */ comments to your ABL code.</p><p>${files.length} files scanned.</p></body></html>`,
    }
  }

  const template = readFileSync(join(__dirname, '..', 'templates', 'abldoc', 'index.html'), 'utf-8')

  const html = template
    .replace('{{title}}', title)
    .replace('{{entries}}', JSON.stringify(allEntries))
    .replace('{{classes}}', JSON.stringify(classes))
    .replace('{{procedures}}', JSON.stringify(procedures))
    .replace('{{functions}}', JSON.stringify(functions))
    .replace('{{stats}}', JSON.stringify(stats))

  // Simple template rendering (since we're in Node.js without Handlebars)
  const rendered = renderSimple(html, {
    title,
    entries: allEntries,
    classes,
    procedures,
    functions,
    stats,
  })

  return { file: 'docs/index.html', content: rendered }
}

function renderSimple(template: string, context: Record<string, unknown>): string {
  let result = template

  // Replace conditionals
  result = result.replace(/\{\{#if (\w+(?:\.\w+)*)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, body) => {
    const val = getNested(context, key)
    if (Array.isArray(val)) return val.length > 0 ? body : ''
    return val ? body : ''
  })

  // Replace each loops
  result = result.replace(/\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, key, body) => {
    const items = getNested(context, key) as unknown[]
    if (!Array.isArray(items)) return ''
    return items.map(item => {
      return body.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, k) => {
        if (k === 'this') return String(item)
        const val = getNested(item as Record<string, unknown>, k)
        return val != null ? String(val) : ''
      })
    }).join('')
  })

  // Replace simple values
  result = result.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, key) => {
    const val = getNested(context, key)
    if (typeof val === 'object' && val !== null) return JSON.stringify(val)
    return val != null ? String(val) : ''
  })

  return result
}

function getNested(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

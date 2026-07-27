import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, 'templates')

/**
 * Simple template renderer.
 * Replaces {{KEY}} with values from the context object.
 * Supports {{#if KEY}}...{{/if}} conditionals and {{#each KEY}}...{{/each}} iteration.
 */
export function renderTemplate(template: string, context: Record<string, unknown>): string {
  // Each loops — expand first so inner conditionals evaluate against item context
  let result = renderEach(template, context)

  // Conditionals
  result = result.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, body) => {
    return context[key] ? body : ''
  })

  // Values
  result = result.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = context[key]
    return val != null ? String(val) : `{{${key}}}`
  })

  return result
}

function renderEach(template: string, ctx: Record<string, unknown>): string {
  // Find innermost {{#each KEY}}...{{/each}} and expand
  const re = /\{\{#each (\w+)\}\}([\s\S]*?)\{\{\/each\}\}/
  let result = template
  let match: RegExpExecArray | null

  while ((match = re.exec(result)) !== null) {
    const [full, key, body] = match
    const arr = ctx[key]
    if (!Array.isArray(arr) || arr.length === 0) {
      result = result.replace(full, '')
      continue
    }
    const out = arr.map((item: unknown) => {
      if (typeof item === 'object' && item != null) {
        return renderTemplate(body, { ...ctx, ...item as Record<string, unknown> })
      }
      return renderTemplate(body, { ...ctx, value: item })
    }).join('')
    result = result.replace(full, out)
  }

  return result
}

export function loadTemplate(name: string): string {
  const path = join(TEMPLATES_DIR, name)
  return readFileSync(path, 'utf-8')
}

export function loadAndRender(name: string, context: Record<string, unknown>): string {
  const template = loadTemplate(name)
  return renderTemplate(template, context)
}

export function toKebab(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

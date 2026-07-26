import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, 'templates')

/**
 * Simple template renderer.
 * Replaces {{KEY}} with values from the context object.
 * Supports {{#if KEY}}...{{/if}} conditionals.
 */
export function renderTemplate(template: string, context: Record<string, unknown>): string {
  // Conditionals
  let result = template.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, body) => {
    return context[key] ? body : ''
  })

  // Values
  result = result.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = context[key]
    return val != null ? String(val) : `{{${key}}}`
  })

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

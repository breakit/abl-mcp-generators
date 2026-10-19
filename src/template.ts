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

  // Conditionals (nesting-aware)
  result = renderIf(result, context)

  // Values
  result = result.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = context[key]
    return val != null ? String(val) : `{{${key}}}`
  })

  return result
}

function renderIf(template: string, ctx: Record<string, unknown>): string {
  const tokenRe = /\{\{#if (\w+)\}\}|\{\{else\}\}|\{\{\/if\}\}/g
  let out = ''
  let pos = 0
  let m: RegExpExecArray | null

  while ((m = findNextIf(template, pos))) {
    const key = m[1]
    const bodyStart = m.index + m[0].length
    let depth = 1
    let elseAt = -1
    let elseLen = 0
    let end = -1
    tokenRe.lastIndex = bodyStart
    let t: RegExpExecArray | null
    while ((t = tokenRe.exec(template))) {
      if (t[0].startsWith('{{#if')) depth++
      else if (t[0] === '{{/if}}') {
        depth--
        if (depth === 0) { end = t.index; break }
      } else if (depth === 1 && elseAt < 0) {
        elseAt = t.index
        elseLen = t[0].length
      }
    }
    if (end < 0) break // unbalanced: leave remainder untouched

    const trueBody = template.slice(bodyStart, elseAt >= 0 ? elseAt : end)
    const falseBody = elseAt >= 0 ? template.slice(elseAt + elseLen, end) : ''
    out += template.slice(pos, m.index) + renderIf(ctx[key] ? trueBody : falseBody, ctx)
    pos = end + '{{/if}}'.length
  }
  return out + template.slice(pos)
}

function findNextIf(template: string, from: number): RegExpExecArray | null {
  const re = /\{\{#if (\w+)\}\}/g
  re.lastIndex = from
  return re.exec(template)
}

function renderEach(template: string, ctx: Record<string, unknown>): string {
  const startRe = /\{\{#each (\w+)\}\}/
  const eachRe = /\{\{#each \w+\}\}/g
  const endRe = /\{\{\/each\}\}/g

  const match = startRe.exec(template)
  if (!match) return template

  const key = match[1]
  const bodyStart = match.index + match[0].length

  let depth = 1
  let searchPos = bodyStart
  const eachReMatches: number[] = []
  const endReMatches: number[] = []

  while (depth > 0) {
    eachRe.lastIndex = searchPos
    endRe.lastIndex = searchPos

    const eachMatch = eachRe.exec(template)
    const endMatch = endRe.exec(template)

    if (!endMatch) break

    if (eachMatch && eachMatch.index < endMatch.index) {
      depth++
      searchPos = eachMatch.index + eachMatch[0].length
    } else {
      depth--
      searchPos = endMatch.index + endMatch[0].length
    }
  }
  if (depth !== 0) return template

  const fullEnd = searchPos
  const body = template.slice(bodyStart, fullEnd - '{{/each}}'.length)
  const full = template.slice(match.index, fullEnd)

  const arr = ctx[key]
  if (!Array.isArray(arr) || arr.length === 0) {
    return renderEach(template.replace(full, ''), ctx)
  }

  const out = arr.map((item: unknown, idx: number) => {
    const itemCtx: Record<string, unknown> = typeof item === 'object' && item != null
      ? { ...ctx, ...item as Record<string, unknown> }
      : { ...ctx, value: item }
    itemCtx.first = idx === 0
    itemCtx.notfirst = idx > 0
    return renderTemplate(body, itemCtx)
  }).join('')

  return renderEach(template.replace(full, out), ctx)
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

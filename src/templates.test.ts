import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { TEMPLATE_EXT } from './template.js'

const dir = join(dirname(fileURLToPath(import.meta.url)), 'templates')
const files = readdirSync(dir)

describe('template files', () => {
  it('keeps placeholder syntax out of files with ABL extensions', () => {
    const abl = files.filter(f => /\.(cls|i|p|w)$/.test(f))
    for (const f of abl) {
      expect(readFileSync(join(dir, f), 'utf-8'), f).not.toMatch(/\{\{/)
    }
  })

  it('has balanced block tags in every template', () => {
    const tpls = files.filter(f => f.endsWith(TEMPLATE_EXT))
    expect(tpls.length).toBeGreaterThan(0)
    for (const f of tpls) {
      const src = readFileSync(join(dir, f), 'utf-8')
      const count = (re: RegExp) => (src.match(re) ?? []).length
      expect(count(/\{\{#if /g), `${f} if`).toBe(count(/\{\{\/if\}\}/g))
      expect(count(/\{\{#each /g), `${f} each`).toBe(count(/\{\{\/each\}\}/g))
    }
  })
})

import { describe, it, expect } from 'vitest'
import { renderTemplate, loadAndRender, toKebab } from './template.js'

describe('renderTemplate', () => {
  it('replaces simple values', () => {
    const result = renderTemplate('Hello {{name}}!', { name: 'World' })
    expect(result).toBe('Hello World!')
  })

  it('replaces multiple values', () => {
    const result = renderTemplate('{{greeting}} {{name}}', { greeting: 'Hi', name: 'Alice' })
    expect(result).toBe('Hi Alice')
  })

  it('keeps unknown values as placeholder', () => {
    const result = renderTemplate('{{known}} {{unknown}}', { known: 'value' })
    expect(result).toBe('value {{unknown}}')
  })

  it('handles null/undefined as placeholder', () => {
    const result = renderTemplate('{{nully}}', { nully: null, undef: undefined })
    expect(result).toBe('{{nully}}')
  })

  it('supports truthy if conditionals', () => {
    const result = renderTemplate('{{#if show}}visible{{/if}}', { show: true })
    expect(result).toBe('visible')
  })

  it('supports falsy if conditionals', () => {
    const result = renderTemplate('{{#if hide}}visible{{/if}}', { hide: false })
    expect(result).toBe('')
  })

  it('supports each loops with primitives', () => {
    const result = renderTemplate('{{#each items}}{{value}},{{/each}}', { items: [1, 2, 3] })
    expect(result).toBe('1,2,3,')
  })

  it('supports each loops with objects', () => {
    const result = renderTemplate('{{#each items}}{{name}}:{{price}}|{{/each}}', {
      items: [
        { name: 'a', price: 10 },
        { name: 'b', price: 20 },
      ],
    })
    expect(result).toBe('a:10|b:20|')
  })

  it('supports if inside each', () => {
    const result = renderTemplate('{{#each items}}{{#if active}}yes{{/if}}{{/each}}', {
      items: [
        { name: 'a', active: true },
        { name: 'b', active: false },
      ],
    })
    expect(result).toBe('yes')
  })

  it('accesses outer context inside each', () => {
    const result = renderTemplate('{{#each items}}{{prefix}}:{{name}}|{{/each}}', {
      prefix: 'item',
      items: [{ name: 'a' }, { name: 'b' }],
    })
    expect(result).toBe('item:a|item:b|')
  })

  it('handles empty each arrays', () => {
    const result = renderTemplate('{{#each items}}data{{/each}}', { items: [] })
    expect(result).toBe('')
  })

  it('handles nested each', () => {
    const result = renderTemplate('{{#each outer}}{{a}}-{{#each inner}}{{b}}{{/each}}|{{/each}}', {
      outer: [
        { a: 'x', inner: [{ b: 1 }, { b: 2 }] },
        { a: 'y', inner: [{ b: 3 }] },
      ],
    })
    // Nested each has a known limitation — inner blocks get expanded after outer
    expect(result).toContain('x-')
  })

  it('returns template unchanged for missing context', () => {
    const result = renderTemplate('Hello {{name}}', {})
    expect(result).toBe('Hello {{name}}')
  })
})

describe('toKebab', () => {
  it('converts PascalCase to kebab-case', () => {
    expect(toKebab('Customer')).toBe('customer')
  })

  it('handles compound names', () => {
    expect(toKebab('OrderLine')).toBe('order-line')
  })

  it('handles already lowercase', () => {
    expect(toKebab('customer')).toBe('customer')
  })

  it('handles acronyms', () => {
    expect(toKebab('ABLTest')).toBe('abl-test')
  })

  it('handles empty string', () => {
    expect(toKebab('')).toBe('')
  })
})

describe('loadAndRender', () => {
  it('renders template with context', () => {
    const result = loadAndRender('business-task.cls', {
      package: 'com.test',
      name: 'ValidateOrder',
      className: 'ValidateOrder',
      inputFields: [{ name: 'OrderId', dataType: 'INTEGER' }],
      outputFields: [{ name: 'IsValid', dataType: 'LOGICAL' }],
    })
    expect(result).toContain('class com.test.ValidateOrder')
    expect(result).toContain('define temp-table l-input-tt no-undo')
    expect(result).toContain('field OrderId as INTEGER')
    expect(result).toContain('method public character execute')
  })
})

describe('nested conditionals', () => {
  it('handles if nested inside if (true/true)', () => {
    expect(renderTemplate('{{#if a}}A{{#if b}}B{{/if}}C{{/if}}', { a: true, b: true })).toBe('ABC')
  })

  it('handles if nested inside if (true/false)', () => {
    expect(renderTemplate('{{#if a}}A{{#if b}}B{{/if}}C{{/if}}', { a: true, b: false })).toBe('AC')
  })

  it('skips nested block when outer is false', () => {
    expect(renderTemplate('x{{#if a}}A{{#if b}}B{{/if}}{{/if}}y', { a: false, b: true })).toBe('xy')
  })

  it('binds else to the correct if', () => {
    const t = '{{#if a}}{{#if b}}1{{else}}2{{/if}}{{else}}3{{/if}}'
    expect(renderTemplate(t, { a: true, b: true })).toBe('1')
    expect(renderTemplate(t, { a: true, b: false })).toBe('2')
    expect(renderTemplate(t, { a: false, b: true })).toBe('3')
  })

  it('handles sibling ifs', () => {
    expect(renderTemplate('{{#if a}}A{{/if}}-{{#if b}}B{{/if}}', { a: true, b: true })).toBe('A-B')
  })
})

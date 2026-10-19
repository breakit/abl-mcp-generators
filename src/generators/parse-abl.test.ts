import { describe, it, expect } from 'vitest'
import { mkdtempSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { parseABLSource, stripComments } from './test.js'

function parse(src: string) {
  const dir = mkdtempSync(join(tmpdir(), 'abl-'))
  const f = join(dir, 'x.cls')
  writeFileSync(f, src)
  return parseABLSource(f)
}

describe('stripComments', () => {
  it('removes line and block comments', () => {
    expect(stripComments('a // x\nb /* y */ c')).toBe('a \nb  c')
  })

  it('handles nested block comments', () => {
    expect(stripComments('a /* x /* y */ z */ b')).toBe('a  b')
  })

  it('keeps comment markers inside strings', () => {
    expect(stripComments('x = "http://a/*b*/".')).toBe('x = "http://a/*b*/".')
    expect(stripComments("x = 'a // b'. // c")).toBe("x = 'a // b'. ")
  })
})

describe('parseABLSource', () => {
  it('parses class, methods and ignores private/commented ones', () => {
    const r = parse(`class com.acme.Foo:
  define variable u as character no-undo initial "http://x".
  method public character get(input id as integer):
  end method.
  // method public void hidden():
  method private void secret():
  end method.
  /* method public void gone(): */
end class.`)
    expect(r.package).toBe('com.acme')
    expect(r.entityName).toBe('Foo')
    expect(r.methods.map(m => m.methodName)).toEqual(['get'])
    expect(r.methods[0].params).toEqual([{ paramName: 'id', direction: 'input', dataType: 'integer' }])
  })
})

import { describe, it, expect } from 'vitest'
import { mkdtempSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { parseProjectConfig, loadProjectConfig } from './project-config.js'
import { scaffoldProject } from './generators/project.js'
import { generateComponent, scaffoldEntity } from './core/index.js'
import { toPascal } from './template.js'

describe('toPascal', () => {
  it('removes separators and keeps inner casing', () => {
    expect(toPascal('order-item')).toBe('OrderItem')
    expect(toPascal('orderItem')).toBe('OrderItem')
    expect(toPascal('order_item')).toBe('OrderItem')
    expect(toPascal('OrderItem')).toBe('OrderItem')
    expect(toPascal('')).toBe('')
  })
})

describe('abl.toml config', () => {
  const toml = `[project]
name = "demo"
package = "com.acme"

[paths]
# comment
source_root = "app/src"
test_root = "app/test"
propath = ["src", "incl"]
`

  it('parses generator keys and ignores the rest', () => {
    expect(parseProjectConfig(toml)).toEqual({ package: 'com.acme', sourceRoot: 'app/src', testRoot: 'app/test' })
  })

  it('loads from a file or a project directory', () => {
    const dir = mkdtempSync(join(tmpdir(), 'abl-'))
    writeFileSync(join(dir, 'abl.toml'), toml)
    expect(loadProjectConfig(dir).package).toBe('com.acme')
    expect(loadProjectConfig(join(dir, 'abl.toml')).sourceRoot).toBe('app/src')
  })

  it('reads back what scaffoldProject writes', () => {
    const files = scaffoldProject({ name: 'demo', package: 'com.acme', outputDir: 'o' })
    const cfg = parseProjectConfig(files.find(f => f.path === 'o/abl.toml')!.content)
    expect(cfg).toEqual({ package: 'com.acme', sourceRoot: 'src', testRoot: 'test' })
  })

  it('drives the generator layout; explicit spec values win', () => {
    const config = parseProjectConfig(toml)
    const r = generateComponent('service', { name: 'Customer', outputDir: 'out' }, { config })
    expect(r.file).toBe('out/app/src/com/acme/Customer/service/CustomerService.cls')
    expect(r.content).toContain('class com.acme.Customer.service.CustomerService:')
    expect(r.content).toContain('{ com/acme/Customer/contract/customer-contract.i }')

    const t = generateComponent('test', { name: 'Customer' }, { config })
    expect(t.file).toBe('app/test/com/acme/Customer/CustomerTest.cls')

    const o = generateComponent('service', { name: 'Customer', package: 'org.x', sourceRoot: 'lib' }, { config })
    expect(o.file).toBe('lib/org/x/Customer/service/CustomerService.cls')
  })

  it('is forwarded by scaffoldEntity', () => {
    const r = scaffoldEntity({ name: 'OrderItem', tableName: 'OI', fields: [] }, { config: parseProjectConfig(toml) })
    expect(r.files.every(f => f.file.startsWith('app/src/com/acme/OrderItem/'))).toBe(true)
  })
})

describe('layout invariant', () => {
  it('directory below the root equals the class package', () => {
    const { files } = scaffoldEntity({ package: 'com.acme', name: 'order-item', tableName: 'OI', fields: [] })
    for (const f of files.filter(x => x.file.endsWith('.cls'))) {
      const pkg = /^class ([\w.]+)\.\w+/m.exec(f.content)![1]
      const dir = f.file.replace(/^src\//, '').split('/').slice(0, -1).join('.')
      expect(dir, f.file).toBe(pkg)
    }
  })
})

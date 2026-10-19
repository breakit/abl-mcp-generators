import { describe, it, expect } from 'vitest'
import { generateComponent, scaffoldEntity, DEFAULT_ENTITY_KINDS } from './index.js'

const spec = {
  package: 'com.acme',
  name: 'Customer',
  tableName: 'CUSTOMER',
  fields: [{ name: 'Id', dataType: 'INTEGER' }],
  outputDir: 'out',
}

describe('generateComponent', () => {
  it('generates a single part', () => {
    const r = generateComponent('service', spec)
    expect(r.file).toBe('out/src/com/acme/Customer/service/CustomerService.cls')
    expect(r.content).toContain('class com.acme.Customer.service.CustomerService')
  })

  it('does not require other parts', () => {
    expect(() => generateComponent('controller', spec, { variant: 'soap' })).not.toThrow()
  })
})

describe('scaffoldEntity', () => {
  it('generates the default set', () => {
    const r = scaffoldEntity(spec)
    expect(r.files.map(f => f.file)).toEqual([
      'out/src/com/acme/Customer/contract/customer-contract.i',
      'out/src/com/acme/Customer/business/Customer.cls',
      'out/src/com/acme/Customer/service/CustomerService.cls',
      'out/src/com/acme/Customer/controller/rest/CustomerController.cls',
    ])
    expect(r.warnings).toEqual([])
    expect(DEFAULT_ENTITY_KINDS).toHaveLength(4)
  })

  it('generates only the included kinds', () => {
    const r = scaffoldEntity(spec, { include: ['business-entity'] })
    expect(r.files).toHaveLength(1)
  })

  it('warns about missing dependencies without generating them', () => {
    const r = scaffoldEntity(spec, { include: ['service'] })
    expect(r.files).toHaveLength(1)
    expect(r.warnings.map(w => w.missing).sort()).toEqual(['business-entity', 'contract'])
  })

  it('supports exclude and variants', () => {
    const r = scaffoldEntity(spec, { exclude: ['controller', 'service'] })
    expect(r.files).toHaveLength(2)
    const s = scaffoldEntity(spec, { include: ['controller'], variants: { controller: 'legacy' } })
    expect(s.files[0].file).toBe('out/src/com/acme/Customer/controller/legacy/CustomerController.cls')
  })

  it('rejects unknown kinds', () => {
    expect(() => scaffoldEntity(spec, { include: ['nope' as never] })).toThrow(/unknown component/)
  })
})

describe('cross-component references', () => {
  const r = scaffoldEntity({ ...spec, name: 'OrderItem' }).files
  const by = (s: string) => r.find(f => f.file.includes(s))!.content

  it('references parts by fully qualified name and include path', () => {
    expect(by('/service/')).toContain('as com.acme.OrderItem.business.OrderItem no-undo')
    expect(by('/service/')).toContain('{ com/acme/OrderItem/contract/order-item-contract.i }')
    expect(by('/controller/rest/')).toContain('new com.acme.OrderItem.service.OrderItemService()')
  })

  it('leaves no unresolved placeholders', () => {
    for (const f of r) expect(f.content, f.file).not.toMatch(/\{\{#?(className|entityFqn|serviceFqn|contractInclude|package)/)
  })

  it('names classes in the same case as their files', () => {
    expect(by('/service/')).toContain('class com.acme.OrderItem.service.OrderItemService:')
    expect(by('/controller/rest/')).toContain('constructor public OrderItemController()')
  })
})

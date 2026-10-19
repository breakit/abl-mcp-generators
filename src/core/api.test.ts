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
    expect(r.file).toBe('out/src/customer/service/CustomerService.cls')
    expect(r.content).toContain('com.acme.customer.service.Customerservice')
  })

  it('does not require other parts', () => {
    expect(() => generateComponent('controller', spec, { variant: 'soap' })).not.toThrow()
  })
})

describe('scaffoldEntity', () => {
  it('generates the default set', () => {
    const r = scaffoldEntity(spec)
    expect(r.files.map(f => f.file)).toEqual([
      'out/src/customer/contract/customer-contract.i',
      'out/src/customer/business/Customer.cls',
      'out/src/customer/service/CustomerService.cls',
      'out/src/customer/controller/rest/CustomerController.cls',
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
    expect(s.files[0].file).toBe('out/src/customer/controller/legacy/CustomerController.cls')
  })

  it('rejects unknown kinds', () => {
    expect(() => scaffoldEntity(spec, { include: ['nope' as never] })).toThrow(/unknown component/)
  })
})

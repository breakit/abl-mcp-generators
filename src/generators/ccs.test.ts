import { describe, it, expect } from 'vitest'
import { scaffoldCcsLayer } from './ccs.js'

describe('scaffoldCcsLayer', () => {
  const result = scaffoldCcsLayer({
    package: 'com.test',
    name: 'Customer',
    entityName: 'CustomerEntity',
    fields: [{ name: 'CustNum', dataType: 'INTEGER' }],
  })

  it('returns the component name', () => {
    expect(result.component).toBe('Customer')
  })

  it('emits contract, entity, service and controller files', () => {
    expect(result.files.map(f => f.file)).toEqual([
      'contracts/customer-entity-contract.i',
      'cls/business/CustomerEntity.cls',
      'cls/service/CustomerEntityService.cls',
      'cls/controller/CustomerEntityController.cls',
    ])
  })

  it('renders non-empty content without unresolved package', () => {
    for (const f of result.files) {
      expect(f.content.length).toBeGreaterThan(0)
    }
    expect(result.files[1].content).toContain('com.test')
  })
})

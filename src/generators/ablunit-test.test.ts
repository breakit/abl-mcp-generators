import { describe, it, expect } from 'vitest'
import { generateTest, scaffoldTest } from './test.js'

describe('generateTest', () => {
  const spec = {
    package: 'com.test',
    name: 'Customer',
    entityName: 'CustomerEntity',
    tableName: 'CUSTOMER',
    fields: [
      { name: 'CustNum', dataType: 'INTEGER' },
      { name: 'Name', dataType: 'CHARACTER' },
    ],
    outputDir: './output',
  }

  it('generates test class', () => {
    const result = generateTest(spec)
    expect(result).toContain('class com.test.Customertest')
    expect(result).toContain('inherits openedge.ablunit.testcase')
  })

  it('generates temp-table and dataset with convention', () => {
    const result = generateTest(spec)
    expect(result).toContain('define temp-table l-customer-entity-tt')
    expect(result).toContain('define dataset l-customer-entity-ds')
  })

  it('generates testCreate method', () => {
    const result = generateTest(spec)
    expect(result).toContain('@test.')
    expect(result).toContain('method public void testcreate')
    expect(result).toContain('create l-customer-entity-tt')
    expect(result).toContain('l-customer-entity-tt.CustNum')
    expect(result).toContain('l-customer-entity-tt.Name')
  })

  it('generates testSave method', () => {
    const result = generateTest(spec)
    expect(result).toContain('method public void testsave')
    expect(result).toContain('l-entity-o = CustomerEntity:create()')
    expect(result).toContain('assert:istrue(l-entity-o:save())')
  })

  it('generates testRead method', () => {
    const result = generateTest(spec)
    expect(result).toContain('method public void testread')
    expect(result).toContain('CustomerEntity:read("key")')
  })

  it('generates testDelete method', () => {
    const result = generateTest(spec)
    expect(result).toContain('method public void testdelete')
    expect(result).toContain('valid-object(l-entity-o)')
  })
})

describe('scaffoldTest', () => {
  it('produces a scaffold result', () => {
    const result = scaffoldTest({
      package: 'com.test',
      name: 'Customer',
      entityName: 'CustomerEntity',
      tableName: 'CUSTOMER',
      fields: [{ name: 'CustNum', dataType: 'INTEGER' }],
      outputDir: './output',
    })
    expect(result.file).toContain('cls/test/CustomerTest.cls')
    expect(result.content).toContain('class com.test.Customertest')
  })
})

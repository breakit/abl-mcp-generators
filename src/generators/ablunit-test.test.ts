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

  it('includes shared data contract', () => {
    const result = generateTest(spec)
    expect(result).toContain('{ customer-entity-contract.i }')
  })

  it('has setup method', () => {
    const result = generateTest(spec)
    expect(result).toContain('@setup.')
    expect(result).toContain('method public void setup')
    expect(result).toContain('l-service-o = new CustomerEntityservice()')
  })

  it('generates testCreate method', () => {
    const result = generateTest(spec)
    expect(result).toContain('@test.')
    expect(result).toContain('method public void testcreate')
    expect(result).toContain('create l-customer-entity-tt')
    expect(result).toContain('l-service-o:create')
  })

  it('generates testList method', () => {
    const result = generateTest(spec)
    expect(result).toContain('method public void testlist')
    expect(result).toContain('l-service-o:listall()')
  })

  it('generates testUpdate method', () => {
    const result = generateTest(spec)
    expect(result).toContain('method public void testupdate')
    expect(result).toContain('l-service-o:update')
  })

  it('generates testDelete method', () => {
    const result = generateTest(spec)
    expect(result).toContain('method public void testdelete')
    expect(result).toContain('l-service-o:delete')
  })

  it('has teardown method', () => {
    const result = generateTest(spec)
    expect(result).toContain('@teardown.')
    expect(result).toContain('method public void teardown')
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

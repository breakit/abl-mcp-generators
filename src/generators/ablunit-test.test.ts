import { describe, it, expect } from 'vitest'
import { generateTest, scaffoldTest } from './test.js'

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

const methods = [
  {
    methodName: 'getById',
    visibility: 'public',
    returnType: 'character',
    hasParams: true,
    hasReturnType: true,
    params: [{ paramName: 'id', direction: 'input', dataType: 'integer' }],
  },
  {
    methodName: 'reset',
    visibility: 'public',
    returnType: 'void',
    hasParams: false,
    hasReturnType: false,
    params: [],
  },
]

describe('generateTest', () => {
  it('generates test class', () => {
    const result = generateTest(spec)
    expect(result).toContain('class com.test.customer-entity.CustomerTest inherits openedge.ablunit.testcase')
    expect(result).toContain('define variable h-entity-o as com.test.customer-entity.business.CustomerEntity no-undo.')
  })

  it('has lifecycle methods', () => {
    const result = generateTest(spec)
    expect(result).toContain('@BeforeAll.')
    expect(result).toContain('method public void beforeAll()')
    expect(result).toContain('@AfterAll.')
    expect(result).toContain('@Setup.')
    expect(result).toContain('method public void setup()')
    expect(result).toContain('new com.test.customer-entity.business.CustomerEntity()')
  })

  it('generates one test per method', () => {
    const result = generateTest({ ...spec, methods })
    expect(result).toContain('method public void testgetById()')
    expect(result).toContain('method public void testreset()')
    expect(result).toContain('h-result = h-entity-o:getById(input h-id-var).')
    expect(result).toContain('h-entity-o:reset().')
  })
})

describe('scaffoldTest', () => {
  it('produces a scaffold result', () => {
    const result = scaffoldTest(spec)
    expect(result.file).toBe('./output/test/customer-entity/CustomerTest.cls')
    expect(result.content).toContain('class com.test.customer-entity.CustomerTest')
  })
})

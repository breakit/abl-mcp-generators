import { describe, it, expect } from 'vitest'
import { generateBusinessEntity, generateService, generateController, scaffoldFullEntity } from './be.js'

describe('generateBusinessEntity', () => {
  const baseSpec = {
    package: 'com.test',
    name: 'Customer',
    tableName: 'CUSTOMER',
    fields: [
      { name: 'CustNum', dataType: 'INTEGER' },
      { name: 'Name', dataType: 'CHARACTER' },
    ],
  }

  it('generates a class with correct inheritance', () => {
    const result = generateBusinessEntity(baseSpec)
    expect(result).toContain('class com.test.Customer')
    expect(result).toContain('inherits openedge.businesslogic.businessentity')
  })

  it('includes shared data contract', () => {
    const result = generateBusinessEntity(baseSpec)
    expect(result).toContain('{ customer-contract.i }')
  })

  it('generates GetData method with correct loop order', () => {
    const result = generateBusinessEntity(baseSpec)
    expect(result).toContain('method override public handle getdata')
    expect(result).toContain('get-first')
    expect(result).toContain('if l-query-h:query-off-end then leave')
    expect(result).toContain('buffer-copy(l-query-h)')
  })

  it('generates CreateData method', () => {
    const result = generateBusinessEntity(baseSpec)
    expect(result).toContain('method override public handle createdata')
    expect(result).toContain('return dataset l-customer-ds:handle')
  })

  it('generates UpdateData method with row-state case dispatch', () => {
    const result = generateBusinessEntity(baseSpec)
    expect(result).toContain('method override public logical updatedata')
    expect(result).toContain('case row-state(l-customer-tt)')
    expect(result).toContain('when row-created then do')
    expect(result).toContain('when row-modified then do')
    expect(result).toContain('when row-deleted then do')
  })

  it('generates DeleteData method', () => {
    const result = generateBusinessEntity(baseSpec)
    expect(result).toContain('method override public logical deletedata')
    expect(result).toContain('define buffer l-customer-buf')
  })

  it('generates temp-table field access in UpdateData', () => {
    const result = generateBusinessEntity(baseSpec)
    expect(result).toContain('l-customer-tt.CustNum')
    expect(result).toContain('l-customer-tt.Name')
    expect(result).toContain('l-customer-buf.CustNum')
    expect(result).toContain('l-customer-buf.Name')
  })
})

describe('generateService', () => {
  it('generates service class with constructor and BE instance', () => {
    const result = generateService({ package: 'com.test', name: 'Customer', entityName: 'CustomerEntity' })
    expect(result).toContain('class com.test.Customerservice')
    expect(result).toContain('{ customer-entity-contract.i }')
    expect(result).toContain('define variable l-be-o as CustomerEntity no-undo')
    expect(result).toContain('constructor public Customerservice')
    expect(result).toContain('l-be-o = new CustomerEntity()')
  })

  it('generates instance methods (not static)', () => {
    const result = generateService({ package: 'com.test', name: 'Customer', entityName: 'CustomerEntity' })
    expect(result).toContain('method public handle listall')
    expect(result).toContain('method public handle create')
    expect(result).toContain('method public logical update')
    expect(result).toContain('method public logical delete')
    expect(result).toContain('method public logical validate')
    expect(result).not.toContain('method public static')
  })

  it('delegates to BE methods', () => {
    const result = generateService({ package: 'com.test', name: 'Customer', entityName: 'CustomerEntity' })
    expect(result).toContain('l-be-o:getdata(?)')
    expect(result).toContain('l-be-o:updatedata')
    expect(result).toContain('l-be-o:deletedata')
  })
})

describe('generateController', () => {
  it('generates controller with constructor', () => {
    const result = generateController({ package: 'com.test', name: 'Customer', entityName: 'CustomerEntity' })
    expect(result).toContain('class com.test.Customercontroller')
    expect(result).toContain('inherits openedge.web.webhandler')
    expect(result).toContain('constructor public Customercontroller')
    expect(result).toContain('l-service-o = new CustomerEntityservice()')
  })

  it('generates handlerequest and endpoint methods', () => {
    const result = generateController({ package: 'com.test', name: 'Customer', entityName: 'CustomerEntity' })
    expect(result).toContain('method override protected void handlerequest')
    expect(result).toContain('method public character handleget')
    expect(result).toContain('method public character handlecreate')
    expect(result).toContain('method public character handleupdate')
    expect(result).toContain('method public character handledelete')
  })
})

describe('scaffoldFullEntity', () => {
  it('returns four files (contract + be + service + controller)', () => {
    const results = scaffoldFullEntity({
      entityName: 'Customer',
      package: 'com.test',
      tableName: 'CUSTOMER',
      fields: [{ name: 'CustNum', dataType: 'INTEGER' }],
      outputDir: './output',
    })
    expect(results).toHaveLength(4)
    expect(results[0].file).toContain('contracts/customer-contract.i')
    expect(results[1].file).toContain('business/Customer.cls')
    expect(results[2].file).toContain('service/CustomerService.cls')
    expect(results[3].file).toContain('controller/CustomerController.cls')
  })
})

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

  it('generates temp-table and dataset with naming convention', () => {
    const result = generateBusinessEntity(baseSpec)
    expect(result).toContain('define temp-table l-customer-tt')
    expect(result).toContain('define dataset l-customer-ds')
  })

  it('generates GetData method', () => {
    const result = generateBusinessEntity(baseSpec)
    expect(result).toContain('method override public handle getdata')
    expect(result).toContain('define variable l-buffer-h as handle no-undo')
    expect(result).toContain('define variable l-query-h  as handle no-undo')
    expect(result).toContain('return dataset l-customer-ds:handle')
  })

  it('generates UpdateData method', () => {
    const result = generateBusinessEntity(baseSpec)
    expect(result).toContain('method override public logical updatedata')
    expect(result).toContain('define buffer l-customer-buf for CUSTOMER')
    expect(result).toContain('for each l-customer-tt')
    expect(result).toContain('return true')
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
  it('generates service class', () => {
    const result = generateService({ package: 'com.test', name: 'Customer', entityName: 'CustomerEntity' })
    expect(result).toContain('class com.test.Customerservice')
    expect(result).toContain('method public static CustomerEntity getbyid')
    expect(result).toContain('method public static logical save')
    expect(result).toContain('method public static logical delete')
  })
})

describe('generateController', () => {
  it('generates controller class', () => {
    const result = generateController({ package: 'com.test', name: 'Customer', entityName: 'CustomerEntity' })
    expect(result).toContain('class com.test.Customercontroller')
    expect(result).toContain('inherits openedge.web.webhandler')
    expect(result).toContain('method public character handleget')
    expect(result).toContain('method public character handlecreate')
    expect(result).toContain('method public character handledelete')
  })
})

describe('scaffoldFullEntity', () => {
  it('returns three files', () => {
    const results = scaffoldFullEntity({
      entityName: 'Customer',
      package: 'com.test',
      tableName: 'CUSTOMER',
      fields: [{ name: 'CustNum', dataType: 'INTEGER' }],
      outputDir: './output',
    })
    expect(results).toHaveLength(3)
    expect(results[0].file).toContain('business/Customer.cls')
    expect(results[1].file).toContain('service/CustomerService.cls')
    expect(results[2].file).toContain('controller/CustomerController.cls')
  })
})

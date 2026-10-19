import { describe, it, expect } from 'vitest'
import { scaffoldProject } from './project.js'

describe('scaffoldProject with entities', () => {
  const entities = [
    {
      name: 'Customer',
      tableName: 'CUSTOMER',
      fields: [{ name: 'CustNum', dataType: 'INTEGER', key: true }, { name: 'Name', dataType: 'CHARACTER' }],
      include: ['contract', 'business-entity', 'command', 'command-handler', 'command-result', 'service'] as never,
      commands: ['Create', 'Delete'],
      variants: { service: 'cqrs' },
    },
    { name: 'OrderItem', tableName: 'ORDERITEM', fields: [{ name: 'Id', dataType: 'INTEGER' }] },
  ]
  const files = scaffoldProject({ name: 'demo', package: 'com.acme', outputDir: 'out', entities })
  const paths = files.map(f => f.path)

  it('keeps the skeleton and adds every entity below the abl.toml roots', () => {
    expect(paths).toContain('out/abl.toml')
    expect(paths).toContain('out/src/com/acme/Customer/business/Customer.cls')
    expect(paths).toContain('out/src/com/acme/Customer/command/handler/DeleteCustomerCommandHandler.cls')
    expect(paths).toContain('out/src/com/acme/OrderItem/controller/rest/OrderItemController.cls')
  })

  it('uses per-entity include and variants, defaults otherwise', () => {
    expect(paths).not.toContain('out/src/com/acme/Customer/controller/rest/CustomerController.cls')
    expect(files.find(f => f.path.endsWith('Customer/service/CustomerService.cls'))!.content).toContain('l-create-command-handler-o')
    expect(paths.filter(p => p.includes('/OrderItem/'))).toHaveLength(4)
  })

  it('has no duplicate paths', () => {
    expect(new Set(paths).size).toBe(paths.length)
  })

  it('rejects colliding entities', () => {
    expect(() => scaffoldProject({ name: 'd', package: 'a.b', outputDir: 'o', entities: [entities[1], entities[1]] })).toThrow(/already exists/)
  })

  it('is unchanged without entities', () => {
    expect(scaffoldProject({ name: 'demo', package: 'com.acme', outputDir: 'out' })).toHaveLength(8)
  })
})

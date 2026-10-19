import { describe, it, expect } from 'vitest'
import { generateComponent, scaffoldEntity } from './index.js'

const spec = {
  package: 'com.acme',
  name: 'Customer',
  tableName: 'CUSTOMER',
  fields: [
    { name: 'CustNum', dataType: 'INTEGER' },
    { name: 'Name', dataType: 'CHARACTER' },
  ],
  outputDir: 'out',
}

describe('single command / query parts', () => {
  it('command goes to command/command', () => {
    const r = generateComponent('command', { ...spec, operation: 'create' })
    expect(r.file).toBe('out/src/com/acme/Customer/command/command/CreateCustomerCommand.cls')
    expect(r.content).toContain('class com.acme.Customer.command.command.CreateCustomerCommand:')
    expect(r.content).toContain('define public property CustNum as INTEGER no-undo get. set.')
  })

  it('command handler goes to command/handler and references its command', () => {
    const r = generateComponent('command-handler', { ...spec, operation: 'Create' })
    expect(r.file).toBe('out/src/com/acme/Customer/command/handler/CreateCustomerCommandHandler.cls')
    expect(r.content).toContain('class com.acme.Customer.command.handler.CreateCustomerCommandHandler:')
    expect(r.content).toContain('input i-command-o as com.acme.Customer.command.command.CreateCustomerCommand')
    expect(r.content).toContain('as com.acme.Customer.business.Customer no-undo')
  })

  it('query and query handler mirror the command split', () => {
    const q = generateComponent('query', { ...spec, operation: 'GetById' })
    const h = generateComponent('query-handler', { ...spec, operation: 'GetById' })
    expect(q.file).toBe('out/src/com/acme/Customer/query/query/GetByIdCustomerQuery.cls')
    expect(h.file).toBe('out/src/com/acme/Customer/query/handler/GetByIdCustomerQueryHandler.cls')
    expect(h.content).toContain('input i-query-o as com.acme.Customer.query.query.GetByIdCustomerQuery')
  })

  it('requires an operation', () => {
    expect(() => generateComponent('command', spec)).toThrow(/operation/)
  })

  it('leaves no placeholders', () => {
    for (const k of ['command', 'command-handler', 'query', 'query-handler'] as const) {
      expect(generateComponent(k, { ...spec, operation: 'X' }).content).not.toMatch(/\{\{/)
    }
  })
})

describe('service facade', () => {
  it('dispatches to the default handlers', () => {
    const r = generateComponent('service', spec, { variant: 'cqrs' })
    expect(r.file).toBe('out/src/com/acme/Customer/service/CustomerService.cls')
    expect(r.content).toContain('method public logical create(input i-command-o as com.acme.Customer.command.command.CreateCustomerCommand)')
    expect(r.content).toContain('method public handle getById(input i-query-o as com.acme.Customer.query.query.GetByIdCustomerQuery)')
    expect(r.content).toContain('l-create-command-handler-o = new com.acme.Customer.command.handler.CreateCustomerCommandHandler()')
    expect(r.content).toContain('return l-list-query-handler-o:execute(i-query-o)')
    expect(r.content).not.toMatch(/\{\{/)
  })

  it('uses custom operations', () => {
    const r = generateComponent('service', { ...spec, commands: ['Approve'], queries: [] }, { variant: 'cqrs' })
    expect(r.content).toContain('method public logical approve(')
    expect(r.content).not.toContain('create(')
    expect(r.content).not.toContain('method public handle')
  })

  it('default variant is unchanged', () => {
    expect(generateComponent('service', spec).content).toContain('l-be-o:getdata(?)')
  })
})

describe('scaffoldEntity with CQRS', () => {
  const kinds = ['command', 'command-handler', 'query', 'query-handler'] as const

  it('generates the default CRUD set', () => {
    const r = scaffoldEntity(spec, { include: [...kinds] })
    const names = r.files.map(f => f.file.split('/').pop())
    expect(names).toEqual([
      'CreateCustomerCommand.cls', 'UpdateCustomerCommand.cls', 'DeleteCustomerCommand.cls',
      'CreateCustomerCommandHandler.cls', 'UpdateCustomerCommandHandler.cls', 'DeleteCustomerCommandHandler.cls',
      'GetByIdCustomerQuery.cls', 'ListCustomerQuery.cls',
      'GetByIdCustomerQueryHandler.cls', 'ListCustomerQueryHandler.cls',
    ])
    expect(r.warnings.map(w => w.missing)).toEqual(
      expect.arrayContaining(['business-entity']),
    )
    expect(r.warnings.some(w => w.missing === 'command')).toBe(false)
  })

  it('default payloads: create has all fields, delete the key, list none', () => {
    const r = scaffoldEntity(spec, { include: ['command', 'query'] })
    const by = (n: string) => r.files.find(f => f.file.endsWith(n))!.content
    expect(by('CreateCustomerCommand.cls')).toContain('property Name')
    expect(by('DeleteCustomerCommand.cls')).toContain('property CustNum')
    expect(by('DeleteCustomerCommand.cls')).not.toContain('property Name')
    expect(by('ListCustomerQuery.cls')).not.toContain('property')
  })

  it('supports custom operations and a handler-only run with a warning', () => {
    const r = scaffoldEntity(spec, { include: ['command-handler'], commands: ['Approve'] })
    expect(r.files).toHaveLength(1)
    expect(r.files[0].file).toContain('ApproveCustomerCommandHandler.cls')
    expect(r.warnings.map(w => w.missing)).toContain('command')
  })

  it('full stack with facade is consistent', () => {
    const r = scaffoldEntity(spec, {
      include: ['contract', 'business-entity', ...kinds, 'service'],
      variants: { service: 'cqrs' },
    })
    expect(r.warnings).toEqual([])
    const svc = r.files.find(f => f.file.endsWith('CustomerService.cls'))!.content
    for (const f of r.files.filter(x => /\/(command|query)\//.test(x.file) && /Handler\.cls$/.test(x.file))) {
      const cls = /^class ([\w.]+):/m.exec(f.content)![1]
      expect(svc, cls).toContain(cls)
    }
  })

  it('directory below the root equals the package for every part', () => {
    const r = scaffoldEntity(spec, { include: [...kinds, 'service'] })
    for (const f of r.files) {
      const pkg = /^class ([\w.]+)\.\w+:/m.exec(f.content)![1]
      expect(f.file.replace(/^out\/src\//, '').split('/').slice(0, -1).join('.'), f.file).toBe(pkg)
    }
  })
})

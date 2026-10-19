import { describe, it, expect } from 'vitest'
import { scaffoldCommand, scaffoldQuery, scaffoldEntity } from './index.js'

const spec = {
  package: 'com.acme',
  name: 'Customer',
  tableName: 'CUSTOMER',
  fields: [
    { name: 'CustNum', dataType: 'INTEGER', key: true },
    { name: 'Name', dataType: 'CHARACTER' },
  ],
  outputDir: 'out',
}
const names = (r: { files: { file: string }[] }) => r.files.map(f => f.file.split('/').pop())

describe('scaffoldCommand', () => {
  it('generates command + handler for one use case', () => {
    const r = scaffoldCommand(spec, 'Create')
    expect(names(r)).toEqual(['CreateCustomerCommand.cls', 'CreateCustomerCommandHandler.cls'])
    expect(r.warnings.map(w => w.missing).sort()).toEqual(['business-entity', 'command-result'])
  })

  it('can add the command result and drop the handler', () => {
    const r = scaffoldCommand(spec, 'Create', { include: ['command', 'command-handler', 'command-result'] })
    expect(names(r)).toContain('CustomerCommandResult.cls')
    expect(r.warnings.map(w => w.missing)).toEqual(['business-entity'])
    expect(names(scaffoldCommand(spec, 'Create', { include: ['command'] }))).toEqual(['CreateCustomerCommand.cls'])
  })

  it('generates the optional task from the command payload, only on request', () => {
    const op = { name: 'Approve', fields: ['CustNum'], task: 'approve-customer' }
    expect(names(scaffoldCommand(spec, op))).toEqual(['ApproveCustomerCommand.cls', 'ApproveCustomerCommandHandler.cls'])
    const r = scaffoldCommand(spec, op, { include: ['command', 'command-handler', 'task'] })
    const task = r.files.find(f => f.file.endsWith('ApproveCustomer.cls') && f.file.includes('/task/'))!
    expect(task.file).toBe('out/src/com/acme/Customer/task/ApproveCustomer.cls')
    expect(task.content).toContain('class com.acme.Customer.task.ApproveCustomer:')
    expect(task.content).toContain('field CustNum as INTEGER')
    expect(r.warnings.map(w => w.missing)).not.toContain('task')
  })

  it('rejects a task request for an operation without a task', () => {
    expect(() => scaffoldCommand(spec, 'Approve', { include: ['task'] })).toThrow(/names no task/)
  })

  it('works without any command: a task alone is independent', () => {
    expect(scaffoldEntity(spec, { include: ['task'] }).warnings).toEqual([])
  })
})

describe('scaffoldQuery', () => {
  it('generates query + handler', () => {
    expect(names(scaffoldQuery(spec, 'GetById'))).toEqual(['GetByIdCustomerQuery.cls', 'GetByIdCustomerQueryHandler.cls'])
  })
})

describe('scaffoldEntity builds on them', () => {
  it('command-result is generated once, not per operation', () => {
    const r = scaffoldEntity(spec, { include: ['command-result', 'command'] })
    expect(names(r).filter(n => n === 'CustomerCommandResult.cls')).toHaveLength(1)
    expect(r.files).toHaveLength(4)
  })

  it('output equals the union of the per-operation scaffolds', () => {
    const viaEntity = scaffoldEntity(spec, { include: ['command', 'command-handler'], commands: ['Create', 'Delete'] }).files
    const viaOps = ['Create', 'Delete'].flatMap(op => scaffoldCommand(spec, op).files)
    expect(viaEntity.map(f => f.file).sort()).toEqual(viaOps.map(f => f.file).sort())
    for (const f of viaEntity) expect(viaOps.find(o => o.file === f.file)!.content).toBe(f.content)
  })
})

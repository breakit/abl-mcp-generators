import { describe, it, expect } from 'vitest'
import { resolveOperation, inferKind, keyFields, generateComponent, scaffoldEntity } from './index.js'

const fields = [
  { name: 'Region', dataType: 'CHARACTER', key: true },
  { name: 'CustNum', dataType: 'INTEGER', key: true },
  { name: 'Name', dataType: 'CHARACTER' },
]
const spec = { package: 'com.acme', name: 'Customer', tableName: 'CUSTOMER', fields }

describe('operation model', () => {
  it('infers kinds from names, else custom', () => {
    expect(inferKind('create')).toBe('create')
    expect(inferKind('GetById')).toBe('get')
    expect(inferKind('List')).toBe('list')
    expect(inferKind('Approve')).toBe('custom')
  })

  it('payload per kind: all / key / none', () => {
    const f = (n: string) => resolveOperation(n, fields).fields.map(x => x.name)
    expect(f('Create')).toEqual(['Region', 'CustNum', 'Name'])
    expect(f('Update')).toEqual(['Region', 'CustNum', 'Name'])
    expect(f('Delete')).toEqual(['Region', 'CustNum'])
    expect(f('GetById')).toEqual(['Region', 'CustNum'])
    expect(f('List')).toEqual([])
    expect(f('Approve')).toEqual([])
  })

  it('falls back to the first field when no key is marked', () => {
    expect(keyFields([{ name: 'A', dataType: 'X' }, { name: 'B', dataType: 'X' }]).map(f => f.name)).toEqual(['A'])
  })

  it('explicit fields (names or specs) win; unknown names throw', () => {
    expect(resolveOperation({ name: 'Rename', fields: ['name'] }, fields).fields).toEqual([fields[2]])
    expect(resolveOperation({ name: 'X', fields: [{ name: 'Z', dataType: 'DATE' }] }, fields).fields[0].name).toBe('Z')
    expect(() => resolveOperation({ name: 'X', fields: ['nope'] }, fields)).toThrow(/unknown field/)
  })

  it('keeps kind and optional task; rejects empty names', () => {
    expect(resolveOperation({ name: 'approve', task: 'ApproveOrder' }, fields)).toMatchObject({
      name: 'Approve', kind: 'custom', task: 'ApproveOrder',
    })
    expect(() => resolveOperation('  ')).toThrow(/name is required/)
  })
})

describe('operation model in generators', () => {
  it('generateComponent applies the payload rules', () => {
    const del = generateComponent('command', { ...spec, operation: 'Delete' }).content
    expect(del).toContain('property CustNum')
    expect(del).not.toContain('property Name')
    expect(generateComponent('command', { ...spec, operation: { name: 'Rename', fields: ['Name'] } }).content)
      .toContain('property Name')
  })

  it('scaffoldEntity accepts specs and strings, composite keys and custom ops', () => {
    const r = scaffoldEntity(spec, {
      include: ['command', 'query', 'service'],
      commands: ['Delete', { name: 'Approve', fields: ['CustNum'], task: 'ApproveCustomer' }],
      queries: ['GetById'],
      variants: { service: 'cqrs' },
    })
    const by = (n: string) => r.files.find(f => f.file.endsWith(n))!.content
    expect(by('DeleteCustomerCommand.cls')).toContain('property Region')
    expect(by('ApproveCustomerCommand.cls')).toContain('property CustNum')
    expect(by('GetByIdCustomerQuery.cls')).toContain('property Region')
    expect(by('CustomerService.cls')).toContain('method public com.acme.Customer.command.result.CustomerCommandResult approve(')
  })
})

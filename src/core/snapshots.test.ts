import { describe, it, expect } from 'vitest'
import { generateComponent, scaffoldEntity, listComponents } from './index.js'
import type { ComponentKind } from './index.js'

const base = {
  package: 'com.acme',
  name: 'Customer',
  tableName: 'CUSTOMER',
  fields: [
    { name: 'CustNum', dataType: 'INTEGER' },
    { name: 'Name', dataType: 'CHARACTER' },
  ],
  outputDir: 'out',
}

const extra: Partial<Record<ComponentKind, Record<string, unknown>>> = {
  workflow: { initialStatus: 'new', steps: [{ name: 'Approve', nextStatus: 'approved' }] },
  task: { inputFields: [{ name: 'Id', dataType: 'INTEGER' }], outputFields: [{ name: 'Ok', dataType: 'LOGICAL' }] },
  command: { operation: 'Create' },
  'command-handler': { operation: 'Create' },
  'command-handler-test': { operation: 'Create' },
  query: { operation: 'GetById' },
  'query-handler': { operation: 'GetById' },
  'legacy-backend': { package: 'sagedpw.employee', name: 'EmployeeManager' },
  'legacy-page': { name: 'employee', backendClass: 'sagedpw.employee.EmployeeManager' },
}

const variants: Record<string, string[]> = { controller: ['rest', 'soap'], service: ['default', 'cqrs'] }

// command handlers follow the operation kind
const handlerOps = [
  { name: 'Update' },
  { name: 'Delete' },
  { name: 'Approve' },
  { name: 'Approve', task: 'ApproveCustomer' },
]

describe('every component (snapshots)', () => {
  for (const kind of listComponents()) {
    for (const variant of variants[kind] ?? [undefined as unknown as string]) {
      it(`${kind}${variant ? ':' + variant : ''}`, () => {
        const r = generateComponent(kind, { ...base, ...extra[kind] }, { variant })
        expect(r.file).toMatchSnapshot('file')
        expect(r.content).toMatchSnapshot('content')
        expect(r.content).not.toMatch(/\{\{/)
      })
    }
  }
})

describe('layout invariants', () => {
  const entityKinds = ['command-result', 'contract', 'business-entity', 'service', 'controller', 'command', 'command-handler', 'query', 'query-handler'] as const

  it('every class sits in the directory equal to its package', () => {
    const files = entityKinds.flatMap(k => scaffoldEntity({ ...base, operation: 'Create' }, { include: [k] }).files)
    for (const f of files.filter(x => x.file.endsWith('.cls'))) {
      const m = /^class ([\w.]+)\.\w+/m.exec(f.content) ?? /\bclass ([\w.]+)\.\w+/.exec(f.content)
      expect(f.file.replace(/^out\/src\//, '').split('/').slice(0, -1).join('.'), f.file).toBe(m![1])
    }
  })

  it('no generated path or package contains hyphens (except contract file names)', () => {
    const { files } = scaffoldEntity({ ...base, name: 'order-item' }, { include: ['business-entity', 'service', 'controller'] })
    for (const f of files) expect(f.file).not.toContain('-')
  })

  it('every registered kind is covered by the snapshot suite', () => {
    expect(listComponents().sort()).toEqual(
      ['business-entity', 'command', 'command-handler', 'command-handler-test', 'command-result', 'contract', 'controller', 'legacy-backend', 'legacy-page',
        'query', 'query-handler', 'service', 'task', 'test', 'workflow'].sort(),
    )
  })
})

describe('command handler flavours (snapshots)', () => {
  for (const op of handlerOps) {
    it(`${op.name}${op.task ? ' with task' : ''}`, () => {
      const r = generateComponent('command-handler', { ...base, operation: op })
      expect(r.content).toMatchSnapshot()
      expect(r.content).not.toMatch(/\{\{/)
    })
  }
})

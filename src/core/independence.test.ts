import { describe, it, expect } from 'vitest'
import { generateComponent, scaffoldEntity, scaffoldCommand, listComponents, getComponent } from './index.js'

const spec = {
  package: 'com.acme',
  name: 'Customer',
  tableName: 'CUSTOMER',
  fields: [{ name: 'CustNum', dataType: 'INTEGER', key: true }, { name: 'Name', dataType: 'CHARACTER' }],
}
const task = { ...spec, name: 'ValidateCustomer', entity: 'Customer', inputFields: spec.fields, outputFields: [] }

describe('tasks and commands are independent', () => {
  it('a task is generated alone, with no command parts and no warnings', () => {
    const r = generateComponent('task', task)
    expect(r.file).toBe('src/com/acme/Customer/task/ValidateCustomer.cls')
    expect(r.content).not.toMatch(/command|handler/i)
    expect(scaffoldEntity(task, { include: ['task'] }).warnings).toEqual([])
  })

  it('no component lists task as a hard dependency, and task lists no command part', () => {
    for (const k of listComponents()) {
      expect(getComponent(k).dependsOn ?? [], k).not.toContain('task')
    }
    expect(getComponent('task').dependsOn).toBeUndefined()
  })

  it('commands (all kinds) generate with no task, no warnings about tasks', () => {
    for (const op of ['Create', 'Update', 'Delete', 'Approve']) {
      const r = scaffoldCommand(spec, op, { include: ['command', 'command-handler', 'command-result'] })
      expect(r.files.length).toBeGreaterThan(0)
      expect(r.warnings.map(w => w.missing)).not.toContain('task')
    }
  })

  it('a task is only generated when the operation names one and it is requested', () => {
    const op = { name: 'Approve', task: 'ApproveCustomer' }
    expect(scaffoldCommand(spec, op).files.some(f => f.file.includes('/task/'))).toBe(false)
    expect(scaffoldCommand(spec, op, { include: ['task'] }).files[0].file).toContain('/Customer/task/ApproveCustomer.cls')
  })
})

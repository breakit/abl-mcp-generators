import { describe, it, expect } from 'vitest'
import { generateComponent, scaffoldEntity } from './index.js'

const spec = {
  package: 'sagedpw.employee',
  name: 'EmployeeManager',
  fields: [
    { name: 'EmpNum', dataType: 'integer' },
    { name: 'LastName', dataType: 'character' },
  ],
  outputDir: 'out',
}

describe('legacy-backend', () => {
  it('uses the caller package and mirrors it in the folder (no entity folder)', () => {
    const r = generateComponent('legacy-backend', spec)
    expect(r.file).toBe('out/src/sagedpw/employee/EmployeeManager.cls')
    expect(r.content).toContain('class sagedpw.employee.EmployeeManager:')
  })

  it('exposes public variables and json crud methods', () => {
    const c = generateComponent('legacy-backend', spec).content
    expect(c).toContain('define public variable EmpNum as integer no-undo.')
    for (const m of ['getAll', 'getById', 'create', 'update', 'delete']) expect(c).toContain(`method public longchar ${m}(`)
    expect(c).toContain('return "~{~}".')
    expect(c).not.toMatch(/\{\{/)
  })

  it('is independent of the CQRS/entity components', () => {
    const c = generateComponent('legacy-backend', spec).content
    expect(c).not.toMatch(/command|query|Service|businessentity/i)
  })

  it('requires an explicit package', () => {
    expect(() => generateComponent('legacy-backend', { name: 'X' })).toThrow(/package/)
  })

  it('honours sourceRoot from the config', () => {
    const r = generateComponent('legacy-backend', { ...spec, outputDir: undefined }, { config: { sourceRoot: 'app' } })
    expect(r.file).toBe('app/sagedpw/employee/EmployeeManager.cls')
  })
})

describe('naming strategy per call', () => {
  it('overrides only the given functions', () => {
    const r = generateComponent('legacy-backend', spec, { naming: { backendFile: s => `legacy/${s.name}.cls` } })
    expect(r.file).toBe('legacy/EmployeeManager.cls')
    expect(r.content).toContain('class sagedpw.employee.EmployeeManager:')
  })

  it('can override the package', () => {
    const r = generateComponent('legacy-backend', spec, { naming: { packageOf: () => 'old.hr' } })
    expect(r.content).toContain('class old.hr.EmployeeManager:')
  })

  it('does not leak between calls', () => {
    generateComponent('legacy-backend', spec, { naming: { backendFile: () => 'x.cls' } })
    expect(generateComponent('legacy-backend', spec).file).toBe('out/src/sagedpw/employee/EmployeeManager.cls')
  })

  it('is ignored by entity-tree components', () => {
    const a = generateComponent('service', { ...spec, name: 'Employee' }, { naming: { backendFile: () => 'x' } })
    expect(a.file).toBe('out/src/sagedpw/employee/Employee/service/EmployeeService.cls')
  })

  it('is forwarded by scaffoldEntity', () => {
    const r = scaffoldEntity(spec, { include: ['legacy-backend'], naming: { backendFile: () => 'a/B.cls' } })
    expect(r.files[0].file).toBe('a/B.cls')
  })
})

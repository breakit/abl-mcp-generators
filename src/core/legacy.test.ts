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

describe('legacy-page', () => {
  const page = { ...spec, name: 'employee', backendClass: 'sagedpw.employee.EmployeeManager' }

  it('is a single flat .htm in the output root', () => {
    const r = generateComponent('legacy-page', page)
    expect(r.file).toBe('out/employee.htm')
    expect(r.content).not.toMatch(/\{\{/)
  })

  it('instantiates the backend and renders its variables', () => {
    const c = generateComponent('legacy-page', page).content
    expect(c).toContain('l-backend-o = new sagedpw.employee.EmployeeManager().')
    expect(c).toContain('<%= l-backend-o:EmpNum %>')
    expect(c).toContain('language="SpeedScript"')
  })

  it('uses a per-call pageFile strategy, independent of the backend', () => {
    const r = generateComponent('legacy-page', page, { naming: { pageFile: s => `web/${s.name}.htm` } })
    expect(r.file).toBe('web/employee.htm')
    expect(generateComponent('legacy-backend', spec, { naming: { pageFile: () => 'z' } }).file)
      .toBe('out/src/sagedpw/employee/EmployeeManager.cls')
  })

  it('works without outputDir and can be scaffolded with the backend', () => {
    expect(generateComponent('legacy-page', { name: 'x' }).file).toBe('x.htm')
    const r = scaffoldEntity(page, { include: ['legacy-backend', 'legacy-page'] })
    expect(r.files.map(f => f.file)).toEqual(['out/src/sagedpw/employee/employee.cls', 'out/employee.htm'])
  })
})

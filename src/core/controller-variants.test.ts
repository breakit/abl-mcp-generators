import { describe, it, expect } from 'vitest'
import { generateComponent, scaffoldEntity, resolveVariant, getComponent, registerComponent } from './index.js'

const spec = { package: 'com.acme', name: 'Customer', tableName: 'CUSTOMER', fields: [] }

describe('controller variants', () => {
  it('defaults to rest', () => {
    const r = generateComponent('controller', spec)
    expect(r.file).toBe('src/com/acme/Customer/controller/rest/CustomerController.cls')
    expect(r.content).toContain('type="rest"')
    expect(r.content).toContain('inherits openedge.web.webhandler')
    expect(r.content).toContain('class com.acme.Customer.controller.rest.CustomerController')
  })

  it('renders the soap template in controller/soap', () => {
    const r = generateComponent('controller', spec, { variant: 'soap' })
    expect(r.file).toBe('src/com/acme/Customer/controller/soap/CustomerController.cls')
    expect(r.content).toContain('type="soap"')
    expect(r.content).not.toContain('webhandler')
    expect(r.content).toContain('class com.acme.Customer.controller.soap.CustomerController:')
    expect(r.content).toContain('new com.acme.Customer.service.CustomerService()')
    expect(r.content).not.toMatch(/\{\{/)
  })

  it('both variants can be generated side by side', () => {
    const r = scaffoldEntity(spec, { include: ['controller'], variants: { controller: 'soap' } })
    expect(r.files[0].file).toContain('/controller/soap/')
    const rest = generateComponent('controller', spec, { variant: 'rest' })
    expect(rest.file).toContain('/controller/rest/')
  })

  it('rejects unknown variants with the available list', () => {
    expect(() => generateComponent('controller', spec, { variant: 'legacy' })).toThrow(/available: rest, soap/)
  })

  it('rejects variants for components that have none', () => {
    expect(() => generateComponent('service', spec, { variant: 'x' })).toThrow(/has no variants/)
  })

  it('new API standards can be registered with their own template', () => {
    const def = getComponent('controller')
    expect(resolveVariant(def)).toBe('rest')
    expect(def.variants).toEqual(['rest', 'soap'])
    expect(() => registerComponent({ ...def, kind: 'controller' })).toThrow()
  })
})

import { describe, it, expect } from 'vitest'
import { renderComponent, packageOf, listComponents, registerComponent, getComponent } from './index.js'

const spec = {
  package: 'com.acme',
  name: 'OrderItem',
  tableName: 'ORDERITEM',
  fields: [{ name: 'Id', dataType: 'INTEGER' }],
  outputDir: 'out',
}

describe('registry', () => {
  it('registers the existing components', () => {
    expect(listComponents()).toEqual(
      expect.arrayContaining(['business-entity', 'contract', 'service', 'controller', 'workflow', 'task', 'test']),
    )
  })

  it('rejects duplicates and unknown kinds', () => {
    expect(() => registerComponent(getComponent('service'))).toThrow(/already registered/)
    expect(() => getComponent('nope' as never)).toThrow(/unknown component/)
  })
})

describe('layout', () => {
  it('places every component in its own folder under the entity folder', () => {
    expect(renderComponent('business-entity', spec).file).toBe('out/src/com/acme/OrderItem/business/OrderItem.cls')
    expect(renderComponent('contract', spec).file).toBe('out/src/com/acme/OrderItem/contract/order-item-contract.i')
    expect(renderComponent('service', spec).file).toBe('out/src/com/acme/OrderItem/service/OrderItemService.cls')
  })

  it('places controllers by API standard', () => {
    expect(renderComponent('controller', spec).file).toBe('out/src/com/acme/OrderItem/controller/rest/OrderItemController.cls')
    expect(renderComponent('controller', spec, { variant: 'soap' }).file).toBe(
      'out/src/com/acme/OrderItem/controller/soap/OrderItemController.cls',
    )
  })

  it('places tests in the separate test tree', () => {
    expect(renderComponent('test', spec).file).toBe('out/test/com/acme/OrderItem/OrderItemTest.cls')
  })

  it('omits the output dir prefix when not given', () => {
    expect(renderComponent('task', { ...spec, outputDir: undefined, inputFields: [], outputFields: [] }).file).toBe(
      'src/com/acme/OrderItem/task/OrderItem.cls',
    )
  })

  it('derives packages from folders', () => {
    expect(packageOf('business-entity', spec)).toBe('com.acme.OrderItem.business')
    expect(packageOf('controller', spec, 'soap')).toBe('com.acme.OrderItem.controller.soap')
  })
})

describe('render pipeline', () => {
  it('uses the derived package in the template', () => {
    expect(renderComponent('business-entity', spec).content).toContain('com.acme.OrderItem.business.OrderItem')
  })

  it('renders each component without touching the others', () => {
    const r = renderComponent('contract', spec)
    expect(r.content).toContain('define temp-table l-order-item-tt like ORDERITEM')
  })

  it('computes the workflow first step', () => {
    const r = renderComponent('workflow', {
      ...spec,
      initialStatus: 'new',
      steps: [{ name: 'approve' }, { name: 'ship' }],
    })
    expect(r.file).toBe('out/src/com/acme/OrderItem/workflow/OrderItem.cls')
    expect(r.content).toContain('approve')
  })
})

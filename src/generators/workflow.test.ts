import { describe, it, expect } from 'vitest'
import { generateWorkflow } from './workflow.js'

describe('generateWorkflow', () => {
  const baseSpec = {
    package: 'com.test',
    name: 'OrderWorkflow',
    initialStatus: 'pending',
    steps: [
      { name: 'Validate', nextStatus: 'validated', nextStep: 'Approve' },
      { name: 'Approve', nextStatus: 'approved' },
    ],
  }

  it('generates workflow class', () => {
    const result = generateWorkflow(baseSpec)
    expect(result).toContain('class com.test.workflows.OrderWorkflow')
  })

  it('generates context temp-table and dataset', () => {
    const result = generateWorkflow(baseSpec)
    expect(result).toContain('define temp-table l-context-tt no-undo')
    expect(result).toContain('define dataset l-context-ds')
  })

  it('generates Execute method with step routing', () => {
    const result = generateWorkflow(baseSpec)
    expect(result).toContain('method public character execute')
    expect(result).toContain('case l-context-tt.currentstep')
    expect(result).toContain('when "Validate"')
    expect(result).toContain('stepValidate')
    expect(result).toContain('when "Approve"')
    expect(result).toContain('stepApprove')
  })

  it('generates step methods', () => {
    const result = generateWorkflow(baseSpec)
    expect(result).toContain('method public character stepValidate')
    expect(result).toContain('method public character stepApprove')
  })

  it('includes step transitions', () => {
    const result = generateWorkflow(baseSpec)
    expect(result).toContain('l-context-tt.status = "validated"')
    expect(result).toContain('l-context-tt.status = "approved"')
    expect(result).toContain('l-context-tt.currentstep = "Approve"')
  })

  it('handles context fields', () => {
    const result = generateWorkflow({
      ...baseSpec,
      contextFields: [{ name: 'CustomerId', dataType: 'INTEGER' }],
    })
    expect(result).toContain('field CustomerId as INTEGER')
  })

  it('handles payload table', () => {
    const result = generateWorkflow({
      ...baseSpec,
      payloadTable: 'ORDERS',
    })
    expect(result).toContain('define temp-table l-payload-tt like ORDERS')
    expect(result).toContain('define dataset l-payload-ds for l-payload-tt')
    expect(result).toContain('input-output dataset for l-payload-ds')
  })

  it('handles no payload table gracefully', () => {
    const result = generateWorkflow(baseSpec)
    expect(result).not.toContain('l-payload-tt')
  })
})

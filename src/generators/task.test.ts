import { describe, it, expect } from 'vitest'
import { generateBusinessTask } from './task.js'

describe('generateBusinessTask', () => {
  const baseSpec = {
    package: 'com.test',
    name: 'ValidateOrder',
    inputFields: [
      { name: 'OrderId', dataType: 'INTEGER' },
      { name: 'Amount', dataType: 'DECIMAL' },
    ],
    outputFields: [
      { name: 'IsValid', dataType: 'LOGICAL' },
    ],
  }

  it('generates task class', () => {
    const result = generateBusinessTask(baseSpec)
    expect(result).toContain('class com.test.tasks.ValidateOrder')
  })

  it('generates input/output temp-tables', () => {
    const result = generateBusinessTask(baseSpec)
    expect(result).toContain('define temp-table l-input-tt no-undo')
    expect(result).toContain('define dataset l-input-ds for l-input-tt')
    expect(result).toContain('define temp-table l-output-tt no-undo')
    expect(result).toContain('define dataset l-output-ds for l-output-tt')
  })

  it('includes input fields', () => {
    const result = generateBusinessTask(baseSpec)
    expect(result).toContain('field OrderId as INTEGER')
    expect(result).toContain('field Amount as DECIMAL')
  })

  it('includes output fields with standard status fields', () => {
    const result = generateBusinessTask(baseSpec)
    expect(result).toContain('field statuscode    as character')
    expect(result).toContain('field statusmessage as character')
    expect(result).toContain('field IsValid as LOGICAL')
  })

  it('generates Execute method', () => {
    const result = generateBusinessTask(baseSpec)
    expect(result).toContain('method public character execute')
    expect(result).toContain('input  dataset for l-input-ds')
    expect(result).toContain('output dataset for l-output-ds')
  })

  it('handles success path', () => {
    const result = generateBusinessTask(baseSpec)
    expect(result).toContain('l-output-tt.statuscode')
    expect(result).toContain('"success"')
    expect(result).toContain('return l-output-tt.statuscode')
  })

  it('handles optional description', () => {
    const result = generateBusinessTask({
      ...baseSpec,
      description: 'Validates order before processing',
    })
    expect(result).toContain('/* Validates order before processing */')
  })
})

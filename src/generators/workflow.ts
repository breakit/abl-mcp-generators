import { loadAndRender } from '../template.js'
import type { WorkflowStep, WorkflowSpec, ContextField } from '../contracts/index.js'

export type { WorkflowStep, WorkflowSpec, ContextField }

export function generateWorkflow(spec: WorkflowSpec): string {
  const firstStep = spec.steps.length > 0 ? spec.steps[0].name : 'start'
  return loadAndRender('business-workflow.cls', {
    ...spec,
    firstStep,
  } as unknown as Record<string, unknown>)
}

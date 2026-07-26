import { loadAndRender } from '../template.js'
import type { WorkflowStep, WorkflowSpec, ContextField } from '../contracts/index.js'

export type { WorkflowStep, WorkflowSpec, ContextField }

export function generateWorkflow(spec: WorkflowSpec): string {
  return loadAndRender('workflow.cls', spec as unknown as Record<string, unknown>)
}

import { loadAndRender } from '../template.js'
import type { WorkflowStep, WorkflowSpec, WorkflowTaskSpec, ContextField } from '../contracts/index.js'

export type { WorkflowStep, WorkflowSpec, WorkflowTaskSpec, ContextField }

export function generateWorkflow(spec: WorkflowSpec): string {
  return loadAndRender('workflow.p', spec as unknown as Record<string, unknown>)
}

export function generateWorkflowTask(spec: WorkflowTaskSpec): string {
  return loadAndRender('workflow-task.p', spec as unknown as Record<string, unknown>)
}

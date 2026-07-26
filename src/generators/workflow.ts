import { loadAndRender, toKebab } from '../template.js'
import type { WorkflowStep, WorkflowSpec, ContextField } from '../contracts/index.js'

export type { WorkflowStep, WorkflowSpec, ContextField }

export function generateWorkflow(spec: WorkflowSpec): string {
  return loadAndRender('workflow.cls', {
    ...spec,
    kebabName: toKebab(spec.name),
  } as unknown as Record<string, unknown>)
}

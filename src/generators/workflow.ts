import { renderComponent } from '../core/render.js'
import '../core/components.js'
import type { ComponentSpec } from '../core/types.js'
import type { WorkflowStep, WorkflowSpec, ContextField } from '../contracts/index.js'

export type { WorkflowStep, WorkflowSpec, ContextField }

/** @deprecated use generateComponent('workflow', ...) */
export function generateWorkflow(spec: WorkflowSpec): string {
  return renderComponent('workflow', spec as unknown as ComponentSpec).content
}

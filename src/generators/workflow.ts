import { loadAndRender } from '../template.js'

export interface WorkflowStep {
  name: string
  nextStep?: string
}

export interface WorkflowSpec {
  name: string
  description?: string
  initialStatus: string
  steps: WorkflowStep[]
}

export function generateWorkflow(spec: WorkflowSpec): string {
  return loadAndRender('workflow.p', spec as unknown as Record<string, unknown>)
}

export interface WorkflowTaskSpec {
  name: string
  workflowName: string
  description?: string
}

export function generateWorkflowTask(spec: WorkflowTaskSpec): string {
  return loadAndRender('workflow-task.p', spec as unknown as Record<string, unknown>)
}

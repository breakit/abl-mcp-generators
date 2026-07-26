export interface FieldSpec {
  name: string
  dataType: string
  initial?: string
}

export interface BusinessEntitySpec {
  package: string
  name: string
  tableName: string
  description?: string
  fields: FieldSpec[]
}

export interface ServiceSpec {
  package: string
  name: string
  entityName: string
}

export interface ControllerSpec {
  package: string
  name: string
  entityName: string
}

export interface FullEntityScaffold {
  entityName: string
  package: string
  tableName: string
  fields: FieldSpec[]
  outputDir: string
}

export interface ScaffoldResult {
  file: string
  content: string
}

export interface WorkflowStep {
  name: string
  nextStep?: string
  nextStatus?: string
  description?: string
}

export interface ContextField {
  name: string
  dataType: string
  initial?: string
}

export interface WorkflowSpec {
  package: string
  name: string
  description?: string
  initialStatus: string
  steps: WorkflowStep[]
  contextFields?: ContextField[]
  payloadTable?: string
}

export interface BusinessTaskSpec {
  package: string
  name: string
  description?: string
  inputFields: FieldSpec[]
  outputFields: FieldSpec[]
}

export interface CcsComponentSpec {
  package: string
  name: string
  entityName: string
  fields: FieldSpec[]
}

export interface CcsScaffoldResult {
  component: string
  files: { file: string; content: string }[]
}

export interface ProjectScaffoldSpec {
  name: string
  package: string
  description?: string
  outputDir: string
}

export interface ProjectFile {
  path: string
  content: string
}

export interface TestSpec {
  package: string
  name: string
  entityName: string
  tableName: string
  description?: string
  fields: FieldSpec[]
  outputDir: string
}

export interface TestMethodSpec {
  name: string
  description?: string
}

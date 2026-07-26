import { loadAndRender } from '../template.js'

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

export function generateBusinessEntity(spec: BusinessEntitySpec): string {
  return loadAndRender('business-entity.cls', spec as unknown as Record<string, unknown>)
}

export interface ServiceSpec {
  package: string
  name: string
  entityName: string
}

export function generateService(spec: ServiceSpec): string {
  return loadAndRender('service.cls', spec as unknown as Record<string, unknown>)
}

export interface ControllerSpec {
  package: string
  name: string
  entityName: string
}

export function generateController(spec: ControllerSpec): string {
  return loadAndRender('controller.cls', spec as unknown as Record<string, unknown>)
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

export function scaffoldFullEntity(spec: FullEntityScaffold): ScaffoldResult[] {
  const results: ScaffoldResult[] = []

  const be = generateBusinessEntity({
    package: spec.package,
    name: spec.entityName,
    tableName: spec.tableName,
    fields: spec.fields,
  })
  results.push({ file: `${spec.outputDir}/cls/business/${spec.entityName}.cls`, content: be })

  const svc = generateService({
    package: spec.package,
    name: spec.entityName,
    entityName: spec.entityName,
  })
  results.push({ file: `${spec.outputDir}/cls/service/${spec.entityName}Service.cls`, content: svc })

  const ctrl = generateController({
    package: spec.package,
    name: spec.entityName,
    entityName: spec.entityName,
  })
  results.push({ file: `${spec.outputDir}/cls/controller/${spec.entityName}Controller.cls`, content: ctrl })

  return results
}

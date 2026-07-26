import { loadAndRender, toKebab } from '../template.js'
import type { FieldSpec, BusinessEntitySpec, ServiceSpec, ControllerSpec, FullEntityScaffold, ScaffoldResult } from '../contracts/index.js'

export type { FieldSpec, BusinessEntitySpec, ServiceSpec, ControllerSpec, FullEntityScaffold, ScaffoldResult }

export function generateBusinessEntity(spec: BusinessEntitySpec): string {
  return loadAndRender('business-entity.cls', {
    ...spec,
    kebabName: toKebab(spec.name),
  } as unknown as Record<string, unknown>)
}

export function generateEntityContract(spec: { entityName: string; tableName: string }): string {
  return loadAndRender('entity-contract.i', {
    entityName: spec.entityName,
    tableName: spec.tableName,
    kebabName: toKebab(spec.entityName),
  } as unknown as Record<string, unknown>)
}

export function generateService(spec: ServiceSpec): string {
  return loadAndRender('service.cls', {
    ...spec,
    kebabName: toKebab(spec.entityName),
  } as unknown as Record<string, unknown>)
}

export function generateController(spec: ControllerSpec): string {
  return loadAndRender('controller.cls', {
    ...spec,
    kebabName: toKebab(spec.entityName),
  } as unknown as Record<string, unknown>)
}

export function scaffoldFullEntity(spec: FullEntityScaffold): ScaffoldResult[] {
  const results: ScaffoldResult[] = []

  const contract = generateEntityContract({ entityName: spec.entityName, tableName: spec.tableName })
  results.push({ file: `${spec.outputDir}/contracts/${toKebab(spec.entityName)}-contract.i`, content: contract })

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

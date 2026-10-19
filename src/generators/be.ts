import { renderComponent } from '../core/render.js'
import '../core/components.js'
import { scaffoldEntity } from '../core/api.js'
import type { ComponentSpec } from '../core/types.js'
import type { FieldSpec, BusinessEntitySpec, ServiceSpec, ControllerSpec, FullEntityScaffold, ScaffoldResult } from '../contracts/index.js'

export type { FieldSpec, BusinessEntitySpec, ServiceSpec, ControllerSpec, FullEntityScaffold, ScaffoldResult }

/*
 * Compatibility wrappers over the component API (see core/api.ts).
 * Prefer generateComponent / scaffoldEntity in new code.
 */

/** @deprecated use generateComponent('business-entity', ...) */
export function generateBusinessEntity(spec: BusinessEntitySpec): string {
  return renderComponent('business-entity', spec as unknown as ComponentSpec).content
}

/** @deprecated use generateComponent('contract', ...) */
export function generateEntityContract(spec: { entityName: string; tableName: string }): string {
  return renderComponent('contract', { package: '', name: spec.entityName, tableName: spec.tableName }).content
}

/** @deprecated use generateComponent('service', ...) */
export function generateService(spec: ServiceSpec): string {
  return renderComponent('service', { package: spec.package, name: spec.name, entity: spec.entityName }).content
}

/** @deprecated use generateComponent('controller', ...) */
export function generateController(spec: ControllerSpec): string {
  return renderComponent('controller', { package: spec.package, name: spec.name, entity: spec.entityName }).content
}

/** @deprecated use scaffoldEntity */
export function scaffoldFullEntity(spec: FullEntityScaffold): ScaffoldResult[] {
  return scaffoldEntity({
    package: spec.package,
    name: spec.entityName,
    tableName: spec.tableName,
    fields: spec.fields,
    outputDir: spec.outputDir,
  }).files
}

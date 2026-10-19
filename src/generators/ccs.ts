import { toKebab } from '../template.js'
import { generateBusinessEntity, generateEntityContract, generateService, generateController } from './be.js'
import type { FieldSpec } from './be.js'
import type { CcsComponentSpec, CcsScaffoldResult } from '../contracts/index.js'

export type { CcsComponentSpec, CcsScaffoldResult }

/**
 * Generate a full CCS layer stack for a component:
 * Contract → BE → Service → Controller
 */
export function scaffoldCcsLayer(spec: CcsComponentSpec): CcsScaffoldResult {
  const tableName = spec.name.toUpperCase()
  const contract = generateEntityContract({ entityName: spec.entityName, tableName })
  const be = generateBusinessEntity({
    package: spec.package,
    name: spec.entityName,
    tableName,
    fields: spec.fields,
  })
  const svc = generateService({
    package: spec.package,
    name: spec.entityName,
    entityName: spec.entityName,
  })
  const ctrl = generateController({
    package: spec.package,
    name: spec.entityName,
    entityName: spec.entityName,
  })

  return {
    component: spec.name,
    files: [
      { file: `contracts/${toKebab(spec.entityName)}-contract.i`, content: contract },
      { file: `cls/business/${spec.entityName}.cls`, content: be },
      { file: `cls/service/${spec.entityName}Service.cls`, content: svc },
      { file: `cls/controller/${spec.entityName}Controller.cls`, content: ctrl },
    ],
  }
}

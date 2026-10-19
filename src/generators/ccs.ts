import { scaffoldEntity } from '../core/api.js'
import type { CcsComponentSpec, CcsScaffoldResult } from '../contracts/index.js'

export type { CcsComponentSpec, CcsScaffoldResult }

/**
 * Generate a full CCS layer stack for a component:
 * Contract -> BE -> Service -> Controller
 * @deprecated use scaffoldEntity
 */
export function scaffoldCcsLayer(spec: CcsComponentSpec): CcsScaffoldResult {
  const { files } = scaffoldEntity({
    package: spec.package,
    name: spec.entityName,
    tableName: spec.name.toUpperCase(),
    fields: spec.fields,
  })
  return { component: spec.name, files }
}

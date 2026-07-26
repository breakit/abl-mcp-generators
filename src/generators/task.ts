import { loadAndRender, toKebab } from '../template.js'
import type { BusinessTaskSpec } from '../contracts/index.js'

export type { BusinessTaskSpec }

export function generateBusinessTask(spec: BusinessTaskSpec): string {
  return loadAndRender('business-task.cls', {
    ...spec,
    kebabName: toKebab(spec.name),
  } as unknown as Record<string, unknown>)
}

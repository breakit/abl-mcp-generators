import { loadAndRender } from '../template.js'
import type { BusinessTaskSpec } from '../contracts/index.js'

export type { BusinessTaskSpec }

export function generateBusinessTask(spec: BusinessTaskSpec): string {
  return loadAndRender('business-task.cls', spec as unknown as Record<string, unknown>)
}

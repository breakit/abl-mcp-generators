import { renderComponent } from '../core/render.js'
import '../core/components.js'
import type { ComponentSpec } from '../core/types.js'
import type { BusinessTaskSpec } from '../contracts/index.js'

export type { BusinessTaskSpec }

/** @deprecated use generateComponent('task', ...) */
export function generateBusinessTask(spec: BusinessTaskSpec): string {
  return renderComponent('task', spec as unknown as ComponentSpec).content
}

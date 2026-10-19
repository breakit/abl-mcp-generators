import type { ComponentDefinition, ComponentKind } from './types.js'

const definitions = new Map<ComponentKind, ComponentDefinition>()

export function registerComponent(def: ComponentDefinition): void {
  if (definitions.has(def.kind)) throw new Error(`component already registered: ${def.kind}`)
  definitions.set(def.kind, def)
}

export function getComponent(kind: ComponentKind): ComponentDefinition {
  const def = definitions.get(kind)
  if (!def) throw new Error(`unknown component kind: ${kind}`)
  return def
}

/** Resolve and validate the variant: undefined -> default; unknown -> error. */
export function resolveVariant(def: ComponentDefinition, variant?: string): string | undefined {
  if (!def.variants) {
    if (variant) throw new Error(`component ${def.kind} has no variants (got "${variant}")`)
    return undefined
  }
  const v = variant ?? def.variants[0]
  if (!def.variants.includes(v)) {
    throw new Error(`unknown variant "${v}" for ${def.kind}; available: ${def.variants.join(', ')}`)
  }
  return v
}

export function listComponents(): ComponentKind[] {
  return [...definitions.keys()]
}

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

export function listComponents(): ComponentKind[] {
  return [...definitions.keys()]
}

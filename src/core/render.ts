import { loadAndRender, toKebab } from '../template.js'
import { resolveLocation, derivePackage } from './layout.js'
import { getComponent } from './registry.js'
import type { ComponentKind, ComponentSpec, GenerateOptions, ScaffoldResult } from './types.js'

/**
 * Shared pipeline for every component:
 * resolve location -> build context -> render template -> return file + content.
 */
export function renderComponent(
  kind: ComponentKind,
  spec: ComponentSpec,
  options: GenerateOptions = {},
): ScaffoldResult {
  const def = getComponent(kind)
  const loc = resolveLocation(def, spec, options.variant)

  const ctx: Record<string, unknown> = {
    ...spec,
    kebabName: toKebab(spec.name),
    entityName: spec.entityName ?? spec.name,
    basePackage: spec.package,
    package: loc.package,
    ...def.context?.(spec, loc),
  }

  return { file: loc.file, content: loadAndRender(def.template(options.variant), ctx) }
}

/** Package a given kind would have for this entity, e.g. to reference it from another component. */
export function packageOf(kind: ComponentKind, spec: ComponentSpec, variant?: string): string {
  return derivePackage(spec, getComponent(kind).segments(variant))
}

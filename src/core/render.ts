import { loadAndRender, toKebab } from '../template.js'
import { resolveLocation, derivePackage, entityFolder, entityName, packagePath, applyConfig } from './layout.js'
import { getComponent } from './registry.js'
import type { ComponentKind, ComponentSpec, GenerateOptions, ScaffoldResult } from './types.js'

/**
 * Shared pipeline for every component:
 * resolve location -> build context -> render template -> return file + content.
 */
export function renderComponent(
  kind: ComponentKind,
  rawSpec: ComponentSpec,
  options: GenerateOptions = {},
): ScaffoldResult {
  const spec = applyConfig(rawSpec, options.config)
  const def = getComponent(kind)
  const loc = resolveLocation(def, spec, options.variant)

  const entity = entityName(spec)
  const className = loc.file.split('/').pop()!.replace(/\.[^.]+$/, '')

  const ctx: Record<string, unknown> = {
    ...spec,
    kebabName: toKebab(entity),
    entityName: entity,
    className,
    basePackage: spec.package,
    package: loc.package,
    // cross-component references (fully qualified, since each part lives in its own package)
    entityFqn: `${packageOf('business-entity', spec)}.${entity}`,
    serviceFqn: `${packageOf('service', spec)}.${spec.name}Service`,
    // include path relative to the source root (propath entry)
    contractInclude: [packagePath(spec), entityFolder(spec), 'contract', `${toKebab(entity)}-contract.i`]
      .filter(Boolean)
      .join('/'),
    ...def.context?.(spec, loc),
  }

  return { file: loc.file, content: loadAndRender(def.template(options.variant), ctx) }
}

/** Package a given kind would have for this entity, e.g. to reference it from another component. */
export function packageOf(kind: ComponentKind, spec: ComponentSpec, variant?: string): string {
  return derivePackage(spec, getComponent(kind).segments(variant))
}

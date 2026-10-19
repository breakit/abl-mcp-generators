import { toPascal } from '../template.js'
import type { ProjectConfig } from '../project-config.js'
import type { ComponentDefinition, ComponentSpec, ResolvedLocation } from './types.js'

export const SOURCE_ROOT = 'src'
export const TEST_ROOT = 'test'

export function entityName(spec: ComponentSpec): string {
  return spec.entity ?? spec.name
}

/** Folder of an entity (PascalCase, no hyphens): one folder per business entity. */
export function entityFolder(spec: ComponentSpec): string {
  return toPascal(entityName(spec))
}

/** Fill unset spec values from the project config (abl.toml). Explicit spec values win. */
export function applyConfig(spec: ComponentSpec, config?: ProjectConfig): ComponentSpec {
  if (!config) return spec
  return {
    ...spec,
    package: spec.package ?? config.package,
    sourceRoot: spec.sourceRoot ?? config.sourceRoot,
    testRoot: spec.testRoot ?? config.testRoot,
  }
}

export function derivePackage(spec: ComponentSpec, segments: string[]): string {
  return [spec.package, entityFolder(spec), ...segments].filter(Boolean).join('.')
}

function join(...parts: string[]): string {
  return parts.filter(p => p !== '').join('/')
}

/** Folder of the base package below the source/test root, e.g. `com.acme` -> `com/acme`. */
export function packagePath(spec: ComponentSpec): string {
  return (spec.package ?? '').replace(/\./g, '/')
}

/**
 * Single source of truth for where a component is placed.
 * Source tree: <out>/<sourceRoot>/<package path>/<Entity>/<segments>/<file>
 * Test tree:   <out>/<testRoot>/<package path>/<Entity>/<segments>/<file>
 * The directory below the root always equals the class package, as ABL requires.
 */
export function resolveLocation(
  def: ComponentDefinition,
  spec: ComponentSpec,
  variant?: string,
): ResolvedLocation {
  const segments = def.segments(variant)
  const root = def.tree === 'test' ? (spec.testRoot ?? TEST_ROOT) : (spec.sourceRoot ?? SOURCE_ROOT)
  const file = join(
    spec.outputDir ?? '',
    root,
    packagePath(spec),
    entityFolder(spec),
    ...segments,
    def.fileName(spec, variant),
  )
  return { segments, package: derivePackage(spec, segments), file }
}

import { toKebab } from '../template.js'
import type { ComponentDefinition, ComponentSpec, ResolvedLocation } from './types.js'

export const SOURCE_ROOT = 'src'
export const TEST_ROOT = 'test'

/** Folder of an entity: one folder per business entity. */
export function entityFolder(spec: ComponentSpec): string {
  return toKebab(spec.name)
}

export function derivePackage(spec: ComponentSpec, segments: string[]): string {
  return [spec.package, entityFolder(spec), ...segments].filter(Boolean).join('.')
}

function join(...parts: string[]): string {
  return parts.filter(p => p !== '').join('/')
}

/**
 * Single source of truth for where a component is placed.
 * Source tree: <out>/src/<entity>/<segments>/<file>
 * Test tree:   <out>/test/<entity>/<segments>/<file>
 */
export function resolveLocation(
  def: ComponentDefinition,
  spec: ComponentSpec,
  variant?: string,
): ResolvedLocation {
  const segments = def.segments(variant)
  const root = def.tree === 'test' ? TEST_ROOT : SOURCE_ROOT
  const file = join(spec.outputDir ?? '', root, entityFolder(spec), ...segments, def.fileName(spec, variant))
  return { segments, package: derivePackage(spec, segments), file }
}

import { renderComponent } from './render.js'
import { getComponent, listComponents } from './registry.js'
import type { OperationSpec } from './operations.js'
import { DEFAULT_COMMANDS, DEFAULT_QUERIES } from './cqrs.js'
import type { ProjectConfig } from '../project-config.js'
import type { LegacyNamingStrategy, ComponentKind, ComponentSpec, GenerateOptions, ScaffoldResult } from './types.js'

/** Generate exactly one part of a business entity. */
export function generateComponent(
  kind: ComponentKind,
  spec: ComponentSpec,
  options: GenerateOptions = {},
): ScaffoldResult {
  return renderComponent(kind, spec, options)
}

export interface ScaffoldEntityOptions {
  /** Kinds to generate. Defaults to the core set (see DEFAULT_ENTITY_KINDS). */
  include?: ComponentKind[]
  /** Kinds to skip when `include` is not given. */
  exclude?: ComponentKind[]
  /** Variant per kind, e.g. `{ controller: 'soap' }`. */
  variants?: Partial<Record<ComponentKind, string>>
  /** Command operations to generate (default: Create, Update, Delete). */
  commands?: (string | OperationSpec)[]
  /** Query operations to generate (default: GetById, List). */
  queries?: (string | OperationSpec)[]
  /** Settings from abl.toml (see loadProjectConfig). */
  config?: ProjectConfig
  /** Per-call naming for legacy components. */
  naming?: Partial<LegacyNamingStrategy>
}

export interface ScaffoldWarning {
  kind: ComponentKind
  missing: ComponentKind
  message: string
}

export interface ScaffoldEntityResult {
  files: ScaffoldResult[]
  /** Referenced components that were not part of this run. Never generated implicitly. */
  warnings: ScaffoldWarning[]
}

/** Components that need no extra spec data beyond the entity itself. */
export const DEFAULT_ENTITY_KINDS: ComponentKind[] = ['contract', 'business-entity', 'service', 'controller']

/**
 * Generate any subset of an entity's components.
 * Missing dependencies are reported as warnings, not generated.
 */
export function scaffoldEntity(spec: ComponentSpec, options: ScaffoldEntityOptions = {}): ScaffoldEntityResult {
  const known = new Set(listComponents())
  const kinds = options.include ?? DEFAULT_ENTITY_KINDS.filter(k => !options.exclude?.includes(k))

  for (const k of kinds) if (!known.has(k)) throw new Error(`unknown component kind: ${k}`)

  const selected = new Set(kinds)
  const files: ScaffoldResult[] = []
  const warnings: ScaffoldWarning[] = []

  const commands = options.commands ?? DEFAULT_COMMANDS
  const queries = options.queries ?? DEFAULT_QUERIES
  const base = { ...spec, commands, queries }
  for (const kind of kinds) {
    const opts = { variant: options.variants?.[kind], config: options.config, naming: options.naming }
    const ops = kind.startsWith('command') ? commands : kind.startsWith('query') ? queries : undefined
    if (ops) {
      for (const op of ops) {
        files.push(renderComponent(kind, { ...base, operation: op }, opts))
      }
    } else {
      files.push(renderComponent(kind, base, opts))
    }
    for (const dep of getComponent(kind).dependsOn ?? []) {
      if (!selected.has(dep)) {
        warnings.push({ kind, missing: dep, message: `${kind} references ${dep}, which is not part of this run` })
      }
    }
  }

  return { files, warnings }
}

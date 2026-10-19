import type { ScaffoldResult } from '../contracts/index.js'

/** Every part of a business entity that can be generated on its own. */
export type ComponentKind =
  | 'business-entity'
  | 'contract'
  | 'service'
  | 'controller'
  | 'workflow'
  | 'task'
  | 'test'
  | 'command'
  | 'command-handler'
  | 'query'
  | 'query-handler'

/** Minimal input every component needs. Component-specific fields are passed through to templates. */
export interface ComponentSpec {
  /** Base package (e.g. `com.acme`). The component package is derived from it and the layout. */
  package: string
  /** Class/artifact name. For entity-level parts this is the entity name (e.g. `Customer`). */
  name: string
  /** Owning business entity when `name` is a part of an entity (e.g. workflow `OrderApproval` of `Order`). Defaults to `name`. */
  entity?: string
  tableName?: string
  outputDir?: string
  [key: string]: unknown
}

export interface GenerateOptions {
  /** Sub-kind, e.g. the API standard of a controller (`rest`, `soap`, ...). */
  variant?: string
}

/** Where a component lives, resolved by the layout. */
export interface ResolvedLocation {
  /** Folder segments below the entity root, e.g. `['command', 'handler']`. */
  segments: string[]
  /** Fully derived package (base package + entity + segments). */
  package: string
  /** Output path relative to the output dir. */
  file: string
}

/** Declarative description of one generatable component. */
export interface ComponentDefinition {
  kind: ComponentKind
  /** Template file name, may depend on the variant. */
  template: (variant?: string) => string
  /** Folder segments below the entity root. */
  segments: (variant?: string) => string[]
  /** File name (no folder) for the generated artifact. */
  fileName: (spec: ComponentSpec, variant?: string) => string
  /** Extra template context on top of the common one. */
  context?: (spec: ComponentSpec, loc: ResolvedLocation) => Record<string, unknown>
  /** Kinds this component references by name (reported, never generated implicitly). */
  dependsOn?: ComponentKind[]
  /** Place in the test tree instead of the source tree. */
  tree?: 'src' | 'test'
}

export type { ScaffoldResult }

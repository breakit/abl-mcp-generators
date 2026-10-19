import { renderComponent } from './render.js'
import { getComponent } from './registry.js'
import { resolveOperation } from './operations.js'
import type { OperationSpec } from './operations.js'
import type { ProjectConfig } from '../project-config.js'
import type { ComponentKind, ComponentSpec, ScaffoldResult } from './types.js'
import type { FieldSpec } from '../contracts/index.js'

/** Kinds generated once per operation (everything else is generated once per entity). */
export const COMMAND_KINDS: ComponentKind[] = ['command', 'command-handler', 'command-handler-test']
export const QUERY_KINDS: ComponentKind[] = ['query', 'query-handler']

export interface ScaffoldWarning {
  kind: ComponentKind
  missing: ComponentKind
  message: string
}

export interface ScaffoldOperationOptions {
  /**
   * Parts to generate. Default: the operation's own parts (command + handler, or query + handler).
   * Per-entity parts (`command-result`, `contract`, ...) and `task` can be added explicitly.
   */
  include?: ComponentKind[]
  config?: ProjectConfig
}

export interface ScaffoldOperationResult {
  files: ScaffoldResult[]
  /** References to parts that are not part of this run. A task is optional and never reported. */
  warnings: ScaffoldWarning[]
}

function run(
  spec: ComponentSpec,
  rawOp: string | OperationSpec,
  defaults: ComponentKind[],
  options: ScaffoldOperationOptions,
): ScaffoldOperationResult {
  const entityFields = (spec.fields as FieldSpec[] | undefined) ?? []
  const op = resolveOperation(rawOp, entityFields)
  const kinds = options.include ?? defaults
  const opts = { config: options.config }
  const selected = new Set(kinds)
  const files: ScaffoldResult[] = []
  const warnings: ScaffoldWarning[] = []

  for (const kind of kinds) {
    if (kind === 'task') {
      // optional: only when the operation names a task; its input is the operation payload
      if (!op.task) throw new Error(`operation ${op.name}: "task" was requested but the operation names no task`)
      files.push(
        renderComponent('task', { ...spec, name: op.task, entity: spec.entity ?? spec.name, inputFields: op.fields, outputFields: [] }, opts),
      )
      continue
    }
    const perOperation = COMMAND_KINDS.includes(kind) || QUERY_KINDS.includes(kind)
    files.push(renderComponent(kind, perOperation ? { ...spec, operation: rawOp } : spec, opts))
    for (const dep of getComponent(kind).dependsOn ?? []) {
      if (!selected.has(dep)) warnings.push({ kind, missing: dep, message: `${kind} references ${dep}, which is not part of this run` })
    }
  }
  return { files, warnings }
}

/**
 * One command use case: command + handler (+ optionally `command-result`, `task`, ...).
 * The facade is not a per-operation file; regenerate it with scaffoldEntity to add the operation.
 */
export function scaffoldCommand(
  spec: ComponentSpec,
  operation: string | OperationSpec,
  options: ScaffoldOperationOptions = {},
): ScaffoldOperationResult {
  return run(spec, operation, COMMAND_KINDS, options)
}

/** One query use case: query + handler. */
export function scaffoldQuery(
  spec: ComponentSpec,
  operation: string | OperationSpec,
  options: ScaffoldOperationOptions = {},
): ScaffoldOperationResult {
  return run(spec, operation, QUERY_KINDS, options)
}

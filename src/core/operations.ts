import { toPascal } from '../template.js'
import type { FieldSpec } from '../contracts/index.js'

export type OperationKind = 'create' | 'update' | 'delete' | 'get' | 'list' | 'custom'

/** A command or query use case. A plain string is shorthand for `{ name }`. */
export interface OperationSpec {
  /** Operation name, e.g. `Create`, `GetById`, `Approve`. */
  name: string
  /** Defaults to the preset matching the name, else `custom`. */
  kind?: OperationKind
  /** Payload. Names refer to entity fields. Defaults depend on the kind (see payloadFor). */
  fields?: (string | FieldSpec)[]
  /** Optional Business Task the (custom) command delegates to. Never required. */
  task?: string
}

export interface ResolvedOperation {
  name: string
  kind: OperationKind
  fields: FieldSpec[]
  task?: string
}

const PRESETS: Record<string, OperationKind> = {
  create: 'create',
  update: 'update',
  delete: 'delete',
  get: 'get',
  getbyid: 'get',
  list: 'list',
}

export function inferKind(name: string): OperationKind {
  return PRESETS[toPascal(name).toLowerCase()] ?? 'custom'
}

/** Key fields of an entity: those marked `key`, else the first field. */
export function keyFields(fields: FieldSpec[]): FieldSpec[] {
  const marked = fields.filter(f => f.key)
  return marked.length > 0 ? marked : fields.slice(0, 1)
}

/** Default payload per kind. */
export function payloadFor(kind: OperationKind, entityFields: FieldSpec[]): FieldSpec[] {
  switch (kind) {
    case 'create':
    case 'update':
      return entityFields
    case 'delete':
    case 'get':
      return keyFields(entityFields)
    default:
      return []
  }
}

export function resolveOperation(op: string | OperationSpec, entityFields: FieldSpec[] = []): ResolvedOperation {
  const spec: OperationSpec = typeof op === 'string' ? { name: op } : op
  if (!spec.name || !spec.name.trim()) throw new Error('operation name is required')
  const name = toPascal(spec.name)
  const kind = spec.kind ?? inferKind(name)

  let fields: FieldSpec[]
  if (spec.fields) {
    fields = spec.fields.map(f => {
      if (typeof f !== 'string') return f
      const found = entityFields.find(e => e.name.toLowerCase() === f.toLowerCase())
      if (!found) throw new Error(`operation ${name}: unknown field "${f}"`)
      return found
    })
  } else {
    fields = payloadFor(kind, entityFields)
  }

  return { name, kind, fields, task: spec.task }
}

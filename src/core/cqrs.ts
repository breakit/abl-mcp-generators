import { toPascal } from '../template.js'
import { derivePackage } from './layout.js'
import { resolveOperation, keyFields } from './operations.js'
import type { OperationSpec, ResolvedOperation } from './operations.js'
import type { FieldSpec } from '../contracts/index.js'
import { registerComponent } from './registry.js'
import type { ComponentSpec, ComponentKind } from './types.js'

export const DEFAULT_COMMANDS = ['Create', 'Update', 'Delete']
export const DEFAULT_QUERIES = ['GetById', 'List']

export interface FieldLike { name: string; dataType: string }

/** get/list/custom kinds are not write operations: only create/update/delete have a dedicated handler body. */
function handlerFlavor(kind: string): string {
  return kind === 'create' || kind === 'update' || kind === 'delete' ? kind : 'custom'
}

/** The operation of a command/query component: `spec.operation` is a name or an OperationSpec. */
export function operationOf(spec: ComponentSpec): ResolvedOperation {
  const op = spec.operation as string | OperationSpec | undefined
  if (!op || (typeof op === 'string' && !op.trim())) {
    throw new Error(`"operation" is required for command/query components (e.g. "Create")`)
  }
  return resolveOperation(op, (spec.fields as FieldSpec[] | undefined) ?? [])
}

function operation(spec: ComponentSpec): string {
  return operationOf(spec).name
}

const SEGMENTS = {
  command: ['command', 'command'],
  'command-handler': ['command', 'handler'],
  query: ['query', 'query'],
  'query-handler': ['query', 'handler'],
} as const

type Part = keyof typeof SEGMENTS
const SUFFIX: Record<Part, string> = {
  command: 'Command',
  'command-handler': 'CommandHandler',
  query: 'Query',
  'query-handler': 'QueryHandler',
}

/** Class name of the per-entity command result, e.g. CustomerCommandResult. */
export function resultClassName(spec: ComponentSpec): string {
  return `${toPascal(spec.name)}CommandResult`
}

/** Class name of a command/query part, e.g. CreateCustomerCommand. */
export function cqrsClassName(part: Part, spec: ComponentSpec, op: string = operation(spec)): string {
  return `${toPascal(op)}${spec.name}${SUFFIX[part]}`
}

export function cqrsFqn(part: Part, spec: ComponentSpec, op?: string): string {
  return `${derivePackage(spec, [...SEGMENTS[part]])}.${cqrsClassName(part, spec, op)}`
}

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1)
}

/** Facade entries for the given operation names. */
export function facadeEntries(spec: ComponentSpec, ops: (string | OperationSpec)[], kind: 'command' | 'query') {
  return ops.map(o => {
    const op = resolveOperation(o, (spec.fields as FieldSpec[] | undefined) ?? []).name
    return {
      operation: op,
      methodName: lowerFirst(op),
      handlerVar: `${lowerFirst(op)}-${kind}-handler`,
      messageFqn: cqrsFqn(kind, spec, op),
      handlerFqn: cqrsFqn(`${kind}-handler` as Part, spec, op),
    }
  })
}

function def(kind: Part, template: string, dependsOn: ComponentKind[]) {
  registerComponent({
    kind,
    template: () => `cqrs/${template}`,
    segments: () => [...SEGMENTS[kind]],
    fileName: spec => `${cqrsClassName(kind, spec)}.cls`,
    dependsOn,
    context: spec => {
      const resolved = operationOf(spec)
      const op = resolved.name
      return {
        operation: op,
        operationKind: resolved.kind,
        isList: resolved.kind === 'list',
        // payload per operation kind; replaces the entity field list for command/query templates
        fields: resolved.fields,
        task: resolved.task,
        commandFqn: cqrsFqn('command', spec, op),
        queryFqn: cqrsFqn('query', spec, op),
      }
    },
  })
}

def('command', 'command.cls', [])
registerComponent({
  kind: 'command-result',
  template: () => 'cqrs/command-result.cls',
  segments: () => ['command', 'result'],
  fileName: spec => `${resultClassName(spec)}.cls`,
})

// the handler template follows the operation kind: create | update | delete | custom
registerComponent({
  kind: 'command-handler',
  template: (_v, spec) => `cqrs/command-handler.${handlerFlavor(operationOf(spec!).kind)}.cls`,
  segments: () => [...SEGMENTS['command-handler']],
  fileName: spec => `${cqrsClassName('command-handler', spec)}.cls`,
  dependsOn: ['command', 'command-result', 'business-entity'],
  context: spec => {
    const resolved = operationOf(spec)
    const entityFields = (spec.fields as FieldSpec[] | undefined) ?? []
    const keys = new Set(keyFields(entityFields).map(f => f.name))
    return {
      operation: resolved.name,
      operationKind: resolved.kind,
      fields: resolved.fields,
      keyFields: resolved.fields.filter(f => keys.has(f.name)),
      valueFields: resolved.fields.filter(f => !keys.has(f.name)),
      task: resolved.task,
      taskFqn: resolved.task ? `${derivePackage(spec, ['task'])}.${toPascal(resolved.task)}` : '',
      commandFqn: cqrsFqn('command', spec, resolved.name),
    }
  },
})
def('query', 'query.cls', [])
registerComponent({
  kind: 'query-handler',
  template: () => 'cqrs/query-handler.cls',
  segments: () => [...SEGMENTS['query-handler']],
  fileName: spec => `${cqrsClassName('query-handler', spec)}.cls`,
  dependsOn: ['query', 'business-entity'],
  context: spec => {
    const resolved = operationOf(spec)
    return {
      operation: resolved.name,
      operationKind: resolved.kind,
      // character-like values must be quoted in the filter, numbers not
      fields: resolved.fields.map(f => ({ ...f, quoted: /^(char|longchar|date|datetime|clob|raw)/i.test(f.dataType) })),
      queryFqn: cqrsFqn('query', spec, resolved.name),
    }
  },
})

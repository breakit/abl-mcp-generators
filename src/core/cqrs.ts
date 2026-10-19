import { toPascal } from '../template.js'
import { derivePackage } from './layout.js'
import { registerComponent } from './registry.js'
import type { ComponentSpec, ComponentKind } from './types.js'

export const DEFAULT_COMMANDS = ['Create', 'Update', 'Delete']
export const DEFAULT_QUERIES = ['GetById', 'List']

export interface FieldLike { name: string; dataType: string }

function operation(spec: ComponentSpec): string {
  if (typeof spec.operation !== 'string' || !spec.operation.trim()) {
    throw new Error(`"operation" is required for command/query components (e.g. "Create")`)
  }
  return toPascal(spec.operation)
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
export function facadeEntries(spec: ComponentSpec, ops: string[], kind: 'command' | 'query') {
  return ops.map(op => ({
    operation: toPascal(op),
    methodName: lowerFirst(toPascal(op)),
    handlerVar: `${lowerFirst(toPascal(op))}-${kind}-handler`,
    messageFqn: cqrsFqn(kind, spec, op),
    handlerFqn: cqrsFqn(`${kind}-handler` as Part, spec, op),
  }))
}

function def(kind: Part, template: string, dependsOn: ComponentKind[]) {
  registerComponent({
    kind,
    template: () => `cqrs/${template}`,
    segments: () => [...SEGMENTS[kind]],
    fileName: spec => `${cqrsClassName(kind, spec)}.cls`,
    dependsOn,
    context: spec => {
      const op = operation(spec)
      return {
        operation: op,
        commandFqn: cqrsFqn('command', spec, op),
        queryFqn: cqrsFqn('query', spec, op),
      }
    },
  })
}

def('command', 'command.cls', [])
def('command-handler', 'command-handler.cls', ['command', 'business-entity'])
def('query', 'query.cls', [])
def('query-handler', 'query-handler.cls', ['query', 'business-entity'])

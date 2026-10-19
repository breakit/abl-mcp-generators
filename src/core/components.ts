import { entityName } from './layout.js'
import type { OperationSpec } from './operations.js'
import { DEFAULT_COMMANDS, DEFAULT_QUERIES, facadeEntries } from './cqrs.js'
import { toKebab, toPascal } from '../template.js'
import { registerComponent } from './registry.js'
import type { ComponentSpec } from './types.js'

const cls = (suffix = '') => (spec: ComponentSpec) => `${toPascal(spec.name)}${suffix}.cls`

registerComponent({
  kind: 'business-entity',
  template: () => 'business-entity.cls',
  segments: () => ['business'],
  fileName: cls(),
  dependsOn: ['contract'],
})

registerComponent({
  kind: 'contract',
  template: () => 'entity-contract.i',
  segments: () => ['contract'],
  fileName: spec => `${toKebab(entityName(spec))}-contract.i`,
})

registerComponent({
  kind: 'service',
  // 'default' talks to the business entity directly; 'cqrs' is a facade dispatching to command/query handlers
  variants: ['default', 'cqrs'],
  template: variant => (variant === 'cqrs' ? 'cqrs/service.cls' : 'service.cls'),
  segments: () => ['service'],
  fileName: cls('Service'),
  dependsOn: ['contract', 'business-entity'],
  context: spec => ({
    commands: facadeEntries(spec, (spec.commands as (string | OperationSpec)[] | undefined) ?? DEFAULT_COMMANDS, 'command'),
    queries: facadeEntries(spec, (spec.queries as (string | OperationSpec)[] | undefined) ?? DEFAULT_QUERIES, 'query'),
  }),
})

registerComponent({
  kind: 'controller',
  variants: ['rest', 'soap'],
  template: variant => `controller/${variant}/controller.cls`,
  segments: variant => ['controller', variant!],
  fileName: cls('Controller'),
  dependsOn: ['service'],
})

registerComponent({
  kind: 'workflow',
  template: () => 'business-workflow.cls',
  segments: () => ['workflow'],
  fileName: cls(),
  context: spec => {
    const steps = (spec.steps as { name: string }[] | undefined) ?? []
    return { firstStep: steps.length > 0 ? steps[0].name : 'start' }
  },
})

registerComponent({
  kind: 'task',
  template: () => 'business-task.cls',
  segments: () => ['task'],
  fileName: cls(),
})

registerComponent({
  kind: 'test',
  template: () => 'test.cls',
  segments: () => [],
  fileName: cls('Test'),
  tree: 'test',
  dependsOn: ['business-entity'],
})

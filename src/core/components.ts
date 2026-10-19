import { entityName } from './layout.js'
import { toKebab } from '../template.js'
import { registerComponent } from './registry.js'
import type { ComponentSpec } from './types.js'

const cls = (suffix = '') => (spec: ComponentSpec) => `${spec.name}${suffix}.cls`

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
  template: () => 'service.cls',
  segments: () => ['service'],
  fileName: cls('Service'),
  dependsOn: ['contract', 'business-entity'],
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

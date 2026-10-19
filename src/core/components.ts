import { entityFolder } from './layout.js'
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
  fileName: spec => `${entityFolder(spec)}-contract.i`,
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
  template: () => 'controller.cls',
  segments: variant => ['controller', variant ?? 'rest'],
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

import { loadAndRender, toKebab } from '../template.js'
import type { TestSpec, ScaffoldResult } from '../contracts/index.js'

export type { TestSpec }

export function generateTest(spec: TestSpec): string {
  return loadAndRender('test.cls', {
    ...spec,
    kebabName: toKebab(spec.entityName),
  } as unknown as Record<string, unknown>)
}

export function scaffoldTest(spec: TestSpec): ScaffoldResult {
  const content = generateTest(spec)
  return { file: `${spec.outputDir}/tests/${spec.name}/${spec.name}-test.cls`, content }
}

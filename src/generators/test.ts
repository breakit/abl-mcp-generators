import { loadAndRender } from '../template.js'
import type { TestSpec, ScaffoldResult } from '../contracts/index.js'

export type { TestSpec }

export function generateTest(spec: TestSpec): string {
  return loadAndRender('test.cls', spec as unknown as Record<string, unknown>)
}

export function scaffoldTest(spec: TestSpec): ScaffoldResult {
  const content = generateTest(spec)
  return { file: `${spec.outputDir}/cls/test/${spec.name}Test.cls`, content }
}

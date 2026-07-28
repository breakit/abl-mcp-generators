import { readFileSync } from 'fs'
import { loadAndRender, toKebab } from '../template.js'
import type { TestSpec, ScaffoldResult, MethodSpec, ParamSpec } from '../contracts/index.js'

export type { TestSpec }

export function parseABLSource(sourcePath: string): {
  package: string
  name: string
  entityName: string
  methods: MethodSpec[]
} {
  const source = readFileSync(sourcePath, 'utf-8')

  const clean = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')

  const classMatch = clean.match(/class\s+((\w+(?:\.\w+)*)\.(\w+))\s*:/)
  const pkg = classMatch ? classMatch[2] : ''
  const entityName = classMatch ? classMatch[3] : ''

  const fullText = clean
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    .join('\n')

  const methods: MethodSpec[] = []
  const methodRe = /method\s+(public|private|protected)\s+(\w+(?:\.\w+)*)\s+(\w+)\s*\(([\s\S]*?)\)\s*:/g
  let m: RegExpExecArray | null
  while ((m = methodRe.exec(fullText)) !== null) {
    const [, visibility, returnType, methodName, paramsBlock] = m
    if (visibility === 'private') continue
    const params: ParamSpec[] = parseParamsBlock(paramsBlock)
    methods.push({
      methodName,
      visibility,
      returnType,
      hasParams: params.length > 0,
      hasReturnType: returnType.toLowerCase() !== 'void',
      params,
    })
  }

  return {
    package: pkg,
    name: entityName,
    entityName,
    methods,
  }
}

function parseParamsBlock(block: string): ParamSpec[] {
  if (!block.trim()) return []
  const parts = splitParams(block.trim())
  return parts
    .map(p => {
      const paramRe = /(input|output|input-output)\s+([\w-]+)\s+as\s+(\w+(?:\.\w+)*)/
      const pm = paramRe.exec(p.trim())
      if (!pm) return null
      return {
        paramName: pm[2],
        direction: pm[1],
        dataType: pm[3],
      }
    })
    .filter((p): p is ParamSpec => p !== null)
}

function splitParams(block: string): string[] {
  const result: string[] = []
  let depth = 0
  let current = ''
  for (const ch of block) {
    if (ch === ',' && depth === 0) {
      result.push(current)
      current = ''
    } else {
      if (ch === '(') depth++
      if (ch === ')') depth--
      current += ch
    }
  }
  if (current.trim()) result.push(current)
  return result
}

export function generateTest(spec: TestSpec): string {
  const ctx: Record<string, unknown> = {
    ...spec,
    kebabName: toKebab(spec.entityName),
  }
  return loadAndRender('test.cls', ctx)
}

export function scaffoldTest(spec: TestSpec): ScaffoldResult {
  let resolved = { ...spec }

  if (spec.sourcePath) {
    const parsed = parseABLSource(spec.sourcePath)
    resolved = {
      ...resolved,
      package: spec.package || parsed.package,
      name: spec.name || parsed.name,
      entityName: spec.entityName || parsed.entityName,
      methods: spec.methods && spec.methods.length > 0 ? spec.methods : parsed.methods,
    }
  }

  const content = generateTest(resolved)
  return { file: `${resolved.outputDir}/tests/${resolved.name}/${resolved.name}-test.cls`, content }
}

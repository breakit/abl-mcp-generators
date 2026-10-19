import { readFileSync } from 'fs'
import { renderComponent } from '../core/render.js'
import '../core/components.js'
import type { ComponentSpec } from '../core/types.js'
import type { TestSpec, ScaffoldResult, MethodSpec, ParamSpec } from '../contracts/index.js'

export type { TestSpec }

export function parseABLSource(sourcePath: string): {
  package: string
  name: string
  entityName: string
  methods: MethodSpec[]
} {
  const source = readFileSync(sourcePath, 'utf-8')

  const clean = stripComments(source)

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

/**
 * Remove ABL comments (block comments, which nest in ABL, and // line comments)
 * while leaving string literals ("..." and '...') untouched.
 */
export function stripComments(source: string): string {
  let out = ''
  let i = 0
  const n = source.length
  while (i < n) {
    const ch = source[i]
    const next = source[i + 1]
    if (ch === '"' || ch === "'") {
      let j = i + 1
      while (j < n && source[j] !== ch) {
        if (source[j] === '~') j++ // ABL escape char
        j++
      }
      out += source.slice(i, j + 1)
      i = j + 1
    } else if (ch === '/' && next === '*') {
      let depth = 1
      let j = i + 2
      while (j < n && depth > 0) {
        if (source[j] === '/' && source[j + 1] === '*') { depth++; j += 2 }
        else if (source[j] === '*' && source[j + 1] === '/') { depth--; j += 2 }
        else j++
      }
      i = j
    } else if (ch === '/' && next === '/') {
      while (i < n && source[i] !== '\n') i++
    } else {
      out += ch
      i++
    }
  }
  return out
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

function toComponentSpec(spec: TestSpec): ComponentSpec {
  return { ...spec, entity: spec.entityName } as unknown as ComponentSpec
}

export function generateTest(spec: TestSpec): string {
  return renderComponent('test', toComponentSpec(spec)).content
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

  return renderComponent('test', toComponentSpec(resolved))
}

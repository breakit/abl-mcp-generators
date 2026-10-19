import { existsSync, readFileSync, statSync } from 'fs'
import { join } from 'path'

/** Generator settings pre-defined in abl.toml and reused by the generators. */
export interface ProjectConfig {
  /** Root package, e.g. `com.acme` (`[project] package`). */
  package?: string
  /** Source root below the project dir, e.g. `src` (`[paths] source_root`). */
  sourceRoot?: string
  /** Test root below the project dir, e.g. `test` (`[paths] test_root`). */
  testRoot?: string
}

/** Minimal TOML reader: `[section]` headers and `key = "string"` pairs. Enough for the generator keys. */
export function parseToml(text: string): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {}
  let section = ''
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const sec = /^\[([^\]]+)\]$/.exec(line)
    if (sec) {
      section = sec[1].trim()
      out[section] ??= {}
      continue
    }
    const kv = /^([\w.-]+)\s*=\s*"((?:[^"\\]|\\.)*)"/.exec(line)
    if (kv) (out[section] ??= {})[kv[1]] = kv[2].replace(/\\(["\\])/g, '$1')
  }
  return out
}

export function parseProjectConfig(text: string): ProjectConfig {
  const toml = parseToml(text)
  return {
    package: toml.project?.package,
    sourceRoot: toml.paths?.source_root,
    testRoot: toml.paths?.test_root,
  }
}

/** Load config from an `abl.toml` file, or from a project directory containing one. */
export function loadProjectConfig(pathOrDir: string): ProjectConfig {
  const file = existsSync(pathOrDir) && statSync(pathOrDir).isDirectory() ? join(pathOrDir, 'abl.toml') : pathOrDir
  return parseProjectConfig(readFileSync(file, 'utf-8'))
}

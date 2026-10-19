import { registerComponent } from './registry.js'
import { SOURCE_ROOT } from './layout.js'
import type { ComponentSpec, LegacyNamingStrategy, ResolvedLocation } from './types.js'

function join(...parts: (string | undefined)[]): string {
  return parts.filter((p): p is string => !!p).join('/')
}

function requirePackage(spec: ComponentSpec): string {
  if (!spec.package) throw new Error('legacy components need an explicit "package" (e.g. "sagedpw.employee")')
  return spec.package
}

/**
 * Defaults, replaceable per call: the package is taken as given, the file mirrors the package
 * below the source root. No entity folder, no case conversion.
 */
export const defaultLegacyNaming: LegacyNamingStrategy = {
  packageOf: spec => requirePackage(spec),
  backendFile: spec =>
    join(spec.outputDir, spec.sourceRoot ?? SOURCE_ROOT, requirePackage(spec).replace(/\./g, '/'), `${spec.name}.cls`),
}

export function resolveLegacyNaming(override?: Partial<LegacyNamingStrategy>): LegacyNamingStrategy {
  return { ...defaultLegacyNaming, ...override }
}

registerComponent({
  kind: 'legacy-backend',
  template: () => 'legacy/backend.cls',
  segments: () => [],
  fileName: spec => `${spec.name}.cls`,
  locate: (spec, naming): ResolvedLocation => {
    const n = resolveLegacyNaming(naming)
    return { segments: [], package: n.packageOf(spec), file: n.backendFile(spec) }
  },
})

import type { ProjectScaffoldSpec, ProjectFile, ProjectEntitySpec } from '../contracts/index.js'
import { scaffoldEntity } from '../core/index.js'
import { parseProjectConfig } from '../project-config.js'

export type { ProjectScaffoldSpec, ProjectFile, ProjectEntitySpec }

/**
 * Project skeleton, plus (optionally) every listed entity.
 * Entities are generated with the roots and package defined in the skeleton's own abl.toml.
 */
export function scaffoldProject(spec: ProjectScaffoldSpec): ProjectFile[] {
  const files = scaffoldSkeleton(spec)
  if (!spec.entities || spec.entities.length === 0) return files

  const toml = files.find(f => f.path === `${spec.outputDir}/abl.toml`)!.content
  const config = parseProjectConfig(toml)
  const seen = new Set(files.map(f => f.path))

  for (const e of spec.entities) {
    const { files: generated } = scaffoldEntity(
      { name: e.name, tableName: e.tableName, fields: e.fields, outputDir: spec.outputDir },
      { include: e.include, commands: e.commands, queries: e.queries, variants: e.variants, config },
    )
    for (const g of generated) {
      if (seen.has(g.file)) throw new Error(`entity "${e.name}" generates ${g.file}, which already exists in the project`)
      seen.add(g.file)
      files.push({ path: g.file, content: g.content })
    }
  }
  return files
}

function scaffoldSkeleton(spec: ProjectScaffoldSpec): ProjectFile[] {
  const pkg = spec.package.replace(/\./g, '/')

  return [
    {
      path: `${spec.outputDir}/abl.toml`,
      content: `[project]
name = "${spec.name}"
description = "${spec.description || ''}"
package = "${spec.package}"

[build]
type = "abl"

[paths]
# generator settings: sources are generated below source_root/<package path>/<Entity>/...
source_root = "src"
test_root = "test"
propath = ["src", "incl"]
schema_dirs = ["schema"]

[formatting]
indent_width = 4
align_comments = true
`,
    },
    {
      path: `${spec.outputDir}/src/${pkg}/start.p`,
      content: `/* ${spec.name} — entry point */
/* Package: ${spec.package} */

{${pkg}/config.i}

${spec.description ? '/* ' + spec.description + ' */' : ''}

RETURN.
`,
    },
    {
      path: `${spec.outputDir}/src/${pkg}/config.i`,
      content: `/* ${spec.package} — shared configuration */

/* Global preprocessor defines */
&SCOPED-DEFINE APP-NAME "${spec.name}"
&SCOPED-DEFINE APP-VERSION "1.0.0"
&SCOPED-DEFINE DB-NAME "${spec.name}"

/* Include PROPATH */
{${pkg}/def/global-defs.i}
`,
    },
    {
      path: `${spec.outputDir}/src/${pkg}/def/global-defs.i`,
      content: `/* Global definitions for ${spec.package} */

DEFINE VARIABLE gcUserID   AS CHARACTER NO-UNDO.
DEFINE VARIABLE gcLanguage AS CHARACTER NO-UNDO INITIAL "de".
DEFINE VARIABLE glDebug    AS LOGICAL   NO-UNDO INITIAL FALSE.
`,
    },
    {
      path: `${spec.outputDir}/schema/.gitkeep`,
      content: '',
    },
    {
      path: `${spec.outputDir}/incl/.gitkeep`,
      content: '',
    },
    {
      path: `${spec.outputDir}/test/.gitkeep`,
      content: '',
    },
    {
      path: `${spec.outputDir}/.gitignore`,
      content: `*.r
*.listings
__tmp/
__work/
node_modules/
`,
    },
  ]
}

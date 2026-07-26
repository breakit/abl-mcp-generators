import type { ProjectScaffoldSpec, ProjectFile } from '../contracts/index.js'

export type { ProjectScaffoldSpec, ProjectFile }

export function scaffoldProject(spec: ProjectScaffoldSpec): ProjectFile[] {
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

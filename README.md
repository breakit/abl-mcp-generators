# abl-mcp-generators

ABL code scaffolding — business entities, services, controllers, workflows, tasks, ABLUnit tests, and project initialization.

Part of the [abl-mcp-server](https://github.com/breakit/abl-mcp-server) ecosystem. Built on [`@breakit/abl-mcp-core`](https://github.com/breakit/abl-mcp-core). See also: [`@breakit/abl-mcp-contracts`](https://github.com/breakit/abl-mcp-contracts), [`@breakit/abl-mcp-doc`](https://github.com/breakit/abl-mcp-doc).

## Features

- **Business Entity** — Generate `.cls` extending `OpenEdge.BusinessLogic.BusinessEntity`
  with `@openapi.openedge.export` REST annotations, ProDataSet-based `GetData`/`UpdateData` overrides
- **Service** — Business logic service layer with REST annotations
- **Controller** — REST controller extending `OpenEdge.Web.WebHandler` with request handling
- **Workflow** — Generate `.cls` workflow classes with `Execute` method + per-step methods, ProDataSet context, payload, transitions, and REST annotations
- **Business Task** — Generate standalone task `.cls` with ProDataSet input/output, `Execute` method, and REST annotations. Workflow steps delegate to tasks for complex business logic.
- **CCS Layer** — Generate the full stack (BE + Service + Controller) with ProDataSets
- **ABLUnit Tests** — Generate test classes extending `OpenEdge.ABLUnit.TestCase` with ProDataSet-driven CRUD tests
- **Project Scaffold** — Initialize a new ABL project with directory structure, `abl.toml`, config includes
- **Shared Contracts** — `entity-contract.i` for ProDataSet definitions shared across BE/Service/Test; `security-contract.i` for authorization, logging, and metrics patterns

## Usage

```typescript
import { scaffoldFullEntity, generateWorkflow, generateBusinessTask, scaffoldTest } from '@breakit/abl-mcp-generators'

// Scaffold a full entity stack
const files = scaffoldFullEntity({
  entityName: 'Customer',
  package: 'com.company.app',
  tableName: 'CUSTOMER',
  fields: [
    { name: 'CustNum', dataType: 'INTEGER' },
    { name: 'Name', dataType: 'CHARACTER' },
  ],
  outputDir: './output',
})

// Generate ABLUnit tests
const test = scaffoldTest({
  name: 'Customer',
  entityName: 'Customer',
  tableName: 'CUSTOMER',
  package: 'com.company.app',
  fields: [{ name: 'CustNum', dataType: 'INTEGER' }, { name: 'Name', dataType: 'CHARACTER' }],
  outputDir: './output',
})

// Generate a workflow class (steps can optionally delegate to BusinessTask)
const wf = generateWorkflow({
  package: 'com.company.app',
  name: 'OrderWorkflow',
  initialStatus: 'pending',
  steps: [
    { name: 'Validate', nextStep: 'Approve', nextStatus: 'validated' },
    { name: 'Approve', nextStatus: 'approved', taskName: 'ApproveTask' },
  ],
})

// Generate a standalone business task
const task = generateBusinessTask({
  package: 'com.company.app',
  name: 'ApproveTask',
  inputFields: [{ name: 'OrderId', dataType: 'INTEGER' }],
  outputFields: [{ name: 'Decision', dataType: 'CHARACTER' }],
})
```

## Naming Convention

Templates follow the `<prefix>-<description>-<type>` convention from Progress ABL best practices. This convention is enforced by the `naming-*` lint rules in [config.yaml](https://github.com/breakit/abl-mcp-server/blob/main/config.yaml).

### Prefixes (scope)

| Prefix | Scope | Example |
|---|---|---|
| `l-` | local variable/object (default) | `l-customer-tt` |
| `i-` | input parameter | `i-request-c` |
| `o-` | output parameter | `o-result-l` |
| `io-` | input-output parameter | `io-dataset-ds` |
| `u-` | user-defined persistent | `u-prefs-h` |
| `c-` | compile-time constant | `c-max-rows-i` |
| `g-` | global/shared variable | `g-app-config-h` |

### Suffixes (type)

| Suffix | ABL Type | Example |
|---|---|---|
| `-tt` | temp-table | `l-customer-tt` |
| `-ds` | dataset | `l-customer-ds` |
| `-buf` | buffer | `l-customer-buf` |
| `-qry` | query | `l-active-qry` |
| `-h` | handle | `l-buffer-h` |
| `-i` | integer / int64 | `l-count-i` |
| `-c` | character / longchar | `l-name-c` |
| `-d` | decimal / float | `l-price-d` |
| `-l` | logical | `l-found-l` |
| `-da` | date | `l-start-da` |
| `-de` | datetime / datetime-tz | `l-created-de` |
| `-o` | object | `l-service-o` |

Format: `l-customer-count-i` → local integer counting customers.

### Template Examples

```abl
/* local variables */
define variable l-buffer-h     as handle  no-undo.  /* handle */
define variable l-count-i      as integer no-undo.  /* integer */
define variable l-name-c       as character no-undo. /* character */
define variable l-service-o    as SomeClass no-undo. /* object */

/* parameters */
define input  parameter i-request-c  as character no-undo.
define output parameter o-result-l   as logical   no-undo.
define input-output parameter io-dataset-ds as handle no-undo.

/* temp-tables and datasets */
define temp-table l-customer-tt no-undo
  field custnum as integer.
define dataset l-customer-ds for l-customer-tt.
```

## Output layout

One folder per business entity; every part lives in its own sub-folder and its class package mirrors that folder:

```
<out>/<source_root>/<package path>/<Entity>/
  business/   contract/   service/   workflow/   task/
  controller/<api>/            (rest by default)
  command/{command,handler}/   query/{query,handler}/
<out>/<test_root>/<package path>/<Entity>/   (tests, separate tree)
```

`<Entity>` is PascalCase (`order-item` -> `OrderItem`), so folders and packages contain no hyphens, and the directory below the root always equals the class package.

```ts
import { generateComponent, scaffoldEntity } from '@breakit/abl-mcp-generators'

// one part
generateComponent('service', { package: 'com.acme', name: 'Customer' })

// any subset; missing references are reported in `warnings`
scaffoldEntity(spec, { include: ['business-entity', 'contract'] })
scaffoldEntity(spec, { variants: { controller: 'soap' } })
```

The roots are pre-defined in `abl.toml` (written by `scaffoldProject`) and reused by the generators:

```toml
[project]
package = "com.acme"

[paths]
source_root = "src"
test_root = "test"
```

```ts
import { loadProjectConfig, scaffoldEntity } from '@breakit/abl-mcp-generators'

const config = loadProjectConfig('path/to/project')   // abl.toml or its directory
scaffoldEntity({ name: 'Customer', tableName: 'CUSTOMER', fields }, { config })
// -> src/com/acme/Customer/...   (explicit spec.package / sourceRoot / testRoot win over the config)
```

CQRS: commands and queries are generated per operation, and every command/query has its own handler class in a separate sub-folder:

```ts
generateComponent('command', { ...spec, operation: 'Create' })   // command/command/CreateCustomerCommand.cls
generateComponent('command-handler', { ...spec, operation: 'Create' })
scaffoldEntity(spec, {
  include: ['command', 'command-handler', 'query', 'query-handler', 'service'],
  commands: ['Create', 'Approve'],         // default: Create, Update, Delete
  queries: ['GetById', 'List'],            // default: GetById, List
  variants: { service: 'cqrs' },           // facade dispatching to the handlers (default variant talks to the BE directly)
})
```

Legacy backend (stub): one monolithic class with public variables for the WebSpeed page and JSON CRUD methods. It lives in the caller's old-style domain package, outside the entity folder, and is self-contained. Package and file path are configurable per call:

```ts
generateComponent('legacy-backend', { package: 'sagedpw.employee', name: 'EmployeeManager', fields })
// -> src/sagedpw/employee/EmployeeManager.cls
generateComponent('legacy-backend', spec, { naming: { backendFile: s => `legacy/${s.name}.cls` } })
```

Contract includes resolve against the source root: `com/acme/Customer/contract/customer-contract.i`. See CHANGELOG.md for migration notes.

## Templates

```
src/templates/   # *.tpl = template with {{placeholders}}; .tpl keeps the ABL LSP from parsing them
├── business-entity.cls.tpl  # BE with REST annotations + ProDataSet
├── service.cls.tpl          # Service with REST annotations
├── cqrs/                    # command, command-handler, query, query-handler, service facade
├── legacy/backend.cls.tpl   # monolithic legacy backend class (stub)
├── controller/
│   ├── rest/controller.cls.tpl  # WebHandler-based REST controller
│   └── soap/controller.cls.tpl  # SOAP controller (dataset in/out)
├── business-workflow.cls.tpl# Workflow class with Execute + step methods
├── business-task.cls.tpl    # Standalone task class with input/output datasets
├── test.cls.tpl             # ABLUnit test with ProDataSet
├── entity-contract.i.tpl    # Shared dataset definition (include in BE/Service/Test)
└── security-contract.i      # (static ABL, not a template) Authorization, logging, and metrics patterns
```

## OpenEdge Class Hierarchy

| Template | Inherits From |
|---|---|
| Business Entity | `OpenEdge.BusinessLogic.BusinessEntity` |
| Controller | `OpenEdge.Web.WebHandler` |
| Test | `OpenEdge.ABLUnit.TestCase` |
| Service | Standalone |
| Workflow | Standalone (`.cls` with step methods, delegates to BusinessTask) |
| Business Task | Standalone (`.cls` with input/output datasets) |

## Development

```sh
git clone https://github.com/breakit/abl-mcp-generators.git
cd abl-mcp-generators
yarn install
yarn build
```

### Local Multi-Repo Development

This repo is designed to work beside:

- `../abl-mcp-core`
- `../abl-mcp-server`
- `../abl-mcp-contracts`
- `../abl-mcp-doc`

Documentation generators were extracted into `../abl-mcp-doc`.

For local development, build `../abl-mcp-core` first, then rebuild this repo:

```sh
yarn build
```

To refresh the symlinked package graph used by `abl-mcp-server`, run this from `../abl-mcp-server`:

```sh
yarn build:local-deps
yarn link:local-deps
```

## Acknowledgments

- Built on [@breakit/abl-mcp-core](https://github.com/breakit/abl-mcp-core) which uses [tree-sitter-abl](https://github.com/usagi-coffee/tree-sitter-abl) and [Prolint](https://github.com/jcaillon/prolint)-inspired rules
- Naming convention derived from Progress ABL community standards

## License

MIT

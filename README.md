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

## Templates

```
src/templates/
├── business-entity.cls      # BE with REST annotations + ProDataSet
├── service.cls              # Service with REST annotations
├── controller.cls           # WebHandler-based REST controller
├── business-workflow.cls    # Workflow class with Execute + step methods
├── business-task.cls        # Standalone task class with input/output datasets
├── test.cls                 # ABLUnit test with ProDataSet
├── entity-contract.i        # Shared dataset definition (include in BE/Service/Test)
└── security-contract.i      # Authorization, logging, and metrics patterns
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

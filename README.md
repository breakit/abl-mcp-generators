# abl-mcp-generators

ABL code scaffolding — business entities, services, controllers, workflows, ABLUnit tests, ABLDoc documentation, and project initialization.

Part of the [abl-mcp-server](https://github.com/breakit/abl-mcp-server) ecosystem.

## Features

- **Business Entity** — Generate `.cls` extending `OpenEdge.BusinessLogic.BusinessEntity`
  with `@openapi.openedge.export` REST annotations, ProDataSet-based `GetData`/`UpdateData` overrides
- **Service** — Business logic service layer with REST annotations
- **Controller** — REST controller extending `OpenEdge.Web.WebHandler` with request handling
- **Workflow** — Generate `.cls` workflow classes with `Execute` method + per-step methods, ProDataSet context, payload, transitions, and REST annotations
- **Business Task** — Generate standalone task `.cls` with ProDataSet input/output, `Execute` method, and REST annotations
- **CCS Layer** — Generate the full stack (BE + Service + Controller) with ProDataSets
- **ABLUnit Tests** — Generate test classes extending `OpenEdge.ABLUnit.TestCase` with ProDataSet-driven CRUD tests
- **ABLDoc** — Generate formatted `/** */` comment blocks for classes, methods, functions, and procedures; generate HTML documentation from existing ABLDoc comments
- **Project Scaffold** — Initialize a new ABL project with directory structure, `abl.toml`, config includes

## Usage

```typescript
import { scaffoldFullEntity, generateWorkflow, scaffoldTest, generateAbldocHtml } from '@breakit/abl-mcp-generators'

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

// Generate a workflow class
const wf = generateWorkflow({
  package: 'com.company.app',
  name: 'OrderWorkflow',
  initialStatus: 'pending',
  steps: [
    { name: 'Validate', nextStep: 'Approve', nextStatus: 'validated' },
    { name: 'Approve', nextStatus: 'approved' },
  ],
})

// Generate an ABLDoc comment block
const comment = generateDocComment({
  type: 'method',
  name: 'GetData',
  description: 'Retrieve data from the database',
  params: [{ name: 'request', dataType: 'IGetDataRequest', description: 'Request object' }],
  returnType: 'HANDLE',
})

// Generate HTML documentation from existing ABLDoc comments
const doc = generateAbldocHtml('./project-root', 'My ABL Project')
```

## Templates

```
src/templates/
├── business-entity.cls    # BE with REST annotations + ProDataSet
├── service.cls            # Service with REST annotations
├── controller.cls         # WebHandler-based REST controller
├── workflow.cls           # Workflow class with Execute + step methods
├── business-task.cls      # Standalone task class with input/output datasets
├── test.cls               # ABLUnit test with ProDataSet
└── abldoc/
    └── index.html          # ABLDoc HTML template
```

## OpenEdge Class Hierarchy

| Template | Inherits From |
|---|---|
| Business Entity | `OpenEdge.BusinessLogic.BusinessEntity` |
| Controller | `OpenEdge.Web.WebHandler` |
| Test | `OpenEdge.ABLUnit.TestCase` |
| Service | Standalone |
| Workflow | Standalone (`.cls` with step methods) |
| Business Task | Standalone (`.cls` with input/output datasets) |

## License

MIT

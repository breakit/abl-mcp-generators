# abl-mcp-generators

ABL code scaffolding — business entities, services, controllers, workflows, ABLUnit tests, and full project initialization.

Part of the [abl-mcp-server](https://github.com/breakit/abl-mcp-server) ecosystem.

## Features

- **Business Entity** — Generate `.cls` extending `OpenEdge.BusinessLogic.BusinessEntity`
  with `@openapi.openedge.export` REST annotations, ProDataSet-based `GetData`/`UpdateData` overrides
- **Service** — Business logic service layer with REST annotations
- **Controller** — REST controller extending `OpenEdge.Web.WebHandler` with request handling
- **Workflow** — Generate `.p` workflow files with steps and transitions
- **Workflow Task** — Individual workflow task handlers
- **CCS Layer** — Generate the full stack (BE + Service + Controller) with ProDataSets
- **ABLUnit Tests** — Generate test classes extending `OpenEdge.ABLUnit.TestCase` with ProDataSet-driven CRUD tests
- **Project Scaffold** — Initialize a new ABL project with directory structure, `abl.toml`, config includes

## Usage

```typescript
import { scaffoldFullEntity, generateWorkflow, scaffoldTest } from '@breakit/abl-mcp-generators'

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
```

## Templates

```
src/templates/
├── business-entity.cls    # BE with REST annotations + ProDataSet
├── service.cls            # Service with REST annotations
├── controller.cls         # WebHandler-based REST controller
├── workflow.p             # Workflow with steps
├── workflow-task.p        # Task handler for workflows
└── test.cls               # ABLUnit test with ProDataSet
```

## OpenEdge Class Hierarchy

| Template | Inherits From |
|---|---|
| Business Entity | `OpenEdge.BusinessLogic.BusinessEntity` |
| Controller | `OpenEdge.Web.WebHandler` |
| Test | `OpenEdge.ABLUnit.TestCase` |
| Service | Standalone |

## License

MIT

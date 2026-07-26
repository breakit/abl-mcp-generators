# abl-mcp-generators

ABL code scaffolding — business entities, services, controllers, workflows, and full project initialization.

Part of the [abl-mcp-server](https://github.com/breakit/abl-mcp-server) ecosystem.

## Features

- **Business Entity** — Generate BE `.cls` with CRUD methods from a table definition
- **Service** — Business logic service layer for an entity
- **Controller** — UI/API controller for an entity
- **Workflow** — Generate `.p` workflow files with steps and transitions
- **Workflow Task** — Individual workflow task handlers
- **CCS Layer** — Generate the full stack (BE + Service + Controller) for a component
- **Project Scaffold** — Initialize a new ABL project with directory structure, `abl.toml`, config includes

## Usage

```typescript
import { scaffoldFullEntity, generateWorkflow, scaffoldCcsLayer, scaffoldProject } from '@breakit/abl-mcp-generators'

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

// Generate a workflow
const workflow = generateWorkflow({
  name: 'OrderApproval',
  description: 'Order approval process',
  initialStatus: 'pending',
  steps: [
    { name: 'submit' },
    { name: 'approve', nextStep: 'complete' },
    { name: 'reject' },
  ],
})
```

## Templates

```
src/templates/
├── business-entity.cls    # BE CRUD class
├── service.cls            # Service layer
├── controller.cls         # Controller layer
├── workflow.p             # Workflow with steps
└── workflow-task.p        # Task handler for workflows
```

## License

MIT

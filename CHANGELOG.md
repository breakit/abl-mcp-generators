# Changelog

## 0.2.0

### Added
- Component API: `generateComponent(kind, spec, { variant })` generates one part on its own; `scaffoldEntity(spec, { include, exclude, variants })` generates any subset and reports missing references as warnings.
- Component registry (`registerComponent`, `listComponents`) and a single layout module that decides every output path and package.
- `abl.toml` now carries `source_root` / `test_root`; `loadProjectConfig` / `parseProjectConfig` read them (plus `[project] package`) and `config` can be passed to `generateComponent` / `scaffoldEntity`.
- CQRS components `command`, `command-handler`, `query`, `query-handler` (per operation, via `spec.operation`), placed in `command/{command,handler}` and `query/{query,handler}`. `scaffoldEntity` takes `commands` / `queries` (defaults: Create, Update, Delete / GetById, List).
- `service` variant `cqrs`: a facade that only dispatches to the generated handlers (default variant unchanged).
- `legacy-backend` component (stub) with a per-call `naming` strategy (`packageOf`, `backendFile`; partial overrides, defaults mirror the caller's package).
- `legacy-page` component (stub): single `.htm` with SpeedScript initialisation, JavaScript and HTML placeholders, placed flat in the output root; `naming.pageFile` overrides the path.
- Golden-file snapshot tests for every component and variant, plus layout invariants (directory equals package).
- Operation model: `commands` / `queries` accept names or `OperationSpec { name, kind, fields, task }`; `FieldSpec.key` marks key fields (composite keys). Payloads: create/update carry all fields, delete/get the key fields, list/custom none unless `fields` is given. `task` is an optional link to a Business Task; commands and tasks never require each other.
- `command-result` component: one `<Entity>CommandResult` per entity in `command/result/` (success, errors, key; `collecterrors` reads buffer `error-string`s after `updatedata`/`deletedata`). Command handlers list it as a dependency.
- Command handlers have real bodies per operation kind (`create`/`update`/`delete` build the contract row from the command and call the unchanged `updatedata`/`deletedata`; `custom` delegates to the task named in `operation.task`, or is a plain stub) and return `<Entity>CommandResult`. The `cqrs` facade methods return it too (changed from `logical`).
- `toPascal` helper.
- Templates are stored as `*.tpl` so ABL tooling does not parse placeholder syntax.

### Changed (breaking: output paths and packages)
- One folder per business entity: `<out>/<source_root>/<package path>/<Entity>/{business,contract,service,workflow,task,controller/<api>}`; tests go to `<out>/<test_root>/<package path>/<Entity>/`. `<Entity>` is PascalCase (no hyphens).
- Class packages equal the folder path: `<base>.<Entity>.<segments>`. Workflows and tasks no longer use the fixed `.workflows.` / `.tasks.` packages.
- Controllers are placed by API standard: `controller/rest` (default) and `controller/soap`, each with its own template under `templates/controller/<api>/`. Unknown variants throw an error listing the available ones; a component declares its variants in its registry definition.
- Fixed: `business-entity` template leaked an unsupported `{{#first}}` placeholder; file/class names of entity parts are PascalCase even when the spec name is kebab-case.
- Class names keep the file's casing (`CustomerService`, not `Customerservice`).
- Parts reference each other by fully qualified class name; contract includes use the path `<package path>/<Entity>/contract/<entity-kebab>-contract.i` (propath root = source root).
- `generateService`, `generateController`, `scaffoldFullEntity`, `scaffoldCcsLayer`, `generateWorkflow`, `generateBusinessTask`, `generateTest` and `scaffoldTest` are now wrappers over the component API (deprecated).
- Wrappers: `generateService` / `generateController` name the class `<name>Service` / `<name>Controller` and place it in the folder of `entityName`; the controller references `<name>Service`.
- `ComponentSpec.package` is optional when a config supplies it.

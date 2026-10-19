# Changelog

## 0.2.0

### Added
- Component API: `generateComponent(kind, spec, { variant })` generates one part on its own; `scaffoldEntity(spec, { include, exclude, variants })` generates any subset and reports missing references as warnings.
- Component registry (`registerComponent`, `listComponents`) and a single layout module that decides every output path and package.
- Templates are stored as `*.tpl` so ABL tooling does not parse placeholder syntax.

### Changed (breaking: output paths and packages)
- One folder per business entity: `<out>/src/<entity-kebab>/{business,contract,service,workflow,task,controller/<api>}`; tests go to `<out>/test/<entity-kebab>/`.
- Class packages are derived from the folder: `<base>.<entity-kebab>.<segments>`. Workflows and tasks no longer use the fixed `.workflows.` / `.tasks.` packages.
- Controllers are placed by API standard (`controller/rest` by default).
- Class names keep the file's casing (`CustomerService`, not `Customerservice`).
- Parts reference each other by fully qualified class name; contract includes use the path `<entity>/contract/<entity>-contract.i` (propath root = `src`).
- `generateService`, `generateController`, `scaffoldFullEntity`, `scaffoldCcsLayer`, `generateWorkflow`, `generateBusinessTask`, `generateTest` and `scaffoldTest` are now wrappers over the component API (deprecated).
- In wrappers the class name is derived from `entityName` (service, controller) instead of `name`.

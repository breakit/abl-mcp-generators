/* data contract for {{entityName}} — shared across business entity, service, and test */
/*
 * usage: include this file via PROPATH in classes that need the dataset:
 *   { {{kebabName}}-contract.i }
 *
 * multi-tenant: uncomment and add your tenant field:
 *   define temp-table l-{kebabName}}-tt like {{tableName}}
 *     field tenantid as character
 *     field createdby as character
 *     field createddate as date
 *     field updatedby as character
 *     field updateddate as date.
 *
 * extends: add calculated fields or child tables below:
 *   define temp-table l-{kebabName}}-extra no-undo
 *     field calculatedvalue as decimal.
 *   define dataset l-{kebabName}}-ds for l-{kebabName}}-tt, l-{kebabName}}-extra.
 */
define temp-table l-{{kebabName}}-tt like {{tableName}}.
define dataset l-{{kebabName}}-ds for l-{{kebabName}}-tt.

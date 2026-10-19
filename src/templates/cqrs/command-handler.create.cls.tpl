/* handler for {{commandFqn}} — write side, goes through the business entity (its signatures are unchanged) */
class {{package}}.{{className}}:

  /* note: updatedata/deletedata evaluate row-state, so the contract temp-table needs a before-table */
  { {{contractInclude}} }
  define variable l-be-o as {{entityFqn}} no-undo.

  constructor public {{className}}():
    l-be-o = new {{entityFqn}}().
  end constructor.

  /* execute — create: adds one new row and sends it to the entity */
  method public {{resultFqn}} execute(input i-command-o as {{commandFqn}}):
    define variable l-result-o as {{resultFqn}} no-undo.
    define variable l-ok-l     as logical no-undo.
    l-result-o = new {{resultFqn}}().

    /* todo: authorization and business validation; on failure: l-result-o:addError("...") and return l-result-o. */

    empty temp-table l-{{kebabName}}-tt.
    temp-table l-{{kebabName}}-tt:tracking-changes = true.
    create l-{{kebabName}}-tt.
{{#each fields}}    l-{{kebabName}}-tt.{{name}} = i-command-o:{{name}}.
{{/each}}
    l-ok-l = l-be-o:updatedata(input dataset l-{{kebabName}}-ds).

    if dataset l-{{kebabName}}-ds:error then
      l-result-o:collecterrors(dataset l-{{kebabName}}-ds:handle).
    else if not l-ok-l then
      l-result-o:addError("create failed").

    return l-result-o.
  end method.

end class.

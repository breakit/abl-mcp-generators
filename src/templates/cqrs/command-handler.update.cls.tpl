/* handler for {{commandFqn}} — write side, goes through the business entity (its signatures are unchanged) */
class {{package}}.{{className}}:

  /* note: updatedata/deletedata evaluate row-state, so the contract temp-table needs a before-table */
  { {{contractInclude}} }
  define variable l-be-o as {{entityFqn}} no-undo.

  constructor public {{className}}():
    l-be-o = new {{entityFqn}}().
  end constructor.

  /* execute — update: the row is created as unchanged (key + original), then the new values are assigned */
  method public {{resultFqn}} execute(input i-command-o as {{commandFqn}}):
    define variable l-result-o as {{resultFqn}} no-undo.
    define variable l-ok-l     as logical no-undo.
    l-result-o = new {{resultFqn}}().

    /* todo: authorization and business validation; on failure: l-result-o:addError("...") and return l-result-o. */

    empty temp-table l-{{kebabName}}-tt.
    temp-table l-{{kebabName}}-tt:tracking-changes = false.
    create l-{{kebabName}}-tt.
{{#each keyFields}}    l-{{kebabName}}-tt.{{name}} = i-command-o:{{name}}.
{{/each}}    /* todo: load the current values (original row) before accepting, e.g. via l-be-o:getdata */
    dataset l-{{kebabName}}-ds:accept-changes().
    temp-table l-{{kebabName}}-tt:tracking-changes = true.
{{#each valueFields}}    l-{{kebabName}}-tt.{{name}} = i-command-o:{{name}}.
{{/each}}
    l-ok-l = l-be-o:updatedata(input dataset l-{{kebabName}}-ds).

    if dataset l-{{kebabName}}-ds:error then
      l-result-o:collecterrors(dataset l-{{kebabName}}-ds:handle).
    else if not l-ok-l then
      l-result-o:addError("update failed").

    return l-result-o.
  end method.

end class.

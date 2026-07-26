@openapi.openedge.export file (type="rest", executionmode="singleton").
class {{package}}.{{name}} inherits openedge.businesslogic.businessentity:
  {{#if description}}/* {{description}} */{{/if}}

  define temp-table l-{{kebabName}}-tt like {{tableName}}.
  define dataset l-{{kebabName}}-ds for l-{{kebabName}}-tt.

  @openapi.openedge.export(type="rest", usereturnvalue="true").
  method override public handle getdata(
    input request as openedge.businesslogic.igetdatarequest):

    define variable l-buffer-h as handle no-undo.
    define variable l-query-h  as handle no-undo.

    empty temp-table l-{{kebabName}}-tt.

    l-buffer-h = dataset l-{{kebabName}}-ds:get-buffer-handle(1).
    l-query-h = l-buffer-h:query-prepare("for each {{tableName}}").
    l-query-h:query-open().

    repeat:
      l-buffer-h:buffer-copy(l-query-h).
      if l-query-h:query-off-end then leave.
      l-query-h:get-next().
    end.

    l-query-h:query-close().
    return dataset l-{{kebabName}}-ds:handle.
  end method.

  @openapi.openedge.export(type="rest").
  method override public logical updatedata(
    input dataset for l-{{kebabName}}-ds):

    define buffer l-{{kebabName}}-buf for {{tableName}}.

    for each l-{{kebabName}}-tt:
      if row-state(l-{{kebabName}}-tt) = row-created then do:
        {{#each fields}}if l-{{kebabName}}-tt.{{name}} <> ? then l-{{kebabName}}-buf.{{name}} = l-{{kebabName}}-tt.{{name}}.
        {{/each}}
        release l-{{kebabName}}-buf.
      end.
      else if row-state(l-{{kebabName}}-tt) = row-modified then do:
        find l-{{kebabName}}-buf.
        {{#each fields}}if l-{{kebabName}}-tt.{{name}} <> ? then l-{{kebabName}}-buf.{{name}} = l-{{kebabName}}-tt.{{name}}.
        {{/each}}
        release l-{{kebabName}}-buf.
      end.
      else if row-state(l-{{kebabName}}-tt) = row-deleted then do:
        find l-{{kebabName}}-buf.
        delete l-{{kebabName}}-buf.
      end.
    end.

    return true.
  end method.

    return true.
  end method.

end class.

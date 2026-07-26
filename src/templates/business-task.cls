@openapi.openedge.export file (type="rest", executionmode="singleton").
{{#if description}}/* {{description}} */{{/if}}
class {{package}}.tasks.{{name}}:

  define temp-table l-input-tt no-undo
    {{#each inputFields}}
    field {{name}} as {{dataType}}
    {{/each}}.
  define dataset l-input-ds for l-input-tt.

  define temp-table l-output-tt no-undo
    field statuscode    as character
    field statusmessage as character
    {{#each outputFields}}
    field {{name}} as {{dataType}}
    {{/each}}.
  define dataset l-output-ds for l-output-tt.

  @openapi.openedge.export(type="rest", usereturnvalue="true").
  method public character execute(
    input  dataset for l-input-ds,
    output dataset for l-output-ds):

    find first l-input-tt.
    if available l-input-tt then do:
      create l-output-tt.
      assign
        l-output-tt.statuscode    = "success"
        l-output-tt.statusmessage = "completed".
    end.
    else do:
      create l-output-tt.
      assign
        l-output-tt.statuscode    = "error"
        l-output-tt.statusmessage = "no input data provided".
    end.

    /* todo: implement task business logic */

    return l-output-tt.statuscode.
  end method.

end class.

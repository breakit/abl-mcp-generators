@openapi.openedge.export file (type="rest", executionmode="singleton").
{{#if description}}/* {{description}} */{{/if}}
class {{package}}.tasks.{{name}}:

  /*
   * input: dataset with fields provided by the caller.
   * example for ValidateOrder:
   *   { orderid = 1001, amount = 250.00 }
   */
  define temp-table l-input-tt no-undo
    {{#each inputFields}}
    field {{name}} as {{dataType}}
    {{/each}}.
  define dataset l-input-ds for l-input-tt.

  /*
   * output: dataset with status + result fields.
   * extends: add custom output fields after statusmessage.
   */
  define temp-table l-output-tt no-undo
    field statuscode    as character
    field statusmessage as character
    {{#each outputFields}}
    field {{name}} as {{dataType}}
    {{/each}}.
  define dataset l-output-ds for l-output-tt.

  /*
   * execute — runs the task business logic.
   * todo: implement core logic:
   *   find first l-input-tt.
   *   /* example: validate order amount */.
   *   if l-input-tt.amount <= 0 then do:
   *     assign l-output-tt.statuscode    = "error"
   *            l-output-tt.statusmessage = "invalid amount".
   *     return l-output-tt.statuscode.
   *   end.
   *   /* example: check inventory */.
   *   find first inventory where inventory.itemid = l-input-tt.orderid no-lock no-error.
   *   if not available inventory then do:
   *     assign l-output-tt.statuscode    = "error"
   *            l-output-tt.statusmessage = "item not found".
   *     return l-output-tt.statuscode.
   *   end.
   */
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

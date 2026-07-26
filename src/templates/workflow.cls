@openapi.openedge.export file (type="rest", executionmode="singleton").
{{#if description}}/* {{description}} */{{/if}}
class {{package}}.workflows.{{name}}:

  define temp-table l-context-tt no-undo
    field workflowid    as character
    field currentstep   as character
    field status        as character
    field starteddate   as datetime
    field completeddate as datetime
    field assignedto    as character
    {{#each contextFields}}
    field {{name}} as {{dataType}}{{#if initial}} initial {{initial}}{{/if}}
    {{/each}}.
  define dataset l-context-ds for l-context-tt.

  {{#if payloadTable}}
  define temp-table l-payload-tt like {{payloadTable}}.
  define dataset l-payload-ds for l-payload-tt.
  {{/if}}

  @openapi.openedge.export(type="rest", usereturnvalue="true").
  method public character execute(
    input-output dataset for l-context-ds{{#if payloadTable}},
    input-output dataset for l-payload-ds{{/if}}):

    find first l-context-tt.
    if not available l-context-tt then do:
      create l-context-tt.
      assign
        l-context-tt.workflowid  = string(now)
        l-context-tt.status      = "{{initialStatus}}"
        l-context-tt.currentstep = "start"
        l-context-tt.starteddate = now.
    end.

    case l-context-tt.currentstep:
      {{#each steps}}
      when "{{name}}" then do:
        step{{name}}(input-output dataset l-context-ds{{#if payloadTable}}, input-output dataset l-payload-ds{{/if}}).
      end.
      {{/each}}
    end case.

    return l-context-tt.status.
  end method.

  {{#each steps}}
  @openapi.openedge.export(type="rest").
  method public character step{{name}}(
    input-output dataset for l-context-ds{{#if payloadTable}},
    input-output dataset for l-payload-ds{{/if}}):

    find first l-context-tt.
    {{#if nextStatus}}
    assign l-context-tt.status = "{{nextStatus}}".
    {{/if}}
    {{#if nextStep}}
    assign l-context-tt.currentstep = "{{nextStep}}".
    {{/if}}

    /* todo: implement step logic for "{{name}}" */

    return "success".
  end method.
  {{/each}}

end class.

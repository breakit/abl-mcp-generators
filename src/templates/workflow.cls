@openapi.openedge.export FILE (TYPE="REST", executionMode="SINGLETON").
{{#if description}}/* {{description}} */{{/if}}
CLASS {{package}}.workflows.{{name}}:

  DEFINE TEMP-TABLE ttWorkflowContext NO-UNDO
    FIELD WorkflowId    AS CHARACTER
    FIELD CurrentStep   AS CHARACTER
    FIELD Status        AS CHARACTER
    FIELD StartedDate   AS DATETIME
    FIELD CompletedDate AS DATETIME
    FIELD AssignedTo    AS CHARACTER
    {{#each contextFields}}
    FIELD {{name}} AS {{dataType}}{{#if initial}} INITIAL {{initial}}{{/if}}
    {{/each}}.
  DEFINE DATASET dsWorkflow FOR ttWorkflowContext.

  {{#if payloadTable}}
  DEFINE TEMP-TABLE ttPayload LIKE {{payloadTable}}.
  DEFINE DATASET dsPayload FOR ttPayload.
  {{/if}}

  @openapi.openedge.export(TYPE="REST", useReturnValue="TRUE").
  METHOD PUBLIC CHARACTER Execute(
    INPUT-OUTPUT DATASET FOR dsWorkflow{{#if payloadTable}},
    INPUT-OUTPUT DATASET FOR dsPayload{{/if}}):

    FIND FIRST ttWorkflowContext.
    IF NOT AVAILABLE ttWorkflowContext THEN DO:
      CREATE ttWorkflowContext.
      ASSIGN
        ttWorkflowContext.WorkflowId  = STRING(NOW)
        ttWorkflowContext.Status      = "{{initialStatus}}"
        ttWorkflowContext.CurrentStep = "start"
        ttWorkflowContext.StartedDate = NOW.
    END.

    CASE ttWorkflowContext.CurrentStep:
      {{#each steps}}
      WHEN "{{name}}" THEN DO:
        Step{{name}}(INPUT-OUTPUT DATASET dsWorkflow{{#if payloadTable}}, INPUT-OUTPUT DATASET dsPayload{{/if}}).
      END.
      {{/each}}
    END CASE.

    RETURN ttWorkflowContext.Status.
  END METHOD.

  {{#each steps}}
  @openapi.openedge.export(TYPE="REST").
  METHOD PUBLIC CHARACTER Step{{name}}(
    INPUT-OUTPUT DATASET FOR dsWorkflow{{#if payloadTable}},
    INPUT-OUTPUT DATASET FOR dsPayload{{/if}}):

    FIND FIRST ttWorkflowContext.
    {{#if nextStatus}}
    ASSIGN ttWorkflowContext.Status = "{{nextStatus}}".
    {{/if}}
    {{#if nextStep}}
    ASSIGN ttWorkflowContext.CurrentStep = "{{nextStep}}".
    {{/if}}

    /* TODO: implement step logic for "{{name}}" */

    RETURN "SUCCESS".
  END METHOD.
  {{/each}}

END CLASS.

@openapi.openedge.export FILE (TYPE="REST", executionMode="SINGLE-RUN").

/* Workflow: {{name}}{{#if description}} — {{description}}{{/if}} */

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
PROCEDURE ExecuteWorkflow:
  DEFINE INPUT-OUTPUT PARAMETER DATASET FOR dsWorkflow.
  {{#if payloadTable}}
  DEFINE INPUT-OUTPUT PARAMETER DATASET FOR dsPayload.
  {{/if}}

  FIND FIRST ttWorkflowContext.
  IF NOT AVAILABLE ttWorkflowContext THEN DO:
    CREATE ttWorkflowContext.
    ASSIGN
      ttWorkflowContext.WorkflowId  = STRING(NOW)
      ttWorkflowContext.Status      = "{{initialStatus}}"
      ttWorkflowContext.CurrentStep = "start"
      ttWorkflowContext.StartedDate = NOW.
  END.

  /* Step routing */
  CASE ttWorkflowContext.CurrentStep:
    {{#each steps}}
    WHEN "{{name}}" THEN DO:
      RUN {{name}}Task(INPUT-OUTPUT DATASET dsWorkflow{{#if ../payloadTable}}, INPUT-OUTPUT DATASET dsPayload{{/if}}).
    END.
    {{/each}}
  END CASE.

  RETURN ttWorkflowContext.Status.
END PROCEDURE.

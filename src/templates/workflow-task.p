@openapi.openedge.export FILE (TYPE="REST", executionMode="EXTERNAL").

/* Task handler: {{name}}{{#if description}} — {{description}}{{/if}}
   Workflow: {{workflowName}} */

DEFINE TEMP-TABLE ttWorkflowContext NO-UNDO
  FIELD WorkflowId    AS CHARACTER
  FIELD CurrentStep   AS CHARACTER
  FIELD Status        AS CHARACTER
  FIELD StartedDate   AS DATETIME
  FIELD CompletedDate AS DATETIME
  FIELD AssignedTo    AS CHARACTER.

DEFINE DATASET dsWorkflow FOR ttWorkflowContext.

{{#if payloadTable}}
DEFINE TEMP-TABLE ttPayload LIKE {{payloadTable}}.
DEFINE DATASET dsPayload FOR ttPayload.
{{/if}}

@openapi.openedge.export(TYPE="REST").
PROCEDURE {{name}}Task:
  DEFINE INPUT-OUTPUT PARAMETER DATASET FOR dsWorkflow.
  {{#if payloadTable}}
  DEFINE INPUT-OUTPUT PARAMETER DATASET FOR dsPayload.
  {{/if}}

  FIND FIRST ttWorkflowContext.
  {{#if nextStatus}}
  ASSIGN ttWorkflowContext.Status = "{{nextStatus}}".
  {{/if}}
  {{#if nextStep}}
  ASSIGN ttWorkflowContext.CurrentStep = "{{nextStep}}".
  {{/if}}

  /* TODO: implement task logic */

  RETURN.
END PROCEDURE.

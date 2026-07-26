/* Task handler: {{name}} */
/* Workflow: {{workflowName}} */

DEFINE INPUT PARAMETER pcContext AS CHARACTER NO-UNDO.
DEFINE OUTPUT PARAMETER pcResult AS CHARACTER NO-UNDO.

{{#if description}}
/* {{description}} */
{{/if}}

/* TODO: implement task logic */
pcResult = pcContext.

RETURN.

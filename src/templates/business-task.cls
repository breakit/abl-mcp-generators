@openapi.openedge.export FILE (TYPE="REST", executionMode="SINGLETON").
{{#if description}}/* {{description}} */{{/if}}
CLASS {{package}}.tasks.{{name}}:

  DEFINE TEMP-TABLE tt{{name}}Input NO-UNDO
    {{#each inputFields}}
    FIELD {{name}} AS {{dataType}}
    {{/each}}.
  DEFINE DATASET ds{{name}}Input FOR tt{{name}}Input.

  DEFINE TEMP-TABLE tt{{name}}Output NO-UNDO
    FIELD StatusCode    AS CHARACTER
    FIELD StatusMessage AS CHARACTER
    {{#each outputFields}}
    FIELD {{name}} AS {{dataType}}
    {{/each}}.
  DEFINE DATASET ds{{name}}Output FOR tt{{name}}Output.

  @openapi.openedge.export(TYPE="REST", useReturnValue="TRUE").
  METHOD PUBLIC CHARACTER Execute(
    INPUT  DATASET FOR ds{{name}}Input,
    OUTPUT DATASET FOR ds{{name}}Output):

    FIND FIRST tt{{name}}Input.
    IF AVAILABLE tt{{name}}Input THEN DO:
      CREATE tt{{name}}Output.
      ASSIGN
        tt{{name}}Output.StatusCode    = "SUCCESS"
        tt{{name}}Output.StatusMessage = "Completed".
    END.
    ELSE DO:
      CREATE tt{{name}}Output.
      ASSIGN
        tt{{name}}Output.StatusCode    = "ERROR"
        tt{{name}}Output.StatusMessage = "No input data provided".
    END.

    /* TODO: implement task business logic */

    RETURN tt{{name}}Output.StatusCode.
  END METHOD.

END CLASS.

@openapi.openedge.export FILE (TYPE="REST", executionMode="SINGLETON").
CLASS {{package}}.{{name}} INHERITS OpenEdge.BusinessLogic.BusinessEntity:
  {{#if description}}/* {{description}} */{{/if}}

  DEFINE TEMP-TABLE tt{{name}} LIKE {{tableName}}.
  DEFINE DATASET ds{{name}} FOR tt{{name}}.

  @openapi.openedge.export(TYPE="REST", useReturnValue="TRUE").
  METHOD OVERRIDE PUBLIC HANDLE GetData(
    INPUT request AS OpenEdge.BusinessLogic.IGetDataRequest):

    DEFINE VARIABLE hBuffer AS HANDLE NO-UNDO.
    DEFINE VARIABLE hQuery  AS HANDLE NO-UNDO.

    EMPTY TEMP-TABLE tt{{name}}.

    hBuffer = DATASET ds{{name}}:GET-BUFFER-HANDLE(1).
    hQuery = hBuffer:QUERY-PREPARE("FOR EACH {{tableName}}").
    hQuery:QUERY-OPEN().

    REPEAT:
      hBuffer:BUFFER-COPY(hQuery).
      IF hQuery:QUERY-OFF-END THEN LEAVE.
      hQuery:GET-NEXT().
    END.

    hQuery:QUERY-CLOSE().
    RETURN DATASET ds{{name}}:HANDLE.
  END METHOD.

  @openapi.openedge.export(TYPE="REST").
  METHOD OVERRIDE PUBLIC LOGICAL UpdateData(
    INPUT DATASET FOR ds{{name}}):

    {{#each fields}}
    DEFINE BUFFER b{{name}} FOR {{../tableName}}.
    {{/each}}

    FOR EACH tt{{name}}:
      IF ROW-STATE(tt{{name}}) = ROW-CREATED THEN DO:
        {{#each fields}}IF tt{{../name}}.{{name}} <> ? THEN b{{name}}.{{name}} = tt{{../name}}.{{name}}.
        {{/each}}
        RELEASE b{{name}}.
      END.
      ELSE IF ROW-STATE(tt{{name}}) = ROW-MODIFIED THEN DO:
        FIND b{{name}}.
        {{#each fields}}IF tt{{../name}}.{{name}} <> ? THEN b{{name}}.{{name}} = tt{{../name}}.{{name}}.
        {{/each}}
        RELEASE b{{name}}.
      END.
      ELSE IF ROW-STATE(tt{{name}}) = ROW-DELETED THEN DO:
        FIND b{{name}}.
        DELETE b{{name}}.
      END.
    END.

    RETURN TRUE.
  END METHOD.

END CLASS.

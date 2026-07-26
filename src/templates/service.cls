@openapi.openedge.export FILE (TYPE="REST", executionMode="SINGLETON").
CLASS {{package}}.{{name}}Service:

  /* Business logic service for {{entityName}} */

  @openapi.openedge.export(TYPE="REST", useReturnValue="TRUE").
  METHOD PUBLIC static {{entityName}} GetById(pId AS CHARACTER):
    RETURN {{entityName}}:Read(pId).
  END METHOD.

  @openapi.openedge.export(TYPE="REST", useReturnValue="TRUE").
  METHOD PUBLIC static {{entityName}} Create():
    RETURN {{entityName}}:Create().
  END METHOD.

  @openapi.openedge.export(TYPE="REST").
  METHOD PUBLIC static LOGICAL Save(o{{entityName}} AS {{entityName}}):
    RETURN o{{entityName}}:Save().
  END METHOD.

  @openapi.openedge.export(TYPE="REST").
  METHOD PUBLIC static LOGICAL Delete(pId AS CHARACTER):
    DEFINE VARIABLE o AS {{entityName}} NO-UNDO.
    o = {{entityName}}:Read(pId).
    IF VALID-OBJECT(o) THEN RETURN o:Delete().
    RETURN FALSE.
  END METHOD.

END CLASS.

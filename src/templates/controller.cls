CLASS {{package}}.{{name}}Controller:

  /* Controller for {{entityName}} — handles UI/API interaction */

  METHOD PUBLIC static CHARACTER HandleGet(pId AS CHARACTER):
    DEFINE VARIABLE o{{entityName}} AS {{entityName}} NO-UNDO.
    o{{entityName}} = {{name}}Service:GetById(pId).
    IF VALID-OBJECT(o{{entityName}}) THEN RETURN o{{entityName}}:ToString().
    RETURN ?.
  END METHOD.

  METHOD PUBLIC static CHARACTER HandleCreate(INPUT pJson AS CHARACTER):
    DEFINE VARIABLE o{{entityName}} AS {{entityName}} NO-UNDO.
    o{{entityName}} = {{name}}Service:Create().
    /* TODO: populate from pJson */
    IF o{{entityName}}:Save() THEN RETURN "OK".
    RETURN "ERROR".
  END METHOD.

  METHOD PUBLIC static CHARACTER HandleDelete(pId AS CHARACTER):
    IF {{name}}Service:Delete(pId) THEN RETURN "OK".
    RETURN "ERROR".
  END METHOD.

END CLASS.

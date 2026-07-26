@openapi.openedge.export FILE (TYPE="REST", executionMode="SINGLETON").
CLASS {{package}}.{{name}}Controller
  INHERITS OpenEdge.Web.WebHandler:

  /* Controller for {{entityName}} */

  @openapi.openedge.export(TYPE="REST").
  METHOD OVERRIDE PROTECTED VOID HandleRequest(INPUT pcRequest AS CHARACTER):
    DEFINE VARIABLE oEntity AS {{entityName}} NO-UNDO.
    DEFINE VARIABLE oService AS {{entityName}}Service NO-UNDO.

    oService = NEW {{entityName}}Service().

    /* TODO: route pcRequest to appropriate method */
    SUPER:HandleRequest(pcRequest).
  END METHOD.

  @openapi.openedge.export(TYPE="REST", useReturnValue="TRUE").
  METHOD PUBLIC CHARACTER HandleGet(pId AS CHARACTER):
    RETURN {{entityName}}Service:GetById(pId):ToString().
  END METHOD.

  @openapi.openedge.export(TYPE="REST", useReturnValue="TRUE").
  METHOD PUBLIC CHARACTER HandleCreate(INPUT pJson AS CHARACTER):
    DEFINE VARIABLE oEntity AS {{entityName}} NO-UNDO.
    oEntity = {{entityName}}Service:Create().
    /* TODO: populate from pJson */
    IF oEntity:Save() THEN RETURN "OK".
    RETURN "ERROR".
  END METHOD.

  @openapi.openedge.export(TYPE="REST", useReturnValue="TRUE").
  METHOD PUBLIC CHARACTER HandleDelete(pId AS CHARACTER):
    IF {{entityName}}Service:Delete(pId) THEN RETURN "OK".
    RETURN "ERROR".
  END METHOD.

END CLASS.

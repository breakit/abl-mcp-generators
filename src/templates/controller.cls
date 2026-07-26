@openapi.openedge.export file (type="rest", executionmode="singleton").
class {{package}}.{{name}}controller
  inherits openedge.web.webhandler:

  /* controller for {{entityName}} */

  @openapi.openedge.export(type="rest").
  method override protected void handlerequest(input i-request-c as character):
    define variable l-entity-o  as {{entityName}} no-undo.
    define variable l-service-o as {{entityName}}service no-undo.

    l-service-o = new {{entityName}}service().

    /* todo: route i-request-c to appropriate method */
    super:handlerequest(i-request-c).
  end method.

  @openapi.openedge.export(type="rest", usereturnvalue="true").
  method public character handleget(i-id-c as character):
    return {{entityName}}service:getbyid(i-id-c):tostring().
  end method.

  @openapi.openedge.export(type="rest", usereturnvalue="true").
  method public character handlecreate(input i-json-c as character):
    define variable l-entity-o as {{entityName}} no-undo.
    l-entity-o = {{entityName}}service:create().
    /* todo: populate from i-json-c */
    if l-entity-o:save() then return "ok".
    return "error".
  end method.

  @openapi.openedge.export(type="rest", usereturnvalue="true").
  method public character handledelete(i-id-c as character):
    if {{entityName}}service:delete(i-id-c) then return "ok".
    return "error".
  end method.

end class.

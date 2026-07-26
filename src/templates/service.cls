@openapi.openedge.export file (type="rest", executionmode="singleton").
class {{package}}.{{name}}service:

  /* business logic service for {{entityName}} */

  @openapi.openedge.export(type="rest", usereturnvalue="true").
  method public static {{entityName}} getbyid(i-id-c as character):
    return {{entityName}}:read(i-id-c).
  end method.

  @openapi.openedge.export(type="rest", usereturnvalue="true").
  method public static {{entityName}} create():
    return {{entityName}}:create().
  end method.

  @openapi.openedge.export(type="rest").
  method public static logical save(o-{{kebabName}}-o as {{entityName}}):
    return o-{{kebabName}}-o:save().
  end method.

  @openapi.openedge.export(type="rest").
  method public static logical delete(i-id-c as character):
    define variable l-entity-o as {{entityName}} no-undo.
    l-entity-o = {{entityName}}:read(i-id-c).
    if valid-object(l-entity-o) then return l-entity-o:delete().
    return false.
  end method.

end class.

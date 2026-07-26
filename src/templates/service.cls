@openapi.openedge.export file (type="rest", executionmode="singleton").
class {{package}}.{{name}}service:

  /* business logic service for {{entityName}} */

  { {{kebabName}}-contract.i }
  define variable l-be-o as {{entityName}} no-undo.

  /*
   * multi-tenant / security context — uncomment for your security framework.
   *
   *   define variable l-tenant-id   as character no-undo.
   *   define variable l-user-id     as character no-undo.
   *   define variable l-role-list-c as character no-undo.
   */

  constructor public {{name}}service():
    l-be-o = new {{entityName}}().
    /*
     * todo: initialize security context from session:
     *   assign l-tenant-id   = session:current-request-info:getcontextvalue("tenant")
     *          l-user-id     = session:current-request-info:getcontextvalue("user")
     *          l-role-list-c = session:current-request-info:getcontextvalue("roles").
     */
  end constructor.

  /*
   * listall — return all records via BE, scoped to current tenant.
   * todo: add tenant filtering:
   *   /* BE handles tenant filtering internally via GetData override */.
   *   /* or pass a request object with tenant filter */.
   *   define variable l-req as openedge.businesslogic.igetdatarequest no-undo.
   *   l-req = new openedge.businesslogic.getdatarequest().
   *   l-req:setfilter(substitute("where tenantid = '&1'", l-tenant-id)).
   *   return l-be-o:getdata(l-req).
   */
  @openapi.openedge.export(type="rest", usereturnvalue="true").
  method public handle listall():
    empty temp-table l-{{kebabName}}-tt.
    return l-be-o:getdata(?).
  end method.

  /*
   * create — persist new record, enforce tenant scope.
   * todo: check authorization and assign tenant:
   *   if not checkauthorization("create") then
   *     return ?.
   *
   *   find first l-{{kebabName}}-tt.
   *   assign l-{{kebabName}}-tt.tenantid = l-tenant-id.
   */
  @openapi.openedge.export(type="rest", usereturnvalue="true").
  method public handle create(
    input-output dataset for l-{{kebabName}}-ds):

    l-be-o:updatedata(input dataset l-{{kebabName}}-ds).
    return dataset l-{{kebabName}}-ds:handle.
  end method.

  /*
   * update — persist modifications, verify tenant ownership.
   * todo: add authorization check:
   *   if not checkauthorization("write") then
   *     return false.
   */
  @openapi.openedge.export(type="rest").
  method public logical update(
    input-output dataset for l-{{kebabName}}-ds):

    return l-be-o:updatedata(input dataset l-{{kebabName}}-ds).
  end method.

  /*
   * delete — remove records, verify tenant ownership.
   * todo: add authorization + tenant-scope check:
   *   if not checkauthorization("delete") then
   *     return false.
   */
  @openapi.openedge.export(type="rest").
  method public logical delete(
    input-output dataset for l-{{kebabName}}-ds):

    return l-be-o:deletedata(input dataset l-{{kebabName}}-ds).
  end method.

  /*
   * validate — business rules + cross-tenant guard.
   * todo: add tenant-scope validation:
   *   for each l-{{kebabName}}-tt:
   *     /* field-level validation */.
   *     if l-{{kebabName}}-tt.tenantid <> l-tenant-id then
   *       return false.
   *   end.
   */
  @openapi.openedge.export(type="rest").
  method public logical validate(
    input dataset for l-{{kebabName}}-ds):

    /* todo: add business validation rules */
    return true.
  end method.

  /*
   * checkauthorization — verify role-based access for the current operation.
   * todo: implement access control:
   *   define variable i-cnt as integer no-undo.
   *   i-cnt = num-entries(l-role-list-c).
   *   do i-cnt = 1 to i-cnt:
   *     if lookup(entry(i-cnt, l-role-list-c), "admin,poweruser") > 0 then
   *       return true.
   *   end.
   *
   *   case i-operation-c:
   *     when "create" or when "write" or when "delete" then do:
   *       /* only admins/powerusers can modify */.
   *       return false.
   *     end.
   *   end case.
   *
   *   return true.
   */
  method protected logical checkauthorization(
    input i-operation-c as character):

    /* todo: implement authorization logic */
    return true.
  end method.

end class.

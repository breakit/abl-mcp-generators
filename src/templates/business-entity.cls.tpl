@openapi.openedge.export file (type="rest", executionmode="singleton").
class {{package}}.{{name}} inherits openedge.businesslogic.businessentity:
  {{#if description}}/* {{description}} */{{/if}}

  /* shared data contract */
  { {{kebabName}}-contract.i }

  /*
   * logging / metrics — uncomment and customize:
   *   { logging-contract.i }  /* see security-contract.i for logging/metrics patterns */.
   *
   *   /* metric counters — uncomment for tracking */.
   *   define variable l-metrics-tt as handle no-undo. /* temp-table handle for metrics */.
   *
   *   /* convenience — log with source prefix */.
   *   define variable l-log-source-c as character no-undo initial "{{name}}".
   */

  /*
   * multi-tenant / security context — set in constructor or via framework.
   * uncomment and add to your security framework:
   *
   *   define variable l-tenant-id   as character no-undo. /* from session:current-request-info:getcontextvalue("tenant") */.
   *   define variable l-user-id     as character no-undo. /* from session:current-request-info:getcontextvalue("user")   */.
   *   define variable l-role-list-c as character no-undo. /* comma-separated list of user roles */.
   */

  /*
   * getdata — retrieve records into the dataset, filtered by tenant.
   * todo: add where clause, sorting, pagination using request properties:
   *   define variable l-filter-c as character no-undo.
   *   l-filter-c = substitute("where tenantid = '&1'", l-tenant-id).
   *   if request:getfilter() <> "" then l-filter-c = l-filter-c + " and " + request:getfilter().
   *   l-query-h = l-buffer-h:query-prepare(substitute(
   *     "for each {{tableName}} &1 by {{#each fields}}{{#first}}{{name}}{{/first}}{{/each}}", l-filter-c)).
   *   /* for pagination: request:rowspertable, request:startrow */.
   */
  @openapi.openedge.export(type="rest", usereturnvalue="true").
  method override public handle getdata(
    input request as openedge.businesslogic.igetdatarequest):

    define variable l-buffer-h as handle no-undo.
    define variable l-query-h as handle no-undo.

    /* metrics: {&metric-start} */.
    empty temp-table l-{{kebabName}}-tt.

    l-buffer-h = dataset l-{{kebabName}}-ds:get-buffer-handle(1).
    l-query-h = l-buffer-h:query-prepare("for each {{tableName}}").
    l-query-h:query-open().

    l-query-h:get-first().
    repeat:
      if l-query-h:query-off-end then leave.
      l-buffer-h:buffer-copy(l-query-h).
      l-query-h:get-next().
    end.

    l-query-h:query-close().
    /* {&metric-end}("getdata") */.
    return dataset l-{{kebabName}}-ds:handle.
  end method.

  /*
   * createdata — create a new record, assign tenant ownership.
   * todo: set tenant and audit fields:
   *   assign l-{{kebabName}}-tt.tenantid    = l-tenant-id
   *          l-{{kebabName}}-tt.createdby   = l-user-id
   *          l-{{kebabName}}-tt.createddate = today
   *          l-{{kebabName}}-tt.updatedby   = l-user-id
   *          l-{{kebabName}}-tt.updateddate = today.
   */
  @openapi.openedge.export(type="rest", usereturnvalue="true").
  method override public handle createdata(
    input request as openedge.businesslogic.icreatedatarequest):

    empty temp-table l-{{kebabName}}-tt.
    create l-{{kebabName}}-tt.
    /* log: {&log-debug}(l-log-source-c, substitute("createdata: new row for &1", l-tenant-id)) */.
    return dataset l-{{kebabName}}-ds:handle.
  end method.

  /*
   * updatedata — persist dataset changes.
   * todo: add tenant-scope and authorization checks:
   *   /* check authorization */.
   *   if not checkauthorization("write") then return false.
   *
   *   /* verify tenant ownership for modified rows */.
   *   for each l-{{kebabName}}-tt where row-state(l-{{kebabName}}-tt) = row-modified:
   *     find {{tableName}} where {{tableName}}.id = l-{{kebabName}}-tt.id no-lock.
   *     if available {{tableName}} and {{tableName}}.tenantid <> l-tenant-id then do:
   *       this:error:adderror("cross-tenant access denied", "auth").
   *       return false.
   *     end.
   *   end.
   *
   * todo: add error handling:
   *   catch e as progress.lang.error:
   *     this:error:adderror(trim(e:getmessage(1)), "save failed").
   *     return false.
   *   end catch.
   */
  @openapi.openedge.export(type="rest").
  method override public logical updatedata(
    input dataset for l-{{kebabName}}-ds):

    define variable l-result-l as logical no-undo initial true.
    define buffer l-{{kebabName}}-buf for {{tableName}}.

    for each l-{{kebabName}}-tt:
      case row-state(l-{{kebabName}}-tt):
        when row-created then do:
          create l-{{kebabName}}-buf.
          {{#each fields}}if l-{{kebabName}}-tt.{{name}} <> ? then l-{{kebabName}}-buf.{{name}} = l-{{kebabName}}-tt.{{name}}.
          {{/each}}
          release l-{{kebabName}}-buf.
        end.
        when row-modified then do:
          find l-{{kebabName}}-buf.
          {{#each fields}}if l-{{kebabName}}-tt.{{name}} <> ? then l-{{kebabName}}-buf.{{name}} = l-{{kebabName}}-tt.{{name}}.
          {{/each}}
          release l-{{kebabName}}-buf.
        end.
        when row-deleted then do:
          find l-{{kebabName}}-buf.
          delete l-{{kebabName}}-buf.
        end.
      end case.
    end.

    /* todo: log errors + record metric:
     *   if error-status:error then do:
     *     {&log-error}(l-log-source-c, error-status:get-message(1)).
     *     {&metric-end}("updatedata").
     *     return false.
     *   end.
     */
    return l-result-l.
  end method.

  /*
   * deletedata — remove records, with tenant-scope enforcement.
   * todo: verify tenant ownership before deletion:
   *   for each l-{{kebabName}}-tt where row-state(l-{{kebabName}}-tt) = row-deleted:
   *     find {{tableName}} where {{tableName}}.id = l-{{kebabName}}-tt.id exclusive-lock no-wait no-error.
   *     if available {{tableName}} then do:
   *       if {{tableName}}.tenantid <> l-tenant-id then do:
   *         this:error:adderror("cross-tenant access denied", "auth").
   *         return false.
   *       end.
   *       delete {{tableName}}.
   *     end.
   *   end.
   */
  @openapi.openedge.export(type="rest").
  method override public logical deletedata(
    input dataset for l-{{kebabName}}-ds):

    define buffer l-{{kebabName}}-buf for {{tableName}}.

    for each l-{{kebabName}}-tt:
      if row-state(l-{{kebabName}}-tt) = row-deleted then do:
        find l-{{kebabName}}-buf.
        delete l-{{kebabName}}-buf.
      end.
    end.

    /* {&metric-end}("deletedata") */.
    return true.
  end method.

  /*
   * checkauthorization — verify the current user has permission.
   * todo: implement role-based access control:
   *   define variable i-cnt as integer no-undo.
   *   i-cnt = num-entries(l-role-list-c).
   *   do i-cnt = 1 to i-cnt:
   *     if lookup(entry(i-cnt, l-role-list-c), "admin,poweruser,user") > 0 then
   *       return true.
   *   end.
   *   this:error:adderror("insufficient privileges", "auth").
   *   return false.
   */
  method protected logical checkauthorization(
    input i-operation-c as character):

    /* todo: implement authorization logic */
    return true.
  end method.

  /*
   * getcurrenttenant — resolve tenant identifier from session context.
   * todo: integrate with your multi-tenancy framework:
   *   return session:current-request-info:getcontextvalue("tenant").
   *   /* or from client-principal */.
   *   return security-policy:getclientprincipal("abl"):sealed-attributes:getvalue("tenant-id").
   */
  method protected character getcurrenttenant():

    /* todo: implement tenant resolution */
    return "".
  end method.

end class.

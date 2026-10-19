@openapi.openedge.export file (type="rest", executionmode="singleton").
class {{package}}.{{name}}controller
  inherits openedge.web.webhandler:

  /* controller for {{entityName}} */

  define variable l-service-o as {{entityName}}service no-undo.

  /* logging — uncomment:
   *   define variable l-log-source-c as character no-undo initial "{{name}}controller".
   */

  constructor public {{name}}controller():
    l-service-o = new {{entityName}}service().
    /* todo: log request start + record metric:
     *   {&log-info}(l-log-source-c, "controller initialized").
     */
  end constructor.

  /*
   * handlerequest — main entry point, dispatch to specific handlers.
   * todo: implement method-based routing:
   *   define variable l-method-c as character no-undo.
   *   define variable l-path-c   as character no-undo.
   *   /* parse request: l-method-c = entry(1, i-request-c, " ") */.
   *   /* parse path:   l-path-c   = entry(2, i-request-c, " ") */.
   *   case l-method-c:
   *     when "GET":    then return handleget(l-path-c).
   *     when "POST":   then return handlecreate(i-request-c).
   *     when "PUT":    then return handleupdate(i-request-c).
   *     when "DELETE": then return handledelete(entry(3, i-request-c, " ")).
   *   end case.
   */
  @openapi.openedge.export(type="rest").
  method override protected void handlerequest(
    input i-request-c as character):

    /* log: {&log-info}(l-log-source-c, substitute("handlerequest: &1", i-request-c)) */.
    /* metrics: {&metric-start} ... {&metric-end}("handlerequest") */.
    /* todo: parse i-request-c http method and path, route accordingly */
    super:handlerequest(i-request-c).
  end method.

  /*
   * handleget — retrieve records, optionally filtered by id.
   * todo: return json serialization:
   *   define variable l-json-c as longchar no-undo.
   *   define variable h-dataset as handle no-undo.
   *   h-dataset = l-service-o:listall().
   *   h-dataset:write-json("longchar", l-json-c).
   *   return l-json-c.
   */
  @openapi.openedge.export(type="rest", usereturnvalue="true").
  method public character handleget(input i-id-c as character):

    define variable h-dataset as handle no-undo.
    h-dataset = l-service-o:listall().
    /* todo: filter by i-id-c and serialize result */
    return "ok".
  end method.

  /*
   * handlecreate — create a new record from json payload.
   * todo: parse json input:
   *   define variable l-json-ob as json.object no-undo.
   *   define variable l-buffer-h as handle no-undo.
   *   l-json-ob = new json.object().
   *   l-json-ob:read(i-json-c).
   *   l-buffer-h = dataset l-service-o:listall():get-buffer-handle(1).
   *   l-buffer-h:read-json("jsonobject", l-json-ob).
   *   l-service-o:create(input-output dataset by-reference).
   */
  @openapi.openedge.export(type="rest", usereturnvalue="true").
  method public character handlecreate(input i-json-c as character):

    define variable h-dataset as handle no-undo.
    h-dataset = l-service-o:listall().
    /* todo: populate from i-json-c, call l-service-o:create() */
    return "ok".
  end method.

  /*
   * handleupdate — update an existing record from json payload.
   * todo: parse json and populate dataset (see handlecreate example).
   */
  @openapi.openedge.export(type="rest", usereturnvalue="true").
  method public character handleupdate(input i-json-c as character):

    define variable h-dataset as handle no-undo.
    h-dataset = l-service-o:listall().
    /* todo: populate from i-json-c, call l-service-o:update() */
    return "ok".
  end method.

  /*
   * handledelete — delete a record by id.
   * todo: find and delete matching row:
   *   define variable h-dataset as handle no-undo.
   *   define variable l-buffer-h as handle no-undo.
   *   h-dataset = l-service-o:listall().
   *   l-buffer-h = h-dataset:get-buffer-handle(1).
   *   l-buffer-h:find-unique(substitute("where id = &1", i-id-c), no-lock).
   *   if l-buffer-h:available then do:
   *     l-buffer-h:buffer-delete().
   *     l-service-o:delete(input-output dataset by-reference).
   *   end.
   */
  @openapi.openedge.export(type="rest", usereturnvalue="true").
  method public character handledelete(input i-id-c as character):

    define variable h-dataset as handle no-undo.
    h-dataset = l-service-o:listall().
    /* todo: populate with row to delete, call l-service-o:delete() */
    return "ok".
  end method.

end class.

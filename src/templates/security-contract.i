/*
 * security-contract.i — shared security context definitions.
 * include in classes that need tenant isolation and authorization checks.
 *   { security-contract.i }
 *
 * uncomment and customize for your security framework
 */

/* tenant and audit fields — uncomment and add to your temp-tables:
 *
 * define temp-table security-context-tt no-undo
 *   field tenantid    as character
 *   field userid      as character
 *   field rolelist    as character
 *   field sessionid   as character.
 * define dataset security-context-ds for security-context-tt.
 *
 * /* audit fields — add to data tables */.
 * define temp-table audit-fields-tt no-undo
 *   field tenantid    as character initial "default"
 *   field createdby   as character
 *   field createddate as date     initial today
 *   field updatedby   as character
 *   field updateddate as date     initial today.
 */

/*
 * getcurrenttenant — resolve tenant from session, client-principal, or header.
 * example implementations:
 *
 *   /* from PASOE request context */.
 *   return session:current-request-info:getcontextvalue("tenant").
 *
 *   /* from client-principal sealed attributes */.
 *   return security-policy:getclientprincipal("abl")
 *     :sealed-attributes:getvalue("tenant-id").
 *
 *   /* from http header (cgi) */.
 *   return get-cgi-value("X-Tenant-Id").
 */

/*
 * getcurrentuser — resolve user identity from session.
 * example:
 *
 *   return session:current-request-info:getcontextvalue("user").
 *   /* or */.
 *   return security-policy:getclientprincipal("abl"):userid.
 */

/*
 * getcurrentroles — resolve role list for authorization.
 * example:
 *
 *   return session:current-request-info:getcontextvalue("roles").
 */

/*
 * checkauthorization — role-based access check.
 * example:
 *
 *   function checkauthorization returns logical(input i-role-c as character):
 *     define variable i-cnt as integer no-undo.
 *     i-cnt = num-entries(l-role-list-c).
 *     do i-cnt = 1 to i-cnt:
 *       if lookup(entry(i-cnt, l-role-list-c), i-role-c) > 0 then
 *         return true.
 *     end.
 *     return false.
 *   end.
 */

/*
 * logging-contract.i — shared logging and metrics utilities.
 * include: { logging-contract.i }
 */

/* log levels */
/* uncomment and customize for your logging framework:
 *
 *   &scoped-define log-level-debug 1
 *   &scoped-define log-level-info  2
 *   &scoped-define log-level-warn  3
 *   &scoped-define log-level-error 4
 *   &scoped-define log-level current {&log-level-info}
 *
 *   /* simple file-based logger */.
 *   procedure writelog:
 *     define input parameter i-level-i  as integer  no-undo.
 *     define input parameter i-source-c as character no-undo.
 *     define input parameter i-message-c as character no-undo.
 *
 *     if i-level-i < {&log-level} then return.
 *
 *     output to value(session:temp-dir + "/app.log") append.
 *     put unformatted
 *       iso-date(now) " " string(time, "hh:mm:ss")
 *       " [" entry(i-level-i, "debug,info,warn,error") + "]"
 *       " " i-source-c
 *       " " i-message-c skip.
 *     output close.
 *   end procedure.
 *
 *   /* structured log entry — json lines for log aggregation */.
 *   procedure writestructuredlog:
 *     define input parameter i-level-i    as integer  no-undo.
 *     define input parameter i-source-c   as character no-undo.
 *     define input parameter i-message-c  as character no-undo.
 *     define input parameter i-tenant-c   as character no-undo.
 *     define input parameter i-user-c     as character no-undo.
 *     define input parameter i-duration-i as integer  no-undo.
 *
 *     define variable l-json-ob as json.object no-undo.
 *     l-json-ob = new json.object().
 *     l-json-ob:add("timestamp",  iso-date(now) + "T" + string(time, "hh:mm:ss")).
 *     l-json-ob:add("level",      entry(i-level-i, "debug,info,warn,error")).
 *     l-json-ob:add("source",     i-source-c).
 *     l-json-ob:add("message",    i-message-c).
 *     l-json-ob:add("tenant",     i-tenant-c).
 *     l-json-ob:add("user",       i-user-c).
 *     l-json-ob:add("durationMs", i-duration-i).
 *
 *     output to value(session:temp-dir + "/app.jsonl") append.
 *     put unformatted l-json-ob:write() skip.
 *     output close.
 *
 *     delete object l-json-ob.
 *   end procedure.
 *
 *   /* metrics — simple timing and counting */.
 *   define temp-table metrics-tt no-undo
 *     field operation-c  as character
 *     field call-count-i as integer   initial 0
 *     field total-time-i as integer   initial 0
 *     field last-time-i  as integer   initial 0
 *     field error-count-i as integer  initial 0
 *     field last-error-c as character
 *     index operation-idx is primary unique operation-c.
 *   define dataset metrics-ds for metrics-tt.
 *
 *   procedure recordmetric:
 *     define input parameter i-operation-c as character no-undo.
 *     define input parameter i-elapsed-i   as integer  no-undo.
 *     define input parameter i-success-l   as logical  no-undo.
 *
 *     find first metrics-tt where metrics-tt.operation-c = i-operation-c exclusive-lock no-error.
 *     if not available metrics-tt then do:
 *       create metrics-tt.
 *       assign metrics-tt.operation-c = i-operation-c.
 *     end.
 *     assign metrics-tt.call-count-i = metrics-tt.call-count-i + 1
 *            metrics-tt.total-time-i = metrics-tt.total-time-i + i-elapsed-i
 *            metrics-tt.last-time-i  = i-elapsed-i.
 *     if not i-success-l then
 *       assign metrics-tt.error-count-i = metrics-tt.error-count-i + 1.
 *     release metrics-tt.
 *   end procedure.
 *
 *   procedure reportmetrics:
 *     define output parameter dataset for metrics-ds.
 *   end procedure.
 */

/* convenience macros — uncomment:
 *
 *   &scoped-define log-debug(src, msg)  run writelog({&log-level-debug}, src, msg)
 *   &scoped-define log-info(src, msg)   run writelog({&log-level-info},  src, msg)
 *   &scoped-define log-warn(src, msg)   run writelog({&log-level-warn},  src, msg)
 *   &scoped-define log-error(src, msg)  run writelog({&log-level-error}, src, msg)
 *
 *   /* usage: {&log-info}("CustomerBE:getdata", substitute("retrieved &1 rows", l-count-i)) */.
 *
 *   /* metric collection pattern */.
 *   &scoped-define metric-start  define variable l-met-start-i as integer no-undo. l-met-start-i = etime(true)
 *   &scoped-define metric-end(op) run recordmetric(input op, input etime - l-met-start-i, input not error-status:error)
 */


/* handler for {{queryFqn}} — read-only, must not change state; reads through the unchanged business entity */
class {{package}}.{{className}}:

  define variable l-be-o as {{entityFqn}} no-undo.

  constructor public {{className}}():
    l-be-o = new {{entityFqn}}().
  end constructor.

  /*
   * execute — turn the query criteria into a filter and read through the business entity.
   * todo: authorization; paging and sorting once the entity supports them.
   */
  method public handle execute(input i-query-o as {{queryFqn}}):
    define variable l-filter-c  as character no-undo.
    define variable l-request-o as openedge.businesslogic.getdatarequest no-undo.

    l-filter-c = "".
{{#each fields}}    l-filter-c = l-filter-c + (if l-filter-c > "" then " and " else "") + "{{name}} = " + {{#if quoted}}quoter(string(i-query-o:{{name}})){{else}}string(i-query-o:{{name}}){{/if}}.
{{/each}}    if l-filter-c > "" then l-filter-c = "where " + l-filter-c.

    /*
     * the request type follows the entity template's convention (igetdatarequest with a filter).
     * note: OpenEdge.BusinessLogic.GetDataRequest ships with 12.x, not 11.7 — on 11.7 supply your own
     * request class implementing that interface and adapt the two lines below.
     */
    l-request-o = new openedge.businesslogic.getdatarequest().
    l-request-o:setfilter(l-filter-c).
    return l-be-o:getdata(l-request-o).
  end method.

end class.

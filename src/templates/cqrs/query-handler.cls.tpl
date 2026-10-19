/* handler for {{queryFqn}} — read-only, must not change state */
class {{package}}.{{className}}:

  define variable l-be-o as {{entityFqn}} no-undo.

  constructor public {{className}}():
    l-be-o = new {{entityFqn}}().
  end constructor.

  /*
   * execute — run the query and return the result dataset.
   * todo: translate query properties into a filter for l-be-o:getdata().
   */
  method public handle execute(input i-query-o as {{queryFqn}}):
    /* todo: authorization, filtering */
    return l-be-o:getdata(?).
  end method.

end class.

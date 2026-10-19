/* handler for {{commandFqn}} — contains the write logic of the command */
class {{package}}.{{className}}:

  define variable l-be-o as {{entityFqn}} no-undo.

  constructor public {{className}}():
    l-be-o = new {{entityFqn}}().
  end constructor.

  /*
   * execute — apply the command.
   * todo: map command properties to the contract dataset ({ {{contractInclude}} })
   *       and call l-be-o:createdata / updatedata / deletedata.
   */
  method public logical execute(input i-command-o as {{commandFqn}}):
    /* todo: authorization, validation, persistence */
    return true.
  end method.

end class.

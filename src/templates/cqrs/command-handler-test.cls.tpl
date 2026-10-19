/* ablunit tests for {{handlerFqn}} */
using openedge.core.assert.

block-level on error undo, throw.

class {{package}}.{{className}}:

  define variable l-handler-o as {{handlerFqn}} no-undo.

  @Setup.
  method public void setup():
    l-handler-o = new {{handlerFqn}}().
    /* todo: prepare test data / session context */
  end method.

  @TearDown.
  method public void teardown():
    if valid-object(l-handler-o) then
      delete object l-handler-o.
  end method.

  @Test.
  method public void executeSucceeds():
    define variable l-command-o as {{commandFqn}} no-undo.
    define variable l-result-o  as {{resultFqn}} no-undo.

    l-command-o = new {{commandFqn}}().
{{#each fields}}    /* todo: l-command-o:{{name}} = <{{dataType}} test value>. */
{{/each}}
    l-result-o = l-handler-o:execute(l-command-o).

    assert:istrue(l-result-o:success).
{{#if isDelete}}    /* todo: assert that the record no longer exists */
{{else}}    /* todo: assert on the stored data */
{{/if}}  end method.

  @Test.
  @Ignore.
  method public void executeReportsErrors():
    define variable l-command-o as {{commandFqn}} no-undo.
    define variable l-result-o  as {{resultFqn}} no-undo.

    l-command-o = new {{commandFqn}}().
    /* todo: arrange an invalid command, then remove @Ignore */

    l-result-o = l-handler-o:execute(l-command-o).

    assert:isfalse(l-result-o:success).
  end method.

end class.

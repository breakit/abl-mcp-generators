/* handler for {{commandFqn}} — custom command{{#if task}}, delegates to the business task {{taskFqn}}{{/if}} */
class {{package}}.{{className}}:
{{#if task}}
  /* input of the task: must match the dataset of the task class */
  define temp-table l-input-tt no-undo
{{#each fields}}    field {{name}} as {{dataType}}
{{/each}}    .
  define dataset l-input-ds for l-input-tt.
  /* output of the task: add the extra output fields of the task here */
  define temp-table l-output-tt no-undo
    field statuscode    as character
    field statusmessage as character.
  define dataset l-output-ds for l-output-tt.

  define variable l-task-o as {{taskFqn}} no-undo.

  constructor public {{className}}():
    l-task-o = new {{taskFqn}}().
  end constructor.

  method public {{resultFqn}} execute(input i-command-o as {{commandFqn}}):
    define variable l-result-o as {{resultFqn}} no-undo.
    define variable l-status-c as character no-undo.
    l-result-o = new {{resultFqn}}().

    /* todo: authorization and business validation */

    empty temp-table l-input-tt.
    create l-input-tt.
{{#each fields}}    l-input-tt.{{name}} = i-command-o:{{name}}.
{{/each}}
    l-status-c = l-task-o:execute(input dataset l-input-ds, output dataset l-output-ds).
    if l-status-c <> "success" then do:
      find first l-output-tt no-error.
      l-result-o:addError(if available l-output-tt then l-output-tt.statusmessage else l-status-c).
    end.

    return l-result-o.
  end method.
{{else}}
  constructor public {{className}}():
    /* todo: initialise what the command needs (business entity, services, ...) */
  end constructor.

  method public {{resultFqn}} execute(input i-command-o as {{commandFqn}}):
    define variable l-result-o as {{resultFqn}} no-undo.
    l-result-o = new {{resultFqn}}().

    /* todo: implement the command; on failure: l-result-o:addError("...") */

    return l-result-o.
  end method.
{{/if}}
end class.

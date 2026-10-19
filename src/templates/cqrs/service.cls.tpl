@openapi.openedge.export file (type="rest", executionmode="singleton").
class {{package}}.{{className}}:

  /* facade for {{entityName}}: dispatches to command and query handlers, contains no logic itself */

{{#each commands}}  define variable l-{{handlerVar}}-o as {{handlerFqn}} no-undo.
{{/each}}{{#each queries}}  define variable l-{{handlerVar}}-o as {{handlerFqn}} no-undo.
{{/each}}
  constructor public {{className}}():
{{#each commands}}    l-{{handlerVar}}-o = new {{handlerFqn}}().
{{/each}}{{#each queries}}    l-{{handlerVar}}-o = new {{handlerFqn}}().
{{/each}}  end constructor.
{{#each commands}}
  /* command: {{operation}} */
  method public logical {{methodName}}(input i-command-o as {{messageFqn}}):
    return l-{{handlerVar}}-o:execute(i-command-o).
  end method.
{{/each}}{{#each queries}}
  /* query: {{operation}} */
  method public handle {{methodName}}(input i-query-o as {{messageFqn}}):
    return l-{{handlerVar}}-o:execute(i-query-o).
  end method.
{{/each}}
end class.

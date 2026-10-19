class {{package}}.{{name}}Test inherits openedge.ablunit.testcase:

  define variable h-entity-o as {{entityName}} no-undo.

  @BeforeAll.
  method public void beforeAll():
    h-entity-o = new {{entityName}}().
  end method.

  @AfterAll.
  method public void afterAll():
    if valid-object(h-entity-o) then
      delete object h-entity-o.
  end method.

  @Setup.
  method public void setup():
    h-entity-o:initData().
  end method.
{{#each methods}}
  @Test.
  method public void test{{methodName}}():{{#if hasParams}}
{{#each params}}
    define variable h-{{paramName}}-var as {{dataType}} no-undo.{{/each}}
{{/if}}{{#if hasReturnType}}
    define variable h-result as {{returnType}} no-undo.
{{/if}}
    /* todo: set up test preconditions */{{#if hasParams}}
    /* todo: assign test values to h-{{#each params}}{{#if notfirst}}, h-{{/if}}{{paramName}}-var{{/each}} */{{/if}}
{{#if hasReturnType}}
    h-result = h-entity-o:{{methodName}}({{#each params}}{{#if notfirst}}, {{/if}}input h-{{paramName}}-var{{/each}}).
    assert:not-unknown(h-result).
{{else}}
    h-entity-o:{{methodName}}({{#each params}}{{#if notfirst}}, {{/if}}input h-{{paramName}}-var{{/each}}).
    assert:true.
{{/if}}
  end method.

{{/each}}
end class.

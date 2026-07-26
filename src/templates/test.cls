class {{package}}.{{name}}test inherits openedge.ablunit.testcase:

  define temp-table l-{{kebabName}}-tt like {{tableName}}.
  define dataset l-{{kebabName}}-ds for l-{{kebabName}}-tt.

  define variable l-entity-o as {{entityName}} no-undo.

  @test.
  method public void testcreate():
    create l-{{kebabName}}-tt.
    {{#each fields}}
    l-{{kebabName}}-tt.{{name}} = ?. /* todo: set from {{name}} */{{/each}}
    assert:istrue(valid-handle(dataset l-{{kebabName}}-ds:handle)).
  end method.

  @test.
  method public void testsave():
    l-entity-o = {{entityName}}:create().
    assert:isnotnull(l-entity-o).
    {{#each fields}}
    {{#if initial}}l-entity-o:{{name}} = {{initial}}.  /* {{name}} */{{/if}}
    {{/each}}
    assert:istrue(l-entity-o:save()).
  end method.

  @test.
  method public void testread():
    l-entity-o = {{entityName}}:read("key").
    assert:isnotnull(l-entity-o).
  end method.

  @test.
  method public void testdelete():
    l-entity-o = {{entityName}}:read("key").
    if valid-object(l-entity-o) then
      assert:istrue(l-entity-o:delete()).
  end method.

end class.

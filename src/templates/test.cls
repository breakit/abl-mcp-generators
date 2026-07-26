class {{package}}.{{name}}test inherits openedge.ablunit.testcase:

  /* data contract — matches the service and business entity */
  { {{kebabName}}-contract.i }

  define variable l-service-o as {{entityName}}service no-undo.

  @setup.
  method public void setup():
    l-service-o = new {{entityName}}service().
    empty temp-table l-{{kebabName}}-tt.
  end method.

  /*
   * testcreate — verify that creating a record persists correctly.
   * todo: set valid test data:
   *   assign l-{{kebabName}}-tt.CustNum  = 1
   *          l-{{kebabName}}-tt.Name     = "test customer".
   *   l-service-o:create(input-output dataset l-{{kebabName}}-ds).
   *   assert:equal(row-state(l-{{kebabName}}-tt), 0).  /* row-unmodified = persisted */.
   */
  @test.
  method public void testcreate():
    create l-{{kebabName}}-tt.
    {{#each fields}}
    l-{{kebabName}}-tt.{{name}} = ?. /* todo: set test value for {{name}} */{{/each}}
    l-service-o:create(input-output dataset l-{{kebabName}}-ds).
    assert:notempty(temp-table l-{{kebabName}}-tt:handle).
    assert:equal(row-state(l-{{kebabName}}-tt), 0, "row-created rows should be persisted").
  end method.

  /*
   * testlist — verify that records can be retrieved.
   * example: after creating test data, verify row count:
   *   assert:greaterthan(l-buffer-h:num-results, 0, "should have records").
   */
  @test.
  method public void testlist():
    define variable h-dataset as handle no-undo.
    h-dataset = l-service-o:listall().
    assert:valid-handle(h-dataset).
  end method.

  /*
   * testupdate — verify that modifying a record persists correctly.
   * todo: create record first, then modify and verify:
   *   find first l-{{kebabName}}-tt.
   *   assign l-{{kebabName}}-tt.field = newvalue.
   *   l-service-o:update(input-output dataset l-{{kebabName}}-ds).
   *   /* re-read and verify */.
   */
  @test.
  method public void testupdate():
    create l-{{kebabName}}-tt.
    {{#each fields}}
    l-{{kebabName}}-tt.{{name}} = ?. /* todo: set test value for {{name}} */{{/each}}
    l-service-o:update(input-output dataset l-{{kebabName}}-ds).
    assert:true.
  end method.

  /*
   * testdelete — verify that deleting a record works.
   * todo: create a record, count rows, delete it, verify count decreased:
   *   define variable l-count-i as integer no-undo.
   *   /* count before */.
   *   delete l-{{kebabName}}-tt.
   *   l-service-o:delete(input-output dataset l-{{kebabName}}-ds).
   *   /* count after and verify */.
   */
  @test.
  method public void testdelete():
    create l-{{kebabName}}-tt.
    l-{{kebabName}}-tt.{{#each fields}}{{#first}}? /* delete row */{{/first}}{{/each}}
    delete l-{{kebabName}}-tt.
    l-service-o:delete(input-output dataset l-{{kebabName}}-ds).
    assert:true.
  end method.

  @teardown.
  method public void teardown():
    empty temp-table l-{{kebabName}}-tt.
  end method.

end class.

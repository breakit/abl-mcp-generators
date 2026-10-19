@openapi.openedge.export file (type="soap", executionmode="singleton").
class {{package}}.{{className}}:

  /* soap controller for {{entityName}} — operations take and return datasets, no json */

  define variable l-service-o as {{serviceFqn}} no-undo.

  constructor public {{className}}():
    l-service-o = new {{serviceFqn}}().
  end constructor.

  /*
   * listall — return all records.
   * todo: expose the dataset as output parameter of the web service operation.
   */
  @openapi.openedge.export(type="soap").
  method public void listall(output dataset-handle o-dataset-h):
    o-dataset-h = l-service-o:listall().
  end method.

  /* todo: getbyid — filter by key, return dataset */
  @openapi.openedge.export(type="soap").
  method public void getbyid(input i-id-c as character, output dataset-handle o-dataset-h):
    o-dataset-h = l-service-o:listall().
    /* todo: filter o-dataset-h by i-id-c */
  end method.

  /* todo: create — populate the dataset from the request, call the service */
  @openapi.openedge.export(type="soap").
  method public logical create(input dataset-handle io-dataset-h):
    /* todo: l-service-o:create(input-output dataset-handle io-dataset-h) */
    return true.
  end method.

  /* todo: update — apply row changes of the request dataset */
  @openapi.openedge.export(type="soap").
  method public logical update(input dataset-handle io-dataset-h):
    /* todo: l-service-o:update(input-output dataset-handle io-dataset-h) */
    return true.
  end method.

  /* todo: delete — remove rows of the request dataset */
  @openapi.openedge.export(type="soap").
  method public logical delete(input dataset-handle io-dataset-h):
    /* todo: l-service-o:delete(input-output dataset-handle io-dataset-h) */
    return true.
  end method.

end class.

/* legacy backend for {{name}} — monolithic: business logic, state for the webspeed page, json crud for rest */
class {{package}}.{{className}}:

  /* ---- public state, read directly by the webspeed page ---- */
{{#each fields}}  define public variable {{name}} as {{dataType}} no-undo.
{{/each}}
  /* todo: error state, paging info, other values the page renders */

  constructor public {{className}}():
    /* todo: initialise state / session context */
  end constructor.

  /* ---- business logic ---- */

  /* todo: load — fill the public variables for the page */
  method public logical load(input i-id-c as character):
    return true.
  end method.

  /* todo: validate / calculate / other business methods */

  /* ---- crud, json for the rest api ---- */

  method public longchar getAll():
    /* todo: read all rows, serialise to json */
    return "[]".
  end method.

  method public longchar getById(input i-id-c as character):
    /* todo: read one row, serialise to json */
    return "~{~}".
  end method.

  method public longchar create(input i-json-c as longchar):
    /* todo: parse json, create row, return the created row as json */
    return "~{~}".
  end method.

  method public longchar update(input i-id-c as character, input i-json-c as longchar):
    /* todo: parse json, update row, return the updated row as json */
    return "~{~}".
  end method.

  method public longchar delete(input i-id-c as character):
    /* todo: delete row, return a json status */
    return "~{~}".
  end method.

end class.

/* outcome of a command for {{entityName}}: success flag, error messages and the generated key, no business logic */
class {{package}}.{{className}}:

  define public property Success as logical no-undo get. set.
  define public property Errors as character no-undo get. set.
  /* todo: key of the created/changed record, if callers need it */
  define public property Key as character no-undo get. set.

  constructor public {{className}}():
    Success = true.
    Errors = "".
  end constructor.

  method public void addError(input i-message-c as character):
    Success = false.
    if Errors > "" then Errors = Errors + "~n".
    Errors = Errors + i-message-c.
  end method.

  /*
   * collecterrors — copy buffer-level errors (error-string of rows with the error attribute)
   * of a dataset, as set by the business entity after updatedata/deletedata.
   */
  method public void collecterrors(input i-dataset-h as handle):
    define variable l-buffer-h as handle  no-undo.
    define variable l-query-h  as handle  no-undo.
    define variable l-index-i  as integer no-undo.

    do l-index-i = 1 to i-dataset-h:num-buffers:
      l-buffer-h = i-dataset-h:get-buffer-handle(l-index-i).
      create query l-query-h.
      l-query-h:set-buffers(l-buffer-h).
      l-query-h:query-prepare("for each " + l-buffer-h:name).
      l-query-h:query-open().
      l-query-h:get-first().
      do while not l-query-h:query-off-end:
        if l-buffer-h:error then
          addError(l-buffer-h:error-string).
        l-query-h:get-next().
      end.
      l-query-h:query-close().
      delete object l-query-h.
    end.
  end method.

end class.

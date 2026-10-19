/* query: {{operation}} {{entityName}} — read request object, carries the selection criteria only */
class {{package}}.{{className}}:

{{#each fields}}  define public property {{name}} as {{dataType}} no-undo get. set.
{{/each}}
  /* todo: add paging / sorting criteria if needed */

end class.

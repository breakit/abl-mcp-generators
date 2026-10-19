/* query: {{operation}} {{entityName}} — read request object, carries the selection criteria only */
class {{package}}.{{className}}:

{{#each fields}}  define public property {{name}} as {{dataType}} no-undo get. set.
{{/each}}{{#if isList}}
  /* paging: 0 = not set. todo: pass to the request in the handler once the entity supports it */
  define public property Skip as integer no-undo initial 0 get. set.
  define public property Top  as integer no-undo initial 0 get. set.
{{/if}}
  /* todo: add sorting criteria if needed */

end class.

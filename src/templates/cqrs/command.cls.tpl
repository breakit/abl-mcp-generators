/* command: {{operation}} {{entityName}} — immutable-by-convention request object, carries data only */
class {{package}}.{{className}}:

{{#each fields}}  define public property {{name}} as {{dataType}} no-undo get. set.
{{/each}}
  /* todo: add constructor / validation if the command must be created in a valid state */

end class.

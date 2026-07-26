CLASS {{package}}.{{name}}:
  {{#if description}}
  /* {{description}} */
  {{/if}}

  DEFINE PUBLIC PROPERTY TableName AS CHARACTER INITIAL "{{tableName}}" GET. SET.

  {{#each fields}}
  DEFINE PUBLIC PROPERTY {{name}} AS {{dataType}}{{#if initial}} INITIAL {{initial}}{{/if}} GET. SET.
  {{/each}}

  CONSTRUCTOR PUBLIC {{name}}():
    SUPER().
  END CONSTRUCTOR.

  METHOD PUBLIC static {{name}} Create():
    DEFINE VARIABLE o AS {{name}} NO-UNDO.
    o = NEW {{name}}().
    RETURN o.
  END METHOD.

  METHOD PUBLIC static {{name}} Read(pKey AS CHARACTER):
    DEFINE VARIABLE o AS {{name}} NO-UNDO.
    o = NEW {{name}}().
    /* TODO: load from database */
    RETURN o.
  END METHOD.

  METHOD PUBLIC LOGICAL Save():
    /* TODO: save to database */
    RETURN TRUE.
  END METHOD.

  METHOD PUBLIC LOGICAL Delete():
    /* TODO: delete from database */
    RETURN TRUE.
  END METHOD.

END CLASS.

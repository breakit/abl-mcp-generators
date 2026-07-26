CLASS {{package}}.{{name}}Test INHERITS OpenEdge.ABLUnit.TestCase:

  DEFINE TEMP-TABLE tt{{entityName}} LIKE {{tableName}}.
  DEFINE DATASET ds{{entityName}} FOR tt{{entityName}}.

  DEFINE VARIABLE oEntity AS {{entityName}} NO-UNDO.

  @Test.
  METHOD PUBLIC VOID TestCreate():
    CREATE tt{{entityName}}.
    {{#each fields}}
    tt{{../entityName}}.{{name}} = ?. /* TODO: set from {{name}} */{{/each}}
    Assert:IsTrue(VALID-HANDLE(DATASET ds{{entityName}}:HANDLE)).
  END METHOD.

  @Test.
  METHOD PUBLIC VOID TestSave():
    oEntity = {{entityName}}:Create().
    Assert:IsNotNull(oEntity).
    {{#each fields}}
    {{#if initial}}oEntity:{{name}} = {{initial}}.  /* {{name}} */{{/if}}
    {{/each}}
    Assert:IsTrue(oEntity:Save()).
  END METHOD.

  @Test.
  METHOD PUBLIC VOID TestRead():
    oEntity = {{entityName}}:Read("key").
    Assert:IsNotNull(oEntity).
  END METHOD.

  @Test.
  METHOD PUBLIC VOID TestDelete():
    oEntity = {{entityName}}:Read("key").
    IF VALID-OBJECT(oEntity) THEN
      Assert:IsTrue(oEntity:Delete()).
  END METHOD.

END CLASS.

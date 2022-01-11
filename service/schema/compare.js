const dbHelper = require('../../util/dbHelper')
const mybatisMapper = require('mybatis-mapper')
const moment = require('moment')

function getIndexUpdated(db, versionOld, versionNew) {
  const query = `
SELECT  O.INDEX_SCHEMA,
        O.TABLE_NAME,
        O.INDEX_NAME,
        O.INDEX_COLUMNS INDEX_COLUMNS_OLD, N.INDEX_COLUMNS INDEX_COLUMNS_NEW,
        O.INDEX_TYPE INDEX_TYPE_OLD, N.INDEX_TYPE INDEX_TYPE_NEW,
        O.IS_UNIQUE IS_UNIQUE_OLD, N.IS_UNIQUE IS_UNIQUE_NEW
FROM    SCHEMA_INDEX O
        INNER JOIN SCHEMA_INDEX N
        ON O.TABLE_NAME = N.TABLE_NAME
        AND O.INDEX_NAME = N.INDEX_NAME
WHERE   O.VERSION = @versionOld
        AND N.VERSION = @versionNew
        AND (O.INDEX_COLUMNS != N.INDEX_COLUMNS
            OR O.INDEX_TYPE != N.INDEX_TYPE
            OR O.IS_UNIQUE != N.IS_UNIQUE)
`
  const result = db.prepare(query).all({ versionOld, versionNew })
  return { result, query }
}
function getIndexInserted(db, versionOld, versionNew) {
  const query = `
SELECT  N.INDEX_SCHEMA,
        N.TABLE_NAME,
        N.INDEX_NAME,
        N.INDEX_COLUMNS,
        N.INDEX_TYPE,
        N.IS_UNIQUE
FROM    (SELECT * FROM SCHEMA_INDEX WHERE VERSION = @versionNew) N
        LEFT JOIN (SELECT * FROM SCHEMA_INDEX WHERE VERSION = @versionOld) O
        ON N.TABLE_NAME = O.TABLE_NAME
        AND N.INDEX_NAME = O.INDEX_NAME
WHERE   O.VERSION IS NULL
`
  const result = db.prepare(query).all({ versionOld, versionNew })
  return { result, query }
}
function getIndexDeleted(db, versionOld, versionNew) {
  const query = `
SELECT  O.INDEX_SCHEMA,
        O.TABLE_NAME,
        O.INDEX_NAME,
        O.INDEX_COLUMNS,
        O.INDEX_TYPE,
        O.IS_UNIQUE
FROM    (SELECT * FROM SCHEMA_INDEX WHERE VERSION = @versionOld) O
        LEFT JOIN (SELECT * FROM SCHEMA_INDEX WHERE VERSION = @versionNew) N
        ON O.TABLE_NAME = N.TABLE_NAME
        AND O.INDEX_NAME = N.INDEX_NAME
WHERE   N.VERSION IS NULL
`
  const result = db.prepare(query).all({ versionOld, versionNew })
  return { result, query }
}

function getForeignKeyUpdated(db, versionOld, versionNew) {
  const query = `
SELECT  O.TABLE_SCHEMA,
        O.TABLE_NAME,
        O.CONSTRAINT_NAME,
        O.COLUMN_NAMES COLUMN_NAMES_OLD, N.COLUMN_NAMES COLUMN_NAMES_NEW,
        O.REFERENCED_TABLE_NAME REFERENCED_TABLE_NAME_OLD, N.REFERENCED_TABLE_NAME REFERENCED_TABLE_NAME_NEW,
        O.REFERENCED_COLUMN_NAMES REFERENCED_COLUMN_NAMES_OLD, N.REFERENCED_COLUMN_NAMES REFERENCED_COLUMN_NAMES_NEW
FROM    SCHEMA_FOREIGN_KEY O
        INNER JOIN SCHEMA_FOREIGN_KEY N
        ON O.TABLE_NAME = N.TABLE_NAME
        AND O.CONSTRAINT_NAME = N.CONSTRAINT_NAME
WHERE   O.VERSION = @versionOld
        AND N.VERSION = @versionNew
        AND (O.COLUMN_NAMES != N.COLUMN_NAMES
            OR O.REFERENCED_TABLE_NAME != N.REFERENCED_TABLE_NAME
            OR O.REFERENCED_COLUMN_NAMES != N.REFERENCED_COLUMN_NAMES)
`
  const result = db.prepare(query).all({ versionOld, versionNew })
  return { result, query }
}
function getForeignKeyInserted(db, versionOld, versionNew) {
  const query = `
SELECT  N.TABLE_SCHEMA,
        N.TABLE_NAME,
        N.CONSTRAINT_NAME,
        N.COLUMN_NAMES,
        N.REFERENCED_TABLE_NAME,
        N.REFERENCED_COLUMN_NAMES
FROM    (SELECT * FROM SCHEMA_FOREIGN_KEY WHERE VERSION = @versionNew) N
        LEFT JOIN (SELECT * FROM SCHEMA_FOREIGN_KEY WHERE VERSION = @versionOld) O
        ON N.TABLE_NAME = O.TABLE_NAME
        AND N.CONSTRAINT_NAME = O.CONSTRAINT_NAME
WHERE   O.VERSION IS NULL
`
  const result = db.prepare(query).all({ versionOld, versionNew })
  return { result, query }
}
function getForeignKeyDeleted(db, versionOld, versionNew) {
  const query = `
SELECT  O.TABLE_SCHEMA,
        O.TABLE_NAME,
        O.CONSTRAINT_NAME,
        O.COLUMN_NAMES,
        O.REFERENCED_TABLE_NAME,
        O.REFERENCED_COLUMN_NAMES
FROM    (SELECT * FROM SCHEMA_FOREIGN_KEY WHERE VERSION = @versionOld) O
        LEFT JOIN (SELECT * FROM SCHEMA_FOREIGN_KEY WHERE VERSION = @versionNew) N
        ON O.TABLE_NAME = N.TABLE_NAME
        AND O.CONSTRAINT_NAME = N.CONSTRAINT_NAME
WHERE   N.VERSION IS NULL
`
  const result = db.prepare(query).all({ versionOld, versionNew })
  return { result, query }
}

function getTableUpdated(db, versionOld, versionNew, ignoreOption) {
  const query = `
SELECT  O.TABLE_SCHEMA,
        O.TABLE_NAME,
        O.CREATE_TIME,
        O.UPDATE_TIME,
        O.TABLE_COLLATION TABLE_COLLATION_OLD, N.TABLE_COLLATION TABLE_COLLATION_NEW,
        O.TABLE_COMMENT TABLE_COMMENT_OLD, N.TABLE_COMMENT TABLE_COMMENT_NEW
FROM    SCHEMA_TABLE O
        INNER JOIN SCHEMA_TABLE N
        ON O.TABLE_NAME = N.TABLE_NAME
WHERE   O.VERSION = @versionOld
        AND N.VERSION = @versionNew
        AND (
              ('${ignoreOption.collation}' != 'true' AND O.TABLE_COLLATION != N.TABLE_COLLATION)
              OR O.TABLE_COMMENT != N.TABLE_COMMENT
            )
`
  const result = db.prepare(query).all({ versionOld, versionNew })
  return { result, query }
}
function getTableInserted(db, versionOld, versionNew) {
  const query = `
SELECT  N.TABLE_SCHEMA,
        N.TABLE_NAME,
        N.TABLE_COLLATION,
        N.CREATE_TIME,
        N.UPDATE_TIME,
        N.TABLE_COMMENT
FROM    (SELECT * FROM SCHEMA_TABLE WHERE VERSION = @versionNew) N
        LEFT JOIN (SELECT * FROM SCHEMA_TABLE WHERE VERSION = @versionOld) O
        ON N.TABLE_NAME = O.TABLE_NAME
WHERE   O.VERSION IS NULL
`
  const result = db.prepare(query).all({ versionOld, versionNew })
  return { result, query }
}
function getTableDeleted(db, versionOld, versionNew) {
  const query = `
SELECT  O.TABLE_SCHEMA,
        O.TABLE_NAME,
        O.TABLE_COLLATION,
        O.CREATE_TIME,
        O.UPDATE_TIME,
        O.TABLE_COMMENT
FROM    (SELECT * FROM SCHEMA_TABLE WHERE VERSION = @versionOld) O
        LEFT JOIN (SELECT * FROM SCHEMA_TABLE WHERE VERSION = @versionNew) N
        ON O.TABLE_NAME = N.TABLE_NAME
WHERE   N.VERSION IS NULL
`
  const result = db.prepare(query).all({ versionOld, versionNew })
  return { result, query }
}

function getColumnUpdated(db, versionOld, versionNew, ignoreOption) {
  const query = `
SELECT  O.TABLE_SCHEMA,
        O.TABLE_NAME,
        O.COLUMN_NAME,
        O.ORDINAL_POSITION ORDINAL_POSITION_OLD, N.ORDINAL_POSITION ORDINAL_POSITION_NEW,
        O.COLUMN_DEFAULT COLUMN_DEFAULT_OLD, N.COLUMN_DEFAULT COLUMN_DEFAULT_NEW,
        O.IS_NULLABLE IS_NULLABLE_OLD, N.IS_NULLABLE IS_NULLABLE_NEW,
        O.DATA_TYPE DATA_TYPE_OLD, N.DATA_TYPE DATA_TYPE_NEW,
        O.CHARACTER_MAXIMUM_LENGTH CHARACTER_MAXIMUM_LENGTH_OLD, N.CHARACTER_MAXIMUM_LENGTH CHARACTER_MAXIMUM_LENGTH_NEW,
        O.NUMERIC_PRECISION NUMERIC_PRECISION_OLD, N.NUMERIC_PRECISION NUMERIC_PRECISION_NEW,
        O.NUMERIC_SCALE NUMERIC_SCALE_OLD, N.NUMERIC_SCALE NUMERIC_SCALE_NEW,
        O.COLLATION_NAME COLLATION_NAME_OLD, N.COLLATION_NAME COLLATION_NAME_NEW,
        O.COLUMN_TYPE COLUMN_TYPE_OLD, N.COLUMN_TYPE COLUMN_TYPE_NEW,
        O.COLUMN_COMMENT COLUMN_COMMENT_OLD, N.COLUMN_COMMENT COLUMN_COMMENT_NEW,
        O.GENERATION_EXPRESSION GENERATION_EXPRESSION_OLD, N.GENERATION_EXPRESSION GENERATION_EXPRESSION_NEW
FROM    SCHEMA_COLUMN O
        INNER JOIN SCHEMA_COLUMN N
        ON O.TABLE_NAME = N.TABLE_NAME
        AND O.COLUMN_NAME = N.COLUMN_NAME
WHERE   O.VERSION = @versionOld
        AND N.VERSION = @versionNew
        AND (O.ORDINAL_POSITION != N.ORDINAL_POSITION
            OR IFNULL(O.COLUMN_DEFAULT, '') != IFNULL(N.COLUMN_DEFAULT, '')
            OR O.IS_NULLABLE != N.IS_NULLABLE
            OR O.DATA_TYPE != N.DATA_TYPE
            OR IFNULL(O.CHARACTER_MAXIMUM_LENGTH, '') != IFNULL(N.CHARACTER_MAXIMUM_LENGTH, '')
            OR IFNULL(O.NUMERIC_PRECISION, '') != IFNULL(N.NUMERIC_PRECISION, '')
            OR IFNULL(O.NUMERIC_SCALE, '') != IFNULL(N.NUMERIC_SCALE, '')
            OR ('${ignoreOption.collation}' != 'true' AND IFNULL(O.COLLATION_NAME, '') != IFNULL(N.COLLATION_NAME, ''))
            OR O.COLUMN_TYPE != N.COLUMN_TYPE
            OR O.COLUMN_COMMENT != N.COLUMN_COMMENT
            OR O.GENERATION_EXPRESSION != N.GENERATION_EXPRESSION)
`
  const result = db.prepare(query).all({ versionOld, versionNew })
  return { result, query }
}
function getColumnInserted(db, tablesInserted, versionOld, versionNew) {
  const query = `
SELECT  N.TABLE_SCHEMA,
        N.TABLE_NAME,
        N.COLUMN_NAME,
        N.ORDINAL_POSITION,
        N.COLUMN_DEFAULT,
        N.IS_NULLABLE,
        N.DATA_TYPE,
        N.CHARACTER_MAXIMUM_LENGTH,
        N.NUMERIC_PRECISION,
        N.NUMERIC_SCALE,
        N.COLLATION_NAME,
        N.COLUMN_TYPE,
        N.COLUMN_COMMENT,
        N.GENERATION_EXPRESSION
FROM    (SELECT * FROM SCHEMA_COLUMN WHERE VERSION = @versionNew) N
        LEFT JOIN (SELECT * FROM SCHEMA_COLUMN WHERE VERSION = @versionOld) O
        ON N.TABLE_NAME = O.TABLE_NAME
        AND N.COLUMN_NAME = O.COLUMN_NAME
WHERE   O.VERSION IS NULL
        AND N.TABLE_NAME NOT IN ('${tablesInserted.join("', '")}')
`
  const result = db.prepare(query).all({ versionOld, versionNew })
  return { result, query }
}
function getColumnDeleted(db, tablesDeleted, versionOld, versionNew) {
  const query = `
SELECT  O.TABLE_SCHEMA,
        O.TABLE_NAME,
        O.COLUMN_NAME,
        O.ORDINAL_POSITION,
        O.COLUMN_DEFAULT,
        O.IS_NULLABLE,
        O.DATA_TYPE,
        O.CHARACTER_MAXIMUM_LENGTH,
        O.NUMERIC_PRECISION,
        O.NUMERIC_SCALE,
        O.COLLATION_NAME,
        O.COLUMN_TYPE,
        O.COLUMN_COMMENT,
        O.GENERATION_EXPRESSION
FROM    (SELECT * FROM SCHEMA_COLUMN WHERE VERSION = @versionOld) O
        LEFT JOIN (SELECT * FROM SCHEMA_COLUMN WHERE VERSION = @versionNew) N
        ON O.TABLE_NAME = N.TABLE_NAME
        AND O.COLUMN_NAME = N.COLUMN_NAME
WHERE   N.VERSION IS NULL
        AND O.TABLE_NAME NOT IN ('${tablesDeleted.join("', '")}')
`
  const result = db.prepare(query).all({ versionOld, versionNew })
  return { result, query }
}

function getViewUpdated(db, versionOld, versionNew) {
  const query = `
SELECT  O.TABLE_SCHEMA,
        O.TABLE_NAME,
        O.CREATE_TIME,
        O.UPDATE_TIME,
        O.VIEW_DEFINITION VIEW_DEFINITION_OLD, N.VIEW_DEFINITION VIEW_DEFINITION_NEW,
        O.CHECK_OPTION CHECK_OPTION_OLD, N.CHECK_OPTION CHECK_OPTION_NEW,
        O.IS_UPDATABLE IS_UPDATABLE_OLD, N.IS_UPDATABLE IS_UPDATABLE_NEW,
        O.DEFINER DEFINER_OLD, N.DEFINER DEFINER_NEW,
        O.COLLATION_CONNECTION COLLATION_CONNECTION_OLD, N.COLLATION_CONNECTION COLLATION_CONNECTION_NEW
FROM    SCHEMA_VIEW O
        INNER JOIN SCHEMA_VIEW N
        ON O.TABLE_NAME = N.TABLE_NAME
WHERE   O.VERSION = @versionOld
        AND N.VERSION = @versionNew
        AND (REPLACE(O.VIEW_DEFINITION, CHAR(13), '') != REPLACE(N.VIEW_DEFINITION, CHAR(13), '')
            OR O.CHECK_OPTION != N.CHECK_OPTION
            OR O.IS_UPDATABLE != N.IS_UPDATABLE
            OR O.DEFINER != N.DEFINER
            OR O.COLLATION_CONNECTION != N.COLLATION_CONNECTION
            )
`
  const result = db.prepare(query).all({ versionOld, versionNew })
  return { result, query }
}
function getViewInserted(db, versionOld, versionNew) {
  const query = `
SELECT  N.TABLE_SCHEMA,
        N.TABLE_NAME,
        N.CREATE_TIME,
        N.UPDATE_TIME,
        N.VIEW_DEFINITION,
        N.CHECK_OPTION,
        N.IS_UPDATABLE,
        N.DEFINER,
        N.COLLATION_CONNECTION
FROM    (SELECT * FROM SCHEMA_VIEW WHERE VERSION = @versionNew) N
        LEFT JOIN (SELECT * FROM SCHEMA_VIEW WHERE VERSION = @versionOld) O
        ON N.TABLE_NAME = O.TABLE_NAME
WHERE   O.VERSION IS NULL
`
  const result = db.prepare(query).all({ versionOld, versionNew })
  return { result, query }
}
function getViewDeleted(db, versionOld, versionNew) {
  const query = `
SELECT  O.TABLE_SCHEMA,
        O.TABLE_NAME,
        O.CREATE_TIME,
        O.UPDATE_TIME,
        O.VIEW_DEFINITION,
        O.CHECK_OPTION,
        O.IS_UPDATABLE,
        O.DEFINER,
        O.COLLATION_CONNECTION
FROM    (SELECT * FROM SCHEMA_VIEW WHERE VERSION = @versionOld) O
        LEFT JOIN (SELECT * FROM SCHEMA_VIEW WHERE VERSION = @versionNew) N
        ON O.TABLE_NAME = N.TABLE_NAME
WHERE   N.VERSION IS NULL
`
  const result = db.prepare(query).all({ versionOld, versionNew })
  return { result, query }
}

function getRoutineUpdated(db, versionOld, versionNew) {
  const query = `
SELECT  O.ROUTINE_SCHEMA,
        O.ROUTINE_NAME,
        O.CREATED,
        O.LAST_ALTERED,
        O.ROUTINE_TYPE ROUTINE_TYPE_OLD, N.ROUTINE_TYPE ROUTINE_TYPE_NEW,
        O.COLLATION_NAME COLLATION_NAME_OLD, N.COLLATION_NAME COLLATION_NAME_NEW,
        O.ROUTINE_DEFINITION ROUTINE_DEFINITION_OLD, N.ROUTINE_DEFINITION ROUTINE_DEFINITION_NEW,
        O.DEFINER DEFINER_OLD, N.DEFINER DEFINER_NEW
FROM    SCHEMA_ROUTINE O
        INNER JOIN SCHEMA_ROUTINE N
        ON O.ROUTINE_NAME = N.ROUTINE_NAME
WHERE   O.VERSION = @versionOld
        AND N.VERSION = @versionNew
        AND (O.ROUTINE_TYPE != N.ROUTINE_TYPE
            OR IFNULL(O.COLLATION_NAME, '') != IFNULL(N.COLLATION_NAME, '')
            OR REPLACE(IFNULL(O.ROUTINE_DEFINITION, ''), CHAR(13), '') !=  REPLACE(IFNULL(N.ROUTINE_DEFINITION, ''), CHAR(13), '')
            OR O.DEFINER != N.DEFINER
            )
`
  const result = db.prepare(query).all({ versionOld, versionNew })
  return { result, query }
}
function getRoutineInserted(db, versionOld, versionNew) {
  const query = `
SELECT  N.ROUTINE_SCHEMA,
        N.ROUTINE_NAME,
        N.CREATED,
        N.LAST_ALTERED,
        N.ROUTINE_TYPE,
        N.COLLATION_NAME,
        N.ROUTINE_DEFINITION,
        N.DEFINER
FROM    (SELECT * FROM SCHEMA_ROUTINE WHERE VERSION = @versionNew) N
        LEFT JOIN (SELECT * FROM SCHEMA_ROUTINE WHERE VERSION = @versionOld) O
        ON N.ROUTINE_NAME = O.ROUTINE_NAME
WHERE   O.VERSION IS NULL
`
  const result = db.prepare(query).all({ versionOld, versionNew })
  return { result, query }
}
function getRoutineDeleted(db, versionOld, versionNew) {
  const query = `
SELECT  O.ROUTINE_SCHEMA,
        O.ROUTINE_NAME,
        O.CREATED,
        O.LAST_ALTERED,
        O.ROUTINE_TYPE,
        O.COLLATION_NAME,
        O.ROUTINE_DEFINITION,
        O.DEFINER
FROM    (SELECT * FROM SCHEMA_ROUTINE WHERE VERSION = @versionOld) O
        LEFT JOIN (SELECT * FROM SCHEMA_ROUTINE WHERE VERSION = @versionNew) N
        ON O.ROUTINE_NAME = N.ROUTINE_NAME
WHERE   N.VERSION IS NULL
`
  const result = db.prepare(query).all({ versionOld, versionNew })
  return { result, query }
}

function compareSchema(
  versionOld,
  versionNew,
  ignoreOption = { collation: false },
  returnQuery = false
) {
  const db = dbHelper.getSqliteDb()

  const { result: indexUpdated, query: queryIndexUpdated } = getIndexUpdated(
    db,
    versionOld,
    versionNew
  )
  const { result: indexInserted, query: queryIndexInserted } = getIndexInserted(
    db,
    versionOld,
    versionNew
  )
  const { result: indexDeleted, query: queryIndexDeleted } = getIndexDeleted(
    db,
    versionOld,
    versionNew
  )

  const { result: foreignKeyUpdated, query: queryForeignKeyUpdated } =
    getForeignKeyUpdated(db, versionOld, versionNew)
  const { result: foreignKeyInserted, query: queryForeignKeyInserted } =
    getForeignKeyInserted(db, versionOld, versionNew)
  const { result: foreignKeyDeleted, query: queryForeignKeyDeleted } =
    getForeignKeyDeleted(db, versionOld, versionNew)

  const { result: tableUpdated, query: queryTableUpdated } = getTableUpdated(
    db,
    versionOld,
    versionNew,
    ignoreOption
  )
  const { result: tableInserted, query: queryTableInserted } = getTableInserted(
    db,
    versionOld,
    versionNew
  )
  const { result: tableDeleted, query: queryTableDeleted } = getTableDeleted(
    db,
    versionOld,
    versionNew
  )

  const tablesInserted = tableInserted.map((tbl) => tbl.TABLE_NAME)
  const tablesDeleted = tableDeleted.map((tbl) => tbl.TABLE_NAME)

  const { result: columnUpdated, query: queryColumnUpdated } = getColumnUpdated(
    db,
    versionOld,
    versionNew,
    ignoreOption
  )
  const { result: columnInserted, query: queryColumnInserted } =
    getColumnInserted(db, tablesInserted, versionOld, versionNew)
  const { result: columnDeleted, query: queryColumnDeleted } = getColumnDeleted(
    db,
    tablesDeleted,
    versionOld,
    versionNew
  )

  const { result: viewUpdated, query: queryViewUpdated } = getViewUpdated(
    db,
    versionOld,
    versionNew
  )
  const { result: viewInserted, query: queryViewInserted } = getViewInserted(
    db,
    versionOld,
    versionNew
  )
  const { result: viewDeleted, query: queryViewDeleted } = getViewDeleted(
    db,
    versionOld,
    versionNew
  )

  const { result: routineUpdated, query: queryRoutineUpdated } =
    getRoutineUpdated(db, versionOld, versionNew)
  const { result: routineInserted, query: queryRoutineInserted } =
    getRoutineInserted(db, versionOld, versionNew)
  const { result: routineDeleted, query: queryRoutineDeleted } =
    getRoutineDeleted(db, versionOld, versionNew)

  const result = {
    indexUpdated,
    indexInserted,
    indexDeleted,

    foreignKeyUpdated,
    foreignKeyInserted,
    foreignKeyDeleted,

    tableUpdated,
    tableInserted,
    tableDeleted,

    columnUpdated,
    columnInserted,
    columnDeleted,

    viewUpdated,
    viewInserted,
    viewDeleted,

    routineUpdated,
    routineInserted,
    routineDeleted,
  }
  const query = {
    queryIndexUpdated,
    queryIndexInserted,
    queryIndexDeleted,

    queryForeignKeyUpdated,
    queryForeignKeyInserted,
    queryForeignKeyDeleted,

    queryTableUpdated,
    queryTableInserted,
    queryTableDeleted,

    queryColumnUpdated,
    queryColumnInserted,
    queryColumnDeleted,

    queryViewUpdated,
    queryViewInserted,
    queryViewDeleted,

    queryRoutineUpdated,
    queryRoutineInserted,
    queryRoutineDeleted,
  }

  if (!returnQuery) {
    return result
  }

  return {
    result,
    query,
  }
}

module.exports = {
  compareSchema,
}

// node -e "console.log(require('./service/schema/compare.js').compareSchema(4, 11))"
// node -e "console.log(require('./service/schema/compare.js').compareSchema(28, 25))"
// node -e "console.log(require('./service/schema/compare.js').compareSchema(33, 29))"
// node -e "console.log(require('./service/schema/compare.js').compareSchema(35, 34))"
// node -e "console.log(require('./service/schema/compare.js').compareSchema(39, 36, { collation: true }))"
// node -e "console.log(require('./service/schema/compare.js').compareSchema(42, 36))"

// Compare old and new of real
// node -e "console.log(require('./service/schema/compare.js').compareSchema(36, 55))"
// node -e "console.log(require('./service/schema/compare.js').compareSchema(34, 54))"
// node -e "console.log(require('./service/schema/compare.js').compareSchema(29, 53))"
// node -e "console.log(require('./service/schema/compare.js').compareSchema(25, 52))"
// node -e "console.log(require('./service/schema/compare.js').compareSchema(4, 51))"

const dbHelper = require('../../util/dbHelper')
const mybatisMapper = require('mybatis-mapper')
const moment = require('moment')

function insertVersion(db, name, host, port, database) {
  const query = `
insert into SCHEMA_VERSION
  (NAME, HOST, PORT, DATABASE)
values
  (?, ?, ?, ?);`
  const stmt = db.prepare(query)
  stmt.run(name, host, port, database)

  const ret = db.prepare('select last_insert_rowid() version').get()
  return { version: ret.version, query }
}

function insertIndex(db, version, result) {
  const query = `
insert into SCHEMA_INDEX
  (VERSION, INDEX_SCHEMA, TABLE_NAME, INDEX_NAME, INDEX_COLUMNS, INDEX_TYPE, IS_UNIQUE)
values
  (@VERSION, @INDEX_SCHEMA, @TABLE_NAME, @INDEX_NAME, @INDEX_COLUMNS, @INDEX_TYPE, @IS_UNIQUE)`
  const stmt = db.prepare(query)

  result.forEach((row, index) => {
    stmt.run({
      VERSION: version,
      INDEX_SCHEMA: row.INDEX_SCHEMA,
      TABLE_NAME: row.TABLE_NAME,
      INDEX_NAME: row.INDEX_NAME,
      INDEX_COLUMNS: row.INDEX_COLUMNS,
      INDEX_TYPE: row.INDEX_TYPE,
      IS_UNIQUE: row.IS_UNIQUE,
    })
  })

  return { query }
}

function insertForeignKey(db, version, result) {
  const query = `
insert into SCHEMA_FOREIGN_KEY
  (VERSION, TABLE_SCHEMA, TABLE_NAME, CONSTRAINT_NAME, COLUMN_NAMES, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAMES)
values
  (@VERSION, @TABLE_SCHEMA, @TABLE_NAME, @CONSTRAINT_NAME, @COLUMN_NAMES, @REFERENCED_TABLE_NAME, @REFERENCED_COLUMN_NAMES)`
  const stmt = db.prepare(query)

  result.forEach((row, index) => {
    stmt.run({
      VERSION: version,
      TABLE_SCHEMA: row.TABLE_SCHEMA,
      TABLE_NAME: row.TABLE_NAME,
      CONSTRAINT_NAME: row.CONSTRAINT_NAME,
      COLUMN_NAMES: row.COLUMN_NAMES,
      REFERENCED_TABLE_NAME: row.REFERENCED_TABLE_NAME,
      REFERENCED_COLUMN_NAMES: row.REFERENCED_COLUMN_NAMES,
    })
  })

  return { query }
}

function insertTable(db, version, result) {
  const query = `
insert into SCHEMA_TABLE
  (VERSION, TABLE_SCHEMA, TABLE_NAME, ENGINE, ROW_FORMAT, TABLE_ROWS, DATA_LENGTH, INDEX_LENGTH,
  CREATE_TIME, UPDATE_TIME, TABLE_COLLATION, TABLE_COMMENT)
values
  (@VERSION, @TABLE_SCHEMA, @TABLE_NAME, @ENGINE, @ROW_FORMAT, @TABLE_ROWS, @DATA_LENGTH, @INDEX_LENGTH,
  @CREATE_TIME, @UPDATE_TIME, @TABLE_COLLATION, @TABLE_COMMENT)`
  const stmt = db.prepare(query)

  result.forEach((row, index) => {
    stmt.run({
      VERSION: version,
      TABLE_SCHEMA: row.TABLE_SCHEMA,
      TABLE_NAME: row.TABLE_NAME,
      ENGINE: row.ENGINE,
      ROW_FORMAT: row.ROW_FORMAT,
      TABLE_ROWS: row.TABLE_ROWS,
      DATA_LENGTH: row.DATA_LENGTH,
      INDEX_LENGTH: row.INDEX_LENGTH,
      CREATE_TIME: moment(row.CREATE_TIME).format('YYYY-MM-DD HH:mm:ss'),
      UPDATE_TIME: row.UPDATE_TIME
        ? moment(row.UPDATE_TIME).format('YYYY-MM-DD HH:mm:ss')
        : null,
      TABLE_COLLATION: row.TABLE_COLLATION,
      TABLE_COMMENT: row.TABLE_COMMENT,
    })
  })

  return { query }
}

function insertColumn(db, version, result) {
  const query = `
insert into SCHEMA_COLUMN
  (VERSION, TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, ORDINAL_POSITION, COLUMN_DEFAULT,
  IS_NULLABLE, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION,
  NUMERIC_SCALE, COLLATION_NAME, COLUMN_TYPE, COLUMN_COMMENT,
  GENERATION_EXPRESSION)
values
  (@VERSION, @TABLE_SCHEMA, @TABLE_NAME, @COLUMN_NAME, @ORDINAL_POSITION, @COLUMN_DEFAULT,
  @IS_NULLABLE, @DATA_TYPE, @CHARACTER_MAXIMUM_LENGTH, @NUMERIC_PRECISION,
  @NUMERIC_SCALE, @COLLATION_NAME, @COLUMN_TYPE, @COLUMN_COMMENT,
  @GENERATION_EXPRESSION)`
  const stmt = db.prepare(query)

  result.forEach((row, index) => {
    stmt.run({
      VERSION: version,
      TABLE_SCHEMA: row.TABLE_SCHEMA,
      TABLE_NAME: row.TABLE_NAME,
      COLUMN_NAME: row.COLUMN_NAME,
      ORDINAL_POSITION: row.ORDINAL_POSITION,
      COLUMN_DEFAULT: row.COLUMN_DEFAULT,
      IS_NULLABLE: row.IS_NULLABLE,
      DATA_TYPE: row.DATA_TYPE,
      CHARACTER_MAXIMUM_LENGTH: row.CHARACTER_MAXIMUM_LENGTH,
      NUMERIC_PRECISION: row.NUMERIC_PRECISION,
      NUMERIC_SCALE: row.NUMERIC_SCALE,
      COLLATION_NAME: row.COLLATION_NAME,
      COLUMN_TYPE: row.COLUMN_TYPE,
      COLUMN_COMMENT: row.COLUMN_COMMENT,
      GENERATION_EXPRESSION: row.GENERATION_EXPRESSION,
    })
  })

  return { query }
}

function insertView(db, version, result) {
  const query = `
insert into SCHEMA_VIEW
  (VERSION, TABLE_SCHEMA, TABLE_NAME, CREATE_TIME, UPDATE_TIME, VIEW_DEFINITION,
  CHECK_OPTION, IS_UPDATABLE, DEFINER, COLLATION_CONNECTION)
values
  (@VERSION, @TABLE_SCHEMA, @TABLE_NAME, @CREATE_TIME, @UPDATE_TIME, @VIEW_DEFINITION,
  @CHECK_OPTION, @IS_UPDATABLE, @DEFINER, @COLLATION_CONNECTION)`
  const stmt = db.prepare(query)

  result.forEach((row, index) => {
    stmt.run({
      VERSION: version,
      TABLE_SCHEMA: row.TABLE_SCHEMA,
      TABLE_NAME: row.TABLE_NAME,
      CREATE_TIME: moment(row.CREATE_TIME).format('YYYY-MM-DD HH:mm:ss'),
      UPDATE_TIME: row.UPDATE_TIME
        ? moment(row.UPDATE_TIME).format('YYYY-MM-DD HH:mm:ss')
        : null,
      VIEW_DEFINITION: row.VIEW_DEFINITION,
      CHECK_OPTION: row.CHECK_OPTION,
      IS_UPDATABLE: row.IS_UPDATABLE,
      DEFINER: row.DEFINER,
      COLLATION_CONNECTION: row.COLLATION_CONNECTION,
    })
  })

  return { query }
}

function insertRoutine(db, version, result) {
  const query = `
insert into SCHEMA_ROUTINE
  (VERSION, ROUTINE_SCHEMA, ROUTINE_NAME, ROUTINE_TYPE,
  COLLATION_NAME, ROUTINE_DEFINITION, CREATED, LAST_ALTERED, DEFINER)
values
  (@VERSION, @ROUTINE_SCHEMA, @ROUTINE_NAME, @ROUTINE_TYPE,
  @COLLATION_NAME, @ROUTINE_DEFINITION, @CREATED, @LAST_ALTERED, @DEFINER)`
  const stmt = db.prepare(query)

  result.forEach((row, index) => {
    stmt.run({
      VERSION: version,
      ROUTINE_SCHEMA: row.ROUTINE_SCHEMA,
      ROUTINE_NAME: row.ROUTINE_NAME,
      ROUTINE_TYPE: row.ROUTINE_TYPE,
      COLLATION_NAME: row.COLLATION_NAME,
      ROUTINE_DEFINITION: row.ROUTINE_DEFINITION,
      CREATED: moment(row.CREATED).format('YYYY-MM-DD HH:mm:ss'),
      LAST_ALTERED: moment(row.LAST_ALTERED).format('YYYY-MM-DD HH:mm:ss'),
      DEFINER: row.DEFINER,
    })
  })

  return { query }
}

function deleteSchema_(db, version) {
  const query = `
delete
from    SCHEMA_VERSION
where   VERSION = ?`
  const stmt = db.prepare(query)
  const result = stmt.run(version)

  return { result, query }
}

function insertProcessWatch_(db, result) {
  const query = `
insert into PROCESS_WATCH
  (ID, USER, HOST, DB, COMMAND, TIME, STATE, INFO)
values
  (@ID, @USER, @HOST, @DB, @COMMAND, @TIME, @STATE, @INFO)`
  const stmt = db.prepare(query)

  result.forEach((row, index) => {
    stmt.run({
      ID: row.ID,
      USER: row.USER,
      HOST: row.HOST,
      DB: row.DB,
      COMMAND: row.COMMAND,
      TIME: row.TIME,
      STATE: row.STATE,
      INFO: row.INFO,
    })
  })

  return { query }
}

async function insertSchema(connType) {
  const conn = dbHelper.getConnection(connType)
  conn.connect()
  const database = conn.config.database

  const { result: retIndex, query: queryIndex } = await dbHelper.getResult(
    conn,
    'schema',
    'selectIndex',
    {
      schemaName: database,
    }
  )
  const { result: retForeignKey, query: queryForeignKey } =
    await dbHelper.getResult(conn, 'schema', 'selectForeignKey', {
      schemaName: database,
    })
  const { result: retTable, query: queryTable } = await dbHelper.getResult(
    conn,
    'schema',
    'selectTable',
    {
      schemaName: database,
    }
  )
  const { result: retColumn, query: queryColumn } = await dbHelper.getResult(
    conn,
    'schema',
    'selectColumn',
    {
      schemaName: database,
    }
  )

  const { result: retView, query: queryView } = await dbHelper.getResult(
    conn,
    'schema',
    'selectView',
    {
      schemaName: database,
    }
  )
  for (let i = 0; i < retView.length; i++) {
    const row = retView[i]
    if (!row.VIEW_DEFINITION) {
      await dbHelper.getResultByQuery(conn, `USE ${database};`)
      const { result: retDef } = await dbHelper.getResultByQuery(
        conn,
        `SHOW CREATE VIEW ${row.TABLE_NAME};`
      )
      row.VIEW_DEFINITION = retDef[0]['Create View']
    }
  }

  const { result: retRoutine, query: queryRoutine } = await dbHelper.getResult(
    conn,
    'schema',
    'selectRoutine',
    {
      schemaName: database,
    }
  )
  conn.end()

  const db = dbHelper.getSqliteDb()
  db.exec('begin')

  const { version, query: queryInsertVersion } = insertVersion(
    db,
    connType,
    conn.config.host,
    conn.config.port,
    conn.config.database
  )

  const { query: queryInsertIndex } = insertIndex(db, version, retIndex)
  const { query: queryInsertForeignKey } = insertForeignKey(
    db,
    version,
    retForeignKey
  )
  const { query: queryInsertTable } = insertTable(db, version, retTable)
  const { query: queryInsertColumn } = insertColumn(db, version, retColumn)
  const { query: queryInsertView } = insertView(db, version, retView)
  const { query: queryInsertRoutine } = insertRoutine(db, version, retRoutine)

  db.exec('commit')

  return {
    result: version,

    query: {
      queryIndex,
      queryForeignKey,
      queryTable,
      queryColumn,
      queryView,
      queryRoutine,

      queryInsertVersion,
      queryInsertIndex,
      queryInsertForeignKey,
      queryInsertTable,
      queryInsertColumn,
      queryInsertView,
      queryInsertRoutine,
    },
  }
}

async function deleteSchema(version) {
  const db = dbHelper.getSqliteDb()
  db.exec('begin')

  const { result, query } = deleteSchema_(db, version)

  db.exec('commit')

  return {
    result,
    query,
  }
}

async function insertProcessWatch(connType, db, time, info) {
  const conn = dbHelper.getConnection(connType)
  conn.connect()

  const { result, query: querySelect } = await dbHelper.getResult(
    conn,
    'schema',
    'selectProcessList',
    {
      db,
      time,
      info,
    }
  )
  conn.end()

  const sqliteDb = dbHelper.getSqliteDb()
  sqliteDb.exec('begin')

  const { query: queryInsert } = insertProcessWatch_(sqliteDb, result)

  sqliteDb.exec('commit')

  return {
    result,

    query: {
      querySelect,
      queryInsert,
    },
  }
}

module.exports = {
  insertSchema,
  deleteSchema,
  insertProcessWatch,
}

// node -e "require('./service/schema/insert.js').insertSchema('local_monitoring').then(r => console.log('OK'))"

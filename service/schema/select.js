const dbHelper = require('../../util/dbHelper')
const mybatisMapper = require('mybatis-mapper')
const moment = require('moment')

async function selectVersion(name) {
  const db = dbHelper.getSqliteDb()
  const query = `
select  VERSION, HOST, PORT, DATABASE, TIME, NAME
from    SCHEMA_VERSION
where   NAME = @name or @name is null
order by VERSION desc`
  const result = db.prepare(query).all({ name })

  return { result, query }
}

async function selectTable(type, version) {
  const db = dbHelper.getSqliteDb()

  let query = ''
  switch (type) {
    case 'index':
      query = `
select  VERSION, INDEX_SCHEMA, TABLE_NAME, INDEX_NAME, INDEX_COLUMNS, INDEX_TYPE, IS_UNIQUE, TIME
from    SCHEMA_INDEX
where   VERSION = ?
order by INDEX_NAME`
      break
    case 'foreignKey':
      query = `
select  VERSION, TABLE_SCHEMA, TABLE_NAME, CONSTRAINT_NAME, COLUMN_NAMES, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAMES, TIME
from    SCHEMA_FOREIGN_KEY
where   VERSION = ?
order by CONSTRAINT_NAME`
      break
    case 'table':
      query = `
select  VERSION, TABLE_SCHEMA, TABLE_NAME, ENGINE, ROW_FORMAT, TABLE_ROWS, DATA_LENGTH, INDEX_LENGTH, CREATE_TIME, UPDATE_TIME, TABLE_COLLATION, TABLE_COMMENT, TIME
from    SCHEMA_TABLE
where   VERSION = ?
order by TABLE_NAME`
      break
    case 'column':
      query = `
select  VERSION, TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME, ORDINAL_POSITION, COLUMN_DEFAULT, IS_NULLABLE, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE, COLLATION_NAME, COLUMN_TYPE, COLUMN_COMMENT, GENERATION_EXPRESSION, TIME
from    SCHEMA_COLUMN
where   VERSION = ?
order by TABLE_NAME, ORDINAL_POSITION`
      break
    case 'view':
      query = `
select  VERSION, TABLE_SCHEMA, TABLE_NAME, CREATE_TIME, UPDATE_TIME, VIEW_DEFINITION, CHECK_OPTION, IS_UPDATABLE, DEFINER, COLLATION_CONNECTION, TIME
from    SCHEMA_VIEW
where   VERSION = ?
order by TABLE_NAME`
      break
    case 'routine':
      query = `
select  VERSION, ROUTINE_SCHEMA, ROUTINE_NAME, ROUTINE_TYPE, COLLATION_NAME, ROUTINE_DEFINITION, CREATED, LAST_ALTERED, DEFINER, TIME
from    SCHEMA_ROUTINE
where   VERSION = ?
order by ROUTINE_NAME`
      break
    default:
      throw `Wrong type: ${type}`
  }
  const result = db.prepare(query).all(version)

  return { result, query }
}

module.exports = {
  selectVersion,
  selectTable,
}

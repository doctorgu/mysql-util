const dbHelper = require('../../util/dbHelper')
const moment = require('moment')
const fs = require('fs')

function getQuote(dataType) {
  switch (dataType) {
    case 'int':
    case 'tinyint':
    case 'smallint':
    case 'bigint':
    case 'double':
    case 'float':
    case 'decimal':
      return ''
    default:
      return "'"
  }
}

function getReplaceQuote(dataType) {
  switch (dataType) {
    case 'varchar':
    case 'char':
    case 'text':
    case 'longtext':
    case 'mediumtext':
      return true
    default:
      return false
  }
}

function getDateTime(dataType) {
  switch (dataType) {
    case 'datetime':
    case 'timestamp':
    case 'time':
    case 'date':
      return true
    default:
      return false
  }
}

function getValueNormalized(col, value) {
  if (value === null) return 'null'

  if (col.replaceQuote)
    return `${col.quote}${value.replace(/'/g, "''")}${col.quote}`

  if (col.dateTime)
    return `${col.quote}${moment(value).format('YYYY-MM-DD HH:mm:ss.SSS')}${
      col.quote
    }`

  return `${col.quote}${value}${col.quote}`
}

async function generateInsertUpdate(connType, tableName, fullPath) {
  const conn = dbHelper.getConnection(connType)
  conn.connect()
  const schemaName = conn.config.database

  const { result: colSchema, query: queryColSchema } = await dbHelper.getResult(
    conn,
    'schema',
    'selectColumn',
    {
      schemaName,
      tableName,
    }
  )

  const { result: pkSchema, query: queryPkSchema } = await dbHelper.getResult(
    conn,
    'schema',
    'selectIndex',
    {
      schemaName,
      indexName: 'PRIMARY',
    }
  )
  let pkColumns = []
  if (pkSchema.length) {
    pkColumns = pkSchema[0].INDEX_COLUMNS.split(',')
  }

  const cols = []
  for (let rw = 0; rw < colSchema.length; rw++) {
    const row = colSchema[rw]
    const quote = getQuote(row.DATA_TYPE)
    const replaceQuote = getReplaceQuote(row.DATA_TYPE)
    const dateTime = getDateTime(row.DATA_TYPE)

    const col = {
      name: row.COLUMN_NAME,
      quote,
      replaceQuote,
      dateTime,
      primary: pkColumns.indexOf(row.COLUMN_NAME) !== -1,
    }
    cols.push(col)
  }
  const columnNameComma = cols.map((col) => col.name).join(', ')
  const columnValueComma = cols
    .filter((col) => !col.primary)
    .map((col) => `${col.name} = i.${col.name}`)
    .join(', ')

  const sqls = []
  const { result: rows, query: queryRows } = await dbHelper.getResultByQuery(
    conn,
    `select * from ${tableName}`
  )
  for (let rw = 0; rw < rows.length; rw++) {
    const row = rows[rw]

    const valueAliases = []
    for (let cl = 0; cl < cols.length; cl++) {
      const col = cols[cl]
      const value = row[col.name]

      const value2 = getValueNormalized(col, value)
      const valueAlias = `${value2} ${col.name}`

      valueAliases.push(valueAlias)
    }

    const valueAliasComma = valueAliases.join(', ')

    const sql = `
insert into ${tableName} (${columnNameComma})
select * from
(select
${valueAliasComma}
) i
on duplicate key update
${columnValueComma};`
    sqls.push(sql)
  }

  const sqlAll = sqls.join('\n')

  if (fullPath) {
    fs.writeFileSync(fullPath, sqlAll)
  }

  const query = { queryColSchema, queryPkSchema, queryRows }
  return { result: fullPath || sqlAll, query }
}

module.exports = {
  generateInsertUpdate,
}

// node -e "console.log(require('./service/schema/generate.js').generateInsertUpdate('local_monitoring', 'test_user', 'D:\\Temp\\test_user.sql'))"

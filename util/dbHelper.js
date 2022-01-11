const mysql = require('mysql2')
const mybatisMapper = require('mybatis-mapper')
const sqlite3 = require('better-sqlite3')
const config = require('config-yml')

function getConnection(connType) {
  const confConn = config.dbConnection[connType]
  const confOption = config.dbOption

  let option = {
    host: confConn.host,
    port: confConn.port,
    user: confConn.user,
    password: confConn.password,
    database: confConn.database,
    multipleStatements: confOption.multipleStatements,
  }
  const conn = mysql.createConnection(option)
  return conn
}

function getSqliteDb() {
  const db = sqlite3('sqliteDb/common.db3')
  // enable on delete cascade on update cascade
  db.exec('PRAGMA foreign_keys=ON')
  return db
}

async function getResults(conn, namespace, sql, params) {
  mybatisMapper.createMapper([`./mybatis/${namespace}.xml`])

  const format = { language: 'sql', indent: '  ' }
  const query = mybatisMapper.getStatement(namespace, sql, params, format)

  const results = await conn.promise().query(query)

  return { results, query }
}

async function getResult(conn, namespace, sql, params) {
  const { results, query } = await getResults(conn, namespace, sql, params)
  return { result: results[0], query }
}

async function getResultsByQuery(conn, sql) {
  const results = await conn.promise().query(sql)
  return { results, query: sql }
}

async function getResultByQuery(conn, sql) {
  const { results, query } = await getResultsByQuery(conn, sql)
  return { result: results[0], query }
}

module.exports = {
  getSqliteDb,
  getConnection,
  getResults,
  getResult,
  getResultsByQuery,
  getResultByQuery,
}

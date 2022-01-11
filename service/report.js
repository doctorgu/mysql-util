const dbHelper = require('../util/dbHelper')

async function getWeeklyCount(regDtStart, regDtEnd) {
  const params = {
    regDtStart: `${regDtStart} 00:00:00`,
    regDtEnd: `${regDtEnd} 23:59:59`,
  }
  const conn = dbHelper.getConnection('local_monitoring')
  conn.connect()

  const { query, result } = await dbHelper.getResult(
    conn,
    'report',
    'selectUserCount',
    params
  )
  conn.end()

  return { result: result[0].cnt, query }
}

module.exports = {
  getWeeklyCount,
}

// node -e "require('./service/report.js').getWeeklyCount('2021-09-10', '2021-09-16').then(r => console.log(r))"

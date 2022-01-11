const express = require('express')
const router = express.Router()
const report = require('../service/report')
const moment = require('moment')
const numeral = require('numeral')

const information = [
  {
    url: `/report/weekly-count/:start~:end`,
    description: `특정 기간의 회원 건수
예) 2022-01-01 ~ 2022-12-31 기간의 결과를 보는 경우: /report/weekly-count/2022-01-01~2022-12-31
`,
  },
]

router.get('/', async function (req, res, next) {
  res.render(
    'index',
    { information: JSON.stringify(information, null, 2) },
    function (err, html) {
      res.send(html)
    }
  )
})

router.get('/weekly-count/:start~:end', async function (req, res, next) {
  const regDtStart = req.params.start
  const regDtEnd = req.params.end
  const { result: cnt, query } = await report.getWeeklyCount(
    regDtStart,
    regDtEnd
  )

  const formatted = {
    start: moment(regDtStart).format('M/DD'),
    end: moment(regDtEnd).format('M/DD'),
    cnt: numeral(cnt).format('0,0'),
  }
  // res.send(
  //   `${formatted.start}~${formatted.end} 회원 ${formatted.cnt}건`
  // )
  const result = `${formatted.start}~${formatted.end} 회원 ${formatted.cnt}건`
  const type = 'text'
  res.render(
    'index',
    { information: JSON.stringify(information, null, 2), result, query, type },
    function (err, html) {
      res.send(html)
    }
  )
})

module.exports = router

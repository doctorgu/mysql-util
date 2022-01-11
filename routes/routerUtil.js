const express = require('express')
const router = express.Router()
const common = require('../util/common')
const generate = require('../service/schema/generate')
const insert = require('../service/schema/insert')
const slowQueryToTsv = require('../service/slowQueryToTsv')
const serverTimeDifference = require('../service/serverTimeDifference')
const filterLine = require('../service/filterLine')

const information = [
  {
    url: `/util/insertUpdate/:connType/:tableName/:fileName`,
    description: `connType 연결의 tableName 테이블의 모든 데이터에 대해 insert on duplicate key update 문을 생성
예) local_monitoring의 test_user 테이블의 구문 생성: /generate/local_monitoring/test_user
예) local_monitoring의 test_user 테이블의 구문 생성해서 test_user.sql 파일로 다운로드: /util/insertUpdate/local_monitoring/test_user/test_user.sql`,
  },
  {
    url: `/util/upload/slowQueryToTsv`,
    description: `/dblog/slow-query.log 또는 /dwlog/slow-query.log 파일을 업로드해서 엑셀에 붙여넣을 수 있는 형태의 .tsv 파일을 다운로드
예) slow-query.log-20210821 파일을 선택하고 slow-query.tsv 파일로 다운로드: /util/upload/slowQueryToTsv, 파일 선택 (POST 방식이므로 주소입력줄 입력 불가능)`,
  },
  {
    url: `/util/serverTimeDifference`,
    description: `서버별 시간 차이를 Millisecond로 표시함. noserver 서버의 시간이 기준이 됨.
예) 각 서버의 시간 차이를 표시함: /util/serverTimeDifference`,
  },
  {
    url: `/util/watch/:connType/:db/:time/:info`,
    description: `입력한 조건에 해당하는 information_schema.PROCESSLIST의 값을 1초 간격으로 로컬의 PROCESS_WATCH 테이블에 저장
예) local_monitoring 연결의 monitoring DB의 'UPDATE TEST_USER' 문자열이 있는 SQL문이 3초 이상 실행되는 경우: /process/start/local_monitoring/monitoring/3/UPDATE TEST_USER`,
  },
  {
    url: `/util/upload/filterLine/:find`,
    description: `업로드한 텍스트 파일에서 특정 문자열을 포함한 라인을 모아서 filter.txt 파일로 다운로드
예) restLog.log 파일을 선택하고 'EXCEPTION' 문자열이 포함된 라인만 있는 파일로 다운로드
: /util/upload/filterLine, 파일 선택, 입력상자에 'EXCEPTION' 입력 (POST 방식이므로 주소입력줄 입력 불가능)
예) restLog.log 파일을 선택하고 'POST' 또는 'PUT' 문자열이 포함된 라인만 있는 파일로 다운로드 (정규표현식 이용하기 위해 'r-' 문자열로 시작)
: /util/upload/filterLine, 파일 선택, 입력상자에 'r-(POST|PUT)' 입력 (POST 방식이므로 주소입력줄 입력 불가능)`,
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

router.get(
  '/insertUpdate/:connType/:tableName/:fileName?',
  async function (req, res, next) {
    const { connType, tableName, fileName } = req.params
    const fullPath = fileName ? `${process.env.temp}\\${fileName}` : ''
    const { result, query } = await generate.generateInsertUpdate(
      connType,
      tableName,
      fullPath
    )

    if (fileName) {
      res.download(fullPath, function (err) {
        console.error(err)
      })
    } else {
      const type = 'text'
      res.render(
        'index',
        {
          information: JSON.stringify(information, null, 2),
          result,
          query: common.queryToFlat(query),
          type,
        },
        function (err, html) {
          res.send(html)
        }
      )
    }
  }
)

router.post('/upload/slowQueryToTsv', async function (req, res, next) {
  if (!req.files) {
    res.send({
      status: false,
      message: 'No file uploaded',
    })
    return
  }

  const fulPathSrcs = []
  const files = Array.isArray(req.files.file)
    ? req.files.file
    : [req.files.file]
  const fileNameTsv = common.replaceExtension(files[0].name, '.tsv')
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const fileName = file.name
    const fullPathSrc = `${process.env.temp}\\${fileName}`
    await file.mv(fullPathSrc)
    fulPathSrcs.push(fullPathSrc)
  }

  const tsvFullPath = `${process.env.temp}\\${fileNameTsv}`
  const { result } = await slowQueryToTsv.slowQueryToTsv(
    fulPathSrcs,
    tsvFullPath
  )

  res.download(tsvFullPath, function (err) {
    console.error(err)
  })
})

router.get('/serverTimeDifference', async function (req, res, next) {
  const standardServer = 'noserver'
  const { result, query } = await serverTimeDifference.getServerTimeDifference(
    standardServer
  )

  const type = 'json'
  res.render(
    'index',
    {
      information: JSON.stringify(information, null, 2),
      result: JSON.stringify([result], null, 2),
      query,
      type,
    },
    function (err, html) {
      res.send(html)
    }
  )
})

router.get('/watch/:connType/:db/:time/:info', async function (req, res, next) {
  const { connType, db, time, info } = req.params
  const { result, query } = await insert.insertProcessWatch(
    connType,
    db,
    parseInt(time),
    info
  )

  const type = 'json'
  res.send({
    result: JSON.stringify(result, null, 2),
    query: common.queryToFlat(query),
    type,
  })
})

router.post('/upload/filterLine/:find', async function (req, res, next) {
  if (!req.files) {
    res.send({
      status: false,
      message: 'No file uploaded',
    })
    return
  }

  const find = req.params.find

  const fulPathSrcs = []
  const files = Array.isArray(req.files.file)
    ? req.files.file
    : [req.files.file]
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const fileName = file.name
    const fullPathSrc = `${process.env.temp}\\${fileName}`
    await file.mv(fullPathSrc)
    fulPathSrcs.push(fullPathSrc)
  }

  const fullPathFilter = `${process.env.temp}\\filter.txt`

  const list = await filterLine.filterLine(
    (line, lineIndex, fullPath, tag = {}) => {
      if (!find.startsWith('r-')) {
        if (line.indexOf(find) !== -1) {
          return line
        }

        return null
      } else {
        const r = new RegExp(find.substr(2))
        const m = line.match(r)
        if (m) {
          return line
        }

        return null
      }
    },
    fulPathSrcs
  )
  filterLine.saveList('\n', list, fullPathFilter)

  res.download(fullPathFilter, function (err) {
    console.error(err)
  })
})

module.exports = router

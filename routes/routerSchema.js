const express = require('express')
const router = express.Router()
const insert = require('../service/schema/insert')
const select = require('../service/schema/select')
const compare = require('../service/schema/compare')
const common = require('../util/common')

const information = [
  {
    url: `/schema/insert/:connType`,
    description: `connType에 해당하는 DB의 스키마 정보를 로컬의 SQLite DB에 추가
예) local_monitoring 연결의 정보를 추가: /schema/insert/local_monitoring`,
  },
  {
    url: `/schema/select/version/:connType?`,
    description: `connType에 해당하는 모든 버전 정보를 선택
예) local_monitoring 연결의 모든 버전 정보를 선택: /schema/select/version/local_monitoring
예) 모든 연결의 모든 버전 정보를 선택: /schema/select/version`,
  },
  {
    url: `/schema/select/:tableType/:version`,
    description: `version에 해당하는 테이블 정보를 선택
- tableType
인덱스: index, 외래키: foreignKey, 테이블: table, 칼럼: column, 뷰: view, 루틴: routine
예) version이 77인 모든 인덱스 정보를 선택: /schema/select/index/77`,
  },
  {
    url: `/schema/delete/:version`,
    description: `version에 해당하는 스키마 정보를 로컬의 SQLite DB에서 삭제
예) version이 77인 모든 스키마 정보를 삭제: /schema/delete/77`,
  },
  {
    url: `/schema/compare/:versionOld-:versionNew`,
    description: `versionOld와 versionNew의 모든 스키마 정보를 비교한 결과를 출력
예) 77과 78 버전의 스키마 정보를 비교한 결과를 출력: /schema/compare/77-78`,
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

router.get('/insert/:connType', async function (req, res, next) {
  const connType = req.params.connType
  const { result: version, query } = await insert.insertSchema(connType)

  const result = `${connType} Inserted (version: ${version})`
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
})

router.get('/select/version/:connType?', async function (req, res, next) {
  const connType = req.params.connType
  const { result, query } = await select.selectVersion(connType)
  const type = 'json'

  res.render(
    'index',
    {
      information: JSON.stringify(information, null, 2),
      result: JSON.stringify(result, null, 2),
      query,
      type,
    },
    function (err, html) {
      res.send(html)
    }
  )
})

router.get('/select/:tableType/:version', async function (req, res, next) {
  const tableType = req.params.tableType
  const version = req.params.version
  const { result, query } = await select.selectTable(tableType, version)
  const type = 'json'

  res.render(
    'index',
    {
      information: JSON.stringify(information, null, 2),
      result: JSON.stringify(result, null, 2),
      query,
      type,
    },
    function (err, html) {
      res.send(html)
    }
  )
})

router.get('/delete/:version', async function (req, res, next) {
  const version = req.params.version
  const { result, query } = await insert.deleteSchema(version)
  const type = 'text'

  res.render(
    'index',
    {
      information: JSON.stringify(information, null, 2),
      result: JSON.stringify(result, null, 2),
      query,
      type,
    },
    function (err, html) {
      res.send(html)
    }
  )
})

router.get('/compare/:versionOld-:versionNew', async function (req, res, next) {
  const { versionOld, versionNew } = req.params
  const { result, query } = await compare.compareSchema(
    versionOld,
    versionNew,
    { collation: true },
    true
  )
  const type = 'json'

  res.render(
    'index',
    {
      information: JSON.stringify(information, null, 2),
      result: JSON.stringify(result, null, 2),
      query: common.queryToFlat(query),
      type,
    },
    function (err, html) {
      res.send(html)
    }
  )
})

module.exports = router

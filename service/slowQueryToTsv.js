const path = require('path')
const fs = require('fs')

function getContent(fullPath) {
  const content = fs.readFileSync(fullPath, 'utf8')
  return content
}

function normalizeContent(content) {
  let contentNew = content

  // SET timestamp=1629648173;
  contentNew = contentNew.replace(/SET timestamp=\d+;\n/, '')
  // use monitoring;
  contentNew = contentNew.replace(/use \w+;\n/, '')

  contentNew = contentNew.replace(/"/g, '""') // " -> ""

  return contentNew
}

function normalizeContent2Line(content) {
  let contentNew = content
  contentNew = contentNew.replace(/'\d{17}_\d{4}'/g, "'*'") // call id
  contentNew = contentNew.replace(/'\d{14}_\d{4}'/g, "'*'") // AUDIOID
  contentNew = contentNew.replace(
    /'\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(\.\d{1,3})?'/g,
    "'*'"
  ) // end_time
  contentNew = contentNew.replace(/'\d{16}'/g, "'*'") // dialog_id
  contentNew = contentNew.replace(/VALUES?\s*\(.+\);/gis, 'VALUES (*);') // values ()
  contentNew = contentNew.replace(/VALUES?\s*\(.+/gi, 'VALUES (*') // values ()

  contentNew = contentNew.replace(/"/g, '""') // " -> ""
  return contentNew
}

function slowQueryToTsv(slowQueryFullPaths, tsvFullPath) {
  const list = []

  for (let i = 0; i < slowQueryFullPaths.length; i += 1) {
    const slowQueryFullPath = slowQueryFullPaths[i]
    const content = getContent(slowQueryFullPath)

    const r = /#(?: Time:)/gs
    const content2 = content.replace(
      /(.+\(MySQL Enterprise.+|Tcp port:.+|Time\s+Id\s+Command\s+Argument)\n/g,
      ''
    )

    content2.split(r).forEach((value) => {
      const r2 =
        /(?<time>.+?)\n.+?User@Host: (?<user>.+?) +?Id: (?<id>.+?)\n.+?Query_time: (?<queryTime>[\d.]+).+?Lock_time: (?<lockTime>[\d.]+).+?Rows_sent: (?<rowsSent>\d+).+?Rows_examined: (?<rowsExamined>\d+)\n(?<content>.+)/gs
      const ret = r2.exec(value)
      if (ret) {
        const content = normalizeContent(ret.groups.content)

        const contents = content.split('\n')
        let content2Line = ''
        const max = Math.min(2, contents.length)
        for (let i = 0; i < max; i++) {
          content2Line += contents[i] + ' '
        }
        content2Line = normalizeContent2Line(content2Line)

        list.push({
          time: ret.groups.time,
          user: ret.groups.user,
          id: ret.groups.id,
          queryTime: ret.groups.queryTime,
          lockTime: ret.groups.lockTime,
          rowsSent: ret.groups.rowsSent,
          rowsExamined: ret.groups.rowsExamined,
          content: content,
          content2Line: content2Line,
        })
      }
    })
  }

  const tsvList = [
    'time\tuser\tid\tqueryTime\tlockTime\trowsSent\trowsExamined\tcontent2Line\tcontent',
  ]
  list.forEach((item) => {
    tsvList.push(
      `${item.time}\t${item.user}\t${item.id}\t${item.queryTime}\t${item.lockTime}\t${item.rowsSent}\t${item.rowsExamined}\t"${item.content2Line}"\t"${item.content}"`
    )
  })
  const tsvContent = tsvList.join('\r\n')

  fs.writeFileSync(tsvFullPath, tsvContent)
  return { result: tsvFullPath }
}

// /dblog/slow-query.log
// /dwlog/slow-query.log

// node -e "require('./service/slowQueryToTsv.js').slowQueryToTsv(['D:\\Temp\\slow-query\\slow-query.log-20210824', 'D:\\Temp\\slow-query\\slow-query.log-20210825', 'D:\\Temp\\slow-query\\slow-query.log-20210826'], 'D:\\Temp\\slow-query\\slow-query.log-20210824-26.tsv')"

module.exports = { slowQueryToTsv }

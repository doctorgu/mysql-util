const fs = require('fs')

function readAsJson(replaceCounterSlash, fullPath) {
  let content = fs.readFileSync(fullPath, 'utf8')

  // Prevent JSON parse
  if (replaceCounterSlash) {
    content = content.replace(/\\/g, '\\\\')
  }

  const json = JSON.parse(content)
  return json
}

function jsonTo(callbackFn, lineSeparator, fullPathSrc, fullPathDest) {
  const fullPathsSrc = !fullPathSrc.length ? [fullPathSrc] : fullPathSrc

  const list = []

  for (let i = 0; i < fullPathsSrc.length; i++) {
    const json = readAsJson(true, fullPathsSrc[i])

    for (let nJson = 0; nJson < json.length; nJson++) {
      const jsObj = json[nJson]
      const ret = callbackFn(jsObj, i)
      if (ret === null) continue

      list.push(ret)
    }
  }

  const contentNew = list.join(lineSeparator)
  fs.writeFileSync(fullPathDest, contentNew)
}

function convToInsertFn(jsObj) {
  if (!/^202111070[456]/.test(jsObj.cnsltDt)) {
    return null
  }

  const colComma = Object.keys(jsObj).join(',')

  const valList = Object.values(jsObj).map((v) => {
    if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`
    else return v
  })
  const valComma = valList.join(',')

  return `insert _temp_040506 (${colComma}) values (${valComma});`
}

jsonTo(
  convToInsertFn,
  '\n',
  ['D:\\Temp\\select20211104~06.json'],
  'D:\\Temp\\select20211104~06.sql'
)

// node service/jsonTo

const fs = require('fs')
const readline = require('readline')
const moment = require('moment')

/*
--summary
Read long text file line by line and create new short text file by adding only filtered line
--example
// Add line when only 'abc' text exists
;(async () => {
  const list = await filterLine(
    function (line, lineIndex, fullPath) {
      if (line.indexOf('abc') !== 1) return line
      else return null
    },
    [
      'D:\\Temp\\userLog-2021-10-04.0.log',
      'D:\\Temp\\userLog-2021-10-04.1.log',
      'D:\\Temp\\userLog-2021-10-04.2.log',
    ],
  )
  const list2 = removeLineDup(list)
  saveList(lineSeparator, list2, 'D:\\Temp\\filtered.log')
})()
*/
async function filterLine(filterFn, fullPathSrc) {
  const fullPathsSrc = !fullPathSrc.length ? [fullPathSrc] : fullPathSrc
  const tag = {}
  const list = []

  for (let i = 0; i < fullPathsSrc.length; i++) {
    const fullPath = fullPathsSrc[i]

    const fileStream = fs.createReadStream(fullPath)

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    })
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.

    let lineIndex = 0
    for await (const line of rl) {
      lineIndex += 1
      const lineNew = filterFn(line, lineIndex, fullPath, tag)
      if (lineNew !== null) {
        list.push(lineNew)
      }
    }
  }

  return list
}

/*
--summary
Return duplication removed list
--example
removeLineDup([1,1,2])
-> [1, 2]
*/
function removeLineDup(list) {
  const set = new Set()

  list.forEach((item) => set.add(item))

  return [...set]
}

/*
--summary
Save list to file
*/
function saveList(lineSeparator, list, fullPathDest) {
  const content = list.join(lineSeparator)
  fs.writeFileSync(fullPathDest, content)
}

function filterFnTest(line, lineIndex, fullPath, tag = {}) {
  if (line.indexOf('user') !== -1) return line

  return null
}

// filterLine(
//   filterFnTest,
//   '\n',
//   [
//     'D:\\Temp\\userLog-2021-10-05.0.log',
//     'D:\\Temp\\userLog-2021-10-05.1.log',
//     'D:\\Temp\\userLog-2021-10-05.2.log',
//   ],
//   'D:\\Temp\\filteredStart.log'
// )

// node service/filterLine

module.exports = {
  filterLine,
  saveList,
}

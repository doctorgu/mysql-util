function queryToFlat(query) {
  return Object.entries(query)
    .map(([k, v]) => `-- ${k}\n${v.trim()}`)
    .join('\n\n')
}

function replaceExtension(fileNameWithExtension, extension) {
  const fileExtReg = new RegExp('(.+)(\\..+)$')
  const fileNameNew = fileExtReg.test(fileNameWithExtension)
    ? fileNameWithExtension.replace(fileExtReg, `$1${extension}`)
    : `${fileNameWithExtension}${extension}`
  return fileNameNew
}

module.exports = { queryToFlat, replaceExtension }

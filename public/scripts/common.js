async function getResult(url) {
  const resp = await axios.get(url)
  return resp.data
}

function toJson() {
  const type = document.getElementById('type_hidden').value
  if (type !== 'json') return

  document.getElementById('result').value =
    document.getElementById('result_hidden').value
}

function toTsv() {
  function getColumns(value) {
    const row = value[0]
    const column = Object.keys(row).join('\t')
    return column
  }

  function getRows(rows) {
    const result = rows
      .map((row) =>
        Object.values(row)
          .map((col) => (/[\t\r\n]/.test(col) ? `"${col}"` : col))
          .join('\t')
      )
      .join('\n')

    return result
  }

  const type = document.getElementById('type_hidden').value
  if (type !== 'json') return

  const result = JSON.parse(document.getElementById('result_hidden').value)

  let columnsAndRows = []
  if (!Array.isArray(result)) {
    columnsAndRows = Object.entries(result)
      .filter(([k, v]) => v.length > 0)
      .map(([k, v]) => {
        const columns = getColumns(v)
        const rows = getRows(v)
        return `${k}:\n${columns}\n${rows}`
      })
  } else {
    const columns = getColumns(result)
    const rows = getRows(result)
    columnsAndRows.push(`${columns}\n${rows}`)
  }

  document.getElementById('result').value = columnsAndRows.join('\n\n')
}

function getUrlOriginal() {
  return document.getElementById('url').getAttribute('value')
}

function getInformation() {
  const info = document.getElementById('information_hidden').value
  if (!info) return null

  return JSON.parse(info)
}

function getUrlNew() {
  // To remove initial value (ex: /schema/insert/:connType)
  setUrl()

  return document.getElementById('url').innerText
}

function getNames(url) {
  const names = []
  for (let m of url.matchAll(/:(\w+)(\??)/g)) {
    const name = m[1]
    const optional = !!m[2]
    names.push({ name, optional })
  }
  return names
}

function setUrl() {
  const url = getUrlOriginal()
  let urlNew = url
  getNames(url).forEach(({ name, optional }) => {
    const value = document.getElementById(name).value.trim()
    urlNew = urlNew.replace(new RegExp(`:${name}\\??`), value)
  })

  document.getElementById('url').innerText = urlNew
}

function displayUrl(url) {
  document.getElementById('url').setAttribute('value', url)
  document.getElementById('url').innerText = url
}

function appendFormAndUpload(action) {
  const input = document.getElementById('input')

  const form = document.createElement('form')
  form.action = action
  // form.target = 'postAndDownload'
  form.method = 'post'
  form.enctype = 'multipart/form-data'
  input.appendChild(form)

  const file = document.createElement('input')
  file.type = 'file'
  file.name = 'file'
  file.multiple = true
  form.appendChild(file)
}

function appendInput(name, optional) {
  const input = document.createElement('input')
  input.type = 'text'
  input.placeholder = name
  input.id = name
  input.name = name
  input.required = !optional
  input.addEventListener('keyup', (e) => {
    setUrl()
  })
  document.getElementById('input').appendChild(input)
}

async function getResultInterval(url) {
  const { result, query, type } = await getResult(url)
  if (result.length) {
    document.getElementById('result').value = result
    document.getElementById('result_hidden').value = result
    document.getElementById('query').value = query
    document.getElementById('type_hidden').value = type
  }

  setTimeout(() => getResultInterval(url), 1000)
}

function appendRequestButton(hasUpload, hasWatch) {
  // if (hasUpload) {
  //   const submit = document.createElement('input')
  //   submit.type = 'submit'
  //   submit.value = 'Request'
  //   document.forms[0].appendChild(submit)
  // } else {
  //   const request = document.createElement('input')
  //   request.type = 'button'
  //   request.value = 'Request'
  //   request.addEventListener('click', async (e) => {
  //     const urlNew = getUrlNew()
  //     if (hasWatch) {
  //       getResultInterval(urlNew)
  //     } else {
  //       document.location.href = urlNew
  //     }
  //   })
  //   document.getElementById('input').appendChild(request)
  // }
  const request = document.createElement('input')
  request.type = 'button'
  request.value = 'Request'
  request.id = 'requestButton'
  request.addEventListener('click', async (e) => {
    const urlNew = getUrlNew()
    if (hasUpload) {
      document.forms[0].action = urlNew
      document.forms[0].submit()
    } else if (hasWatch) {
      getResultInterval(urlNew)
    } else {
      document.location.href = urlNew
    }
  })
  document.getElementById('input').appendChild(request)
}

function displayDescription(information) {
  const description = information
    .map(
      (info) =>
        `<a href="javascript:displayInput('${info.url}')">${info.url}</a><br />${info.description}<br />`
    )
    .join('\n')
  document.getElementById('description').innerHTML = description
}

function displayInput(url) {
  document.getElementById('input').innerHTML = ''

  displayUrl(url)

  const hasUpload = url.includes('/upload/')
  const hasWatch = url.includes('/watch/')
  if (hasUpload) {
    appendFormAndUpload(url)
  }

  for (let { name, optional } of getNames(url)) {
    appendInput(name, optional)
  }

  appendRequestButton(hasUpload, hasWatch)
}

const info = getInformation()
if (info) {
  displayDescription(info)
}

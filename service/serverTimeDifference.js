const fs = require('fs')
const config = require('config-yml')
const { NodeSSH } = require('node-ssh')
const {
  getConnection,
  getStdOut,
  streamingCallback,
} = require('../util/sshHelper')

function delay(ms, message) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (message) console.log(message)

      resolve()
    }, ms)
  })
}

function getTimeDifference(connAndTime, standardServer) {
  if (!standardServer) standardServer = 'noserver'

  const stdTime = new Date(`1900-01-01 ${connAndTime.get(standardServer)}`)
  const connAndDiff = {}

  connAndTime.forEach((v, k) => {
    const diff = stdTime - new Date(`1900-01-01 ${v}`)
    connAndDiff[k] = diff
  })

  return connAndDiff
}

async function getServerTimeDifference(standardServer) {
  const checkAtCount = 10
  let count = 0

  const ssh = new NodeSSH()

  const connAndTime = new Map()
  let connAndDiff = new Map()
  const cmd = "for i in {0..100}; do sleep .1; date +'%T.%N'; done"
  const connTypes = Object.keys(config.sshConnection)
  for (let i = 0; i < connTypes.length; i++) {
    const connType = connTypes[i]
    const confConn = config.sshConnection[connType]
    const confOption = config.sshOption

    const conn = await getConnection(ssh, confConn, confOption)

    streamingCallback(
      conn,
      cmd,
      (chunk) => {
        const time = chunk.toString('utf8')
        connAndTime.set(connType, time)
        if (connAndTime.size === connTypes.length) {
          count += 1

          if (count === checkAtCount) {
            connAndDiff = getTimeDifference(connAndTime, standardServer)
          }
        }
        // process.stdout.write(connType.padEnd(10, ' ') + time)
      },
      (chunk) => {
        process.stderr.write(connType.padEnd(10, ' ') + chunk.toString('utf8'))
      }
    )
  }

  while (connAndDiff.size === 0) {
    await delay(1000)
  }

  ssh.dispose()

  // const connAndDiffObj = {}
  // connAndDiff.forEach((v, k) => (connAndDiffObj[k] = v))

  // console.log(2, connAndDiff)
  return { result: connAndDiff, query: cmd }
}

// async function getStdOut(conn, cmd) {
//   const ssh = new NodeSSH()

//   // const result = await conn.execCommand(cmd)
//   // console.log('stdout', result.stdout)
//   // console.log('stderr', result.stderr)

//   // const result = await conn.exec(cmd, parameters)
//   // console.log('result', result)

//   await conn.execCommand(cmd, {
//     onStdout(chunk) {
//       console.log('stdoutChunk', chunk.toString('utf8'))
//     },
//     onStderr(chunk) {
//       console.log('stderrChunk', chunk.toString('utf8'))
//     },
//   })

//   ssh.dispose()

//   // await conn.exec(cmd, parameters, {
//   //   onStdout(chunk) {
//   //     console.log('stdoutChunk', chunk.toString('utf8'))
//   //   },
//   //   onStderr(chunk) {
//   //     console.log('stderrChunk', chunk.toString('utf8'))
//   //   },
//   // })
// }

// node -e "require('./service/ssh.js').getStdOut('ls -l')"
// node -e "require('./service/ssh.js').getStdOut('ls', ['-l'])"
// node -e "require('./service/ssh.js').getStdOut('echo \'xyz\'')"
// node -e "require('./service/ssh.js').getStdOut('for i in {0..10}; do sleep .1; date +\'%T.%N\'; done', [])"

// node -e "require('./service/serverTimeDifference.js').getServerTimeDifference().then(r => console.log(r))"

module.exports = { getStdOut, getServerTimeDifference }

const { NodeSSH } = require('node-ssh')

async function getConnection(ssh, confConn, confOption) {
  const conn = await ssh.connect({
    host: confConn.host,
    username: confConn.username,
    port: confConn.port,
    password: confConn.password,
    readyTimeout: confOption.readyTimeout,
  })

  return conn
}

async function getStdOut(connType, cmd) {
  const ssh = new NodeSSH()

  const conn = await getConnection(ssh, connType)
  const result = await conn.execCommand(cmd)

  const stdout = result.stdout
  const stderr = result.stderr

  ssh.dispose()

  if (stderr) {
    throw stderr
  }

  return stdout
}

async function streamingCallback(
  conn,
  cmd,
  onStdout = (chunk) => console.log('stdoutChunk', chunk.toString('utf8')),
  onStderr = (chunk) => console.log('stderrChunk', chunk.toString('utf8'))
) {
  await conn.execCommand(cmd, {
    onStdout,
    onStderr,
  })
}

module.exports = {
  getConnection,
  getStdOut,
  streamingCallback,
}

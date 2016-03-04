import readline from 'readline'
import csp from 'js-csp'
import connect from './connection'

const PORT = 1234

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const getLine = () => {
  const lineChan = csp.chan()

  rl.question('enter sql query:\n', line => {
    csp.putAsync(lineChan, line, () => lineChan.close())
  })

  return lineChan
}

csp.go(function * () {
  const [ read, write ] = connect(PORT)
  let command

  while((command = yield csp.take(getLine())) !== '\q') {
    yield csp.put(write, command)
    console.log('results received ', yield csp.take(read))
  }

  write.close()
})

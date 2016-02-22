import csp from 'js-csp'
import connect from './connection'

const PORT = 1234

csp.go(function * () {
  const [ read, write ] = connect(PORT)

  yield csp.put(write, 'select * from nums;')
  const results = yield csp.take(read)
  console.log(results)
  write.close()
})

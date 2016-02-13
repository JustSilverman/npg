import { equal } from 'assert'
import csp from 'js-csp'

const serverToClientMsgs = csp.chan()
const clientToServerMsgs = csp.chan()

const mockServer = (rChan, wChan) => {
  return csp.go(function * () {
    let msg
    msg = yield csp.take(rChan)
    equal(msg, 'first startup')

    yield csp.put(wChan, 'session confirm')
    msg = yield csp.take(rChan)
    equal(msg, 'second startup')

    yield csp.put(wChan, 'parameter status message 1')
    yield csp.put(wChan, 'parameter status message 2')
    yield csp.put(wChan, 'parameter status message 3')
    yield csp.put(wChan, 'backend key data')
    yield csp.put(wChan, 'ready for query')

    while((msg = yield csp.take(rChan)) !== 'close') {
      let queryMsg = msg
      console.log('executing query ', queryMsg)
      // do query ...
      yield csp.put(wChan, 'header: expecting 3 rows')
      yield csp.put(wChan, 'query row 1')
      yield csp.put(wChan, 'query row 2')
      yield csp.put(wChan, 'query row 3')
      yield csp.put(wChan, 'query close')
    }
  })
}

const client = (rChan, wChan) => {
  return csp.go(function * () {
    console.log('client started')
    let msg
    yield csp.put(wChan, 'first startup')
    console.log('wrote first startup')

    msg = yield csp.take(rChan)
    if (msg !== 'session confirm') {
      throw new Error('Expected session confirm message, but received ', msg)
    }

    yield csp.put(wChan, 'second startup')
    console.log('wrote second startup')

    const paramaterStatusMessages = []
    msg = yield csp.take(rChan)
    while(msg !== 'backend key data') {
      console.log('paramaterStatusMessages', msg)
      paramaterStatusMessages.push(msg)
      msg = yield csp.take(rChan)
    }

    const backendKeyDataMsg = msg
    msg = yield csp.take(rChan)
    if (msg !== 'ready for query') {
      throw new Error('Expected ready for query message, but received ', msg)
    }

    yield csp.put(wChan, 'first query')
    let row
    const queryRows = []
    const queryHeader = yield csp.take(rChan)
    while((row = yield csp.take(rChan)) !== 'query close') {
      queryRows.push(row)
    }
    console.log('query header ', queryHeader)
    console.log('query rows ', queryRows)

    yield csp.put(wChan, 'close')
  })
}

const serverDone = mockServer(clientToServerMsgs, serverToClientMsgs)
const clientDone = client(serverToClientMsgs, clientToServerMsgs)

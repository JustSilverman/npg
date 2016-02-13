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

    yield csp.put(wChan, 'info about the server ...')
    yield csp.put(wChan, 'ready for query')
    yield csp.put(wChan, 'ready for query2')
    yield csp.put(wChan, 'ready for query3')


    while((msg = yield csp.take(rChan)) !== 'close') {
      let queryMsg = msg
      console.log('done')
      // do query ...
      // write result head
      // write result rows
      // write result close
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
    const queryRows = []
    const queryHeader = yield csp.take(rChan)
    while((row = yield csp.take(rChan)) !== 'query close') {
      queryRows.push(row)
    }

    yield csp.put(wChan, 'close')
  })
}

const serverDone = mockServer(clientToServerMsgs, serverToClientMsgs)
const clientDone = client(serverToClientMsgs, clientToServerMsgs)

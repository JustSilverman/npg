import { equal } from 'assert'
import csp from 'js-csp'
import { asDesc as messages } from '../../fixtures/messages'

const mockServer = (rChan, wChan) => {
  return csp.go(function * () {
    let msg
    msg = yield csp.take(rChan)
    equal(msg, messages.get('firstStartup'))

    yield csp.put(wChan, messages.get('sessionConfirm'))
    msg = yield csp.take(rChan)
    equal(msg, messages.get('secondStartup'))

    yield csp.put(wChan, messages.get('parameterStatus') + ': 1')
    yield csp.put(wChan, messages.get('parameterStatus') + ': 2')
    yield csp.put(wChan, messages.get('parameterStatus') + ': 3')
    yield csp.put(wChan, messages.get('backendKeyData'))
    yield csp.put(wChan, messages.get('readyForQuery'))

    while((msg = yield csp.take(rChan)) !== messages.get('exit')) {
      let queryMsg = msg
      console.log('executing query ', queryMsg)
      // do query ...
      yield csp.put(wChan, messages.get('queryHead'))
      yield csp.put(wChan, messages.get('queryRow') + ': 1')
      yield csp.put(wChan, messages.get('queryRow') + ': 2')
      yield csp.put(wChan, messages.get('queryRow') + ': 3')
      yield csp.put(wChan, messages.get('queryClose'))
    }
  })
}

const client = (rChan, wChan) => {
  return csp.go(function * () {
    let msg
    yield csp.put(wChan, messages.get('firstStartup'))
    console.log('wrote first startup')

    msg = yield csp.take(rChan)
    if (msg !== messages.get('sessionConfirm')) {
      throw new Error('Expected session confirm message, but received ', msg)
    }

    yield csp.put(wChan, messages.get('secondStartup'))
    console.log('wrote second startup')

    const paramaterStatusMessages = []
    msg = yield csp.take(rChan)
    while(msg !== messages.get('backendKeyData')) {
      console.log('paramaterStatusMessages', msg)
      paramaterStatusMessages.push(msg)
      msg = yield csp.take(rChan)
    }

    const backendKeyDataMsg = msg
    msg = yield csp.take(rChan)
    if (msg !== messages.get('readyForQuery')) {
      throw new Error('Expected ready for query message, but received ', msg)
    }

    yield csp.put(wChan, messages.get('query'))

    let row
    const queryRows = []
    const queryHeader = yield csp.take(rChan)
    while((row = yield csp.take(rChan)) !== messages.get('queryClose')) {
      queryRows.push(row)
    }
    console.log('query header ', queryHeader)
    console.log('query rows ', queryRows)

    yield csp.put(wChan, messages.get('exit'))
  })
}

const serverToClientMsgs = csp.chan()
const clientToServerMsgs = csp.chan()
mockServer(clientToServerMsgs, serverToClientMsgs)
client(serverToClientMsgs, clientToServerMsgs)

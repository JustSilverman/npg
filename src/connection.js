const PORT = 1234
import net from 'net'
import csp from 'js-csp'
import { asBuf as rawMsgs, asPgMessage as pgMsgs } from '../test/fixtures/messages'
import msgChannel from './msg-channel'
import * as headers from './msg-headers'
import { ofType } from './msg-equality'
import toChannels from './csp-ify-socket'
import * as create from './msg-creator'

export const connectArgs = (pgUrl) => {
  if (typeof pgUrl === 'number') {
    return { port: pgUrl }
  } else {
    throw new Error('Only port supported, but received ', pgUrl)
  }
}

export const connect = (pgUrl) => {
  const socket = net.connect(connectArgs(pgUrl))
  const { connected, errors, read, write } = toChannels(socket)

  return startup(connected, read, write, errors)
}

//TODO: error handling with alts
export const startup = (connectedChan, rChan, wChan, errChan) => {
  const resultWriter = csp.chan()
  const statementReader = csp.chan()

  csp.go(function * () {
    const parameterStatusMessages = []
    let msg

    yield csp.take(connectedChan)

    yield csp.put(wChan, rawMsgs.get('firstStartup'))

    const sessionConfirmChan = msgChannel(rChan, 1, 0, false)
    const sessionConfirmByte = yield csp.take(sessionConfirmChan)
    sessionConfirmChan.close()
    if (!ofType(headers.sessionConfirm, sessionConfirmByte)) {
      throw new Error('Expected session confirm message, but received ', sessionConfirmByte)
    }

    const messagesChannel = msgChannel(rChan)
    yield csp.put(wChan, rawMsgs.get('secondStartup'))

    msg = yield csp.take(messagesChannel)
    while((msg !== csp.CLOSED) && !ofType(headers.backendKeyData, msg)) {
      parameterStatusMessages.push(msg)
      msg = yield csp.take(messagesChannel)
    }

    const backendKeyDataMsg = msg
    if (!ofType(headers.backendKeyData, backendKeyDataMsg)) {
      throw new Error('Expected ready backend key data message, but received ', msg)
    }

    const readyForQueryMsg = yield csp.take(messagesChannel)
    if (!ofType(headers.readyForQuery, readyForQueryMsg)) {
      throw new Error('Expected ready for query message, but received ', readyForQueryMsg)
    }

    let statement = yield csp.take(statementReader)
    while(statement !== csp.CLOSED) {
      const rowMessages = []

      yield csp.put(wChan, create.fromBuf(headers.query, new Buffer(statement), true))
      console.log('message sent')

      const rowDescription = yield csp.take(messagesChannel)
      console.log('rowDescription ', rowDescription)
      let rowMessage = yield csp.take(messagesChannel)
      while(rowMessage !== csp.CLOSED && !ofType(headers.queryClose, rowMessage)) {
        rowMessages.push(rowMessage)
        rowMessage = yield csp.take(messagesChannel)
      }
      const queryClose = rowMessage
      //transform messages
      yield csp.put(resultWriter, rowMessages.map(msg => msg.body))
      if (!ofType(headers.readyForQuery, yield csp.take(messagesChannel))) {
        throw new Error('Expected ready for query message, but received ', readyForQueryMsg)
      }

      statement = yield csp.take(statementReader)
    }

    yield csp.put(wChan, new Buffer([0x58, 0x00, 0x00, 0x00, 0x04]))
  })

  return [ resultWriter, statementReader ]
}

export default connect

const PORT = 1234
import net from 'net'
import csp from 'js-csp'
import { asBuf as rawMsgs, asPgMessage as pgMsgs } from '../test/fixtures/messages'
import msgChannel from './msg-channel'
import * as headers from './msg-headers'
import { ofType } from './msg-equality'
import toChannels from './csp-ify-socket'
import * as create from './msg-creator'
import { headerSymToParser } from './msg-parsing/msg-parsers'

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

    const authenticationOk = yield csp.take(messagesChannel)

    //validate authenticateOk

    msg = yield csp.take(messagesChannel)
    while((msg !== csp.CLOSED) && !ofType(headers.backendKeyData, msg)) {
      const headerSym = headers.headerByteToSym.get(msg.head.toString())
      if (headerSym === undefined) {
        throw new Error('Unknown header byte of: ' + msg.head)
      }

      parameterStatusMessages.push(headerSymToParser.get(headerSym)(msg.body))
      msg = yield csp.take(messagesChannel)
    }

    const backendKeyDataMsg = msg
    if (!ofType(headers.backendKeyData, backendKeyDataMsg)) {
      throw new Error('Expected ready backend key data message, but received ', msg)
    }

    const backendKeyDataHeaderSym = headers.headerByteToSym.get(msg.head.toString())

    const readyForQueryMsg = yield csp.take(messagesChannel)
    if (!ofType(headers.readyForQuery, readyForQueryMsg)) {
      throw new Error('Expected ready for query message, but received ', readyForQueryMsg)
    }

    let statement = yield csp.take(statementReader)
    while(statement !== csp.CLOSED) {
      const rowMessages = []

      yield csp.put(wChan, create.fromBuf(headers.query, new Buffer(statement), true))

      const rowDescription = yield csp.take(messagesChannel)
      const rowDescriptionHeaderSym = headers.headerByteToSym.get(rowDescription.head.toString())

      let rowMessage = yield csp.take(messagesChannel)
      while(rowMessage !== csp.CLOSED && !ofType(headers.queryClose, rowMessage)) {
        const dataRowHeader = headers.headerByteToSym.get(rowMessage.head.toString())
        rowMessages.push(headerSymToParser.get(dataRowHeader)(rowMessage.body))
        rowMessage = yield csp.take(messagesChannel)
      }

      const queryClose = rowMessage
      yield csp.put(resultWriter, rowMessages)
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

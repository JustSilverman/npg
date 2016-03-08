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

const parsePgMessage = (typeSym, message, headerMap = headers.headerByteToSym, parseMap = headerSymToParser) => {
  const headerSym = headerMap.get(message.head.toString())
  if (!headerSym) {
    throw new Error(`Unsupported message type for header: ${message.head[0].toString(16)} (${message.head.toString()})'`)
  }
  if (headerSym !== typeSym) {
    throw new Error(`Expected to receive message of type ${typeSym.toString()}, but received ${headerSym.toString()}`)
  }

  const parserFnc = parseMap.get(headerSym)
  if (!parserFnc) {
    throw new Error(`Unsupported parser operation for header: ${message.head[0].toString(16)} (${message.head.toString()})'`)
  }

  return parserFnc(message.body)
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

    parsePgMessage(headers.authenticationOk, yield csp.take(messagesChannel))

    msg = yield csp.take(messagesChannel)
    while((msg !== csp.CLOSED) && !ofType(headers.backendKeyData, msg)) {
      parameterStatusMessages.push(parsePgMessage(headers.parameterStatus, msg))
      msg = yield csp.take(messagesChannel)
    }

    const backendKeyDataMsg = parsePgMessage(headers.backendKeyData, msg)
    parsePgMessage(headers.readyForQuery, yield csp.take(messagesChannel))

    let statement = yield csp.take(statementReader)
    while(statement !== csp.CLOSED) {
      const dataRows = []

      yield csp.put(wChan, create.fromBuf(headers.query, new Buffer(statement), true))

      let message = yield csp.take(messagesChannel)
      console.log(message)
      const rowDescription = parsePgMessage(headers.rowDescription, message)

      let dataRow = yield csp.take(messagesChannel)
      while(dataRow !== csp.CLOSED && !ofType(headers.queryClose, dataRow)) {
        dataRows.push(parsePgMessage(headers.dataRow, dataRow))
        dataRow = yield csp.take(messagesChannel)
      }

      const queryClose = dataRow
      yield csp.put(resultWriter, dataRows)
      parsePgMessage(headers.readyForQuery, yield csp.take(messagesChannel))

      statement = yield csp.take(statementReader)
    }

    yield csp.put(wChan, new Buffer([0x58, 0x00, 0x00, 0x00, 0x04]))
  })

  return [ resultWriter, statementReader ]
}

export default connect

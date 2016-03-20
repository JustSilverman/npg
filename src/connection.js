import net from 'net'
import csp from 'js-csp'
import msgChannel from './msg-channel'
import * as msgCreator from './msg-creator'
import * as headers from './msg-headers'
import { ofType } from './msg-equality'
import toChannels from './csp-ify-socket'
import * as create from './msg-creator'
import { headerSymToParser } from './msg-parsing/msg-parsers'
import hexBuf from './hex-buf'

export const connectArgs = (pgUrl) => {
  if (typeof pgUrl === 'number') {
    return { port: pgUrl }
  } else {
    throw new Error('Only port supported, but received ', pgUrl)
  }
}

// returns a channel for recieving results from running statements
// and a channel for writing statements
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

// Message flow docs: http://www.postgresql.org/docs/current/static/protocol-flow.html

//TODO: error handling with alts
// returns a channel for recieving results from running statements
// and a channel for writing statements
export const startup = (connectedChan, rChan, wChan, errChan) => {
  const statementReader = csp.chan()
  const resultWriter = csp.chan()

  csp.go(function * () {
    // wait for socket connection to establish
    yield csp.take(connectedChan)

    // write session request bytes
    const unidentifiedStartup = msgCreator.write(null, hexBuf('04 d2 16 2g'))

    yield csp.put(wChan, unidentifiedStartup)

    const buffer = yield csp.take(rChan)
    if (buffer !== sessionConfirmByte) {
      const bufferChan = csp.chan()
      yield csp.put(chan, buffer)
      const errorChannel = msgChannel(joinChans(bufferChan, rChan)
    }

    // const sessionConfirmChan = msgChannel(rChan, 1, 0, false)
    // const sessionConfirmByte = yield csp.take(sessionConfirmChan)
    // console.log('sessionConfirm ', sessionConfirmByte)

    // sessionConfirmChan.close()
    // if (!ofType(headers.sessionConfirm, sessionConfirmByte)) {
    //   throw new Error('Expected session confirm message, but received ', sessionConfirmByte.body.toString())
    // }

    // create a pg message channel to read the rest of the server's communication through
    const messagesChannel = msgChannel(rChan)

    const startMsgBody = new Buffer([
        '\u0000', '\u0003',// protocol major version number (3)
        '\u0000', '\u0000',// protocol minor version number (0)
        'user', '\u0000', 'justinsilverman', '\u0000', // key/value pair
        'database', '\u0000', 'postgres', '\u0000', // key/value pair
        '\u0000', // trailing null
      ].join(''))

    // write startup message
    const startMsg = msgCreator.write(null, startMsgBody)
    // const startMsg = msgCreator.write(null, rawMsgs.get('secondStartup'))

    yield csp.put(wChan, startMsg)

    parsePgMessage(headers.authenticationOk, yield csp.take(messagesChannel))

    const parameterStatusMessages = []
    let msg

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

      yield csp.put(resultWriter, dataRows)
      parsePgMessage(headers.readyForQuery, yield csp.take(messagesChannel))

      statement = yield csp.take(statementReader)
    }

    yield csp.put(wChan, new Buffer([0x58, 0x00, 0x00, 0x00, 0x04]))
  })

  return [ resultWriter, statementReader ]
}

export default connect

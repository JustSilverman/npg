const PORT = 1234
import net from 'net'
import csp from 'js-csp'
import { asBuf as rawMsgs, asPgMessage as pgMsgs } from '../test/fixtures/messages'
import * as toChannel from './to-channel'
import msgChannel from './msg-channel'
import * as headers from './msg-headers'
import { ofType } from './msg-equality'
import toChannels from './csp-ify-socket'

const client = (connectedChan, rChan, wChan) => {
  return csp.go(function * () {
    const parameterStatusMessages = []
    let msg

    yield csp.take(connectedChan)

    yield csp.put(wChan, rawMsgs.get('firstStartup'))

    const sessionConfirmChan = msgChannel(rChan, 1, 0, false)
    const sessionConfirmByte = yield csp.take(sessionConfirmChan)

    if (!ofType(headers.sessionConfirm, sessionConfirmByte)) {
      throw new Error('Expected session confirm message, but received ', sessionConfirmByte)
    }

    const messagesChannel = msgChannel(rChan)
    yield csp.put(wChan, rawMsgs.get('secondStartup'))

    msg = yield csp.take(messagesChannel)
    while(!messagesChannel.closed && !ofType(headers.backendKeyData, msg)) {
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

    console.log('session confirm byte: ', sessionConfirmByte)
    console.log('parameter status messages: ', parameterStatusMessages)
    console.log('backend key data: ', backendKeyDataMsg)
    console.log('ready for query: ', readyForQueryMsg)
  })
}

const socket = net.connect({ port: PORT })
const { connected, errors, read, write } = toChannels(socket)

client(connected, read, write)

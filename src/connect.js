const PORT = 1234
import net from 'net'
import { coroutine } from 'bluebird'
import hexBuf from './hex-buf'
import readSeq from './msg-sequence'
import waitForEvent from './wait-for-event'
import writeData from './write-Data'
import readMessagesUntil from './read-messages-until'

const firstStartup = hexBuf('00 00 00 08 04 d2 16 2f')
const secondStartup = hexBuf('00 00 00 46 00 03 00 00 75 73 65 72 00 6a 75 73 74 69 6e 73 69 6c 76 65 72 6d 61 6e 00 64 61 74 61 62 61 73 65 00 70 6f 73 74 67 72 65 73 00 61 70 70 6c 69 63 61 74 69 6f 6e 5f 6e 61 6d 65 00 70 73 71 6c 00 00')
const selectNumsQuery = hexBuf('51 00 00 00 18 73 65 6c 65 63 74 20 2a 20 66 72 6f 6d 20 6e 75 6d 73 3b 00')
const exitMessage = hexBuf('58 00 00 00 04')
const capitalN = hexBuf('4e') //server sends for unencrypted sessions

const isReadyForQueryMsg = (msg) => {
  return msg.head.equals(hexBuf('5a')) && msg.body.equals(hexBuf('49'))
}

const isReadyForQuery = (allMessages = [], partialMessage = hexBuf('')) => {
  return (last, getAll) => {
    const [ messages, getRemainder ] = readSeq(Buffer.concat([partialMessage, last]))
    allMessages = allMessages.concat([...messages])
    const lastMessage = allMessages[allMessages.length - 1]

    if (isReadyForQueryMsg(lastMessage)) {
      return true
    }

    partialMessage = Buffer.concat([partialMessage, getRemainder()])
    return false
  }
}

const connect = coroutine(function *(channel) {
  yield waitForEvent(channel, 'connect')
  yield writeData(channel, firstStartup)
  //sessionConfirmByte = yield readByte(channel)
  const sessionConfirm = yield readMessagesUntil(channel, (chunk, getAllChunks) => {
    return chunk.length === 1
  })
  console.log(sessionConfirm)
  if (!sessionConfirm.equals(capitalN)) {
    throw new Error('Server did not send unencrypted session confirm.')
  }

  yield writeData(channel, secondStartup)
  const rawServerSetupMessages = yield readMessagesUntil(channel, isReadyForQuery())
  const [ setupMessageItr, _ ] = readSeq(rawServerSetupMessages)
  console.log('server setup messages ', [...setupMessageItr])

  yield writeData(channel, selectNumsQuery)
  const queryResponse = yield readMessagesUntil(channel, isReadyForQuery())
  const [ messagesItr, restFunc ] = readSeq(queryResponse)
  console.log('response to query ', [...messagesItr])
  console.log('rest ', restFunc())
})

connect(net.connect({ port: PORT }))

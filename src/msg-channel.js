import { deepEqual } from 'assert'
import csp from 'js-csp'
import * as meta from './meta'
import readSeq from './msg-sequence'
import hexBuf from './hex-buf'
import equalErrors from '../test/helpers/equal-errors'

meta.module(module, {
  doc: `
    # Channel that transforms data chunks into messages
  `,
})

meta.fn('create', {
  doc: 'Creates a message channel',
  shape: 'Channel, int?, int?, bool?  -> Channel',
  args: [
    'Channel of binary data',
    'size of message header, defaults to 1, optional',
    'size of message length bytes, defaults to 4, optional',
    'whether the messages length include the length bytes, defaults to true, optional'
  ],
  returns: [
    'Channel of postgres message objects'
  ],
  examples: [
    ['2 complete messages', (f) => {
      const firstMessage = hexBuf('0a 00 00 00 06 0b 0c')
      const secondMessage = hexBuf('0a 00 00 00 04')
      const givenChannel = csp.chan(2)
      const expectedMessages = [
        { head: hexBuf('0a'), body: hexBuf('0b 0c') },
        { head: hexBuf('0a'), body: hexBuf('') }
      ]

      const messageChannel = f(givenChannel)
      const postgresMessages = []

      csp.go(function* () {
        yield csp.put(givenChannel, firstMessage)
        yield csp.put(givenChannel, secondMessage)
        postgresMessages.push(yield csp.take(messageChannel))
        postgresMessages.push(yield csp.take(messageChannel))

        deepEqual(postgresMessages, expectedMessages)
        console.log('Example passed')
      })
    }],

    ['passing an error', (f) => {
      const firstMessage = hexBuf('0a 00 00 00 06 0b 0c')
      const givenError = new Error('Error in the channel')
      const givenChannel = csp.chan(2)
      const expectedMessage = { head: hexBuf('0a'), body: hexBuf('0b 0c') }

      const messageChannel = f(givenChannel)

      csp.go(function* () {
        yield csp.put(givenChannel, firstMessage)
        yield csp.put(givenChannel, givenError)
        const msg = yield csp.take(messageChannel)
        deepEqual(expectedMessage, msg)

        const error = yield csp.take(messageChannel)
        equalErrors(error, givenError)

        console.log('Error example passed')
      })
    }],

    ['closed channel', (f) => {
      const firstMessage = hexBuf('0a 00 00 00 06 0b 0c')
      const givenChannel = csp.chan(2)
      const expectedMessage = { head: hexBuf('0a'), body: hexBuf('0b 0c') }
      const messageChannel = f(givenChannel)

      csp.go(function* () {
        yield csp.put(givenChannel, firstMessage)
        givenChannel.close()

        const msg = yield csp.take(messageChannel)
        deepEqual(expectedMessage, msg)

        const close = yield csp.take(messageChannel)
        deepEqual(close, null)

        console.log('Closed channel example passed')
      })
    }]
  ],
})

export const create = (rChan, headLength = 1, lengthBytesCount = 4, lengthBytesInclusive = true) => {
  const wChan = csp.chan()

  csp.go(function* () {
    let tempBuf
    let partialMessage = hexBuf('')
    while((tempBuf = yield csp.take(rChan)) !== csp.CLOSED) {
      if (tempBuf instanceof Error) {
        yield csp.put(wChan, tempBuf)
        return
      }

      partialMessage = Buffer.concat([partialMessage, tempBuf])
      let [ messages, restFnc ] = readSeq(partialMessage, headLength, lengthBytesCount, lengthBytesInclusive)

      yield csp.operations.onto(wChan, [...messages], true)

      partialMessage = restFnc()
    }

    wChan.close()
  })

  return wChan
}

export default create

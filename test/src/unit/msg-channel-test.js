import { deepEqual } from 'assert'
import csp from 'js-csp'
import equalErrors from '../../helpers/equal-errors'
import hexBuf from '../../../src/hex-buf'
import create from '../../../src/msg-channel'

describe('msg-channel', () => {
  describe('#create', () => {
    it('transforms a channel of buffers into a message channel', (done) => {
      const firstMessage = hexBuf('0a 00 00 00 06 0b 0c')
      const secondMessage = hexBuf('0a 00 00 00 04')
      const givenChannel = csp.chan()
      const expectedMessages = [
        { head: hexBuf('0a'), body: hexBuf('0b 0c') },
        { head: hexBuf('0a'), body: hexBuf('') }
      ]

      const messageChannel = create(givenChannel)
      const postgresMessages = []

      csp.go(function* () {
        yield csp.put(givenChannel, firstMessage)
        postgresMessages.push(yield csp.take(messageChannel))
        yield csp.put(givenChannel, secondMessage)
        postgresMessages.push(yield csp.take(messageChannel))

        deepEqual(postgresMessages, expectedMessages)
        done()
      })
    })

    it('propagates errors', (done) => {
      const firstMessage = hexBuf('0a 00 00 00 06 0b 0c')
      const givenError = new Error('Error in the channel')
      const givenChannel = csp.chan()
      const expectedMessage = { head: hexBuf('0a'), body: hexBuf('0b 0c') }

      const messageChannel = create(givenChannel)

      csp.go(function* () {
        yield csp.put(givenChannel, firstMessage)
        const msg = yield csp.take(messageChannel)
        deepEqual(expectedMessage, msg)
        yield csp.put(givenChannel, givenError)
        const error = yield csp.take(messageChannel)

        equalErrors(error, givenError)
        done()
      })
    })

    it('handles the closing of the read channel', (done) => {
      const firstMessage = hexBuf('0a 00 00 00 06 0b 0c')
      const givenChannel = csp.chan()
      const expectedMessage = { head: hexBuf('0a'), body: hexBuf('0b 0c') }
      const messageChannel = create(givenChannel)

      csp.go(function* () {
        yield csp.put(givenChannel, firstMessage)
        givenChannel.close()

        const msg = yield csp.take(messageChannel)
        deepEqual(expectedMessage, msg)

        const close = yield csp.take(messageChannel)
        deepEqual(close, null)
        done()
      })
    })

    context('messages with non-default parameters', () => {
      it('handles headless messages', (done) => {
        const firstMessage = hexBuf('00 00 00 06 0b 0c')
        const secondMessage = hexBuf('00 00 00 04')
        const givenChannel = csp.chan()
        const expectedMessages = [
          { head: hexBuf(''), body: hexBuf('0b 0c') },
          { head: hexBuf(''), body: hexBuf('') }
        ]

        const messageChannel = create(givenChannel, 0)
        const postgresMessages = []

        csp.go(function* () {
          yield csp.put(givenChannel, firstMessage)
          postgresMessages.push(yield csp.take(messageChannel))
          yield csp.put(givenChannel, secondMessage)
          postgresMessages.push(yield csp.take(messageChannel))

          deepEqual(postgresMessages, expectedMessages)
          done()
        })
      })

      it('handles 1 byte message', (done) => {
        const firstMessage = hexBuf('4e')
        const givenChannel = csp.chan()
        const expectedMessages = [
          { head: hexBuf('4e'), body: hexBuf('') },
        ]

        const messageChannel = create(givenChannel, 0)
        const postgresMessages = []

        csp.go(function* () {
          yield csp.put(givenChannel, firstMessage)
          postgresMessages.push(yield csp.take(messageChannel))

          deepEqual(postgresMessages, expectedMessages)
          done()
        })
      })

      it('handles messages with 2 length bytes', (done) => {
        const firstMessage = hexBuf('0a 00 03 0b')
        const secondMessage = hexBuf('0b 00 04 0a 0a')
        const givenChannel = csp.chan()
        const expectedMessages = [
          { head: hexBuf('0a'), body: hexBuf('0b') },
          { head: hexBuf('0b'), body: hexBuf('0a 0a') }
        ]

        const messageChannel = create(givenChannel, 1, 2)
        const postgresMessages = []

        csp.go(function* () {
          yield csp.put(givenChannel, firstMessage)
          postgresMessages.push(yield csp.take(messageChannel))
          yield csp.put(givenChannel, secondMessage)
          postgresMessages.push(yield csp.take(messageChannel))

          deepEqual(postgresMessages, expectedMessages)
          done()
        })
      })

      it('handles messages with length excluding lengthBytes', (done) => {
        const firstMessage = hexBuf('0a 00 01 0b')
        const secondMessage = hexBuf('0b 00 02 0a 0a')
        const givenChannel = csp.chan()
        const expectedMessages = [
          { head: hexBuf('0a'), body: hexBuf('0b') },
          { head: hexBuf('0b'), body: hexBuf('0a 0a') }
        ]

        const messageChannel = create(givenChannel, 1, 2, false)
        const postgresMessages = []

        csp.go(function* () {
          yield csp.put(givenChannel, firstMessage)
          postgresMessages.push(yield csp.take(messageChannel))
          yield csp.put(givenChannel, secondMessage)
          postgresMessages.push(yield csp.take(messageChannel))

          deepEqual(postgresMessages, expectedMessages)
          done()
        })
      })
    })
  })
})

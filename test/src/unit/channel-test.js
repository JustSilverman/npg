import { equal, deepEqual } from 'assert'
import { coroutine } from 'bluebird'
import hexBuf from '../../../src/hex-buf'
import * as ch from '../../../src/channel'
import readOneMessage from '../../../src/read-one-message'
import createMockReader from '../../helpers/mock-reader'
import createMockWriter from '../../helpers/mock-writer'
import equalErrors from '../../helpers/equal-errors'

describe('channel', () => {
  const identity = (val) => val
  const readOneIdentity = (readable) => {
    return new Promise((resolve, reject) => {
      return resolve(readable.read(1).toString())
    })
  }


  describe('#getMessage returns a promise', () => {
    it('resolves when one message that has been read', (done) => {
      const givenMessages = ['a', 'b', 'c']
      const givenMockSocket = createMockReader(givenMessages)
      const channel = ch.Create(givenMockSocket, readOneIdentity, identity)

      coroutine(function* () {
        let message
        message = yield ch.getMessage(channel)
        equal(message, 'a')

        message = yield ch.getMessage(channel)
        equal(message, 'b')

        message = yield ch.getMessage(channel)
        equal(message, 'c')
        done()
      })()
    })

    context('using actual messages', () => {
      it('resolves when one message that has been read', (done) => {
        const givenMessages = [
          hexBuf('0a 00 00 00 05 0b'),
          hexBuf('0a 00 00 00 01 0b'),
          hexBuf('0c 00 04 0b 0a'),
          hexBuf('00 00 00 01 0e')
        ]
        const givenMockSocket = createMockReader(givenMessages)
        const channel = ch.Create(givenMockSocket, readOneMessage, identity)

        coroutine(function* () {
          let message
          message = yield ch.getMessage(channel)
          deepEqual(message, { head: hexBuf('0a'), body: hexBuf('0b') })
          message = yield ch.getMessage(channel, 1, 4, false)
          deepEqual(message, { head: hexBuf('0a'), body: hexBuf('0b') })
          message = yield ch.getMessage(channel, 1, 2)
          deepEqual(message, { head: hexBuf('0c'), body: hexBuf('0b 0a') })
          message = yield ch.getMessage(channel, 0, 4, false)
          deepEqual(message, { head: null, body: hexBuf('0e') })
          done()
        })()
      })

      it('resolves when one message that has been read', (done) => {
        const givenMessages = [
          hexBuf('0a 00 00 00 05 0b 0a 00 00 00 01 0b 0c 00 04 0b 0a 00 00 00 01 0e')
        ]
        const givenMockSocket = createMockReader(givenMessages)
        const channel = ch.Create(givenMockSocket, readOneMessage, identity)

        coroutine(function* () {
          let message
          message = yield ch.getMessage(channel)
          deepEqual(message, { head: hexBuf('0a'), body: hexBuf('0b') })
          message = yield ch.getMessage(channel, 1, 4, false)
          deepEqual(message, { head: hexBuf('0a'), body: hexBuf('0b') })
          message = yield ch.getMessage(channel, 1, 2)
          deepEqual(message, { head: hexBuf('0c'), body: hexBuf('0b 0a') })
          message = yield ch.getMessage(channel, 0, 4, false)
          deepEqual(message, { head: null, body: hexBuf('0e') })
          done()
        })()
      })

      it('rejects with a timeout error if timeout is reached', () => {

      })

      it('rejects with a timeout error if custom timeout is reached', () => {

      })

      it('rejects with an error if readable emits an error', () => {

      })
    })
  })

  describe('#writeMessage returns a promise', () => {
    it('returns a promise ', (done) => {
      const givenMockSocket = createMockWriter((buf) => buf.toString())
      const channel = ch.Create(givenMockSocket, identity, identity)
      const expectedMessages = ['a', 'b', 'c']

      coroutine(function* () {
        yield ch.writeMessage(channel, 'a')
        yield ch.writeMessage(channel, 'b')
        yield ch.writeMessage(channel, 'c')

        deepEqual(givenMockSocket.testBuffer(), ['a', 'b', 'c'])
        done()
      })()
    })
  })
})
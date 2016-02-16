import { equal, deepEqual } from 'assert'
import { readSeq } from '../../../src/msg-sequence'
import { hexBuf } from '../../../src/hex-buf'

describe('Message sequence', () => {
  describe('#readSeq', () => {
    it('reads one message and calls rest', () => {
      const given = hexBuf('0a 00 00 00 05 0b 0c 00 00 00 07 03 0b 10 0a')
      const expectedMessage = {
        head: hexBuf('0a'),
        body: hexBuf('0b')
      }
      const expectedRest = hexBuf('0c 00 00 00 07 03 0b 10 0a')

      const [ messages, rest ] = readSeq(given)
      deepEqual(messages.next().value, expectedMessage)
      deepEqual(rest(), expectedRest)
      equal(messages.next().done, true)
    })

    it('reads all messages including partial message and calls rest with remainder', () => {
      const given = hexBuf('0a 00 00 00 05 0b 0c 00 00 00 07 03 0b 10 00 0a')
      const expectedMessages = [
        {
          head: hexBuf('0a'),
          body: hexBuf('0b')
        },
        {
          head: hexBuf('0c'),
          body: hexBuf('03 0b 10')
        }
      ]
      const expectedRest = hexBuf('00 0a')

      const [ messages, rest ] = readSeq(given)
      deepEqual(messages.next().value, expectedMessages[0])
      deepEqual(messages.next().value, expectedMessages[1])
      deepEqual(rest(), expectedRest)
      equal(messages.next().done, true)
    })

    it('reads all messages and calls rest', () => {
      const given = hexBuf('0a 00 00 00 05 0b 0c 00 00 00 07 03 0b 10')
      const expectedMessages = [
        {
          head: hexBuf('0a'),
          body: hexBuf('0b')
        },
        {
          head: hexBuf('0c'),
          body: hexBuf('03 0b 10')
        }
      ]
      const expectedRest = hexBuf('')

      const [ messages, rest ] = readSeq(given)
      deepEqual(messages.next().value, expectedMessages[0])
      deepEqual(messages.next().value, expectedMessages[1])
      deepEqual(rest(), expectedRest)
      equal(messages.next().done, true)
    })

    it('reads all messages (in for of loop) and calls rest', () => {
      const given = hexBuf('0a 00 00 00 05 0b 0c 00 00 00 07 03 0b 10')
      const expectedMessages = [
        {
          head: hexBuf('0a'),
          body: hexBuf('0b')
        },
        {
          head: hexBuf('0c'),
          body: hexBuf('03 0b 10')
        }
      ]
      const expectedRest = hexBuf('')

      const result = []
      const [ messages, rest ] = readSeq(given)
      for (let msg of messages) {
        result.push(msg)
      }
      deepEqual(result, expectedMessages)
      deepEqual(messages.next().done, true)
      deepEqual(rest(), expectedRest)
    })

    it('reads an empty buffer', () => {
      const given = hexBuf('')
      const expectedRest = given

      const [ messages, rest ] = readSeq(given)
      equal(messages.next().done, true)
      deepEqual(rest(), expectedRest)
    })

    it('reads a large (full head) partial message', () => {
      const given = hexBuf('0a 00 00 00 10 12 0a 0b 01')
      const expectedRest = given

      const [ messages, rest ] = readSeq(given)
      for (let msg of messages) {
        throw new Error('Expected to not iterate over no complete messages')
      }
      equal(messages.next().done, true)
      deepEqual(rest(), expectedRest)
    })

    it('reads a small (partial head) partial message', () => {
      const given = hexBuf('0a 00 00')
      const expectedRest = given

      const [ messages, rest ] = readSeq(given)
      for (let msg of messages) {
        throw new Error('Expected to not iterate over no complete messages')
      }
      equal(messages.next().done, true)
      deepEqual(rest(), expectedRest)
    })

    it('reads a one byte message', () => {
      const given = hexBuf('4e')
      const expectedMessage = { head: hexBuf('4e'), body: hexBuf('') }
      const expectedRest = hexBuf('')

      const [ messages, rest ] = readSeq(given, 1, 0, false)
      deepEqual(messages.next().value, expectedMessage)
      deepEqual(rest(), expectedRest)
      equal(messages.next().done, true)
    })
  })
})

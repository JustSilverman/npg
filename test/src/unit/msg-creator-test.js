import { deepEqual } from 'assert'
import * as create from '../../../src/msg-creator'

describe('msg-creator', () => {
  describe('#fromPgMessage', () => {
    const hexBuf = (arg) => new Buffer(arg.split(' ').map(s => parseInt(s, 16)))

    it('creates a message from a head and body', () => {
      const given = {
        head: hexBuf('0b'),
        body: hexBuf('ab dd 12 23')
      }
      const expected = hexBuf('0b 00 00 00 08 ab dd 12 23')

      deepEqual(create.fromPgMessage(given.head, given.body), expected)
    })

    it('handles a message of length 1', () => {
      const given = {
        head: hexBuf('0b'),
        body: hexBuf('ab')
      }
      const expected = hexBuf('0b 00 00 00 05 ab')

      deepEqual(create.fromPgMessage(given.head, given.body), expected)
    })

    it('handles a message exclusive of lengthBytes', () => {
      const given = {
        head: hexBuf('0b'),
        body: hexBuf('ab dd 12 23')
      }
      const expected = hexBuf('0b 00 00 00 04 ab dd 12 23')

      deepEqual(create.fromPgMessage(given.head, given.body, 4, false), expected)
    })

    it('handles a message with 2 lengthBytes', () => {
      const given = {
        head: hexBuf('0b'),
        body: hexBuf('ab dd 12 23')
      }
      const expected = hexBuf('0b 00 06 ab dd 12 23')

      deepEqual(create.fromPgMessage(given.head, given.body, 2), expected)
    })

    it('handles a message with 2 lengthBytes and exclusive of lenghtBytes', () => {
      const given = {
        head: hexBuf('0b'),
        body: hexBuf('ab dd 12 23')
      }
      const expected = hexBuf('0b 00 04 ab dd 12 23')

      deepEqual(create.fromPgMessage(given.head, given.body, 2, false), expected)
    })

    describe('messages with no head', () => {
      it('handles a basic message', () => {
        const given = {
          head: null,
          body: hexBuf('ab dd 12 23')
        }
        const expected = hexBuf('00 00 00 08 ab dd 12 23')

        deepEqual(create.fromPgMessage(given.head, given.body), expected)
      })

      it('handles a message exclusive of lengthBytes', () => {
        const given = {
          head: null,
          body: hexBuf('ab dd 12 23')
        }
        const expected = hexBuf('00 00 00 04 ab dd 12 23')

        deepEqual(create.fromPgMessage(given.head, given.body, 4, false), expected)
      })

      it('handles a message with 2 lengthBytes', () => {
        const given = {
          head: null,
          body: hexBuf('ab dd 12 23')
        }
        const expected = hexBuf('00 06 ab dd 12 23')

        deepEqual(create.fromPgMessage(given.head, given.body, 2), expected)
      })

      it('handles a message with 2 lengthBytes and exclusive of lenghtBytes', () => {
        const given = {
          head: null,
          body: hexBuf('ab dd 12 23')
        }
        const expected = hexBuf('00 04 ab dd 12 23')

        deepEqual(create.fromPgMessage(given.head, given.body, 2, false), expected)
      })
    })
  })
})

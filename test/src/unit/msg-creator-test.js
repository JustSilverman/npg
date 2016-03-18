import { deepEqual } from 'assert'
import hexBuf from '../../../src/hex-buf'
import * as headers from '../../../src/msg-headers'
import * as create from '../../../src/msg-creator'

describe('msg-creator', () => {
  describe('#write', () => {
    it('creates a message from a head and body', () => {
      const given = {
        head: hexBuf('0b'),
        body: hexBuf('ab dd 12 23')
      }
      const expected = hexBuf('0b 00 00 00 08 ab dd 12 23')

      deepEqual(create.write(given.head, given.body), expected)
    })

    it('handles a message of length 1', () => {
      const given = {
        head: hexBuf('0b'),
        body: hexBuf('ab')
      }
      const expected = hexBuf('0b 00 00 00 05 ab')

      deepEqual(create.write(given.head, given.body), expected)
    })

    it('handles a message exclusive of lengthBytes', () => {
      const given = {
        head: hexBuf('0b'),
        body: hexBuf('ab dd 12 23')
      }
      const expected = hexBuf('0b 00 00 00 04 ab dd 12 23')

      deepEqual(create.write(given.head, given.body, 4, false), expected)
    })

    it('handles a message with 2 lengthBytes', () => {
      const given = {
        head: hexBuf('0b'),
        body: hexBuf('ab dd 12 23')
      }
      const expected = hexBuf('0b 00 06 ab dd 12 23')

      deepEqual(create.write(given.head, given.body, 2), expected)
    })

    it('handles a message with 2 lengthBytes and exclusive of lenghtBytes', () => {
      const given = {
        head: hexBuf('0b'),
        body: hexBuf('ab dd 12 23')
      }
      const expected = hexBuf('0b 00 04 ab dd 12 23')

      deepEqual(create.write(given.head, given.body, 2, false), expected)
    })

    describe('messages with no head', () => {
      it('handles a basic message', () => {
        const given = {
          head: null,
          body: hexBuf('ab dd 12 23')
        }
        const expected = hexBuf('00 00 00 08 ab dd 12 23')

        deepEqual(create.write(given.head, given.body), expected)
      })

      it('handles a message exclusive of lengthBytes', () => {
        const given = {
          head: null,
          body: hexBuf('ab dd 12 23')
        }
        const expected = hexBuf('00 00 00 04 ab dd 12 23')

        deepEqual(create.write(given.head, given.body, 4, false), expected)
      })

      it('handles a message with 2 lengthBytes', () => {
        const given = {
          head: null,
          body: hexBuf('ab dd 12 23')
        }
        const expected = hexBuf('00 06 ab dd 12 23')

        deepEqual(create.write(given.head, given.body, 2), expected)
      })

      it('handles a message with 2 lengthBytes and exclusive of lenghtBytes', () => {
        const given = {
          head: null,
          body: hexBuf('ab dd 12 23')
        }
        const expected = hexBuf('00 04 ab dd 12 23')

        deepEqual(create.write(given.head, given.body, 2, false), expected)
      })
    })
  })

  describe('#fromBuf', () => {
    it('creates a message from a head and body', () => {
      const givenBody = hexBuf('ab dd 12 23')
      const givenHeadSym = headers.authenticationOk
      const expected = hexBuf('52 00 00 00 08 ab dd 12 23')

      deepEqual(create.fromBuf(givenHeadSym, givenBody), expected)
    })

    it('creates a message from a head and body with a null byte', () => {
      const givenBody = hexBuf('ab dd 12 23')
      const givenHeadSym = headers.query
      const expected = hexBuf('51 00 00 00 09 ab dd 12 23 00')

      deepEqual(create.fromBuf(givenHeadSym, givenBody, true), expected)
    })

    it('handles a message of length 1', () => {
      const givenBody = hexBuf('ab')
      const givenHeadSym = headers.backendKeyData
      const expected = hexBuf('4b 00 00 00 05 ab')

      deepEqual(create.fromBuf(givenHeadSym, givenBody), expected)
    })

    it('handles a message exclusive of lengthBytes', () => {
      const givenBody = hexBuf('ab dd 12 23')
      const givenHeadSym = headers.backendKeyData
      const expected = hexBuf('4b 00 00 00 04 ab dd 12 23')

      deepEqual(create.fromBuf(givenHeadSym, givenBody, false, 4, false), expected)
    })

    it('handles a message with 2 lengthBytes', () => {
      const givenBody = hexBuf('ab dd 12 23')
      const givenHeadSym = headers.query
      const expected = hexBuf('51 00 06 ab dd 12 23')

      deepEqual(create.fromBuf(givenHeadSym, givenBody, false, 2), expected)
    })

    it('handles a message with 2 lengthBytes and exclusive of lenghtBytes', () => {
      const givenBody = hexBuf('ab dd 12 23')
      const givenHeadSym = headers.query
      const expected = hexBuf('51 00 04 ab dd 12 23')

      deepEqual(create.fromBuf(givenHeadSym, givenBody, false, 2, false), expected)
    })
  })
})

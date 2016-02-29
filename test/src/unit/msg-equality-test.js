import { deepEqual, throws } from 'assert'
import hexBuf from '../../../src/hex-buf'
import { equals, ofType } from '../../../src/msg-equality'
import * as headers from '../../../src/msg-headers'

describe('msg-equality', () => {
  describe('#equals', () => {
    it('is true for equal messages', () => {
      const givenMessage1 = { head: hexBuf('53'), body: hexBuf('1a 2b') }
      const givenMessage2 = { head: hexBuf('53'), body: hexBuf('1a 2b') }
      deepEqual(equals(givenMessage1, givenMessage2), true)
    })

    it('is false when heads do not match', () => {
      const givenMessage1 = { head: hexBuf('53'), body: hexBuf('1a 2b') }
      const givenMessage2 = { head: hexBuf('54'), body: hexBuf('1a 2b') }
      deepEqual(equals(givenMessage1, givenMessage2), false)
    })

    it('is false when bodies do not match', () => {
      const givenMessage1 = { head: hexBuf('53'), body: hexBuf('1a 2b') }
      const givenMessage2 = { head: hexBuf('53'), body: hexBuf('1a') }
      deepEqual(equals(givenMessage1, givenMessage2), false)
    })
  })

  describe('#ofType', () => {
    it('is true for the correct type', () => {
      const givenHeadsAndMessages = [
        [ headers.authenticationOk, { head: hexBuf('52'), body: hexBuf('') } ],
        [ headers.sessionConfirm, { head: hexBuf('4e'), body: hexBuf('') } ],
        [ headers.parameterStatus, { head: hexBuf('53'), body: hexBuf('') } ],
        [ headers.backendKeyData, { head: hexBuf('4b'), body: hexBuf('') } ],
        [ headers.readyForQuery, { head: hexBuf('5a'), body: hexBuf('') } ],
        [ headers.query, { head: hexBuf('51'), body: hexBuf('') } ],
        [ headers.rowDescription, { head: hexBuf('54'), body: hexBuf('') } ],
        [ headers.dataRow, { head: hexBuf('44'), body: hexBuf('') } ],
        [ headers.queryClose, { head: hexBuf('43'), body: hexBuf('') } ],
        [ headers.exit, { head: hexBuf('58'), body: hexBuf('') } ]
      ]

      givenHeadsAndMessages.forEach(([head, msg]) => {
        deepEqual(ofType(head, msg), true)
      })

      deepEqual(givenHeadsAndMessages.length, headers.symToHeaderByte.size)
    })

    it('is false for mismatching types', () => {
      const givenMessage = { head: hexBuf('53'), body: hexBuf('') }
      deepEqual(ofType(headers.query, givenMessage), false)

    })
  })

})

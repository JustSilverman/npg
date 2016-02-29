import { deepEqual, throws } from 'assert'
import hexBuf from '../../../../src/hex-buf'
import parse from '../../../../src/msg-parsing/data-row'

describe('data-row', () => {
  describe('#parse', () => {
    it('parses a row with no values', () => {
      const givenBuf = hexBuf('00 00')
      const expectedResult = []

      deepEqual(parse(givenBuf), expectedResult)
    })

    it('parses a row with all null values', () => {
      const givenBuf = hexBuf('00 03 00 00 00 00 00 00 00 00 00 00 00 00')
      const expectedResult = [ null, null, null ]

      deepEqual(parse(givenBuf), expectedResult)
    })

    it('parses a row with non-null values', () => {
      const givenBuf = hexBuf('00 05 00 00 00 02 2d 31 00 00 00 00 00 00 00 02 31 30 00 00 00 05 68 65 6c 6c 6f 00 00 00 00')
      const expectedResult = [ '-1', null, '10', 'hello', null ]

      deepEqual(parse(givenBuf), expectedResult)
    })

    it('throws if the column count does not match the value count', () => {
      throws(() => {
        const givenBuf = hexBuf('00 02 00 00 00 02 2d 31')

        parse(givenBuf)
      }, /Expected 2 column values/)
    })

    it('throws for invalid messages', () => {
      throws(() => {
        const givenBuf = hexBuf('00 02 00 00 00 02 2d')

        parse(givenBuf)
      }, /Expected to read/)
    })
  })
})

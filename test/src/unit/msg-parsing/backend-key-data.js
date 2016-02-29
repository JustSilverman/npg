import { deepEqual, throws } from 'assert'
import hexBuf from '../../../../src/hex-buf'
import parse from '../../../../src/msg-parsing/backend-key-data'

describe('backend-key-data', () => {
  describe('#parse', () => {
    it('parses the buffer into a pid and secret key', () => {
      const givenBuf = hexBuf('00 01 55 30 54 9c 97 d5')
      const expectedResults = { pid: 87344, secretKey: 1419548629 }

      deepEqual(parse(givenBuf), expectedResults)
    })

    it('throws on invalid lengths', () => {
      throws(() => {
        const givenBuf = hexBuf('01 02 03 04 05 06 07')
        parse(givenBuf)
      }, /Expected backend key data message of length 8/)

      throws(() => {
        const givenBuf = hexBuf('01 02 03 04 05 06 07 08 09')
        parse(givenBuf)
      }, /Expected backend key data message of length 8/)
    })
  })
})

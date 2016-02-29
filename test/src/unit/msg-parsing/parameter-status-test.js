import { deepEqual, throws } from 'assert'
import hexBuf from '../../../../src/hex-buf'
import parse from '../../../../src/msg-parsing/parameter-status'

describe('parameter-status', () => {
  describe('#parse', () => {
    it('parses the buffer into a name and value', () => {
      const givenBuf = hexBuf('63 6c 69 65 6e 74 5f 65 6e 63 6f 64 69 6e 67 00 55 54 46 38 00')
      const expectedResult = { name: 'client_encoding', value: 'UTF8' }

      deepEqual(parse(givenBuf), expectedResult)
    })

    it('parses the buffer into a name and value with a custom delimiter', () => {
      const givenBuf = hexBuf('63 6c 69 65 6e 74 5f 65 6e 63 6f 64 69 6e 67 01 55 54 46 38 01')
      const expectedResult = { name: 'client_encoding', value: 'UTF8' }

      deepEqual(parse(givenBuf, 0x01), expectedResult)
    })

    it('throws if last byte is not a null byte', () => {
      throws(() => {
        const givenBuf = hexBuf('63 6c 69 65 6e 74 5f 65 6e 63 6f 64 69 6e 67')
        parse(givenBuf)
      }, /Invalid parameter status message/)
    })
  })
})

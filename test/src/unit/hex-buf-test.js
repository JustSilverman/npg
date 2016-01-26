import { deepEqual } from 'assert'
import { hexBuf } from '../../../src/hex-buf'

describe('hex-buf', () => {
  it('creates stream of binary data', () => {
    const given = '0b 00 00 00 08 ab dd 12 23'
    const expected = new Buffer([0x0b, 0x00, 0x00, 0x00, 0x08, 0xab, 0xdd, 0x12, 0x23])

    deepEqual(hexBuf(given), expected)
  })

  it('empty string returns an empty buffer', () => {
    const given = ''
    const expected = new Buffer([])

    deepEqual(hexBuf(given), expected)
  })
})

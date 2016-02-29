import { deepEqual, throws } from 'assert'
import hexBuf from '../../../src/hex-buf'
import { intoChunks, intoChunk } from '../../../src/split-buf'

describe('split-buf', () => {
  describe('#intoChunks', () => {
    it('splits into chunks with no transforms', () => {
      const givenBuf = hexBuf('01 02 0a 0b 03 05 bb')
      const givenChunks = [
        [ 1 ],
        [ 1 ],
        [ 5 ]
      ]
      const expectedChunks = [
        hexBuf('01'),
        hexBuf('02'),
        hexBuf('0a 0b 03 05 bb')
      ]
      const expectedRemainder = hexBuf('')

      deepEqual(intoChunks(givenBuf, givenChunks), [ expectedChunks, expectedRemainder ])
    })

    it('splits into chunks with with transforms', () => {
      const givenBuf = hexBuf('01 02 0a 0b 03 05 bb')
      const givenChunks = [
        [ 2 ],
        [ 1, buf => buf.readUInt8() ],
        [ 3, buf => buf.toString() ]
      ]
      const expectedChunks = [
        hexBuf('01 02'),
        10,
        '\u000b\u0003\u0005'
      ]
      const expectedRemainder = hexBuf('bb')

      deepEqual(intoChunks(givenBuf, givenChunks), [ expectedChunks, expectedRemainder ])
    })

    it('handles empty chunkSize array', () => {
      const givenBuf = hexBuf('01 02 0a 0b 03 05 bb')
      const givenChunks = []
      const expectedChunks = []
      const expectedRemainder = givenBuf

      deepEqual(intoChunks(givenBuf, givenChunks), [ expectedChunks, expectedRemainder ])
    })

    it('throws if the buffer is not long enough', () => {
      throws(() => {
        const givenBuf = hexBuf('01 02 0a 0b 03 05 bb')
        const givenChunks = [
          [ 3 ],
          [ 3 ],
          [ 3 ]
        ]

        intoChunks(givenBuf, givenChunks)
      }, /exceeds remaining buffer length/)
    })
  })

  describe('#intoChunk', () => {
    it('handles a chunk of 0 bytes', () => {
      const givenBuf = hexBuf('01 02 0a 0b 03 05 bb')
      const givenChunkSize = 0
      const givenTransform = buf => buf.readUInt16BE()
      const expectedChunk = hexBuf('')
      const expectedRemainder = givenBuf

      deepEqual(intoChunk(givenBuf, givenChunkSize), [ expectedChunk, expectedRemainder ])
    })

    it('splits into a chunks with no transform', () => {
      const givenBuf = hexBuf('01 02 0a 0b 03 05 bb')
      const givenChunkSize = 3
      const expectedChunk = hexBuf('01 02 0a')
      const expectedRemainder = hexBuf('0b 03 05 bb')

      deepEqual(intoChunk(givenBuf, givenChunkSize), [ expectedChunk, expectedRemainder ])
    })

    it('splits into chunks with with transforms', () => {
      const givenBuf = hexBuf('01 02 0a 0b 03 05 bb')
      const givenChunkSize = 2
      const givenTransform = buf => buf.readUInt16BE()
      const expectedChunk = 258
      const expectedRemainder = hexBuf('0a 0b 03 05 bb')

      deepEqual(intoChunk(givenBuf, givenChunkSize, givenTransform), [ expectedChunk, expectedRemainder ])
    })

    it('throws if the buffer is not long enough', () => {
      throws(() => {
        const givenBuf = hexBuf('02')
        const givenChunkSize = 2

        intoChunk(givenBuf, givenChunkSize)
      }, /exceeds remaining buffer length/)
    })
  })
})

import { deepEqual } from 'assert'
import { read } from '../../../src/msg-reader'
import { hexBuf } from '../../../src/hex-buf'

describe('Message parser', () => {
  describe('#read', () => {
    describe('paring a standard (non-startup) messages', () => {
      it('parses a message with a body of length 1', () => {
        const input = new Buffer([
          0x00,
          0x00, 0x00, 0x00, 0x05,
          0x03,
        ])

        deepEqual(read(input), [
          {
            head: new Buffer([0x00]),
            body: new Buffer([0x03])
          },
          new Buffer([])
        ])
      })

      it('parses a message with a body of length 4', () => {
        const input = new Buffer([
          0x01,
          0x00, 0x00, 0x00, 0x08,
          0x71, 0x6c, 0x00, 0x53,
        ])

        deepEqual(read(input), [
          {
            head: new Buffer([0x01]),
            body: new Buffer([0x71, 0x6c, 0x00, 0x53])
          },
          new Buffer([])
        ])
      })

      it('parses a buffer with a full message and excess data. Remainder is excess data', () => {
        const input = new Buffer([
          0x01,
          0x00, 0x00, 0x00, 0x07,
          0x71, 0x6c, 0x00, 0x53,
        ])

        deepEqual(read(input), [
          {
            head: new Buffer([0x01]),
            body: new Buffer([0x71, 0x6c, 0x00])
          },
          new Buffer([0x53])
        ])
      })

      it('parses a buffer with a partial message body.  Remainder is the entire buffer', () => {
        const input = new Buffer([
          0x01,
          0x00, 0x00, 0x00, 0x0a,
          0x71, 0x6c, 0x00, 0x53,
        ])

        deepEqual(read(input), [
          null,
          input
        ])
      })

      it('parses a buffer with a partial message head and length bytes.  Remainder is the entire buffer', () => {
        const input = new Buffer([0x01, 0x00, 0x00])

        deepEqual(read(input), [
          null,
          input
        ])
      })

      it('parses empty buffer', () => {
        const input = new Buffer([])

        deepEqual(read(input), [
          null,
          input
        ])
      })
    })

    describe('#parsing a startup messages', () => {
      it('parses a message with a body of length 1', () => {
        const input = new Buffer([
          0x00, 0x00, 0x00, 0x05,
          0x03,
        ])

        deepEqual(read(input, 0), [
          {
            head: new Buffer([]),
            body: new Buffer([0x03])
          },
          new Buffer([])
        ])
      })

      it('parses a message with a body of length 4', () => {
        const input = new Buffer([
          0x00, 0x00, 0x00, 0x08,
          0x71, 0x6c, 0x00, 0x53,
        ])

        deepEqual(read(input, 0), [
          {
            head: new Buffer([]),
            body: new Buffer([0x71, 0x6c, 0x00, 0x53])
          },
          new Buffer([])
        ])
      })

      it('parses a buffer with a full message and excess data. Remainder is excess data', () => {
        const input = new Buffer([
          0x00, 0x00, 0x00, 0x07,
          0x71, 0x6c, 0x00, 0x53,
        ])

        deepEqual(read(input, 0), [
          {
            head: new Buffer([]),
            body: new Buffer([0x71, 0x6c, 0x00])
          },
          new Buffer([0x53])
        ])
      })

      it('parses a buffer with a partial message.  Remainder is the entire buffer', () => {
        const input = new Buffer([
          0x00, 0x00, 0x00, 0x0a,
          0x71, 0x6c, 0x00, 0x53,
        ])

        deepEqual(read(input, 0), [
          null,
          input
        ])
      })
    })
  })

  describe('using non-default arguments', () => {
    it('headless message', () => {
      const givenInput = hexBuf('00 00 00 06 0a 0b 01')
      const expectedResult = [ { head: new Buffer([]), body: hexBuf('0a 0b') }, hexBuf('01') ]

      deepEqual(read(givenInput, 0), expectedResult)
    })

    it('single byte message', () => {
      const givenInput = hexBuf('0e')
      const expectedResult = [ { head: hexBuf('0e'), body: hexBuf('') }, hexBuf('') ]

      deepEqual(read(givenInput, 1, 0, false), expectedResult)
    })

    it('single byte message with a remainder', () => {
      const givenInput = hexBuf('0e 0a')
      const expectedResult = [ { head: hexBuf('0e'), body: hexBuf('') }, hexBuf('0a') ]

      deepEqual(read(givenInput, 1, 0, false), expectedResult)
    })

    it('head of length 3', () => {
      const givenInput = hexBuf('0a 0b 0c 00 00 00 04 01')
      const expectedResult = [ { head: hexBuf('0a 0b 0c'), body: hexBuf('') }, hexBuf('01') ]

      deepEqual(read(givenInput, 3), expectedResult)
    })

    it('headless and length bytes count of 2', () => {
      const givenInput = hexBuf('00 05 0a 0e 0d 0f')
      const expectedResult = [ { head: new Buffer([]), body: hexBuf('0a 0e 0d') }, hexBuf('0f') ]

      deepEqual(read(givenInput, 0, 2), expectedResult)
    })

    it('length bytes count of 2', () => {
      const givenInput = hexBuf('0a 00 03 01, 0a')
      const expectedResult = [ { head: hexBuf('0a'), body: hexBuf('01') }, hexBuf('0a') ]

      deepEqual(read(givenInput, 1, 2), expectedResult)
    })

    it('length bytes exclusive', () => {
      const givenInput = hexBuf('0a 00 00 00 02 0d 0e 0d 0e')
      const expectedResult = [ { head: hexBuf('0a'), body: hexBuf('0d 0e') }, hexBuf('0d 0e') ]

      deepEqual(read(givenInput, 1, 4, false), expectedResult)
    })

    it('length bytes count of 2 and length bytes exclusive', () => {
      const givenInput = hexBuf('0a 00 03 0a 0b 0c 0d')
      const expectedResult = [ { head: hexBuf('0a'), body: hexBuf('0a, 0b 0c') }, hexBuf('0d') ]

      deepEqual(read(givenInput, 1, 2, false), expectedResult)
    })

    it('headless, length bytes count of 2 and length bytes exclusive', () => {
      const givenInput = hexBuf('00 03 0a 0b 0c 0d')
      const expectedResult = [ { head: new Buffer([]), body: hexBuf('0a, 0b 0c') }, hexBuf('0d') ]

      deepEqual(read(givenInput, 0, 2, false), expectedResult)
    })
  })
})

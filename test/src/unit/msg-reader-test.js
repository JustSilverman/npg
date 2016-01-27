import { deepEqual } from 'assert'
import { read } from '../../../src/msg-reader'

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
            head: null,
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
            head: null,
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
            head: null,
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
})

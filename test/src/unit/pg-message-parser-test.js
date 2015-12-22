import { deepEqual } from 'assert'
import { parseMessage, parseStartupMessage } from '../../../src/pg-message-parser'
import { readFileSync } from 'fs'

describe('Message parser', () => {
  describe('#parseMessage parses standard (non-startup) messages', () => {
    it('parses a message with a body of length 1', () => {
      const input = new Buffer([
        0x00,
        0x00, 0x00, 0x00, 0x05,
        0x03,
      ])

      deepEqual(parseMessage(input), [
        {
          type: new Buffer([0x00]),
          length: 5,
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

      deepEqual(parseMessage(input), [
        {
          type: new Buffer([0x01]),
          length: 8,
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

      deepEqual(parseMessage(input), [
        {
          type: new Buffer([0x01]),
          length: 7,
          body: new Buffer([0x71, 0x6c, 0x00])
        },
        new Buffer([0x53])
      ])
    })

    it('parses a buffer with a partial message.  Remainder is the entire buffer', () => {
      const input = new Buffer([
        0x01,
        0x00, 0x00, 0x00, 0x0a,
        0x71, 0x6c, 0x00, 0x53,
      ])

      deepEqual(parseMessage(input), [
        {
          type: new Buffer([0x01]),
          length: 10,
          body: new Buffer([0x71, 0x6c, 0x00, 0x53])
        },
        input
      ])
    })
  })

  describe('#parseStartupMessage parses startup messages', () => {
    it('parses a message with a body of length 1', () => {
      const input = new Buffer([
        0x00, 0x00, 0x00, 0x05,
        0x03,
      ])

      deepEqual(parseStartupMessage(input), [
        {
          type: null,
          length: 5,
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

      deepEqual(parseStartupMessage(input), [
        {
          type: null,
          length: 8,
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

      deepEqual(parseStartupMessage(input), [
        {
          type: null,
          length: 7,
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

      deepEqual(parseStartupMessage(input), [
        {
          type: null,
          length: 10,
          body: new Buffer([0x71, 0x6c, 0x00, 0x53])
        },
        input
      ])
    })
  })
})

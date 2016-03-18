import * as assert from 'assert'
import * as meta from './meta'
import { hexBuf } from './hex-buf'
import { symToHeaderByte } from './msg-headers'

meta.module(module, {
  doc: `
    # Binary message creator

    Creates a message with the correct length bytes (inclusive of length bytes)

        > create(hexBuf('11'), hexBuf('22 22') )
        <Buffer 11 00 00 00 06 22 22>
  `,
})

// -

meta.fn('write', {
  doc: 'Creates a valid message',
  shape: 'Buffer, Buffer, int?, bool? -> Buffer',
  args: [
    'buffer with head (message type), optional',
    'buffer with message body',
    'size of length bytes, defaults to 4, optional',
    'whether the message length include the length bytes, defaults to true, optional',
  ],
  returns: [
    'message buffer',
  ],
  examples: {
    '1 byte header, 1 byte body': (f) => {
      const message = f(hexBuf('0a'), hexBuf('0b'))
      assert.deepEqual(message, hexBuf('0a 00 00 00 01 0b'))
    },
  },
})

export const write = (head, body, lengthBytesCount = 4, lengthBytesInclusive = true) => {
  const messageBodylength = lengthBytesInclusive
    ? body.length + lengthBytesCount
    : body.length
  const lengthBytes = new Buffer(lengthBytesCount)
  lengthBytes.writeUIntBE(messageBodylength, 0, lengthBytesCount)
  const segments = [head, lengthBytes, body]
  if (!head) segments.shift()
  return Buffer.concat(segments)
}

// not a great name, seems to do two fairly unrelated things :/

meta.fn('fromBuf', {
  doc: 'Creates a valid message buffer',
  shape: 'Symbol, Buffer, Buffer, bool?, int?, bool? -> Buffer',
  args: [
    'Symbol referencing the message type',
    'buffer with message body',
    'boolean whether to include a null byte',
    'size of length bytes, defaults to 4, optional',
    'whether the message length include the length bytes, defaults to true, optional',
  ],
  returns: [
    'message buffer',
  ],
  examples: {
    'message with null byte': (f) => {
      const givenBodyBuffer = hexBuf('0a 0b 0c')
      const givenHeadSymbol = symToHeaderByte.query
      const expectedMessage = hexBuf('0a 00 00 00 08 0a 0b 0c 00')
      deepEqual(f(givenHeadSymbol, givenBodyBuffer), expectedMessage)
    },
  },
})

export const fromBuf = (headSymbol, body, includeNullByte = false, lengthBytesCount = 4, lengthBytesInclusive = true) => {
  const head = symToHeaderByte.get(headSymbol)
  body = includeNullByte ? Buffer.concat([ body, hexBuf('00') ]) : body
  return write(head, body, lengthBytesCount, lengthBytesInclusive)
}

import * as assert from 'assert'
import * as meta from './meta'

meta.module(module, {
  doc: `
    # Binary message creator

    Creates a message with the correct length bytes (inclusive of length bytes)

  `,
})

// -

meta.fn('create', {
  doc: 'Creates a valid message buffer',
  shape: 'Buffer, Buffer, int?, bool? -> Buffer',
  args: [
    'buffer with head (message type)',
    'buffer with message body',
    'size of length bytes, defaults to 4, optional',
    'whether the message length include the length bytes, defaults to true, optional'
  ],
  returns: [
    'message buffer'
  ],
  examples: {
    '1 byte header, 1 byte body': (f) => {
      const hexBuf = (...args) => new Buffer(args.split(' ').map(s => parseInt(s, 16)))
      const message = f(hexBuf('0a'), hexBuf('0b'))
      assert.deepEqual(message, hexBuf('0a 00 00 00 01 0b'))
    },
  },
})

export const create = (head, body, lengthBytesCount = 4, lengthBytesInclusive = true) => {
  const messageBodylength = lengthBytesInclusive ? body.length + lengthBytesCount : body.length
  const lengthBytes = new Buffer(lengthBytesCount)
  lengthBytes.writeUInt32BE(messageBodylength, 0)
  return Buffer.concat([head, lengthBytes, body])
}
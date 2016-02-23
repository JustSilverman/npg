import * as assert from 'assert'
import * as meta from './meta'
import { hexBuf }  from './hex-buf'

meta.module(module, {
  doc: `
    # Binary message creator

    Creates a message with the correct length bytes (inclusive of length bytes)

        > create(hexBuf('11'), hexBuf('22 22') )
        <Buffer 11 00 00 00 06 22 22>
  `,
})

// -

meta.fn('fromPgMessage', {
  doc: 'Creates a valid message buffer',
  shape: 'Buffer, Buffer, int?, bool? -> Buffer',
  args: [
    'buffer with head (message type), optional',
    'buffer with message body',
    'size of length bytes, defaults to 4, optional',
    'whether the message length include the length bytes, defaults to true, optional'
  ],
  returns: [
    'message buffer'
  ],
  examples: {
    '1 byte header, 1 byte body': (f) => {
      const message = f(hexBuf('0a'), hexBuf('0b'))
      assert.deepEqual(message, hexBuf('0a 00 00 00 01 0b'))
    },
  },
})

export const fromPgMessage = (head, body, lengthBytesCount = 4, lengthBytesInclusive = true) => {
  const messageBodylength = lengthBytesInclusive
    ? body.length + lengthBytesCount
    : body.length
  const lengthBytes = new Buffer(lengthBytesCount)
  lengthBytes.writeUIntBE(messageBodylength, 0, lengthBytesCount)
  const segments = [head, lengthBytes, body]
  if (!head) segments.shift()
  return Buffer.concat(segments)
}

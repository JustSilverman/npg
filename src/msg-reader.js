import * as assert from 'assert'
import * as meta from './meta'
import { hexBuf }  from './hex-buf'

meta.module(module, {
  doc: `
    # Binary message reader

    Example message:

        4b 00 00 00 0c 00 00 84 03 48 65 fb 75
        ^  ^---------^ ^---------------------^
        header  |                |
              length            body

    The length field includes itself, so a message with a single body byte will have a length of 5.

    The byte format of: 1 byte header, 4 byte length, N byte body

    Gets transformed to the JS record:

      { head: Buffer <single header byte>, body: Buffer <body bytes> }

    So the example above would be:

     msg record: { head: Buffer <4b>, body: Buffer <00 00 84 03 48 65 fb 75> }
  `,
})

// -

meta.fn('read', {
  doc: 'Attempt to read the first message from a given buffer',
  shape: 'Buffer, int?, int?, bool? -> [ { head: Buffer, body: Buffer }?, Buffer ]',
  args: [
    'buffer with msg data in it',
    'size of header, defaults to 1, optional',
    'size of length bytes, defaults to 4, optional',
    'whether the message length include the length bytes, defaults to true, optional',
  ],
  returns: [
    'message record, will be null if no message could be read from buffer',
    'overflow bytes from buffer',
  ],
  examples: {
    '1 byte header, 4 byte length field, 1 byte body, 1 byte overflow': (f) => {
      const [{head, body}, over] = f(hexBuf('0a 00 00 00 05 0b 0c'), 1, 4)
      assert.deepEqual(head, hexBuf('0a'))
      assert.deepEqual(body, hexBuf('0b'))
      assert.deepEqual(over, hexBuf('0c'))
    },
  },
})

export const read = (buf, headLength = 1, lengthBytesCount = 4, lengthBytesInclusive = true) => {
  if (/* buf is incomplete message */ buf.length < headLength + lengthBytesCount) {
    return [ null, buf ]
  }

  const headStart = 0
  const headEnd = headStart + headLength
  const lengthStart = headEnd
  const lengthEnd = headEnd + lengthBytesCount
  const bodyStart = lengthEnd
  const lengthBytes = buf.slice(lengthStart, lengthEnd)
  const bodyLength = lengthBytes.readUIntBE(0, lengthBytesCount) - (lengthBytesInclusive ? lengthBytesCount : 0)
  const bodyEnd = bodyStart + bodyLength
  const headBytes = buf.slice(headStart, headEnd)
  if (/* buf is incomplete message */ bodyEnd > buf.length) return [ null, buf ]
  return [ {
    head: headBytes.length > 0 ? headBytes : null,
    body: buf.slice(bodyStart, bodyEnd),
  }, buf.slice(bodyEnd) ]
}

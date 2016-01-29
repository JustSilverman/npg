import * as assert from 'assert'
import * as meta from './meta'
import { read }  from './msg-reader'
import { hexBuf }  from './hex-buf'

meta.module(module, {
  doc: `
    # Binary message sequence

    Creates a message iterator from a buffer
  `,
})

// -

meta.fn('read', {
  doc: 'Read a sequence of messages from a buffer',
  shape: 'buffer, int?, int?, bool? -> [ iterator?, function ]',
  args: [
    'buffer with messages data in it',
    'size of message header, defaults to 1, optional',
    'size of message length bytes, defaults to 4, optional',
    'whether the messages length include the length bytes, defaults to true, optional',
  ],
  returns: [
    'message iterator',
    'function that returns remaining bytes',
  ],
  examples: {
    '2 messages, 3 byte remainder': (f) => {
      const messagesBuf = hexBuf('0a 00 00 00 05 0b 0c 00 00 00 07 03 0b 10 0a 00 01')
      const [ messages, rest ] = f(messagesBuf)
      assert.deepEqual(messages.next().value, { head: hexBuf('0a'), body: hexBuf('0b') })
      assert.deepEqual(messages.next().value, { head: hexBuf('0c'), body: hexBuf('03 0b 10') })
      assert.deepEqual(rest(), hexBuf('0a 00 01'))
      assert.equal(messages.next().done, true)
    }
  },
})

export const readSeq = (buf, headLength = 1, lengthBytesCount = 4, lengthBytesInclusive = true) => {
  let message
  let remainder = buf

  const seqGenerator = function* () {
    [ message, remainder ] = read(remainder, headLength, lengthBytesCount, lengthBytesInclusive)

    while (message) {
      yield message

      const tuple = read(remainder, headLength, lengthBytesCount, lengthBytesInclusive)
      message   = tuple[0]
      remainder = tuple[1]
    }
  }

  return [
    seqGenerator(),
    () => {
      const rest = remainder
      remainder = new Buffer([])
      return rest
    }
  ]
}

export default readSeq
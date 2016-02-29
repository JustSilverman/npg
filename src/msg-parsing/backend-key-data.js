import * as assert from 'assert'
import * as meta from '../meta'
import { hexBuf }  from '../hex-buf'

meta.module(module, {
  doc: `
    # BackendKeyData parser

    Byte1('K')
      Identifies the message as cancellation key data.
      The frontend must save these values if it wishes to be able to issue CancelRequest messages later.

    Int32(12)
      Length of message contents in bytes, including self.

    Int32
      The process ID of this backend.

    Int32
      The secret key of this backend.

    Example backend key data message:
        00 01 55 30 54 9c 97 d5
        ^---------^ ^---------^
            pid      secret key
  `,
})

// -

meta.fn('parse', {
  doc: 'Transform a backend key data postgres message into an Object',
  shape: 'Buffer -> Object',
  args: [
    'buffer with message body'
  ],
  returns: [
    'Object { pid, secretKey }'
  ],
  examples: {
    'Message with pid and secret key': (f) => {
      const givenBuf = hexBuf('00 01 55 30 54 9c 97 d5')
      const expectedResult = { pid: 87344, secretKey: 1419548629 }

      deepEqual(f(givenBuf), expectedResult)
    },
  },
})

export const parse = (body) => {
  const expectedLength = 8
  if (body.length !== expectedLength) {
    throw new Error('Expected backend key data message of length ' +
      expectedLength + ', but was ', body.length)
  }

  const pid = body.slice(0, 4).readUInt32BE()
  const secretKey = body.slice(4, 8).readUInt32BE()

  return { pid, secretKey }
}

export default parse

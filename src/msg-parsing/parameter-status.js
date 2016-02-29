import * as assert from 'assert'
import * as meta from '../meta'
import { hexBuf }  from '../hex-buf'

meta.module(module, {
  doc: `
    # ParameterStatus parser

    Byte1('S')
      Identifies the message as a run-time parameter status report.

    Int32
      Length of message contents in bytes, including self.

    String
      The name of the run-time parameter being reported.

    String
      The current value of the parameter.

    Example paramter status message:
    63 6c 69 65 6e 74 5f 65 6e 63 6f 64 69 6e 67 00 55 54 46 38 00
    ^------------------------------------------^ ^^ ^------------^
                        name                      |       value
                                              delimiter
  `,
})

// -

meta.fn('parse', {
  doc: 'Transform a parameter status postgres message into an Object',
  shape: 'Buffer -> Object',
  args: [
    'buffer with message body'
  ],
  returns: [
    'Object { name, value }'
  ],
  examples: {
    'client encoding status': (f) => {
      const givenBuf = hexBuf('63 6c 69 65 6e 74 5f 65 6e 63 6f 64 69 6e 67 00 55 54 46 38 00')
      const expectedResult = { name: 'client_encoding', value: 'UTF8' }

      deepEqual(f(givenBuf), expectedResult)
    },
  },
})

export const parse = (body, delimiter = 0x00) => {
  const nameAndValue = []
  let temp = []
  let remainingBuf = body

  if (body[body.length - 1] !== delimiter) {
    throw new Error('Invalid parameter status message. Expected last byte to be ' + delimiter + '.')
  }

  while(remainingBuf.length) {
    if (remainingBuf[0] === delimiter) {
      nameAndValue.push(new Buffer(temp))
      temp = []
    } else {
      temp.push(remainingBuf[0])
    }

    remainingBuf = remainingBuf.slice(1, remainingBuf.length)
  }

  const [ name, value ] = nameAndValue.map(buf => buf.toString())
  return { name, value }
}

export default parse

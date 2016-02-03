import * as assert from 'assert'
import { Readable, Writable } from 'stream'
import * as meta from './meta'
import { hexBuf }  from './hex-buf'
import { read } from './msg-reader'

meta.module(module, {
  doc: `
    # Control flow helper

    Read data from a readable until once complete message has been read
  `,
})

// -

meta.fn('readMessagesUntil', {
  doc: 'Return a promise of when one data for complete message has been read',
  shape: 'Readable -> Promise of when one data for complete message has been read',
  args: [
    'readable stream',
    'size of header, defaults to 1, optional',
    'size of length bytes, defaults to 4, optional',
    'whether the message length include the length bytes, defaults to true, optional'
  ],
  returns: [
    'Promise',
      'resolves when one complete message has been read',
      'rejected if no more data is available and a message has not been read',
      'rejected if reader emits an error'
  ],
  examples: {
    'resolve the promise when one message has been read': (f) => {
      const givenData = [
        hexBuf('0a 00'), hexBuf('00'), hexBuf('00'), hexBuf('05 01')
      ]
      const expectedResult = { head: hexBuf('0a'), body: hexBuf('01') }
      const reader = createMockReader(givenData)

      readOneMessage(reader)
        .then(result => deepEqual(result, expectedResult))
        .catch(fail)
    }
  },
})

export const readOneMessage = (readable, headLength = 1, lengthBytesCount = 4, lengthBytesInclusive = true) => {
  return new Promise((resolve, reject) => {
    let completeMessage
    let partialMessage = hexBuf('')

    const collector = new Writable()
    collector._write = (chunk, enc, cb) => {
      const data = Buffer.concat([partialMessage, chunk]);
      [ completeMessage, partialMessage ] = read(data, headLength, lengthBytesCount, lengthBytesInclusive)

      if (completeMessage) {
        resolve(completeMessage)
        return false
      }

      cb()
    }

    readable
      .once('end', function handleEnd() {
        reject(new Error('Failed to read complete message.'))
      })
      .once('error', function handleError() {
        reject(new Error('Error attempting to read message.'))
      })
      .pipe(collector)
  })
}

export default readOneMessage

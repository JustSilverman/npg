import * as assert from 'assert'
import { Readable, Writable } from 'stream'
import * as meta from './meta'
import { hexBuf }  from './hex-buf'
import { read as readMsg } from './msg-reader'

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

export const readOneMessage = (readable, headLength = 1, lengthBytesCount = 4, lengthBytesInclusive = true, timeoutDuration = 1000) => {
  const TIMEOUT_ERROR = new Error('Timeout of ' + timeoutDuration + ' ms reached waiting to read one message.')

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(TIMEOUT_ERROR)
      removeListenersAndTimers()
    }, timeoutDuration)

    let partialMessage = hexBuf('')

    const read = () => {
      let chunk
      while (null !== (chunk = readable.read())) {
        partialMessage = Buffer.concat([partialMessage, chunk]);
        let [ completeMessage, remainder ] = readMsg(partialMessage, headLength, lengthBytesCount, lengthBytesInclusive)

        if (completeMessage) {
          removeListenersAndTimers()
          readable.unshift(remainder)

          return resolve(completeMessage)
        }
      }
    }

    const handleError = () => {
      removeListenersAndTimers()
      reject(new Error('Error attempting to read message.'))
    }

    const removeListenersAndTimers = () => {
      clearTimeout(timeoutId)
      readable.removeListener('error', handleError)
      readable.removeListener('readable', read)
    }

    readable
      .once('error', handleError)
      .on('readable', read)
  })
}

export default readOneMessage

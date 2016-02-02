import * as assert from 'assert'
import { Readable, Writable } from 'stream'
import * as meta from './meta'
import { hexBuf }  from './hex-buf'

meta.module(module, {
  doc: `
    # Control flow helper

    Read measages from a readable until the predicate is satisfied
  `,
})

// -

meta.fn('readMessagesUntil', {
  doc: 'Return a promise of when the predicate is satisfied',
  shape: 'Readable, Predicate -> Promise of when predicate has been satisfied',
  args: [
    'readable stream',
    'predicate that takes a buffer. Predicate last chunk read and fnc to get all chunks read'
  ],
  returns: [
    'Promise',
      'resolves when predicate holds',
      'rejected if no more data is available and predicate has not been met',
      'rejected if reader emits an error'
  ],
  examples: {
    'resolve the promise when predicate holds': (f) => {
      const givenMessages = [
        hexBuf('00 01'), hexBuf('00'), hexBuf('00'), hexBuf('00 0a')
      ]
      const givenPredicate = (lastChunk, allChunks) => {
        const allData = allChunks()
        const lastByte = allData.slice(allData.length - 1)
        return lastByte.equals(hexBuf('01'))
      }
      const expectedResult = hexBuf('00 01')
      const reader = createMockReader(givenMessages)

      readMessagesUntil(reader, givenPredicate)
        .then(result => deepEqual(result, expectedResult))
        .catch(fail)
    }
  },
})

export const readMessagesUntil = (readable, predicate) => {
  return new Promise((resolve, reject) => {
    let allData = []

    const collector = new Writable()
    collector._write = (chunk, enc, cb) => {
      allData.push(chunk)
      if (predicate(chunk, () => Buffer.concat(allData))) {
        resolve(Buffer.concat(allData))
        return false
      }

      cb()
    }

    readable
      .once('end', function handleEnd() {
        reject(new Error('Failed to satisfy predicate.'))
      })
      .once('error', function handleError() {
        reject(new Error('Error attempting to read message.'))
      })
      .pipe(collector)
  })
}

export default readMessagesUntil

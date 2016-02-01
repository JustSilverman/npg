import * as assert from 'assert'
import { Writable } from 'stream'
import * as meta from './meta'
import { hexBuf }  from './hex-buf'

meta.module(module, {
  doc: `
    # Control flow helper

    Write data to a Writable and return a promise that resolves once the data
    has been flushed to the kernel
  `,
})

// -

meta.fn('writeData', {
  doc: 'Return a promise that resolves data has been flushed to kernel',
  shape: 'Writable, buf -> Promise of having written/flushed',
  args: [
    'writable stream',
    'binary data to be written to stream',
    'timeout duration in ms, optional'
  ],
  returns: [
    'Promise',
      'resolves when data has been flushed to kernel',
      'rejected if timeout is reached'
  ],
  examples: {
    'resolve the promise on when data has been flushed': (f) => {
      const givenData = hexBuf('00 01 02')
      const writer = new Writable();
      writer._write = (chunk, encoding, callback) => {
        callback()
      }

      writeData(writer, givenData)
        .then(() => assert.ok(true))
        .catch(assert.fail)
    }
  },
})

export const writeData = (writable, buf, timeoutDuration = 1000) => {
  const TIMEOUT_ERROR = new Error('Timeout of ' + timeoutDuration + ' ms reached waiting data to be flushed.')

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(TIMEOUT_ERROR)
    }, timeoutDuration)

    writable.once('error', err => {
      clearTimeout(timeoutId)
      reject(err)
      return
    })

    writable.write(buf, null, resolve)
  })
}

export default writeData
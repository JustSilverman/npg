import { equal, deepEqual, fail } from 'assert'
import { Writable } from 'stream';
import { hexBuf } from '../../../src/hex-buf'
import { writeData } from '../../../src/write-data'

describe('write-data', () => {
  const createMockWriter = (error, timeoutDuration = 0) => {
    const writer = new Writable();
    writer._flushed = false //only for testing
    writer._write = (buf, enc, cb) => {
      setTimeout(() => {
         /*
          Doesn't feel right. Assumed it would be cb(error). That emits an error,
          but also causes the cb (resolve in this case) passed to #write to be
          invoked, which is not correct
         */
        if (error) return writer.emit('error', error)

        writer._flushed = true
        cb()
      }, timeoutDuration)
    }

    return writer
  }

  describe('#writeData', () => {
    it('writes the data and resolves the promise once flushed', () => {
      const givenData = hexBuf('00 11')
      const writer = createMockWriter(null, 10)
      equal(writer._flushed, false)

      return writeData(writer, givenData)
        .then(() => equal(writer._flushed, true))
        .catch(fail)
    })

    it('rejects the promise if writing throws an error', () => {
      const givenData = hexBuf('00 11')
      const givenError = new Error('Invalid data.')
      const writer = createMockWriter(givenError)
      equal(writer._flushed, false)

      return writeData(writer, givenData)
        .then(fail)
        .catch(err => {
          deepEqual(err, givenError)
        })
    })

    it('rejects the promise with a timeout error if the timeout is reached', () => {
      const givenData = hexBuf('00 11')
      const writer = createMockWriter(null, 1001)
      const expectedError = new Error('Timeout of 1000 ms reached waiting data to be flushed.')
      equal(writer._flushed, false)

      return writeData(writer, givenData)
        .then(fail)
        .catch(err => deepEqual(err, expectedError))
    })

    it('rejects the promise with a custom timeout error if the timeout is reached', () => {
      const givenData = hexBuf('00 11')
      const writer = createMockWriter(null, 20)
      const expectedError = new Error('Timeout of 400 ms reached waiting data to be flushed.')
      equal(writer._flushed, false)

      return writeData(writer, givenData, 10)
        .then(fail)
        .catch(err => deepEqual(err, expectedError))
    })
  })
})

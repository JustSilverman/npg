import { equal, deepEqual, fail } from 'assert'
import { Writable } from 'stream';
import { hexBuf } from '../../../src/hex-buf'
import { writeData } from '../../../src/write-data'

describe('write-data', () => {
  const createMockWriter = (timeoutDuration, error) => {
    const writer = new Writable();
    writer._flushed = false //only for testing
    writer._write = (buf, enc, cb) => {
      if (error) {
        setTimeout(cb.bind(this, error), timeoutDuration)
        return
      }

      setTimeout(() => {
        writer._flushed = true
        cb(error)
      }, timeoutDuration)
    }

    return writer
  }

  describe('#writeData', () => {
    it('writes the data and resolves the promise once flushed', () => {
      const givenData = hexBuf('00 11')
      const writer = createMockWriter(200)
      equal(writer._flushed, false)

      return writeData(writer, givenData)
        .then(() => equal(writer._flushed, true))
        .catch(fail)
    })

    it('rejects the promise if writing throws an error', () => {
      const givenData = hexBuf('00 11')
      const givenError = new Error('Invalid data.')
      const writer = createMockWriter(1001, givenError)
      equal(writer._flushed, false)

      return writeData(writer, givenData)
        .then(fail)
        .catch(err => {
          deepEqual(err, givenError)
        })
    })

    it('rejects the promise with a timeout error if the timeout is reached', () => {
      const givenData = hexBuf('00 11')
      const writer = createMockWriter(1001)
      const expectedError = new Error('Timeout of 1000 ms reached waiting data to be flushed.')
      equal(writer._flushed, false)

      return writeData(writer, givenData)
        .then(fail)
        .catch(err => {
          deepEqual(err, expectedError)
        })
    })

    it('rejects the promise with a custom timeout error if the timeout is reached', () => {
      const givenData = hexBuf('00 11')
      const writer = createMockWriter(500)
      const expectedError = new Error('Timeout of 400 ms reached waiting data to be flushed.')
      equal(writer._flushed, false)

      return writeData(writer, givenData, 400)
        .then(fail)
        .catch(err => {
          deepEqual(err, expectedError)
        })
    })
  })
})

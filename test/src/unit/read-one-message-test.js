import { deepEqual, fail } from 'assert'
import { Readable } from 'stream';
import { hexBuf } from '../../../src/hex-buf'
import { readOneMessage } from '../../../src/read-one-message'
import createMockReader from '../../helpers/mock-reader'

import { read } from '../../../src/msg-reader'

describe('read-one-message', () => {
  describe('#readOneMessage', () => {
    it('returns promise that resolves one message once a message has been read', () => {
      const givenChunks = [ hexBuf('0a'), hexBuf('00 00'), hexBuf('00'), hexBuf('05'), hexBuf('0b 02') ]
      const givenReader = createMockReader(givenChunks)
      const expectedMessage = { head: hexBuf('0a'), body: hexBuf('0b') }

      return readOneMessage(givenReader)
        .then(result => deepEqual(result, expectedMessage))
        .catch(fail)
    })

    context('returns promise that resolves using non default args for read', () => {
      it('headless message', () => {
        const givenChunks = [ hexBuf('00 00'), hexBuf('00'), hexBuf('05'), hexBuf('0b 02') ]
        const givenReader = createMockReader(givenChunks)
        const expectedMessage = { head: null, body: hexBuf('0b') }

        return readOneMessage(givenReader, 0)
          .then(result => deepEqual(result, expectedMessage))
          .catch(fail)
      })

      it('head of length 3', () => {
        const givenChunks = [ hexBuf('0a'), hexBuf('0a 00'), hexBuf('00 00'), hexBuf('00'), hexBuf('05'), hexBuf('0b 02') ]
        const givenReader = createMockReader(givenChunks)
        const expectedMessage = { head: hexBuf('0a 0a 00'), body: hexBuf('0b') }

        return readOneMessage(givenReader, 3)
          .then(result => deepEqual(result, expectedMessage))
          .catch(fail)
      })

      it('headless and length bytes count of 2', () => {
        const givenChunks = [ hexBuf('00 04'), hexBuf('00'), hexBuf('05 02') ]
        const givenReader = createMockReader(givenChunks)
        const expectedMessage = { head: null, body: hexBuf('00 05') }

        return readOneMessage(givenReader, 0, 2)
          .then(result => deepEqual(result, expectedMessage))
          .catch(fail)
      })

      it('length bytes count of 2', () => {
        const givenChunks = [ hexBuf('0b'), hexBuf('00 04'), hexBuf('00'), hexBuf('05 02') ]
        const givenReader = createMockReader(givenChunks)
        const expectedMessage = { head: hexBuf('0b'), body: hexBuf('00 05') }

        return readOneMessage(givenReader, 1, 2)
          .then(result => deepEqual(result, expectedMessage))
          .catch(fail)
      })

      it('length bytes exclusive', () => {
        const givenChunks = [ hexBuf('0a'), hexBuf('00 00'), hexBuf('00'), hexBuf('01'), hexBuf('0b 02') ]
        const givenReader = createMockReader(givenChunks)
        const expectedMessage = { head: hexBuf('0a'), body: hexBuf('0b') }

        return readOneMessage(givenReader, 1, 4, false)
          .then(result => deepEqual(result, expectedMessage))
          .catch(fail)
      })

      it('length bytes count of 2 and length bytes exclusive', () => {
        const givenChunks = [ hexBuf('0a'), hexBuf('00 01'), hexBuf('0b 02') ]
        const givenReader = createMockReader(givenChunks)
        const expectedMessage = { head: hexBuf('0a'), body: hexBuf('0b') }

        return readOneMessage(givenReader, 1, 2, false)
          .then(result => deepEqual(result, expectedMessage))
          .catch(fail)
      })

      it('headless, length bytes count of 2 and length bytes exclusive', () => {
        const givenChunks = [ hexBuf('00 01'), hexBuf('0b 02') ]
        const givenReader = createMockReader(givenChunks)
        const expectedMessage = { head: null, body: hexBuf('0b') }

        return readOneMessage(givenReader, 0, 2, false)
          .then(result => deepEqual(result, expectedMessage))
          .catch(fail)
      })
    })

    it('returns promise that rejects with an error if all data does not satisfy predicate', () => {
      const givenChunks = [ hexBuf('00 01'), hexBuf('0b 02') ]
      const givenReader = createMockReader(givenChunks)
      const expectedError = new Error('Failed to read complete message.')

      return readOneMessage(givenReader)
        .then(fail)
        .catch(err => deepEqual(err, expectedError))
    })

    it('returns promise that rejects with an error if readable emits an error', () => {
      const givenReader = new Readable()
      givenReader._read = () => {
        givenReader.emit('error', 'Internal error')
      }
      const expectedError = new Error('Error attempting to read message.')

      return readOneMessage(givenReader)
        .then(fail)
        .catch(err => deepEqual(err, expectedError))
    })
  })
})

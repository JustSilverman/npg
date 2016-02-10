import { equal, deepEqual, fail } from 'assert'
import { Readable } from 'stream';
import { hexBuf } from '../../../src/hex-buf'
import { readMessagesUntil } from '../../../src/read-messages-until'
import createMockReader from '../../helpers/mock-reader'
import equalErrors from '../../helpers/equal-errors'

describe('read-messages-until', () => {
  describe('#readMessagesUntil', () => {
    it('returns promise that resolves with all messages once predicate is satisfied', () => {
      const givenMessages = [
        hexBuf('00 01'), hexBuf('00'), hexBuf('00'), hexBuf('00 0a')
      ]
      const givenPredicate = (lastChunk, allChunks) => {
        const allData = allChunks()
        const lastTwoBytes = allData.slice(allData.length - 2)
        return lastTwoBytes.equals(hexBuf('00 00'))
      }
      const expectedResult = hexBuf('00 01 00 00')
      const reader = createMockReader(givenMessages)

      return readMessagesUntil(reader, givenPredicate)
        .then(result => deepEqual(result, expectedResult))
        .catch(fail)
    })

    it('returns promise that rejects with an error if all data does not satisfy predicate', () => {
      const givenMessages = [
        hexBuf('00 01'), hexBuf('00'), hexBuf('01'), hexBuf('00 0a')
      ]
      const givenPredicate = (lastChunk, allChunks) => {
        const allData = allChunks()
        const lastTwoBytes = allData.slice(allData.length - 2)
        return lastTwoBytes.equals(hexBuf('00 00'))
      }
      const expectedError = new Error('Failed to satisfy predicate.')
      const reader = createMockReader(givenMessages)

      return readMessagesUntil(reader, givenPredicate)
        .then(fail)
        .catch(err => equalErrors(err, expectedError))
    })

    it('returns promise that rejects with an error if readable emits an error', () => {
      const givenMessages = [ hexBuf('11 12') ]
      const givenPredicate = (lastChunk, allChunks) => {
        const allData = allChunks()
        const lastTwoBytes = allData.slice(allData.length - 2)
        return lastTwoBytes.equals(hexBuf('00 00'))
      }
      const expectedError = new Error('Error attempting to read message.')
      const reader = new Readable()
      reader._read = () => {
        reader.emit('error', 'Internal error')
      }

      return readMessagesUntil(reader, givenPredicate)
        .then(fail)
        .catch(err => equalErrors(err, expectedError))
    })

    it('no additional data should read after promise is resolved')
  })
})

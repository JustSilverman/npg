import { equal, deepEqual, fail } from 'assert'
import { EventEmitter } from 'events';
import { hexBuf } from '../../../src/hex-buf'
import { waitForEvent } from '../../../src/wait-for-event'
import equalErrors from '../../helpers/equal-errors'

describe('wait-for-event', () => {
  describe('#waitForEvent', () => {
    it('resolves the promise with one argument when the event is emitted', (done) => {
      const givenEmitter = new EventEmitter()
      const givenEventType = 'data'
      const givenEventData = hexBuf('00 01 02')
      const expectedData = givenEventData

      waitForEvent(givenEmitter, givenEventType)
        .then(buf => {
          deepEqual(buf, expectedData)
          done()
        })
        .catch(fail)
      deepEqual(givenEmitter.listenerCount(givenEventType), 1)
      deepEqual(givenEmitter.listenerCount('error'), 1)

      givenEmitter.emit(givenEventType, givenEventData)
    })

    it('rejects the promise when error is emitted', (done) => {
      const givenEmitter = new EventEmitter()
      const givenEventType = 'data'
      const givenError = new Error('Internal error')
      const expectedError = givenError

      waitForEvent(givenEmitter, givenEventType)
        .then(fail)
        .catch(error => {
          equalErrors(error, expectedError)
          done()
        })
      deepEqual(givenEmitter.listenerCount(givenEventType), 1)
      deepEqual(givenEmitter.listenerCount('error'), 1)

      givenEmitter.emit('error', givenError)
    })

    it('rejects the promise with a timeout error if the timeout is reached', (done) => {
      const givenEmitter = new EventEmitter()
      const givenEventType = 'data'
      const givenDurationUntilEvent = 1001
      const expectedError = new Error('Timeout of 1000ms reached waiting for ' + givenEventType + ' to be emitted.')

      waitForEvent(givenEmitter, givenEventType)
        .then(fail)
        .catch(error => {
          equalErrors(error, expectedError)
          done()
        })

      setTimeout(givenEmitter.emit.bind(givenEmitter, givenEventType), givenDurationUntilEvent)
    })

    it('rejects the promise with a custom timeout error if the timeout is reached', (done) => {
      const givenEmitter = new EventEmitter()
      const givenEventType = 'data'
      const givenDurationUntilEvent = 200
      const expectedError = new Error('Timeout of 100ms reached waiting for ' + givenEventType + ' to be emitted.')

      waitForEvent(givenEmitter, givenEventType, 100)
        .then(fail)
        .catch(error => {
          equalErrors(error, expectedError)
          done()
        })

      setTimeout(givenEmitter.emit.bind(givenEmitter, givenEventType), givenDurationUntilEvent)
    })

    it('removes listeners upon resolution', (done) => {
      const givenEmitter = new EventEmitter()
      const givenEventType = 'data'
      const givenEventData = hexBuf('00 01 02')
      const expectedData = givenEventData

      waitForEvent(givenEmitter, givenEventType)
        .then(buf => {
          deepEqual(buf, expectedData)
          deepEqual(givenEmitter.listenerCount(givenEventType), 0)
          deepEqual(givenEmitter.listenerCount('error'), 0)
          done()
        })
        .catch(fail)
      deepEqual(givenEmitter.listenerCount(givenEventType), 1)
      deepEqual(givenEmitter.listenerCount('error'), 1)

      givenEmitter.emit(givenEventType, givenEventData)
    })

    it('removes listeners upon rejection from error', (done) => {
      const givenEmitter = new EventEmitter()
      const givenEventType = 'data'
      const givenError = new Error('Internal error')
      const expectedError = givenError

      waitForEvent(givenEmitter, givenEventType)
        .then(fail)
        .catch(error => {
          equalErrors(error, expectedError)
          deepEqual(givenEmitter.listenerCount(givenEventType), 0)
          deepEqual(givenEmitter.listenerCount('error'), 0)
          done()
        })
      deepEqual(givenEmitter.listenerCount(givenEventType), 1)
      deepEqual(givenEmitter.listenerCount('error'), 1)

      givenEmitter.emit('error', givenError)
    })

    it('removes listeners upon rejection from timeout', (done) => {
      const givenEmitter = new EventEmitter()
      const givenEventType = 'data'
      const givenDurationUntilEvent = 1001
      const expectedError = new Error('Timeout of 1000ms reached waiting for ' + givenEventType + ' to be emitted.')

      waitForEvent(givenEmitter, givenEventType)
        .then(fail)
        .catch(error => {
          equalErrors(error, expectedError)
          deepEqual(givenEmitter.listenerCount(givenEventType), 0)
          deepEqual(givenEmitter.listenerCount('error'), 0)
          done()
        })
      deepEqual(givenEmitter.listenerCount(givenEventType), 1)
      deepEqual(givenEmitter.listenerCount('error'), 1)

      setTimeout(givenEmitter.emit.bind(givenEmitter, givenEventType), givenDurationUntilEvent)
    })
  })
})

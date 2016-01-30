import * as assert from 'assert'
import * as  EventEmitter from 'events';
import * as meta from './meta'
import { hexBuf }  from './hex-buf'

meta.module(module, {
  doc: `
    # Control flow helper

    Transforms waiting for an event into a promise
  `,
})

// -

meta.fn('waitForEvent', {
  doc: 'Return a promise that resolves when emitter emits event',
  shape: 'emitter, str, int? -> promise',
  args: [
    'event emitter',
    'event type that causes promise to be resolved',
    'timeout duration in ms, optional'
  ],
  returns: [
    'Promise',
      'resolves when emitter emits eventType',
      'rejected if emitter emits error',
      'rejected if timeout is reached'
  ],
  examples: {
    'resolve the promise on a data event': (f) => {
      const givenEventType = 'data'
      const expected = hexBuf('00 01 02')
      const emitter = new EventEmitter()

      f(emitter, givenEventType)
        .then(buf => { assert.deepEqual(buf, given) })
        .catch(err => { throw err })

      emitter.emit('data', expected)
    }
  },
})

export const waitForEvent = (emitter, event, timeoutDuration = 1000) => {
  const TIMEOUT_ERROR = new Error('Timeout of ' + timeoutDuration + ' ms reached waiting for ' + event + ' to be emitted.')

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(TIMEOUT_ERROR)
      removeListeners()
    }, timeoutDuration)


    const handler = (func) => {
      return (arg) => {
        func(arg)
        removeListeners()
        clearTimeout(timeoutId)
      }
    }
    const handleEvent = handler(resolve)
    const handleError = handler(reject)

    const removeListeners = () => {
      emitter.removeListener(event, handleEvent)
      emitter.removeListener('error', handleError)
    }


    emitter
      .on(event, handleEvent)
      .on('error', handleError)
  })
}

export default waitForEvent
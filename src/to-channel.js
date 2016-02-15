import * as meta from './meta'
import { Readable, Writable } from 'stream'
import csp from 'js-csp'
import hexBuf from './hex-buf'
import writeData from './write-data'
import createMockReader from '../test/helpers/mock-reader'
import createMockWriter from '../test/helpers/mock-writer'

meta.module(module, {
  doc: `
    # Transform a stream into a channel
  `,
})

// -

meta.fn('fromReadable', {
  doc: 'Transform a readable stream into a channel',
  shape: 'Readable -> Channel',
  args: [
    'Readable from which to read and put on the channel'
  ],
  returns: [
    'Channel'
  ],
  examples: {
    'read 6 bytes': (f) => {
      const givenData = [ hexBuf('00 01 02'), hexBuf('03 04'), hexBuf('05') ]
      const expectedData = hexBuf('00 01 02 03 04 05')
      const reader = createMockReader(givenData)
      const rChan = f(reader)

      csp.go(function* () {
        const messages = []
        let msg
        while((msg = yield csp.take(rChan)) !== csp.CLOSED) {
          messages.push(msg)
        }

        deepEqual(Buffer.concat(messages), expectedData)
      })
    },
  },
})

export const fromReadable = (readable) => {
  const chan = csp.chan()

  const read = () => {
    let chunk;
    while (null !== (chunk = readable.read())) {
      csp.putAsync(chan, chunk)
    }
  }

  const handleEnd = () => {
    removeListeners()
    chan.close()
  }

  const handleError = () => {
    removeListeners()
    csp.putAsync(chan, new Error('Error attempting to read message.'), chan.close)
  }

  const removeListeners = () => {
    readable.removeListener('end', handleEnd)
    readable.removeListener('error', handleError)
    readable.removeListener('readable', read)
  }

  readable
    .once('end', handleEnd)
    .once('error', handleError)
    .once('readable', read)

  return chan
}

meta.fn('fromWritable', {
  doc: 'Transform a writable stream into a channel',
  shape: 'Writable -> Channel',
  args: [
    'Writable to which to write when taking from the channel'
  ],
  returns: [
    'Channel'
  ],
  examples: {
    'write 6 bytes': (f) => {
      const expectedData = hexBuf('00 01')
      const writer = createMockWriter()
      const rChan = f(writer)

      csp.go(function* () {
        yield csp.put(wChan, hexBuf('00'))
        yield csp.put(wChan, hexBuf('01'))
        wChan.close()

        yield csp.put(wChan, hexBuf('02'))
        deepEqual(writer.testBuffer(), expectedData)
      })
    },
  },
})

export const fromWritable = (writable) => {
  const chan = csp.chan()

  csp.go(function* () {
    let msg
    while((msg = yield csp.take(chan)) !== csp.CLOSED) {
      if (msg instanceof Error) {
        throw msg
        console.log('here')
      }

      yield writeData(writable, msg)
    }
  })

  return chan
}

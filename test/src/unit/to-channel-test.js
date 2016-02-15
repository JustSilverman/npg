import { deepEqual, throws } from 'assert'
import { Readable, Writable } from 'stream'
import csp from 'js-csp'
import equalErrors from '../../helpers/equal-errors'
import createMockReader from '../../helpers/mock-reader'
import createMockWriter from '../../helpers/mock-writer'
import hexBuf from '../../../src/hex-buf'
import * as toChannel from '../../../src/to-channel'

describe.only('to-channel', () => {
  describe('#fromReadable', (done) => {
    it('puts the data from the readable onto the channel and closes on end', () => {
      const givenData = [hexBuf('00 01 02'), hexBuf('03 04'), hexBuf('05')]
      const expectedData = hexBuf('00 01 02 03 04 05')
      const reader = createMockReader(givenData)
      const rChan = toChannel.fromReadable(reader)

      csp.go(function* () {
        const messages = []
        let msg
        while((msg = yield csp.take(rChan)) !== csp.CLOSED) {
          messages.push(msg)
        }

        deepEqual(Buffer.concat(messages), expectedData)
        deepEqual(yield csp.take(rChan), csp.CLOSED)
        done()
      })
    })

    it('propagates errors from the readable', () => {
      const givenError = new Error('Error attempting to read message.')
      const reader = new Readable()
      reader._read = () => {
        reader.push(givenError)
      }
      const rChan = toChannel.fromReadable(reader)

      csp.go(function* () {
        equalErrors(yield csp.take(rChan), givenError)
        done()
      })
    })

    it('propagates a timeout error if timout duration is met before first put')
  })

  describe('#fromWritable', () => {
    it('takes from the channel and writes to the writable', (done) => {
      const expectedData = hexBuf('00 01')
      const writer = createMockWriter()
      const wChan = toChannel.fromWritable(writer)

      csp.go(function* () {
        yield csp.put(wChan, hexBuf('00'))
        yield csp.put(wChan, hexBuf('01'))
        wChan.close()

        yield csp.put(wChan, hexBuf('02'))
        deepEqual(Buffer.concat(writer.testBuffer()), expectedData)
        done()
      })
    })

    it('throws errors received from the channel', (done) => {
      const givenError = new Error('Internal error')
      const writer = createMockWriter()
      const wChan = toChannel.fromWritable(writer)

      throws(() => {
        csp.go(function* () {
          yield csp.put(wChan, givenError)
          done()
        })
      }, givenError.message)
    })
  })
})

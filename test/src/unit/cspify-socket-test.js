import { deepEqual } from 'assert'
import { Duplex } from 'stream'
import csp from 'js-csp'
import createMockReader from '../../helpers/mock-reader'
import createMockWriter from '../../helpers/mock-writer'
import equalErrors from '../../helpers/equal-errors'
import hexBuf from '../../../src/hex-buf'
import toChannels from '../../../src/csp-ify-socket'

describe('csp-ify-socket', () => {
  describe('#toChannels', () => {
    describe('using new channels', () => {
      it('puts the socket itself onto the connected channel on connect', (done) => {
        const givenSocket = new Duplex()
        const { connected, errors, read, write } = toChannels(givenSocket)

        csp.go(function* () {
          givenSocket.emit('connect')
          const socket = yield csp.take(connected)
          deepEqual(socket, givenSocket)
          done()
        })
      })

      it('puts data onto the read channel from data events', (done) => {
        const givenSocket = createMockReader([ hexBuf('00'), hexBuf('01 02'), hexBuf('03') ])
        const expectedAllData = hexBuf('00 01 02 03')
        const { connected, errors, read, write } = toChannels(givenSocket)

        csp.go(function* () {
          const allData = []
          let data

          while((data = yield csp.take(read)) !== csp.CLOSED) {
            allData.push(data)
          }

          deepEqual(Buffer.concat(allData), expectedAllData)
          done()
        })
      })

      it('writes data put on the write channel to the socket', (done) => {
        const givenSocket = createMockWriter()
        const expectedAllData = hexBuf('00 01 02 03')
        const { connected, errors, read, write } = toChannels(givenSocket)

        csp.go(function* () {
          yield csp.operations.onto(write, [ hexBuf('00 01'), hexBuf('02'), hexBuf('03') ])
          deepEqual(Buffer.concat(givenSocket.testBuffer()), expectedAllData)
          done()
        })
      })

      it('puts errors onto the error channel', (done) => {
        const givenSocket = new Duplex()
        const givenError = new Error('Internal error')
        const { connected, errors, read, write } = toChannels(givenSocket)

        csp.go(function* () {
          givenSocket.emit('error', givenError)
          const error = yield csp.take(errors)
          equalErrors(error, givenError)
          done()
        })
      })
    })

    describe('passing channels as arguments', () => {
      const _ = undefined

      it('puts the socket itself onto the connected channel on connect', (done) => {
        const givenSocket = new Duplex()
        const existingConnectChannel = csp.chan()
        const { connected, errors, read, write } = toChannels(givenSocket, existingConnectChannel)
        deepEqual(connected, existingConnectChannel)

        csp.go(function* () {
          givenSocket.emit('connect')
          const socket = yield csp.take(existingConnectChannel)
          deepEqual(socket, givenSocket)
          done()
        })
      })

      it('puts data onto the read channel from data events', (done) => {
        const givenSocket = createMockReader([ hexBuf('00'), hexBuf('01 02'), hexBuf('03') ])
        const expectedAllData = hexBuf('00 01 02 03')
        const existingRead = csp.chan(50)
        const { connected, errors, read, write } = toChannels(givenSocket, _, _, existingRead)
        deepEqual(read, existingRead)

        csp.go(function* () {
          const allData = []
          let data

          while((data = yield csp.take(existingRead)) !== csp.CLOSED) {
            allData.push(data)
          }

          deepEqual(Buffer.concat(allData), expectedAllData)
          done()
        })
      })

      it('writes data put on the write channel to the socket', (done) => {
        const givenSocket = createMockWriter()
        const expectedAllData = hexBuf('00 01 02 03')
        const existingWrite = csp.chan()
        const { connected, errors, read, write } = toChannels(givenSocket, _, _, _, existingWrite)
        deepEqual(write, existingWrite)

        csp.go(function* () {
          yield csp.operations.onto(existingWrite, [ hexBuf('00 01'), hexBuf('02'), hexBuf('03') ])
          deepEqual(Buffer.concat(givenSocket.testBuffer()), expectedAllData)
          done()
        })
      })

      it('puts errors onto the error channel', (done) => {
        const givenSocket = new Duplex()
        const givenError = new Error('Internal error')
        const existingError = csp.chan()
        const { connected, errors, read, write } = toChannels(givenSocket, _, existingError)
        deepEqual(errors, existingError)

        csp.go(function* () {
          givenSocket.emit('error', givenError)
          const error = yield csp.take(existingError)
          equalErrors(error, givenError)
          done()
        })
      })
    })
  })
})
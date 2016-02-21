import { deepEqual } from 'assert'
import csp from 'js-csp'
import * as meta from './meta'
import hexBuf from './hex-buf'

meta.module(module, {
  doc: `
    # Process that creates and manages channels to interface with node's socket api

    Default read and write channels are fixed buffer channels
  `,
})

meta.fn('toChannels', {
  doc: 'Creates channels to wrap the socket api',
  shape: 'Socket, Channel?, Channel?, Channel?, Channel? -> { Channel, Channel, Channel, Channel }',
  args: [
    'Socket to wrap',
    'Channel for connected event, optional',
    'Channel for errors, optional',
    'Channel for reads, optional',
    'Channel for writes, optional',
  ],
  returns: [
    'Channel to handle connect event',
    'Channel on which all errors are published',
    'Channel on which data read from the socket is put',
    'Channel from which data is read and then written to the socket'
  ],
  examples: [
    ['read, write and error', (f) => {

    }]
  ],
})

export const toChannels = (socket, connected = csp.chan(), errors = csp.chan(), read = csp.chan(100), write = csp.chan(100)) => {
  socket.on('connect', () => csp.putAsync(connected, socket));
  socket.on('error', err => csp.putAsync(errors, err));
  socket.on('data', buf => csp.putAsync(read, buf));
  socket.on('end', () => { read.close() });

  csp.go(function * () {
    let buf
    while ((buf = yield csp.take(write)) && buf !== csp.CLOSED) {
      socket.write(buf, err => { if (err) csp.putAsync(errors, err) })
    }
  })

  return { connected, errors, read, write }
}

export default toChannels

import { deepEqual } from 'assert'
import csp from 'js-csp'
import * as meta from './meta'
import hexBuf from './hex-buf'

meta.module(module, {
  doc: `
    # Process that creates and manages channels to interface with node's socket api
  `,
})

meta.fn('toChannels', {
  doc: 'Creates channels to wrap the socket api',
  shape: 'Socket -> { Channel, Channel, Channel, Channel }',
  args: [
    'Socket to wrap'
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

export const toChannels = (socket) => {
  const connected = csp.chan();
  socket.on('connect', () => csp.putAsync(connected, socket));

  const errors = csp.chan();
  socket.on('error', (err) => csp.putAsync(errors, err));

  const read = csp.chan();
  socket.on('data', (buf) => { csp.putAsync(read, buf) });
  socket.on('end', () => { read.close() });

  const write = csp.chan()
  csp.go(function * () {
    let buf
    while ((buf = yield csp.take(write)) && buf !== csp.CLOSED) {
      socket.write(buf, (err) => { if (err) csp.putAsync(errors, err) })
    }
  })

  return { connected, errors, read, write }
}

export default toChannels

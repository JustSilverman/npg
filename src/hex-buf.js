import * as assert from 'assert'
import * as meta from './meta'

meta.module(module, {
  doc: `
    # Hex buffer helper

    Create stream of binary data

  `,
})

// -

meta.fn('create', {
  doc: 'Creates a buffer',
  shape: 'String -> Buffer',
  args: [
    'string of space delimited hex values'
  ],
  returns: [
    'buffer'
  ],
  examples: {
    'stream of binary data': (f) => {
      const message = f('0a 00 00 00 01 0b')
      assert.deepEqual(message, new Buffer([0x0a, 0x00, 0x00, 0x01, 0x0b]))
    },
  },
})

export const hexBuf = (hexAsString) => {
  if (hexAsString.length === 0) return new Buffer([])
  return new Buffer(hexAsString.split(' ').map(s => parseInt(s, 16)))
}

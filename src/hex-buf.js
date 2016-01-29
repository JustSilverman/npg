import * as assert from 'assert'
import * as meta from './meta'

meta.module(module, {
  doc: `
    # Hex buffer helper

    Create a buffer from a string with space separated hex digit pairs.

        > hexBuf('0a 00 00 00 01 0b')
        <Buffer 0a 00 00 00 01 0b>
  `,
})

// -

meta.fn('create', {
  doc: 'Create a buffer from a string with space separated hex digit pairs',
  shape: 'String -> Buffer',
  args: [
    'string of space delimited hex pairs'
  ],
  returns: 'buffer',
  examples: {
    '6 bytes': (f) => {
      const message = f('0a 00 00 00 01 0b')
      assert.deepEqual(message, new Buffer([0x0a, 0x00, 0x00, 0x01, 0x0b]))
    },
  },
})

export const hexBuf = (hexAsString) => {
  if (hexAsString.length === 0) return new Buffer([])
  return new Buffer(hexAsString.split(' ').map(s => parseInt(s, 16)))
}

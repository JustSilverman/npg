import * as assert from 'assert'
import * as meta from './meta'
import { hexBuf }  from './hex-buf'

meta.module(module, {
  doc: `
    # Buffer utility

    Helper to transform chunks of n bytes of a buffer. Helpful if we know specific
    bytes in a buffer correspond to specific data. For example, if we know the first
    byte refers to the head of a message and bytes 2 through 5 refer to the size,
    we can transform it as follows:

    sample message:
    0a 00 00 00 05 1c
    ^^ ^---------^ ^^
     |    size     |
    head          body

    const b
    split.intoChunks(Buffer <0a 00 00 00 05 1c>, [
      [ 1 ],
      [ 4, buf => buf.readUInt32BE() ],
    ])

    returns:
    [
      [
        Buffer <0a>,
        5 // Buffer <00 00 00 05> transformed to 5 via #readUInt32BE
      ],
      Buffer <1c> //remainder
    ]
  `,
})

// -

meta.fn('intoChunks', {
  doc: 'Split a buffer into chunks of n bytes and optionally transform each chunk with a provided function',
  shape: 'Buffer, [ int, fnc? ] -> [ [ ? ], Buffer]',
  args: [
    'buffer with msg data in it',
    'array of 2 element tuples, each tuple represents each chunk',
      'first element is number of bytes to slice',
      'second element is function to transform chunk, optional',
  ],
  returns: [
    'array of transformed chunks',
    'remainder bytes'
  ],
  examples: {
    '7 byte buffer into 3 chunks': (f) => {
      const givenBuf = hexBuf('01 02 0a 0b 03 05 bb')
      const givenChunks = [
        [ 2 ],
        [ 1, buf => buf.readUInt8() ]
        [ 3, buf => buf.toString() ]
      ]
      const expectedChunks = [
        hexBuf('01 02'),
        10,
        '\u000b\u0003\u0005'
      ]
      const expectedRemainder = hexBuf('bb')

      deepEqual(f(givenBuf, givenChunks), [ expectedChunks, expectedRemainder ])
    },
  },
})

const identity = val => val

export const intoChunks = (buf, chunkSizeAndTransforms) => {
  return chunkSizeAndTransforms.reduce(([ results, remainder], [ size, transform ]) => {
    transform = transform || identity
    if (remainder.length < size) {
      throw new Error('Chunk length of ' + size + ' exceeds remaining buffer length ' + remainder.length)
    }

    return [
      results.concat(transform(remainder.slice(0, size))),
      remainder.slice(size, remainder.length)
    ]
  }, [ [], buf ])
}

meta.fn('intoChunk', {
  doc: 'Split a buffer a single chunk of n bytes and optionally transform it',
  shape: 'Buffer, ing, fnc? -> [ [ ? ], Buffer]',
  args: [
    'buffer with msg data in it',
    'number of bytes in chunk to be sliced',
    'function to transform the chunk, optional'
  ],
  returns: [
    'transform chunk',
    'remainder bytes'
  ],
  examples: {
    '7 byte buffer into 3 chunks': (f) => {
      const givenBuf = hexBuf('01 02 0a 0b 03 05 bb')
      const givenChunks = [
        [ 2 ],
        [ 1, buf => buf.readUInt8() ]
        [ 3, buf => buf.toString() ]
      ]
      const expectedChunks = [
        hexBuf('01 02'),
        10,
        '\u000b\u0003\u0005'
      ]
      const expectedRemainder = hexBuf('bb')

      deepEqual(f(givenBuf, givenChunks), [ expectedChunks, expectedRemainder ])
    },
  },
})

export const intoChunk = (buf, chunkSize, transform = identity) => {
  if (buf.length < chunkSize) {
    throw new Error('Chunk length of ' + chunkSize + ' exceeds remaining buffer length ' + buf.length)
  }

  return [
    transform(buf.slice(0, chunkSize)),
    buf.slice(chunkSize, buf.length)
  ]
}

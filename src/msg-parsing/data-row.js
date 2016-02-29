import * as assert from 'assert'
import * as meta from '../meta'
import { hexBuf }  from '../hex-buf'
import * as split  from '../split-buf'

meta.module(module, {
  doc: `
    # DataRow parser

    Int16
      The number of column values that follow (possibly zero).

    Next, the following pair of fields appear for each column:

    Int32
      The length of the column value, in bytes (this count does not include itself). Can be zero. As a special case, -1 indicates a NULL column value. No value bytes follow in the NULL case.

    Byten
      The value of the column, in the format indicated by the associated format code. n is the above length.

    Example DataRow message:
    00 02 00 00 00 02 2d 32 00 00 00 01 01
    ^---^ ^---------^ ^---^ ^---------^ ^^
    vals  val length   val   val length |
    count  in bytes           in bytes  |
                                       val
  `,
})

// -

meta.fn('parse', {
  doc: 'Transform a data row postgres message into an array of column values as strings',
  shape: 'Buffer -> [ str?, str?... ]',
  args: [
    'buffer with message body'
  ],
  returns: [
    'Array with one element per column value. May be empty'
  ],
  examples: {
    'two values, one null': (f) => {
      const givenBuf = hexBuf('00 03 00 00 00 02 2d 32 00 00 00 05 68 65 6c 6c 6f 00 00 00 00')
      const expectedResult = [ '-2', 'hello', null ]

      deepEqual(f(givenBuf), expectedResult)
    },
  },
})

export const parse = (body) => {
  const results = []
  let valByteCount
  let value
  let [ valCount, remainder ] = split.intoChunk(body, 2, buf => buf.readUInt16BE())

  while (remainder.length) {
    [ valByteCount, remainder ] = split.intoChunk(remainder, 4, buf => buf.readUInt32BE())
    if (remainder.length < valByteCount) {
      throw new Error('Expected to read ' + valByteCount + ' bytes, but only ' + remainder.length + ' remain in buffer.')
    }

    //TODO: Handle case where format is binary and not plain text
    value = valByteCount === 0 ? null : remainder.slice(0, valByteCount).toString()
    results.push(value)

    remainder = remainder.slice(valByteCount, remainder.length)
  }

  if (valCount !== results.length) {
    throw new Error('Expected ' + valCount + ' column values, but was ' + results.length)
  }

  return results
}

export default parse

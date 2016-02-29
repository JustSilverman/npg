import * as assert from 'assert'
import * as meta from '../meta'
import { hexBuf }  from '../hex-buf'
import * as split  from '../split-buf'

meta.module(module, {
  doc: `
    # RowDescription parser

    Int16
      Specifies the number of fields in a row (can be zero).

    Then, for each field, there is the following:

    String
      The field name.

    Int32
      If the field can be identified as a column of a specific table, the object ID of the table; otherwise zero.

    Int16
      If the field can be identified as a column of a specific table, the attribute number of the column; otherwise zero.

    Int32
      The object ID of the field's data type.

    Int16
      The data type size (see pg_type.typlen). Note that negative values denote variable-width types.

    Int32
      The type modifier (see pg_attribute.atttypmod). The meaning of the modifier is type-specific.

    Int16
      The format code being used for the field. Currently will be zero (text) or one (binary). In a RowDescription returned from the statement variant of Describe, the format code is not yet known and will always be zero.

    Example row description message:
    00 01 6e 75 6d 00 00 00 40 07 00 01 00 00 00 17 00 04 ff ff ff ff 00 00
    ^---^ ^------^ ^^ ^---------^ ^---^ ^---------^ ^---^ ^---------^ ^---^
      |     name   |   table Id     |     type Id     |    type mod.    |
    field        delimiter         col               type              format
    count                          num               size
  `,
})

// -

meta.fn('parse', {
  doc: 'Transform a row description postgres message into an array of field descriptions',
  shape: 'Buffer -> Object',
  args: [
    'buffer with message body'
  ],
  returns: [
    'Array of field description objects',
      '{ name, tableId, colNum, typeId, typeSize, typeModifier, format }'
  ],
  examples: {
    '1 column named num of type integer': (f) => {
      const givenBuf = hexBuf('00 01 6e 75 6d 00 00 00 40 07 00 01 00 00 00 17 00 04 ff ff ff ff 00 00')
      const expectedResult = [
        {
          name: 'num',
          tableId: 16391,
          colNum: 1,
          typeId: 23,
          typeSize: 4,
          typeModifier: 4294967295,
          format: 0
        }
      ]

      deepEqual(f(givenBuf), expectedResult)
    },
  },
})

const fieldName = (buf) => {
  let remainder = buf
  const delimiter = 0x00
  const temp = []

  while (remainder[0] !== delimiter) {
    temp.push(remainder[0])
    remainder = remainder.slice(1, remainder.length)
  }

  return [ new Buffer(temp).toString(), remainder.slice(1, remainder.length) ]
}

const parseField = (buf) => {
  let name
  let remainder
  let transformedChunks

  [ name, remainder ] = fieldName(buf);
  [ transformedChunks, remainder ] = split.intoChunks(remainder,
    [
      [ 4, buf => buf.readUInt32BE() ], // tableId
      [ 2, buf => buf.readUInt16BE() ], // colNum
      [ 4, buf => buf.readUInt32BE() ], // typeId
      [ 2, buf => buf.readUInt16BE() ], // typeSize
      [ 4, buf => buf.readUInt32BE() ], // typeModifier
      [ 2, buf => buf.readUInt16BE() ]  // format
    ]
  )

  const [ tableId, colNum, typeId, typeSize, typeModifier, format ] = transformedChunks
  return [
    { name, tableId, colNum, typeId, typeSize, typeModifier, format },
    remainder
  ]
}

export const parse = (buf) => {
  const fields = []
  let field
  let expectedFieldCount
  let remainder = buf;

  [ expectedFieldCount, remainder ] = split.intoChunks(remainder, [ [ 2, buf => buf.readUInt16BE() ] ])

  while(remainder.length) {
    [ field, remainder ] = parseField(remainder)
    fields.push(field)
  }

  if (expectedFieldCount[0] !== fields.length) {
    throw new Error('Expected ' + expectedFieldCount + ' fields, but was ' + fields.length)
  }

  return fields
}

export default parse

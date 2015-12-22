import * as assert from 'assert'
import { parseColumnValue } from '../../../src/pg-row-data-parser'

describe('Row data parser', () => {
  describe('parsing rows of a single type', () => {
    describe('unsupported types', () => {
      it('returns the value as a string', () => {
        const unsupportedTypeId = -23
        const rowData = new Buffer('some string', 'utf8')
        assert.deepEqual(parseColumnValue(unsupportedTypeId, 'utf8', rowData), 'some string')
      })
    })

    describe('integer types', () => {
      describe('int2', () => {
        it('parses a positive 2 byte integer', () => {
          const rowData = new Buffer([0x31])
          assert.deepEqual(parseColumnValue(21, 'utf8', rowData), 1)
        })

        it('parses a negative 2 byte integer', () => {
          const rowData = new Buffer([0x2d, 0x31])
          assert.deepEqual(parseColumnValue(21, 'utf8', rowData), -1)
        })
      })

      describe('int4', () => {
        it('parses a positive 4 byte integer', () => {
          const rowData = new Buffer([0x32, 0x31, 0x34, 0x37, 0x34, 0x38, 0x33, 0x36, 0x34, 0x37])
          assert.deepEqual(parseColumnValue(23, 'utf8', rowData), 2147483647)
        })

        it('parses a negative 4 byte integer', () => {
          const rowData = new Buffer([0x2d, 0x32, 0x31, 0x34, 0x37, 0x34, 0x38, 0x33, 0x36, 0x34, 0x37])
          assert.deepEqual(parseColumnValue(23, 'utf8', rowData), -2147483647)
        })
      })

      describe('int8', () => {
        const asBuffer = new Buffer('9223372036854775807', 'utf8')

        it('parses a positive 8 byte integer', () => {
          const rowData = asBuffer
          assert.deepEqual(parseColumnValue(20, 'utf8', rowData), 9223372036854775807)
        })

        it('parses a negative 8 byte integer', () => {
          const rowData = Buffer.concat([new Buffer([0x2d]), asBuffer])
          assert.deepEqual(parseColumnValue(20, 'utf8', rowData), -9223372036854775807)
        })
      })
    })

    describe('floating point types', () => {
      describe('real type', () => {
        const asBuffer = new Buffer('123.456', 'utf8')

        it('parses a positive float4', () => {
          const rowData = asBuffer
          assert.deepEqual(parseColumnValue(700, 'utf8', rowData), 123.456)
        })

        it('parses a negative float4', () => {
          const rowData = Buffer.concat([new Buffer([0x2d]), asBuffer])
          assert.deepEqual(parseColumnValue(700, 'utf8', rowData), -123.456)
        })
      })

      describe('double precision type', () => {
        const asBuffer = new Buffer('12345678.12345678', 'utf8')

        it('parses a positive float8', () => {
          const rowData = asBuffer
          assert.deepEqual(parseColumnValue(701, 'utf8', rowData), 12345678.12345678)
        })

        it('parses a negative float8', () => {
          const rowData = Buffer.concat([new Buffer([0x2d]), asBuffer])
          assert.deepEqual(parseColumnValue(701, 'utf8', rowData), -12345678.12345678)
        })
      })
    })

    describe('Arbitrary precision types', () => {
      describe('numeric (aka decimal) type', () => {
        const bignumAsStr = '31415926535897932384626433832795028841971693993751058.16180339887498948482045868343656381177203091798057628'
        const bignumAsNum = 31415926535897932384626433832795028841971693993751058.16180339887498948482045868343656381177203091798057628
        const asBuffer = new Buffer(bignumAsStr, 'utf8')

        it('parses a positive bignum', () => {
          const rowData = asBuffer
          assert.deepEqual(parseColumnValue(1700, 'utf8', rowData), bignumAsNum)
        })

        it('parses a negative bignum', () => {
          const rowData = Buffer.concat([new Buffer([0x2d]), asBuffer])
          assert.deepEqual(parseColumnValue(1700, 'utf8', rowData), -1 * bignumAsNum)
        })
      })
    })

    describe('Booleans', () => {
      it('parses a boolean and is true for all true states', () => {
        ['TRUE', 't', 'true', 'y', 'yes', 'on', '1'].forEach((value) => {
          assert.strictEqual(parseColumnValue(16, 'utf8', new Buffer(value, 'utf8')), true)
        })
      })

      it('parses a boolean and is false for all false states', () => {
        ['FALSE', 'f', 'false', 'n', 'no', 'off', '0'].forEach((value) => {
          assert.strictEqual(parseColumnValue(16, 'utf8', new Buffer(value, 'utf8')), false)
        })
      })

      it('throws if passed an unsupported boolean value', () => {
        assert.throws(() => {
          parseColumnValue(16, 'utf8', new Buffer('very true', 'utf8'))
        })
      })
    })
  })
})

import * as assert from 'assert'
import { parseColumnValue } from '../../../src/pg-row-data-parser'

describe('Row data parser', () => {
  describe('parsing rows of a single type', () => {
    describe('integer types', () => {
      describe('int2', () => {
        it('parses a positive 2 byte integer', () => {
          const rowData = new Buffer([0x31])
          assert.deepEqual(parseColumnValue(21, rowData), 1)
        })

        it('parses a negative 2 byte integer', () => {
          const rowData = new Buffer([0x2d, 0x31])
          assert.deepEqual(parseColumnValue(21, rowData), -1)
        })
      })

      describe('int4', () => {
        it('parses a positive 4 byte integer', () => {
          const rowData = new Buffer([0x32, 0x31, 0x34, 0x37, 0x34, 0x38, 0x33, 0x36, 0x34, 0x37])
          assert.deepEqual(parseColumnValue(23, rowData), 2147483647)
        })

        it('parses a negative 4 byte integer', () => {
          const rowData = new Buffer([0x2d, 0x32, 0x31, 0x34, 0x37, 0x34, 0x38, 0x33, 0x36, 0x34, 0x37])
          assert.deepEqual(parseColumnValue(23, rowData), -2147483647)
        })
      })

      describe('int8', () => {
        const asBuffer = new Buffer('9223372036854775807', 'utf8')

        it('parses a positive 8 byte integer', () => {
          const rowData = asBuffer
          assert.deepEqual(parseColumnValue(20, rowData), 9223372036854775807)
        })

        it('parses a negative 8 byte integer', () => {
          const rowData = Buffer.concat([new Buffer([0x2d]), asBuffer])
          assert.deepEqual(parseColumnValue(20, rowData), -9223372036854775807)
        })
      })
    })
  })
})

import { deepEqual, throws } from 'assert'
import hexBuf from '../../../../src/hex-buf'
import parse from '../../../../src/msg-parsing/row-description'

describe('row-description', () => {
  describe('#parse', () => {
    it('parses a row description buffer with one field', () => {
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

      deepEqual(parse(givenBuf), expectedResult)
    })

    it('parses a row description buffer with multiple fields', () => {
      const givenFieldCount = hexBuf('00 02')
      const givenField1 = hexBuf('6e 75 6d 00 00 00 40 07 00 01 00 00 00 17 00 04 ff ff ff ff 00 00')
      const givenField2 = hexBuf('75 70 64 61 74 65 64 5f 61 74 00 00 00 40 07 00 02 00 00 04 5a 00 08 ff ff ff ff 00 01')
      const expectedResult = [
        {
          name: 'num',
          tableId: 16391,
          colNum: 1,
          typeId: 23,
          typeSize: 4,
          typeModifier: 4294967295,
          format: 0
        },
        {
          name: 'updated_at',
          tableId: 16391,
          colNum: 2,
          typeId: 1114,
          typeSize: 8,
          typeModifier: 4294967295,
          format: 1
        }
      ]

      deepEqual(parse(Buffer.concat([givenFieldCount, givenField1, givenField2])), expectedResult)
    })

    it('throws if an incomplete row description is received', () => {
      throws(() => {
        const givenBuf = hexBuf('00 01 6e 75 6d 00 00 00 40 07 00 01 00 00 00 17 00 04 ff ff ff ff 00')

        parse(givenBuf)
      })
    })

    it('throws if fields count does not match fields bytes', () => {
      throws(() => {
        const givenFieldCount = hexBuf('00 02')
        const givenField1 = hexBuf('6e 75 6d 00 00 00 40 07 00 01 00 00 00 17 00 04 ff ff ff ff 00 00')

        parse(Buffer.concat([givenFieldCount, givenField1]))
      }, /Expected 2 fields/)
    })
  })
})

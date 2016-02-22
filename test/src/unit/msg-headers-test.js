import { deepEqual } from 'assert'
import * as headers from '../../../src/msg-headers'

describe('msg-headers', () => {
  it('symToHeaderByte does not have duplicate values', () => {
    const expectedValuesLength = headers.symToHeaderByte.size
    const uniqueValuesLength = [...new Set(headers.symToHeaderByte.values()) ].length
    deepEqual(uniqueValuesLength, expectedValuesLength)
  })
})

import { deepEqual } from 'assert'
import { create } from '../../../src/msg-creator'

describe('msg-creator', () => {
  const hexBuf = (arg) => new Buffer(arg.split(' ').map(s => parseInt(s, 16)))

  it('creates a message from a head and body', () => {
    const given = {
      head: hexBuf('0b'),
      body: hexBuf('ab dd 12 23')
    }
    const expected = hexBuf('0b 00 00 00 08 ab dd 12 23')

    deepEqual(create(given.head, given.body), expected)
  })
})

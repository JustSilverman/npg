import { deepEqual } from 'assert'
import { read } from '../../../src/msg-reader'
import { create } from '../../../src/msg-creator'
import { hexBuf } from '../../../src/hex-buf'

describe('Message reading and creating', () => {
  it('reads a message, creates and then reads a message', () => {
    const given = hexBuf('53 00 00 00 1a 61 70 70 6c 69 63 61 74 69 6f 6e 5f 6e 61 6d 65 00 70 73 71 6c 00')
    const expectedReadMessage = {
      head: hexBuf('53'),
      body: hexBuf('61 70 70 6c 69 63 61 74 69 6f 6e 5f 6e 61 6d 65 00 70 73 71 6c 00')
    }
    const expectedCreatedMessage = hexBuf('53 00 00 00 1a 61 70 70 6c 69 63 61 74 69 6f 6e 5f 6e 61 6d 65 00 70 73 71 6c 00')

    const [ readMessage, remainder ] = read(given)
    const createdMessage = create(readMessage.head, readMessage.body)
    deepEqual(readMessage, expectedReadMessage)
    deepEqual(createdMessage, expectedCreatedMessage)
    deepEqual(read(createdMessage)[0], expectedReadMessage)
  })

  it('reads a message, creates and then reads a message', () => {
    const given = hexBuf('00 00 00 1a 61 70 70 6c 69 63 61 74 69 6f 6e 5f 6e 61 6d 65 00 70 73 71 6c 00')
    const expectedReadMessage = {
      head: hexBuf(''),
      body: hexBuf('61 70 70 6c 69 63 61 74 69 6f 6e 5f 6e 61 6d 65 00 70 73 71 6c 00')
    }
    const expectedCreatedMessage = hexBuf('00 00 00 1a 61 70 70 6c 69 63 61 74 69 6f 6e 5f 6e 61 6d 65 00 70 73 71 6c 00')

    const [ readMessage, remainder ] = read(given, 0)
    const createdMessage = create(readMessage.head, readMessage.body)
    deepEqual(readMessage, expectedReadMessage)
    deepEqual(createdMessage, expectedCreatedMessage)
    deepEqual(read(createdMessage, 0)[0], expectedReadMessage)
  })
})

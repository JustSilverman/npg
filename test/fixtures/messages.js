import hexBuf from '../../src/hex-buf'

export const messages = new Map()

messages.set('firstStartup', {
  buf: hexBuf('00 00 00 08 04 d2 16 2f'),
  pgMessage: { head: null, body: hexBuf('04 d2 16 2f') },
  desc: 'first startup'
})

messages.set('secondStartup', {
  buf: hexBuf('00 00 00 46 00 03 00 00 75 73 65 72 00 6a 75 73 74 69 6e 73 69 6c 76 65 72 6d 61 6e 00 64 61 74 61 62 61 73 65 00 70 6f 73 74 67 72 65 73 00 61 70 70 6c 69 63 61 74 69 6f 6e 5f 6e 61 6d 65 00 70 73 71 6c 00 00'),
  pgMessage: { head: null, body: hexBuf('00 03 00 00 75 73 65 72 00 6a 75 73 74 69 6e 73 69 6c 76 65 72 6d 61 6e 00 64 61 74 61 62 61 73 65 00 70 6f 73 74 67 72 65 73 00 61 70 70 6c 69 63 61 74 69 6f 6e 5f 6e 61 6d 65 00 70 73 71 6c 00 00') },
  desc: 'second startup'
})

messages.set('sessionConfirm', {
  buf: hexBuf('4e'),
  pgMessage: { head: hexBuf('4e'), body: hexBuf('') },
  desc: 'session confirm'
})

messages.set('parameterStatus', {
  buf: hexBuf('53 00 00 00 17 44 61 74 65 53 74 79 6c 65 00 49 53 4f 2c 20 4d 44 59 00'),
  pgMessage: { head: hexBuf('53'), body: hexBuf('44 61 74 65 53 74 79 6c 65 00 49 53 4f 2c 20 4d 44 59 00') },
  desc: 'parameter status'
})

messages.set('backendKeyData', {
  buf: hexBuf('4b 00 00 00 0a 00 00 84 03 48 65 fb 75'),
  pgMessage: { head: hexBuf('4b'), body: hexBuf('00 00 84 03 48 65 fb 75') },
  desc: 'backend key data'
})

messages.set('readyForQuery', {
  buf: hexBuf('5a 00 00 00 05 49'),
  pgMessage: { head: hexBuf('5a'), body: hexBuf('49') },
  desc: 'ready for query'
})

messages.set('query', {
  buf: hexBuf('51 00 00 00 18 73 65 6c 65 63 74 20 2a 20 66 72 6f 6d 20 6e 75 6d 73 3b 00'),
  pgMessage: { head: hexBuf('51'), body: hexBuf('73 65 6c 65 63 74 20 2a 20 66 72 6f 6d 20 6e 75 6d 73 3b 00') },
  desc: 'query'
})

messages.set('queryHead', {
  buf: hexBuf('54 00 00 00 1c 00 01 6e 75 6d 00 00 00 40 07 00 01 00 00 00 17 00 04 ff ff ff ff 00 00'),
  pgMessage: { head: hexBuf('54'), body: hexBuf('00 01 6e 75 6d 00 00 00 40 07 00 01 00 00 00 17 00 04 ff ff ff ff 00 00') },
  desc: 'query head'
})

messages.set('queryRow', {
  buf: hexBuf('44 00 00 00 0b 00 01 00 00 00 01 32'),
  pgMessage: { head: hexBuf('44'), body: hexBuf('00 01 00 00 00 01 32') },
  desc: 'query row'
})

messages.set('queryClose', {
  buf: hexBuf('43 00 00 00 0a 53 45 4c 45 43 54 20 33 00'),
  pgMessage: { head: hexBuf('43'), body: hexBuf('53 45 4c 45 43 54 20 33 00') },
  desc: 'query close'
})

messages.set('exit', {
  buf: hexBuf('58 00 00 00 04'),
  pgMessage: { head: hexBuf('58'), body: hexBuf('04') },
  desc: 'exit'
})

const as = (prop) => {
  return Array.from(messages.keys()).reduce((memo, key) => {
    memo.set(key, messages.get(key)[prop])
    return memo
  }, new Map())
}

export const asBuf = as('buf')
export const asPgMessage = as('pgMessage')
export const asDesc = as('desc')

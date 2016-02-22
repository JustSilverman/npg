import * as assert from 'assert'
import * as meta from './meta'
import { read }  from './msg-reader'
import { hexBuf }  from './hex-buf'
import * as headers from './msg-headers'

meta.module(module, {
  doc: `
    # Postgres message comparators
  `,
})

// -

meta.fn('equals', {
  doc: 'Determines if two messages are identical',
  shape: 'pg message, pg message -> bool',
  args: [
    'pg message',
    'pg message'
  ],
  returns: [
    'bool'
  ],
  examples: {
    'equal messages': (f) => {
      const givenMessage1 = { head: hexBuf('0a 00 00 00 05 0b'), body: hexBuf('0b') }
      const givenMessage2 = { head: hexBuf('0a 00 00 00 05 0b'), body: hexBuf('0b') }

      deepEqual(f(givenMessage1, givenMessage2), true)
    }
  },
})

export const equals = (msg1, msg2) => {
  return msg1.head.equals(msg2.head) && msg1.body.equals(msg2.body)
}

meta.fn('equals', {
  doc: 'Determines if a pg message is of a specific pg type',
  shape: 'symbol, pg message -> bool',
  args: [
    'symbol referencing header byte',
    'pg message'
  ],
  returns: [
    'bool'
  ],
  examples: {
    'ready for query': (f) => {
      const givenHeadSymbol = headers.readyForQuery
      const givenMessage = { head: hexBuf('5a'), body: hexBuf('') }

      deepEqual(f(givenHeadSymbol, givenMessage), true)
    }
  },
})

export const ofType = (headSymbol, message) => {
  return message.head.equals(headers.symToHeaderByte.get(headSymbol))
}

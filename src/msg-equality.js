import { symToHeaderByte as headers } from './msg-headers'

export const equals = (msg1, msg2) => {
  return msg1.head.equals(msg2.head) && msg1.body.equals(msg2.body)
}

export const ofType = (headSymbol, message) => {
  return message.head.equals(headers.get(headSymbol))
}

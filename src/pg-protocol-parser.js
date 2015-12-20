const startupMessageTypeBytesCount = 0
const messageTypeBytesCount = 1
const lengthBytesCount = 4

const parseType = (typeBytesCount, buf) => {
  return buf.slice(0, typeBytesCount)
}

const parseLength = (typeBytesCount, lengthBytesCount, buf) => {
  const lengthBytesStartIndex = typeBytesCount
  const lengthBytesEndIndex = typeBytesCount + lengthBytesCount
  return buf.slice(lengthBytesStartIndex, lengthBytesEndIndex).readUInt32BE()
}

const parseBody = (typeBytesCount, lengthBytesCount, buf) => {
  const bodyStartIndex = typeBytesCount + lengthBytesCount
  const bodyEndIndex = bodyStartIndex + (parseLength(typeBytesCount, lengthBytesCount, buf) - lengthBytesCount)
  return buf.slice(bodyStartIndex, bodyEndIndex)
}

const _parseMessage = (typeBytesCount, lengthBytesCount, buf) => {
  const typeBuffer = parseType(typeBytesCount, buf)
  const type = typeBuffer.length ? typeBuffer : null
  const length = parseLength(typeBytesCount, lengthBytesCount, buf)
  const body = parseBody(typeBytesCount, lengthBytesCount, buf)
  let remainder

  const isIncompleteMessage = body.length < (length - lengthBytesCount)

  if (isIncompleteMessage) {
    remainder = buf
  } else {
    const messageEndIndex = typeBytesCount + length
    remainder = buf.slice(messageEndIndex, buf.length)
  }

  return [
    {
      type,
      length,
      body
    },
    remainder
  ]
}

/**
 * Buffer buf -> postgres message
 * message is a tuple
 * [0] { type: Buffer, length: Int, body: Buffer},
 * [1] Buffer remainder
**/
export const parseMessage = (buf) => {
  return _parseMessage(messageTypeBytesCount, lengthBytesCount, buf)
}

/**
 * Buffer buf -> postgres startup message (lacks message type byte)
 * message is a tuple
 * [0] { type: null, length: Int, body: Buffer},
 * [1] Buffer remainder
**/
export const parseStartupMessage = (buf) => {
  return _parseMessage(startupMessageTypeBytesCount, lengthBytesCount, buf)
}

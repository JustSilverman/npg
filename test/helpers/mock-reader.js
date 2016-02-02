import { Readable } from 'stream';

export const createMockReader = (messages = []) => {
  const iter = messages[Symbol.iterator]()
  const reader = new Readable()
  reader._read = () => {
    const next = iter.next()
    if (next.done) {
      reader.push(null)
      return
    }
    reader.push(next.value)
  }

  return reader
}

export default createMockReader

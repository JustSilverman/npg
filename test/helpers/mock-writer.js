import { Writable } from 'stream';

const identity = (val) => val

export const createMockWriter = (transform = identity) => {
  const writer = new Writable()
  writer._testBuffer = []
  writer.testBuffer = () => {
    return writer._testBuffer
  }

  writer._write = (chunk, enc, cb) => {
    writer._testBuffer.push(transform(chunk))
    cb()
  }

  return writer
}

export default createMockWriter

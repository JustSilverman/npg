import { Writable } from 'stream';

export const createMockWriter = (transform) => {
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

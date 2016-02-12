import * as assert from 'assert'
import * as meta from './meta'
import readOneMessage from './read-one-message'
import writeData from './write-data'
import { read as readMsg } from './msg-reader'

meta.module(module, {
  doc: `
    #

  `,
})

meta.fn('Create', {
  doc: 'Create an instance of a channel',
  shape: 'Duplex, Function, Function, Int -> Channel',
  args: [
    'Duplex stream to get messages from and write to',
    'Function that takes a readable and message parameters returns a promise of when a message has been read',
    'Function that transforms message object',
    'Timeout duration for reading and writing to channel, optional'
  ],
  returns: [
    'Channel instance',
  ],
  examples: {
    'create a channel from a socket connection': (f) => {
    }
  },
})

export const Create = (socket, readOne, create, timeoutDuration = 1000) => {
  return { socket, readOne, create, timeoutDuration }
}

meta.fn('getMessage', {
  doc: "Get one message from the channel",
  shape: 'Channel, int?, int?, bool? -> promise of when one message is read from the channel',
  args: [
    'Channel instance from which to read the message',
    'size of header, defaults to 1, optional',
    'size of length bytes, defaults to 4, optional',
    'whether the message length include the length bytes, defaults to true, optional',
  ],
  returns: [
    'Promise',
      'resolves when one complete message has been read',
      "rejected if channel's timeout duration elapses before getting data for one message",
      'rejected if reader emits an error'
  ],
  examples: {
    'read one message': (f) => {
    }
  },
})

export const getMessage = (channel, headLength = 1, lengthBytesCount = 4, lengthBytesInclusive = true) => {
  return channel.readOne(channel.socket, headLength, lengthBytesCount, lengthBytesInclusive, channel.timeoutDuration)
}

meta.fn('writeMessage', {
  doc: "Write one message to the channel transformed by the channel's writeTransform function",
  shape: 'Channel, Object -> promise of when message message has been flushed',
  args: [
    'Channel instance from which to read the message',
    'Data to write in the form of an object ( { head: Buffer, body: Buffer} )'
  ],
  returns: [
    'Promise',
      'resolves when one complete message has been flushed',
      "rejected if channel's timeout duration elapses before getting data for one message",
      'rejected if reader emits an error'
  ],
  examples: {
    'write one message': (f) => {

    }
  },
})

export const writeMessage = (channel, message) => {
  return writeData(channel.socket, channel.create(message), channel.timeoutDuration)
}

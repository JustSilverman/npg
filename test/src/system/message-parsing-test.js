import * as assert from 'assert'
import { parseMessage, parseStartupMessage } from '../../../src/pg-protocol-parser'
import { readFileSync } from 'fs'

describe('Message parsing', () => {
  // Buffer buf -> [ message1, message2 ... ]
  // message -> [ { type: Buffer, length: Int, body: Buffer}, Buffer remainder ]
  function parseMessages(buf, messages = []) {
    if (!buf.length) {
      return messages
    }

    let [ message, remainder ] = parseMessage(buf)
    messages.push(message)
    return parseMessages(remainder, messages)
  }

  // Buffer messageBody -> [ 'string1', 'string2' ... ]
  function toAsciiEmptyByteSeparated(messageBody, currentMessage = [], messageList = []) {
    const delimiter = 0x00
    if (!messageBody.length) {
      return messageList
    }

    let head = messageBody[0]
    let rest = messageBody.slice(1, messageBody.length)

    if (head === delimiter) {
      messageList.push(new Buffer(currentMessage).toString('ascii'))
      currentMessage = []
    } else {
      currentMessage.push(head)
    }

    return toAsciiEmptyByteSeparated(rest, currentMessage, messageList)
  }

  function assertIsReadyForQuery(message) {
    assert.strictEqual(message.type[0], 0x5a)
    assert.strictEqual(message.length, 5)
    assert.deepEqual(message.body, new Buffer([0x49]))
  }

  describe('parsing a server response to the startup message', () => {
    /*
      Questions:
        What is the first byte 0x4e?  It possibly indicates a message type byte,
        but that would seem to violate the protocol beause the next byte seems to be
        the message type byte for the first message.
    */

    let messages
    before(() => {
      const input = readFileSync('./test/fixtures/server-handshake')
      const noticeMessageType = input.slice(0, 1) //What is this first byte?
      const serverResponseMessages = input.slice(1, input.length)
      messages = parseMessages(serverResponseMessages)
    })

    it('parses the authenticationOk message', () => {
      const authenticationOkByteType = 0x52
      const expectedAuthenticationOk = {
        type: new Buffer([0x52]),
        length: 8,
        body: new Buffer([0x00, 0x00, 0x00, 0x00])
      }
      const authenticationOk = messages.filter((message) => {
        return message.type[0] === authenticationOkByteType
      })[0]

      assert.deepEqual(authenticationOk, expectedAuthenticationOk)
    })

    it('parses the parameterStatus messages', () => {
      const expectedParamterStatusMessagesAsAscii = [
        [ 'application_name', 'psql' ],
        [ 'client_encoding', 'UTF8' ],
        [ 'DateStyle', 'ISO, MDY' ],
        [ 'integer_datetimes', 'on' ],
        [ 'IntervalStyle', 'postgres' ],
        [ 'is_superuser', 'on' ],
        [ 'server_encoding', 'UTF8' ],
        [ 'server_version', '9.4.4' ],
        [ 'session_authorization', 'justinsilverman' ],
        [ 'standard_conforming_strings', 'on' ],
        [ 'TimeZone', 'US/Pacific' ]
      ]

      const parameterStatusByteType = 0x53
      const parameterStatusMessagesAsAscii = messages
        .filter((message) => { return message.type[0] === parameterStatusByteType })
        .map((message) => { return toAsciiEmptyByteSeparated(message.body) })

      assert.deepEqual(parameterStatusMessagesAsAscii, expectedParamterStatusMessagesAsAscii)
    })

    it('parses the backendKeyData message', () => {
      const backendKeyDataByteType = 0x4b
      const expectedbackendKeyData = {
        type: new Buffer([0x4b]),
        length: 12,
        body: new Buffer([0x00, 0x00, 0x84, 0x03, 0x48, 0x65, 0xfb, 0x75])
      }
      const backendKeyData = messages.filter((message) => {
        return message.type[0] === backendKeyDataByteType
      })[0]

      assert.deepEqual(backendKeyData, expectedbackendKeyData)
    })

    it('parses the readyForQuery message', () => {
      const readyForQueryByteType = 0x5a
      const expectedreadyForQuery = {
        type: new Buffer([0x5a]),
        length: 5,
        body: new Buffer([0x49])
      }
      const readyForQuery = messages.filter((message) => {
        return message.type[0] === readyForQueryByteType
      })[0]

      assert.deepEqual(readyForQuery, expectedreadyForQuery)
    })
  })

  describe('parsing a startup messages', () => {
    /*
      Questions:
        Why are there two startup messages that lack a message type byte?
    */

    it('parses a startup message from the client including a standard exit message', () => {
      const input = readFileSync('./test/fixtures/client-handshake')

      let [ firstStartupMessage, firstStartupMessageRemainder ] = parseStartupMessage(input)
      assert.strictEqual(firstStartupMessage.type, null)
      assert.strictEqual(firstStartupMessage.length, 8)
      assert.deepEqual(firstStartupMessage.body, new Buffer([0x04, 0xd2, 0x16, 0x2f]))

      let [ secondStartupMessage, secondStartupMessageRemainder ] = parseStartupMessage(firstStartupMessageRemainder)
      assert.strictEqual(secondStartupMessage.type, null)
      assert.strictEqual(secondStartupMessage.length, 91)
      assert.deepEqual(secondStartupMessage.body, input.slice(12, 99))

      let [ exitMessage, remainder ] = parseMessage(secondStartupMessageRemainder)
      assert.deepEqual(exitMessage.type, new Buffer([0x58]))
      assert.strictEqual(exitMessage.length, 4)
      assert.deepEqual(exitMessage.body, new Buffer([]))
      assert.strictEqual(remainder.length, 0)
    })
  })

  describe('parsing messages to create a database', () => {
    describe('successfully creating a database with no parameters', () => {
      it('parses the client request to create a database', () => {
        const input = readFileSync('./test/fixtures/client-create-database-with-options')
        const [ message, remainder ] = parseMessage(input)
        const expectedBody = 'create database users connection limit 10 template default;\u0000'

        assert.strictEqual(message.type[0], 0x51)
        assert.strictEqual(message.length, 64)
        assert.strictEqual(message.body.toString('ascii'), expectedBody)
      })

      it('parses the server response to create a database', () => {
        const input = readFileSync('./test/fixtures/server-create-database-with-options')
        const [ message, readyForQuery ] = parseMessages(input)

        assert.strictEqual(message.type[0], 0x43)
        assert.strictEqual(message.length, 20)
        assert.strictEqual(message.body.toString('ascii'), 'CREATE DATABASE\u0000')
        assertIsReadyForQuery(readyForQuery)
      })
    })
  })
})

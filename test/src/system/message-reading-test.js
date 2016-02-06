import * as assert from 'assert'
import { read } from '../../../src/msg-reader'
import { readFileSync } from 'fs'

describe('Message parsing', () => {

  // todo: use readSeq here?

  // Buffer buf -> [ message1, message2 ... ]
  // message -> [ { head: Buffer, length: Int, body: Buffer}, Buffer remainder ]
  const parseMessages = (buf, messages = []) => {
    if (!buf.length) {
      return messages
    }

    let [ message, remainder ] = read(buf)
    messages.push(message)
    return parseMessages(remainder, messages)
  }

  // todo: factor out to specific test for parsing the *body* of this message type?
  // also, this is probably not a test helper but belongs in the library itself

  // Buffer messageBody -> [ 'string1', 'string2' ... ]
  const toUtf8EmptyByteSeparated = (messageBody, currentMessage = [], messageList = []) => {
    const delimiter = 0x00
    if (!messageBody.length) {
      return messageList
    }

    let head = messageBody[0]
    let rest = messageBody.slice(1, messageBody.length)

    if (head === delimiter) {
      messageList.push(new Buffer(currentMessage).toString('utf8'))
      currentMessage = []
    } else {
      currentMessage.push(head)
    }

    return toUtf8EmptyByteSeparated(rest, currentMessage, messageList)
  }

  // todo: also something that is part of the lib itself

  const assertIsReadyForQuery = (message) => {
    assert.strictEqual(message.head[0], 0x5a)
    assert.deepEqual(message.body, new Buffer([0x49]))
  }

  describe('parsing the handshake', () => {
    describe('parses the server handshake', () => {
      let messages
      before(() => {
        const input = readFileSync('./test/fixtures/server-handshake')
        const serverResponseMessages = input.slice(1, input.length) // exclude SSL byte
        messages = parseMessages(serverResponseMessages)
      })

      it('parses the authenticationOk message', () => {
        const authenticationOkByteType = 0x52
        const expectedAuthenticationOk = {
          head: new Buffer([0x52]),
          body: new Buffer([0x00, 0x00, 0x00, 0x00])
        }
        const authenticationOk = messages.filter((message) => {
          return message.head[0] === authenticationOkByteType
        })[0]

        assert.deepEqual(authenticationOk, expectedAuthenticationOk)
      })

      it('parses the parameterStatus messages', () => {
        const expectedParamterStatusMessagesAsUtf8 = [
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
        const parameterStatusMessagesAsUtf8 = messages
          .filter((message) => { return message.head[0] === parameterStatusByteType })
          .map((message) => { return toUtf8EmptyByteSeparated(message.body) })

        assert.deepEqual(parameterStatusMessagesAsUtf8, expectedParamterStatusMessagesAsUtf8)
      })

      it('parses the backendKeyData message', () => {
        const backendKeyDataByteType = 0x4b
        const expectedbackendKeyData = {
          head: new Buffer([0x4b]),
          body: new Buffer([0x00, 0x00, 0x84, 0x03, 0x48, 0x65, 0xfb, 0x75])
        }
        const backendKeyData = messages.filter((message) => {
          return message.head[0] === backendKeyDataByteType
        })[0]

        assert.deepEqual(backendKeyData, expectedbackendKeyData)
      })

      it('parses the readyForQuery message', () => {
        const readyForQueryByteType = 0x5a
        const expectedreadyForQuery = {
          head: new Buffer([0x5a]),
          body: new Buffer([0x49])
        }
        const readyForQuery = messages.filter((message) => {
          return message.head[0] === readyForQueryByteType
        })[0]

        assert.deepEqual(readyForQuery, expectedreadyForQuery)
      })
    })

    describe('parses the client handshake', () => {
      /*
        Questions:
          Why are there two startup messages that lack a message type byte?
      */

      it('parses a startup message from the client including a standard exit message', () => {
        const input = readFileSync('./test/fixtures/client-handshake')

        let [ firstStartupMessage, firstStartupMessageRemainder ] = read(input, 0)
        assert.strictEqual(firstStartupMessage.head, null)
        assert.deepEqual(firstStartupMessage.body, new Buffer([0x04, 0xd2, 0x16, 0x2f]))

        let [ secondStartupMessage, secondStartupMessageRemainder ] = read(firstStartupMessageRemainder, 0)
        assert.strictEqual(secondStartupMessage.head, null)
        assert.deepEqual(secondStartupMessage.body, input.slice(12, 99))

        let [ exitMessage, remainder ] = read(secondStartupMessageRemainder)
        assert.deepEqual(exitMessage.head, new Buffer([0x58]))
        assert.deepEqual(exitMessage.body, new Buffer([]))
      })
    })
  })

  describe('parsing messages to create a database', () => {
    describe('successfully creating a database with no parameters', () => {
      it('parses the client request to create a database', () => {
        const input = readFileSync('./test/fixtures/client-create-database-with-options')
        const [ message, remainder ] = read(input)
        const expectedBody = 'create database users connection limit 10 template default;\u0000'

        assert.strictEqual(message.head[0], 0x51)
        assert.strictEqual(message.body.toString('utf8'), expectedBody)
      })

      it('parses the server response to create a database', () => {
        const input = readFileSync('./test/fixtures/server-create-database-with-options')
        const [ message, readyForQuery ] = parseMessages(input)

        assert.strictEqual(message.head[0], 0x43)
        assert.strictEqual(message.body.toString('utf8'), 'CREATE DATABASE\u0000')
        assertIsReadyForQuery(readyForQuery)
      })
    })

    describe('attempting to create a database that already exists', () => {
      it('parses the server response to create a database', () => {
        const input = readFileSync('./test/fixtures/server-create-existing-database')
        const [ errorMessage, readyForQuery] = parseMessages(input)
        const expectedError = 'SERROR\u0000C42P04\u0000Mdatabase "users" already exists\u0000Fdbcommands.c\u0000L443\u0000Rcreatedb\u0000\u0000'

        assert.strictEqual(errorMessage.head[0], 0x45)
        assert.strictEqual(errorMessage.body.toString('utf8'), expectedError)
        assertIsReadyForQuery(readyForQuery)
      })
    })
  })


  describe('creating a table, adding data and retrieving it', () => {
    describe('parses messages from the client', () => {
      let messages
      before(() => {
        messages = parseMessages(readFileSync('./test/fixtures/client-create-add-retrieve'))
      })

      it('parses the create table query', () => {
        const createTable = messages[0]
        assert.strictEqual(createTable.head[0], 0x51)
        assert.strictEqual(createTable.body.toString('utf8'), 'create table nums (num int);\u0000')
      })

      it('parses the insert values queries', () => {
        const [ insert1, insert2 ] = messages.slice(1, 3)
        assert.strictEqual(insert1.head[0], 0x51)
        assert.strictEqual(insert1.body.toString('utf8'), 'insert into nums values (1);\u0000')

        assert.strictEqual(insert2.head[0], 0x51)
        assert.strictEqual(insert2.body.toString('utf8'), 'insert into nums values (2);\u0000')
      })

      it('parses the select query', () => {
        const select = messages[3]
        assert.strictEqual(select.head[0], 0x51)
        assert.strictEqual(select.body.toString('utf8'), 'select * from nums;\u0000')
      })
    })

    describe('parses messages from the server', () => {
      let messages
      before(() => {
        messages = parseMessages(readFileSync('./test/fixtures/server-create-add-retrieve'))
      })

      it('parses the create table query', () => {
        const [ createTable, readyForQuery ] = messages.slice(0, 2)
        assert.strictEqual(createTable.head[0], 0x43)
        assert.strictEqual(createTable.body.toString('utf8'), 'CREATE TABLE\u0000')
        assertIsReadyForQuery(readyForQuery)
      })

      it('parses the create insert queries', () => {
        const [ insert1, readyForQuery1, insert2, readyForQuery2 ] = messages.slice(2, 6)
        assert.strictEqual(insert1.head[0], 0x43)
        assert.strictEqual(insert1.body.toString('utf8'), 'INSERT 0 1\u0000')
        assertIsReadyForQuery(readyForQuery1)

        assert.strictEqual(insert2.head[0], 0x43)
        assert.strictEqual(insert2.body.toString('utf8'), 'INSERT 0 1\u0000')
        assertIsReadyForQuery(readyForQuery2)
      })

      it('parses the select query', () => {
        const [ rowDescription1, dataRow1, dataRow2, close, readyForQuery ] = messages.slice(6, 12)

        assert.strictEqual(rowDescription1.head[0], 0x54)
        assert.strictEqual(dataRow1.head[0], 0x44)
        assert.strictEqual(dataRow2.head[0], 0x44)
        assert.strictEqual(close.head[0], 0x43)
        assertIsReadyForQuery(readyForQuery)
      })
    })
  })
})

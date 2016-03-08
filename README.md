# NPG - A postgres client for node (_work in process_)

Current status: can establish a connection with the server and run some basic queries. The full protocol is not yet supported and right now you must interface with the api using goroutines. Support for callbacks and promises is planned once the channel api settles down.

    // connect takes a port and returns a channel for writing
    // statements and another for reading the corresponding results
    const [ results, statements ] = connect(PORT)
    csp.go(function * () {  
      yield csp.put(statements, 'select * from nums')
      console.log('result received ', yield csp.take(results))
      statements.close()
    })

---

## Goals:

* binary protocol parser
* es6 based
* promise based
* connection pooling
* write queuing
* strong test coverage
* repl friendly?
* property based tests?

Potential high-level interface:

```
co(function * () { // coroutine (matches es2016 async interface)

  const cp = yield npg.createConnectionPool({
    /* connection options */
  })

  yield npg.mutate(cp, ‘create table nums (num int)’)
  yield npg.mutate(cp, ‘insert into nums values (1)’)
  yield npg.mutate(cp, ‘insert into nums values (2)’)

  const queryResult = yield npg.query(cp, ‘select * from nums’)
  console.log(queryResult.records)
  // => [ { num: 1 }, { num: 2 } ]

}).call()
```

---

## Plan

Build "bottom-up" - in layers. Layers do not need to be 100% complete, the goal is simply good seperation of concerns and clearly defined boundaries of resposiblity.

---

## Planned Layers

### Binary Protocol Message Parser

The operating system will handle delivering ordered byte sequences between our library and the postgres process - via sockets (tcp and/or local domain sockets). 

Layered on top of that, the node runtime provides us an API that lets us write raw data chunks _to_ the server, and will also emit events when new chunks of data arrive _from_ the server:

```
$ <<< 'abc' nc -l 2345 & node --eval "
const net = require('net')
const sc = net.connect({ port: 2345 }) // socket connection
sc.on('connect', () => console.log('connected to server'))
sc.on('data', (buf) => console.log('data from server:', buf))
sc.on('end', () => console.log('server disconnected'))
"
connected to server
data from server: <Buffer 61 62 63 0a>
server disconnected
```

The first problem we need to solve is that these "data chunks" don't correspond to "message frames" sent by the server. One chunk might be half a message, or four messages. So we need a module that transforms a data chunk to a seq of messages - and a possible "remainder" data chunk:

```
$ < data-chunk node --eval "
const msgReader = require('./src/msg-reader')
const buf = new Buffer([
  // bytes in first msg
  0x4b, 0x00, 0x00, 0x00, 0x0c, 0x00, 0x00, 0x84, 0x03, 0x48, 0x65, 0xfb, 0x75, 
  // bytes in second msg
  0x5a, 0x00, 0x00, 0x00, 0x05, 0x49,
  // remaining, incomplete message bytes
  0x11, 0x00, 
])
const [firstMsg, rest] = msgReader.read(buf)
console.log('first message', firstMsg) // { head: <Buffer 4b>, body: <Buffer 00 00 84 03 48 65 fb 75> }

const [msgs, rest] = msgReader.readSeq(buf)
let n = 1
for (const msg in msgs) console.log('msg', n++, msg)
console.log(rest()) // <Buffer 11, 00>
"
```

We also need a message serializer, for creating these message frames to send to the server.

### Client using modern flow control

We can use generators/promisess/co-routines/channels to get around some of the problems callbacks and event emitters present for understanding the flow of control in a socket based client.

Ideally we'd have something like:

```
co(function * (chan) {
    yield putMsg(chan, 'startup')
    let res = yield chan.readMsg()
    // ... do the next thing
})
```

### Promise Based End User API

From the end user's perspective, they shouldn't need know how the protocol works, or how connection pooling and write queueing works. So we'll need a layer to translate those API calls to the right operations.

---

## Resources

* [core postgres module for parsing and formatting messages](https://github.com/postgres/postgres/blob/71fc49dfe1d99bd83cd99c2e7a39f93e07d19310/src/backend/libpq/pqformat.c)
* [node-pg connection module](https://github.com/brianc/node-postgres/blob/master/lib/connection.js)
* [node-pg client module](https://github.com/brianc/node-postgres/blob/master/lib/client.js)
* [js channels](https://github.com/ubolonton/js-csp/blob/master/doc/basic.md)
* [rust postgres driver](https://github.com/sfackler/rust-postgres/blob/master/src/lib.rs)

---

## Capturing binary data from postgres server and client for testing

```
// create new postgres store
initdb tmp/pg

// start postgres server
postgres -D tmp/pg -i -p 1234

// connect to postgres server and opens client
psql -h localhost -p 1234 postgres

// Capture tcp binary data on any interface and port 1234
sudo tcpflow -i any port 1234
```

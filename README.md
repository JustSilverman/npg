##NPG - A postgres client for node (_work in process_)

####Requirements
* binary protocol parser
* es6 based
* promise based
* connection pooling
* write queuing
* strong test coverage
* repl friendly?
* property based tests?

Potential interface:

```
co(function * () { // coroutine
  const cp = yield npg.createConnectionPool({
    /* connection options */
  })

  yield npg.mutate(cp, ‘create table nums (num int)’)
  yield npg.mutate(cp, ‘insert into nums values (1)’)
  yield npg.mutate(cp, ‘insert into nums values (2)’)

  const queryResult = yield npg.query(cp, ‘select * from nums’)
  console.log(queryResult.records)
  // => [ { num: 1 }, { num: 2 } ]
})
```

####Capturing binary data from postgres server and client for testing

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

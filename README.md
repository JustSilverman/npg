postgres node library
- binary protocol parser
- es6 based
- promise based
- connection pooling
- write queuing
- strong test coverage
- repl friendly?
- property based tests?
from the user’s perspective, the interface looks something like
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
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

####Supported Postgres Data Types
| Name                                    | Aliases                          | Desc                                              | Supported |
| ----------------------------------------|----------------------------------| --------------------------------------------------| ----------|
| bigint                                  | int8                             | signed eight-byte integer                         | No        |
| bigserial                               | serial8                          | autoincrementing eight-byte integer               | No        |
| bit [ (n) ]                             |                                  | fixed-length bit string                           | No        |
| bit varying [ (n) ]                     | varbit                           | variable-length bit string                        | No        |
| boolean                                 | bool                             | logical Boolean (true/false)                      | No        |
| bytea                                   |                                  | binary data ("byte array")                        | No        |
| character [ (n) ]                       | char [ (n) ]                     | fixed-length character string                     | No        |
| character varying [ (n) ]               | varchar [ (n) ]                  | variable-length character string                  | No        |
| cidr                                    |                                  | IPv4 or IPv6 network address                      | No        |
| circle                                  |                                  | circle on a plane                                 | No        |
| date                                    |                                  | calendar date (year, month, day)                  | No        |
| double precision                        |                                  | double precision floating-point number (8 bytes)  | No        |
| inet                                    |                                  | IPv4 or IPv6 host address                         | No        |
| integer                                 |                                  | signed four-byte integer                          | No        |
| interval                                |                                  | time span                                         | No        |
| json                                    |                                  | textual JSON data                                 | No        |
| jsonb                                   |                                  | binary JSON data, decomposed                      | No        |
| line                                    |                                  | infinite line on a plane                          | No        |
| lseg                                    |                                  | line segment on a plane                           | No        |
| macaddr                                 |                                  | MAC (Media Access Control) address                | No        |
| money                                   |                                  | currency amount                                   | No        |
| numeric                                 | decimal [ (p, s) ]               | exact numeric of selectable precision             | No        |
| path                                    |                                  | geometric path on a plane                         | No        |
| pg_lsn                                  |                                  | PostgreSQL Log Sequence Number                    | No        |
| point                                   |                                  | geometric point on a plane                        | No        |
| polygon                                 |                                  | closed geometric path on a plane                  | No        |
| real                                    | float4                           | single precision floating-point number (4 bytes)  | No        |
| smallint                                | int2                             | signed two-byte integer                           | No        |
| smallserial                             | serial2                          | autoincrementing two-byte integer                 | No        |
| serial                                  | serial4                          | autoincrementing two-byte integer                 | No        |
| text                                    |                                  | variable-length character string                  | No        |
| time [ (p) ] [ without time zone ]      |                                  | time of day (no time zone)                        | No        |
| time [ (p) ] with time zone             | timetz                           | time of day, including time zone                  | No        |
| timestamp [ (p) ] [ without time zone ] |                                  | date and time (no time zone)                      | No        |
| timestamp [ (p) ] with time zone        | timestamptz                      | date and time, including time zone                | No        |
| tsquery                                 |                                  | text search query                                 | No        |
| tsvector                                |                                  | text search document                              | No        |
| txid_snapshot                           |                                  | user-level transaction ID snapshot                | No        |
| uuid                                    |                                  | universally unique identifier                     | No        |
| xml                                     |                                  | XML data                                          | No        |


####Capturing binary data from postgres server and client for testing

```
// create new postgres store
initdb tmp-pgstore/pg

// start postgres server
postgres -D tmp-pgstore/pg -i -p 1234

// connect to postgres server and opens client
psql -h localhost -p 1234 postgres

// Capture tcp binary data on any interface and port 1234
sudo tcpflow -i any port 1234
```

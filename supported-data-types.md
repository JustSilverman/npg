# Supported Postgres Data Types

| Name                             | Aliases                          | Desc                                | PG OID    | Supported |
| ---------------------------------|----------------------------------| ------------------------------------| ----------|----------|
| bigint                           | int8                             | signed eight-byte integer           | 20        | No        |
| bigserial                        | serial8                          | autoincrementing eight-byte integer | [20]      | No        |
| bit [ (n) ]                      |                                  | fixed-length bit string             | 1560      | No        |
| bit varying [ (n) ]              | varbit                           | variable-length bit string          | 1562      | No        |
| boolean                          | bool                             | logical Boolean (true/false)        | 16        | No        |
| bytea                            |                                  | binary data ("byte array")          | 17        | No        |
| character [ (n) ]                | char [ (n) ]                     | fixed-length character string       | 18        | No        |
| character varying [ (n) ]        | varchar [ (n) ]                  | variable-length character string    | 1043      | No        |
| cidr                             |                                  | IPv4 or IPv6 network address        | 650       | No        |
| circle                           |                                  | circle on a plane                   | 718       | No        |
| date                             |                                  | calendar date (year, month, day)    | 1082      | No        |
| double precision                 |                                  | double precision float (8 bytes)    | 701       | No        |
| inet                             |                                  | IPv4 or IPv6 host address           | 869       | No        |
| integer                          |                                  | signed four-byte integer            | 23        | No        |
| interval                         |                                  | time span                           | 1186      | No        |
| json                             |                                  | textual JSON data                   | 114       | No        |
| jsonb                            |                                  | binary JSON data, decomposed        | 3802      | No        |
| line                             |                                  | infinite line on a plane            | 628       | No        |
| lseg                             |                                  | line segment on a plane             | 601       | No        |
| macaddr                          |                                  | MAC (Media Access Control) address  | 829       | No        |
| money                            |                                  | currency amount                     | 790       | No        |
| numeric                          | decimal [ (p, s) ]               | exact numeric of selectable pre.    | 1700      | No        |
| path                             |                                  | geometric path on a plane           | 602       | No        |
| pg_lsn                           |                                  | PostgreSQL Log Sequence Number      | 3220      | No        |
| point                            |                                  | geometric point on a plane          | 600       | No        |
| polygon                          |                                  | closed geometric path on a plane    | 604       | No        |
| real                             | float4                           | single precision float (4 bytes)    | 700       | No        |
| smallint                         | int2                             | signed two-byte integer             | 21        | No        |
| smallserial                      | serial2                          | autoincrementing two-byte integer   | [21]      | No        |
| serial                           | serial4                          | autoincrementing two-byte integer   | [21]      | No        |
| text                             |                                  | variable-length character string    | 25        | No        |
| time [ (p) ] [ without tz ]      |                                  | time of day (no time zone)          | 1083      | No        |
| time [ (p) ] with tz             | timetz                           | time of day, including time zone    | 1266      | No        |
| timestamp [ (p) ] [ without tz ] |                                  | date and time (no time zone)        | 1114      | No        |
| timestamp [ (p) ] with tz        | timestamptz                      | date and time, including time zone  | 1184      | No        |
| tsquery                          |                                  | text search query                   | 3615      | No        |
| tsvector                         |                                  | text search document                | 3614      | No        |
| txid_snapshot                    |                                  | user-level transaction ID snapshot  | 2970      | No        |
| uuid                             |                                  | universally unique identifier       | 2950      | No        |
| xml                              |                                  | XML data                            | 142       | No        |

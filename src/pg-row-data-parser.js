const parseIntType = (buf) => {
  return parseInt(buf.toString('utf8'))
}

const dataTypeIdToParseFnc = {
  20: parseIntType,
  21: parseIntType,
  23: parseIntType
}

/**
 * Takes dataTypeId and buffer and returns a parsed column value [Integer | Float | boolean]
 * dataTypeId: Postgres data typ OID
 * buf: Column data in binary
**/
export const parseColumnValue = (dataTypeId, buf) => {
  return dataTypeIdToParseFnc[dataTypeId](buf)
}
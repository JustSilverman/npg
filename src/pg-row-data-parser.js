const parseIntType = (buf) => {
  return parseInt(buf.toString('utf8'))
}

const parseFloatType = (buf) => {
  return parseFloat(buf.toString('utf8'))
}

}

const dataTypeIdToParseFnc = new Map()

dataTypeIdToParseFnc.set(20, parseIntType)
dataTypeIdToParseFnc.set(21, parseIntType)
dataTypeIdToParseFnc.set(23, parseIntType)
dataTypeIdToParseFnc.set(700, parseFloatType)
dataTypeIdToParseFnc.set(701, parseFloatType)
dataTypeIdToParseFnc.set(1700, parseFloatType)
dataTypeIdToParseFnc.set(16, parseBoolType)

/**
 * Takes dataTypeId and buffer and returns a parsed column value [Integer | Float | boolean]
 * dataTypeId: Postgres data typ OID
 * buf: Column data in binary
**/
export const parseColumnValue = (dataTypeId, buf) => {
  return dataTypeIdToParseFnc.get(dataTypeId)(buf)
}
const trueValues = new Set(['TRUE', 't', 'true', 'y', 'yes', 'on', '1'])
const falseValues = new Set(['FALSE', 'f', 'false', 'n', 'no', 'off', '0'])

const parseIntType = (buf) => {
  return parseInt(buf.toString('utf8'))
}

const parseFloatType = (buf) => {
  return parseFloat(buf.toString('utf8'))
}

const parseBoolType = (buf) => {
  const asString = buf.toString('utf8')
  if (trueValues.has(asString)) {
    return true
  } else if (falseValues.has(asString)) {
    return false
  }

  throw new Error('Unsupported boolean value of ' + asString)
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
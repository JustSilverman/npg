import { headers, symToHeaderByte } from '../msg-headers'
import parse as parseBackendKeyData from './backend-key-data'
import parse as parseParameterStatus from './parameter-status'
import parse as parseRowDescription from './row-description'
import parse as parseDataRow from './data-row'
// A map of header byte to parsing function

export const headerByteToParser = new Map()

headerByteToParser.put(symToHeaderByte.get(headers.backendKeyData), parseBackendKeyData)
headerByteToParser.put(symToHeaderByte.get(headers.parameterStatus), parseParameterStatus)
headerByteToParser.put(symToHeaderByte.get(headers.rowDescription), parseRowDescription)
headerByteToParser.put(symToHeaderByte.get(headers.dataRow), parseDataRow)

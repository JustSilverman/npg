import * as headers from '../msg-headers'
import { parse as parseBackendKeyData } from './backend-key-data'
import { parse as parseParameterStatus } from './parameter-status'
import { parse as parseRowDescription } from './row-description'
import { parse as parseDataRow } from './data-row'
// A map of header byte to parsing function

export const headerSymToParser = new Map()

headerSymToParser.set(headers.backendKeyData, parseBackendKeyData)
headerSymToParser.set(headers.parameterStatus, parseParameterStatus)
headerSymToParser.set(headers.rowDescription, parseRowDescription)
headerSymToParser.set(headers.dataRow, parseDataRow)

import * as headers from '../msg-headers'
import { parse as parseBackendKeyData } from './backend-key-data'
import { parse as parseParameterStatus } from './parameter-status'
import { parse as parseRowDescription } from './row-description'
import { parse as parseDataRow } from './data-row'
// A map of header byte to parsing function

const identity = val => val
export const headerSymToParser = new Map()

headerSymToParser.set(headers.sessionConfirm, identity)
headerSymToParser.set(headers.authenticationOk, identity)
headerSymToParser.set(headers.backendKeyData, parseBackendKeyData)
headerSymToParser.set(headers.parameterStatus, parseParameterStatus)
headerSymToParser.set(headers.readyForQuery, identity)
headerSymToParser.set(headers.rowDescription, parseRowDescription)
headerSymToParser.set(headers.dataRow, parseDataRow)

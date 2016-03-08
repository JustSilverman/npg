
// A map of header symbol to header byte

export const symToHeaderByte = new Map()
export const headerByteToSym = new Map()

export const authenticationOk = Symbol('authenticationOk (R)')
symToHeaderByte.set(authenticationOk, new Buffer([0x52]))
headerByteToSym.set('R', authenticationOk)

export const sessionConfirm = Symbol('sessionConfirm (N)')
symToHeaderByte.set(sessionConfirm, new Buffer([0x4e]))
headerByteToSym.set('N', sessionConfirm)

export const parameterStatus = Symbol('parameterStatus (S)')
symToHeaderByte.set(parameterStatus, new Buffer([0x53]))
headerByteToSym.set('S', parameterStatus)

export const backendKeyData = Symbol('backendKeyData (K)')
symToHeaderByte.set(backendKeyData, new Buffer([0x4b]))
headerByteToSym.set('K', backendKeyData)

export const readyForQuery = Symbol('readyForQuery (Z)')
symToHeaderByte.set(readyForQuery, new Buffer([0x5a]))
headerByteToSym.set('Z', readyForQuery)

export const query = Symbol('query (Q)')
symToHeaderByte.set(query, new Buffer([0x51]))
headerByteToSym.set('Q', query)

export const rowDescription = Symbol('rowDescription (T)')
symToHeaderByte.set(rowDescription, new Buffer([0x54]))
headerByteToSym.set('T', rowDescription)

export const dataRow = Symbol('dataRow (D)')
symToHeaderByte.set(dataRow, new Buffer([0x44]))
headerByteToSym.set('D', dataRow)

export const queryClose = Symbol('queryClose (C)')
symToHeaderByte.set(queryClose, new Buffer([0x43]))
headerByteToSym.set('C', queryClose)

export const exit = Symbol('exit (X)')
symToHeaderByte.set(exit, new Buffer([0x58]))
headerByteToSym.set('X', exit)

export const errorResponse = Symbol('errorResponse (E)')
symToHeaderByte.set(errorResponse, new Buffer('E'))
headerByteToSym.set('E', errorResponse)

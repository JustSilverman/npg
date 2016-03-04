
// A map of header symbol to header byte

export const symToHeaderByte = new Map()
export const headerByteToSym = new Map()

export const authenticationOk = Symbol('R')
symToHeaderByte.set(authenticationOk, new Buffer([0x52]))
headerByteToSym.set('R', authenticationOk)

export const sessionConfirm = Symbol('N')
symToHeaderByte.set(sessionConfirm, new Buffer([0x4e]))
headerByteToSym.set('N', sessionConfirm)

export const parameterStatus = Symbol('S')
symToHeaderByte.set(parameterStatus, new Buffer([0x53]))
headerByteToSym.set('S', parameterStatus)

export const backendKeyData = Symbol('K')
symToHeaderByte.set(backendKeyData, new Buffer([0x4b]))
headerByteToSym.set('K', backendKeyData)

export const readyForQuery = Symbol('Z')
symToHeaderByte.set(readyForQuery, new Buffer([0x5a]))
headerByteToSym.set('Z', readyForQuery)

export const query = Symbol('Q')
symToHeaderByte.set(query, new Buffer([0x51]))
headerByteToSym.set('Q', query)

export const rowDescription = Symbol('T')
symToHeaderByte.set(rowDescription, new Buffer([0x54]))
headerByteToSym.set('T', rowDescription)

export const dataRow = Symbol('D')
symToHeaderByte.set(dataRow, new Buffer([0x44]))
headerByteToSym.set('D', dataRow)

export const queryClose = Symbol('C')
symToHeaderByte.set(queryClose, new Buffer([0x43]))
headerByteToSym.set('C', queryClose)

export const exit = Symbol('X')
symToHeaderByte.set(exit, new Buffer([0x58]))
headerByteToSym.set('X', exit)

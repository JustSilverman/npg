
// A map of header symbol to header byte

export const symToHeaderByte = new Map()

export const authenticationOk = Symbol('R')
symToHeaderByte.set(authenticationOk, new Buffer([0x52]))

export const sessionConfirm = Symbol('N')
symToHeaderByte.set(sessionConfirm, new Buffer([0x4e]))

export const parameterStatus = Symbol('S')
symToHeaderByte.set(parameterStatus, new Buffer([0x53]))

export const backendKeyData = Symbol('K')
symToHeaderByte.set(backendKeyData, new Buffer([0x4b]))

export const readyForQuery = Symbol('Z')
symToHeaderByte.set(readyForQuery, new Buffer([0x5a]))

export const query = Symbol('Q')
symToHeaderByte.set(query, new Buffer([0x51]))

export const queryHead = Symbol('T')
symToHeaderByte.set(queryHead, new Buffer([0x54]))

export const queryRow = Symbol('D')
symToHeaderByte.set(queryRow, new Buffer([0x44]))

export const queryClose = Symbol('C')
symToHeaderByte.set(queryClose, new Buffer([0x43]))

export const exit = Symbol('X')
symToHeaderByte.set(exit, new Buffer([0x58]))

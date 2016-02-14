
// A map of byte to header symbols

export const headerBytesToSym = new Map()

// -

// A entry for each message header we care about
// pass ascii char as arg to symbol
export const authenticationOk = Symbol('R')
map.set(new Buffer([0x52]), authenticationOk)

export const sessionConfirm = Symbol('N')
map.set(new Buffer([0x4e]), sessionConfirm)

export const parameterStatus = Symbol('S')
map.set(new Buffer([0x53]), parameterStatus)

export const backendKeyData = Symbol('K')
map.set(new Buffer([0x4b]), backendKeyData)

export const readyForQuery = Symbol('Z')
map.set(new Buffer([0x5a]), readyForQuery)

export const query = Symbol('Q')
map.set(new Buffer([0x51]), query)

export const queryHead = Symbol('T')
map.set(new Buffer([0x54]), queryHead)

export const queryRow = Symbol('D')
map.set(new Buffer([0x44]), queryRow)

export const queryClose = Symbol('C')
map.set(new Buffer([0x43]), queryClose)

export const exit = Symbol('X')
map.set(new Buffer([0x58]), exit)

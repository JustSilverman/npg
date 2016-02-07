
// A map of byte to header symbols

export const headerBytesToSym = new Map()

// -

// A entry for each message header we care about
// pass ascii char as arg to symbol
export const authenticationOk = Symbol()
map.set(new Buffer([0x52]), authenticationOk)

export const readyForQuery = Symbol()
map.set(new Buffer([0x5a]), readyForQuery)

export const sessionConfirm = Symbol()
map.set(new Buffer([0x4e]), sessionConfirm)

export const backendKeyData = Symbol()
map.set(new Buffer([0x4b]), backendKeyData)

export const endRows = Symbol()
map.set(new Buffer([0x43]), endRows)

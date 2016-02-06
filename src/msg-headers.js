
// A map of byte to header symbols

export const headerBytesToSym = new Map()

// -

// A entry for each message header we care about

export const authenticationOk = Symbol()
map.set(new Buffer([0x52]), authenticationOk)

// etc ...

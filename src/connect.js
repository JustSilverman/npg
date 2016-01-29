const PORT = 1234
import net from 'net'
import hexBuf from './hex-buf'
import readSeq from './msg-sequence'

// Message -> Message

const firstStartup = hexBuf('00 00 00 08 04 d2 16 2f')
const secondStartup = hexBuf('00 00 00 46 00 03 00 00 75 73 65 72 00 6a 75 73 74 69 6e 73 69 6c 76 65 72 6d 61 6e 00 64 61 74 61 62 61 73 65 00 70 6f 73 74 67 72 65 73 00 61 70 70 6c 69 63 61 74 69 6f 6e 5f 6e 61 6d 65 00 70 73 71 6c 00 00')
const selectNumsQuery = hexBuf('51 00 00 00 18 73 65 6c 65 63 74 20 2a 20 66 72 6f 6d 20 6e 75 6d 73 3b 00')
const exitMessage = hexBuf('58 00 00 00 04')
const capitalN = hexBuf('4e') //server sends for unencrypted sessions

const connect = (msg) => {
  let serverSetupMessages
  const sc = net.connect({ port: PORT }) // socket connection


  sc.on('connect', () => {
    sc.write(firstStartup, () => {
      sc.once('data', buf => {
        if (!buf.equals(capitalN)) {
          throw new Error('Server did not send unencrypted session confirm.')
        }

        sc.write(secondStartup, () => {
          sc.once('data', buf => {
            //read all messages from server, fail if last message isn't readyForQuery
            const [ serverSetupMessages, rest ] = readSeq(buf)

            sc.write(selectNumsQuery, () => {
              sc.once('data', buf => {
                const [ messagesItr, rest ] = readSeq(buf)
                console.log('response to query ', [...messagesItr])
                console.log('rest ', rest())
              })
            })
          })
        })
      })
    })

    console.log('connected to server')
  })

  // sc.on('data', (buf) => console.log('data from server:', buf))
  sc.on('end', () => console.log('server disconnected'))
}

connect()
/*

from: http://jlongster.com/Taming-the-Asynchronous-Beast-with-CSP-in-JavaScript

function httpRequest(url) {
  var ch = chan();
  var req = new XMLHttpRequest();
  req.onload = function() {
    if(req.status === 200) {
      csp.putAsync(ch, this.responseText);
    }
    else {
      csp.putAsync(ch, new Error(this.responseText));
    }
  }
  req.open('get', url, true);
  req.send();
  return ch;
}

function jsonRequest(url) {
  return go(function*() {
    var value = yield take(httpRequest(url));
    if(!(value instanceof Error)) {
      value = JSON.parse(value);
    }
    return value;
  });
}

go(function*() {
  var data = yield takem(jsonRequest('sample.json'));
  console.log(JSON.stringify(data));
});

*/

import csp from 'js-csp'

const serverToClientMsgs = csp.chan()
const clientToServerMsgs = csp.chan()

const mockServer = (rChan, wChan) => {
  return go(function * () {
    let msg
    msg = yield csp.take(rChan, '')
    // assert startup message ...
    yield csp.put(wChan, 'session confirm')
    msg = yield csp.take(rChan, '')
    // assert second startup message ...
    yield csp.put(wChan, 'info about the server ...')
    yield csp.put(wChan, 'ready for query')

    while((msg = yield csp.take(rChan, '') !== 'close') {
      let queryMsg = msg
      // do query ...
      // write results
    }

    // write close?
  })
}

const client = (rChan, wChan) => {
  return go(function * () {
    // ....
  })
}

// start server "process"
mockServer(clientToServerMsgs, serverToClientMsgs)
// start client
client(serverToClientMsgs, clientToServerMsgs)

// ... node process should exit when both processes have finished

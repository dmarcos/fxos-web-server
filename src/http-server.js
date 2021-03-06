/*jshint esnext:true*/
/*exported HTTPServer*/
'use strict';

module.exports = window.HTTPServer = (function() {

var Listenable   = require('./listenable');
var HTTPRequest  = require('./http-request');
var HTTPResponse = require('./http-response');
var IPUtils      = require('./ip-utils');

const DEFAULT_PORT = 8080;
const DEFAULT_TIMEOUT = 20000;

const CRLF = '\r\n';

function HTTPServer(port, options) {
  this.port = port || DEFAULT_PORT;

  options = options || {};
  for (var option in options) {
    this[option] = options[option];
  }

  this.running = false;
}

HTTPServer.HTTP_VERSION = 'HTTP/1.1';

Listenable(HTTPServer.prototype);

HTTPServer.prototype.constructor = HTTPServer;

HTTPServer.prototype.timeout = DEFAULT_TIMEOUT;

HTTPServer.prototype.start = function() {
  if (this.running) {
    return;
  }

  console.log('Starting HTTP server on port ' + this.port);

  var socket = navigator.mozTCPSocket.listen(this.port, {
    binaryType: 'string' // 'arraybuffer'
  });

  socket.onconnect = (connectEvent) => {
    connectEvent.ondata = (dataEvent) => {
      var request = new HTTPRequest(dataEvent.data);
      if (request.invalid) {
        connectEvent.close();
        return;
      }

      var response = new HTTPResponse(connectEvent, this.timeout);

      this.emit('request', {
        request: request,
        response: response
      });
    };
  };

  this.socket = socket;
  this.running = true;
};

HTTPServer.prototype.stop = function() {
  if (!this.running) {
    return;
  }

  console.log('Shutting down HTTP server on port ' + this.port);

  this.socket.close();

  this.running = false;
};

return HTTPServer;

})();

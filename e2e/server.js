'use strict';

var tls = require('tls');
var net = require('net');
var fs = require('fs');
var sys = require('sys');
var crypto = require('crypto');
var NodeRSA = require('node-rsa');
var cert_encoder = require('cert_encoder');


var https = require('https'),
    pem = require('pem');

pem.createCertificate({days:1, selfSigned:true}, function(err, keys){
  var options = {
    key: keys.serviceKey,
    cert: keys.certificate,
   
    // This is necessary only if using the client certificate authentication.
    // Without this some clients don't bother sending certificates at all, some do
    requestCert: true,
   
    // Do we reject anyone who certs who haven't been signed by our recognised certificate authorities
    rejectUnauthorized: false,
   
    // This is necessary only if the client uses the self-signed certificate and you care about implicit authorization
    //ca: [ fs.readFileSync('client/client-certificate.pem') ]//TODO how do i get rid of this
   
  };

  // new tls.TLSSocket(socket, {});
   
  var server = tls.createServer(options, function(socketCleartextStream) {




    console.log("started");
    console.log("cert_encoder.convert(socketCleartextStream.getPeerCertificate().raw) = %j", cert_encoder.convert(socketCleartextStream.getPeerCertificate().raw));

    console.log("socketCleartextStream.authorized = %j", socketCleartextStream.authorized);
    console.log("socketCleartextStream.authorizationError = %j", socketCleartextStream.authorizationError);
    debugger;

    //Show the certificate info as supplied by the client
    // console.log(socketCleartextStream.getPeerCertificate());
   
    // console.log('server connected', socketCleartextStream.authorized ? 'authorized' : 'unauthorized');
    // console.log("socketCleartextStream.getTLSTicket() = %j", socketCleartextStream.getTLSTicket());
    // console.log("hello");
    // console.log("socketCleartextStream = %j", socketCleartextStream);
    socketCleartextStream.write("welcome!\n");
    socketCleartextStream.setEncoding('utf8');
    socketCleartextStream.pipe(socketCleartextStream);

    socketCleartextStream.addListener("connect", function () {
      sys.puts("Connection from " + socketCleartextStream.remoteAddress);
    });

    socketCleartextStream.addListener("data", function (data) {
      console.log("data = %j", data);
      console.log("tempTlsSocket");
    });

    socketCleartextStream.addListener("close", function () {
      //close the tunnel when the client finishes the connection.
      server.close();
    });
  });

  server.listen(8081, function() {
    console.log('server bound');
  });

});
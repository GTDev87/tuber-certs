'use strict';

var tls = require('tls');
var fs = require('fs');
var sys = require('sys');
var https = require('https');
var cert_encoder = require('cert_encoder');
var express = require('express');
var macattackExpress = require('macattack-express');
var pem = require('pem');

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

  var app = express();

  app.route('/').get(function(req, res) {

    var pemCert = cert_encoder.convert(req.connection.getPeerCertificate().raw);
    console.log("pemCert = %j", pemCert)
    res.json({ index: "data" });
  });

  // Return Express server instance vial callback

  console.log("keys.certificate = %j", keys.certificate);

  pem.getPublicKey(keys.certificate, function (err, data){
    console.log("data = %j", data);
  });

  var httpsApp = https.createServer(options, app);

  httpsApp.listen(8081, '0.0.0.0');

  // // new tls.TLSSocket(socket, {});
   
  // var server = tls.createServer(options, function(socketCleartextStream) {
  //   console.log("started");
  //   console.log("cert_encoder.convert(socketCleartextStream.getPeerCertificate().raw) = %j", cert_encoder.convert(socketCleartextStream.getPeerCertificate().raw));

  //   console.log("socketCleartextStream.authorized = %j", socketCleartextStream.authorized);
  //   console.log("socketCleartextStream.authorizationError = %j", socketCleartextStream.authorizationError);
  //   debugger;

  //   //Show the certificate info as supplied by the client
  //   // console.log(socketCleartextStream.getPeerCertificate());
   
  //   // console.log('server connected', socketCleartextStream.authorized ? 'authorized' : 'unauthorized');
  //   // console.log("socketCleartextStream.getTLSTicket() = %j", socketCleartextStream.getTLSTicket());
  //   // console.log("hello");
  //   // console.log("socketCleartextStream = %j", socketCleartextStream);
  //   socketCleartextStream.write("welcome!\n");
  //   socketCleartextStream.setEncoding('utf8');
  //   socketCleartextStream.pipe(socketCleartextStream);

  //   socketCleartextStream.addListener("connect", function () {
  //     sys.puts("Connection from " + socketCleartextStream.remoteAddress);
  //   });

  //   socketCleartextStream.addListener("data", function (data) {
  //     console.log("data = %j", data);
  //     console.log("tempTlsSocket");
  //   });

  //   socketCleartextStream.addListener("close", function () {
  //     //close the tunnel when the client finishes the connection.
  //     server.close();
  //   });
  // });

  // server.listen(8081, function() {
  //   console.log('server bound');
  // });
});


// var cert = fs.readFileSync(certfile, "utf-8");

// pem.getPublicKey(cert, function (err, data) {
//   var caveatKey = crypto.createHash('md5').digest('hex');

//   console.log("cert = %j", cert);

//   function condenseCertificate(cert){
//     return cert
//       .replace("-----BEGIN CERTIFICATE-----", "")
//       .replace("-----END CERTIFICATE-----", "")
//       .replace(/\n/g, "");
//   }

//   var caveatMacaroon = publicKeyMacaroons.addPublicKey3rdPartyCaveat(serializedMacaroon, "For initializing client", caveatKey, "cert = " + condenseCertificate(cert), data.publicKey);

//   console.log("client_macaroon=" + JSON.stringify(caveatMacaroon));

//   //macattack_express
//   app.use(macattack_express({secret: secretKey}));

//   //end of macattack security

//   app.disable('x-powered-by');

//   // Globbing routing files
//   config.getGlobbedFiles('./app/routes/**/*.js').forEach(function(routePath) {
//     require(path.resolve(routePath))(app);
//   });

//   // Log SSL usage
//   console.log('Securely using https protocol');

//   // Create SSL key and certificate
//   pem.createCertificate({days:1, selfSigned:true}, function(err, keys){
    

//     // Return Express server instance vial callback
//     callback(https.createServer(options, app));
//   });
// });











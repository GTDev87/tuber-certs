'use strict';

var _ = require('lodash');
var tls = require('tls');
var fs = require('fs');
var sys = require('sys');
var https = require('https');
var cert_encoder = require('cert_encoder');
var express = require('express');
var macattackExpress = require('macattack-express');
var pem = require('pem');
var crypto = require('crypto');
var publicKeyMacaroons = require('public-key-macaroons');
var macattack = require('macattack');

var MacaroonsBuilder = require('macaroons.js').MacaroonsBuilder;
var MacaroonsVerifier = require('macaroons.js').MacaroonsVerifier;

var args = process.argv.slice(2);
console.log("args = %j", args);
var cerfileLocation = args[0] || (__dirname + "/../tmp/cert.pem");

var clientCert = fs.readFileSync(cerfileLocation, "utf-8");
console.log("clientCert = %j", clientCert);

var secretKey = crypto.createHash('md5').digest('hex');

pem.getPublicKey(clientCert, function (err, data) {
  var caveatKey = crypto.createHash('md5').digest('hex');


  function condenseCertificate(cert){
    return cert
      .replace("-----BEGIN CERTIFICATE-----", "")
      .replace("-----END CERTIFICATE-----", "")
      .replace(/\n/g, "");
  }

  var rootMacaroon = macattack.createMac("localhost", 8081, secretKey);

  var caveatMacaroon = publicKeyMacaroons.addPublicKey3rdPartyCaveat(rootMacaroon, "Macattack", caveatKey, "cert = " + condenseCertificate(clientCert), data.publicKey);

  fs.writeFileSync(__dirname + "/../tmp/macaroon.json", JSON.stringify(caveatMacaroon), 'utf8');

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

    macattackExpress({secret: secretKey, hostPort: 8081, hostIp: "localhost", cert: clientCert}, function (err, middlewareFnObj) {
      if(err) {return console.log("fail");}
      app.use(middlewareFnObj);

      app.route('/').get(function(req, res) {
        res.json({ index: "data" });
      });

      // Return Express server instance vial callback

      console.log("keys.certificate = %j", keys.certificate);

      https.createServer(options, app).listen(8081, '0.0.0.0');
    });
  });
});
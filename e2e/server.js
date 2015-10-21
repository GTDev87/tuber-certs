'use strict';

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


//copy of macattack express
function getTokenFromReq(req, headerKey) {
  if (req.headers && req.headers.authorization) {
    var parts = req.headers.authorization.split(' ');
    if (parts.length > 1 && parts[0] === headerKey) { return parts.slice(1).join(" "); }
  }
  throw new Error("macaroon not found");
}



function expressPartial (optionsObj) {
  var options = optionsObj || {};
  return function (req, res, next){

    console.log("thing");

    var pemCert = cert_encoder.convert(req.connection.getPeerCertificate().raw);
    console.log("pemCert");
    console.log(pemCert);
    console.log("I am in the middleware");

    var token = getTokenFromReq(req, 'Bearer');
    console.log("token = %j", token);


    var serializedMac;
    var pemCert = cert_encoder.convert(req.connection.getPeerCertificate().raw);//certificate for comprison

    try { serializedMac = getTokenFromReq(req, optionsObj.headerKey || 'Bearer'); }
    catch (e) { return next(e); }

    //separate out 3rd party caveat portion


    console.log("MacaroonsBuilder.deserialize(serializedMac)");
    console.log("");
    console.log(MacaroonsBuilder.deserialize(serializedMac));
    console.log("");

    var macaroon = MacaroonsBuilder.deserialize(serializedMac);

    console.log("optionsObj.secret = %j",optionsObj.secret);
    console.log("ab")

    new MacaroonsVerifier(macaroon)
      .assertIsValid(optionsObj.secret);

    console.log("abc")


    // verifier.satisfyGeneral(schemaVerifierCreater(parser, requestData).verifyArguments);
    // return verifier.isValid(databaseSecret);


    // if(!macattack.validateMac(serializedMac, optionsObj.secret || "secret", req.body)) { 
    //   // validateMac(serializedMac, databaseSecret, requestData);

    //   return next(new Error("Macaroon is not valid ")); 
    // }

    return next();
  }
};
//////





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

  var serializedMacaroon = macattack.createMac("localhost", 8081, secretKey);


  var caveatMacaroon = publicKeyMacaroons.addPublicKey3rdPartyCaveat(serializedMacaroon, "Macattack", caveatKey, "cert = " + condenseCertificate(clientCert), data.publicKey);

  console.log("client_macaroon = " + JSON.stringify(caveatMacaroon));
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
    app.use(expressPartial({secret: secretKey}));

    app.route('/').get(function(req, res) {
      res.json({ index: "data" });
    });

    // Return Express server instance vial callback

    console.log("keys.certificate = %j", keys.certificate);

    pem.getPublicKey(keys.certificate, function (err, data){
      console.log("data = %j", data);
    });

    var httpsApp = https.createServer(options, app);

    httpsApp.listen(8081, '0.0.0.0');
  });
});


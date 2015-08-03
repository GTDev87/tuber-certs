'use strict';

var tls = require('tls');
var fs = require('fs');
var pem = require('pem');
var ursa = require('ursa');


pem.createCertificate({days:1, selfSigned:true}, function(err, keys){
  var options = {
    // These are necessary only if using the client certificate authentication (so yeah, you need them)
    key: keys.serviceKey,
    cert: keys.certificate,
    rejectUnauthorized: false
   
    // This is necessary only if the server uses the self-signed certificate
    //ca: [ fs.readFileSync('server/server-certificate.pem') ]//HOW DO I IGNORE THIS
  };

  console.log("cert = " + keys.certificate);
  console.log("priv = " + keys.serviceKey);
   
  console.log("keys.certificate = %j", keys.certificate);

  var socketClearTextStream = tls.connect(8081, options, function() {
    socketClearTextStream.write("hello my name is greg");
    process.stdin.pipe(socketClearTextStream);
    process.stdin.resume();
  });
  socketClearTextStream.setEncoding('utf8');
  socketClearTextStream.on('data', function(data) {
    // console.log("data");
    // console.log(data);
  });
  socketClearTextStream.on('end', function() {
    console.log("end")
  });
});
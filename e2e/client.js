'use strict';

var tls = require('tls');
var pem = require('pem');
var request = require('request');

pem.createPrivateKey(function (err, pemKeyObj) {
  console.log("pemKeyObj = %j", pemKeyObj);

  pem.createCertificate({days:1, selfSigned:true, serviceKey: pemKeyObj.key}, function(err, keys){
    console.log("err = %j", err);
    if(err) { console.log("err.message = %j", err.message);}

    

    console.log("cert = " + keys.certificate);
    console.log("priv = " + keys.serviceKey);
     
    console.log("keys.certificate = %j", keys.certificate);

    var options = {
      // These are necessary only if using the client certificate authentication (so yeah, you need them)
      key: keys.serviceKey,
      cert: keys.certificate,
      rejectUnauthorized: false,
      url: "https://localhost:8081"
     
      // This is necessary only if the server uses the self-signed certificate
      //ca: [ fs.readFileSync('server/server-certificate.pem') ]//HOW DO I IGNORE THIS
    };


    request.get(options, function (error, response, body) {
      if(response.statusCode == 201 || (response.statusCode == 200)){
        console.log("body = %j", body);
      } else {
        console.log('error: '+ response.statusCode)
        console.log(body)
      }
    });

    // var socketClearTextStream = tls.connect(8081, options, function() {
    //   socketClearTextStream.write("hello my name is greg");
    //   process.stdin.pipe(socketClearTextStream);
    //   process.stdin.resume();
    // });
    // socketClearTextStream.setEncoding('utf8');
    // socketClearTextStream.on('data', function(data) {
    //   // console.log("data");
    //   // console.log(data);
    // });
    // socketClearTextStream.on('end', function() {
    //   console.log("end")
    // });
  });
});
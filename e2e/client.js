'use strict';

var tls = require('tls');
var pem = require('pem');
var tuberClient = require('tuber-client');
var request = require('request');
var fs = require("fs");


var args = process.argv.slice(2);
console.log("args = %j", args);
// var ip = args[0];
// var port = args[1];
// var secretFileLocation = args[2];
var macaroonFileLocation = args[0];

pem.createPrivateKey(function (err, pemKeyObj) {
  console.log("pemKeyObj = %j", pemKeyObj);

  pem.createCertificate({days:1, selfSigned:true, serviceKey: pemKeyObj.key}, function(err, keys){

    console.log("err = %j", err);
    if(err) { console.log("err.message = %j", err.message);}

    

    console.log("cert = " + keys.certificate);
    console.log("priv = " + keys.serviceKey);

    var ip = "localhost";
    var port = 8081;

    console.log("macaroonFileLocation = %j", macaroonFileLocation);
    var macaroonWithCaveat = fs.readFileSync(macaroonFileLocation, "utf8");
     
    console.log("keys.certificate = %j", keys.certificate);
    tuberClient.createConnection(keys.serviceKey, macaroonWithCaveat, "https://" + ip + ":" + port, function (error, response, body) {

    })
  });
});
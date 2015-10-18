'use strict';

var tls = require('tls');
var pem = require('pem');
var request = require('request');
var fs = require("fs");


var args = process.argv.slice(2);
console.log("args = %j", args);
var privateKeyLocation = args[0];

pem.createCertificate({days:1, selfSigned:true, serviceKey: fs.readFileSync(privateKeyLocation, "utf8") }, function(err, keys){
  console.log("err = %j", err);
  console.log("keys = %j", keys);
  console.log("keys.certificate = %j", keys.certificate);
  fs.writeFileSync(__dirname + "/../tmp/cert.pem", keys.certificate, 'utf8');
});
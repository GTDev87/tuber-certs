'use strict';

var tls = require('tls');
var pem = require('pem');
var tuberClient = require('../../tuber-client');
var request = require('request');
var fs = require("fs");


var args = process.argv.slice(2);
console.log("args = %j", args);
// var ip = args[0];
// var port = args[1];
// var secretFileLocation = args[2];
var privKeyLocation = args[0] || __dirname + "/../tmp/priv.pem";
var macaroonFileLocation = args[1] || __dirname + "/../tmp/macaroon.json";

console.log("macaroonFileLocation = %j", macaroonFileLocation);
var macaroonWithCaveat = JSON.parse(fs.readFileSync(macaroonFileLocation, "utf8"));

console.log("macaroonWithCaveat = %j", macaroonWithCaveat);

console.log("privKeyLocation = %j", privKeyLocation);
var privKey = fs.readFileSync(privKeyLocation, "utf8");

var ip = "localhost";
var port = 8081;

tuberClient.createConnection(privKey, macaroonWithCaveat, "https://" + ip + ":" + port, function (err, response, body) {
  console.log("err = %j", err);
  console.log("response = %j", response);
  console.log("body = %j", body);
});
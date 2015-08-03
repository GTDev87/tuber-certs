'use strict';
var expect = require('chai').expect, 
  tuberCerts = require('../lib'),
  fs = require('fs'),
  macaroons = require('macaroons.js'),
  MacaroonsBuilder = macaroons.MacaroonsBuilder,
  ursa = require("ursa"),
  _ = require("lodash"),
  deserializeFn = MacaroonsBuilder.deserialize;

describe('tuber_certs', function () {
  var serializedMac = new MacaroonsBuilder("thing1.com", "my secret", "identifier")
    .getMacaroon()
    .serialize();

  var fooCertPem = fs.readFileSync(__dirname + "/pem/foo.cert.pem", "utf8");
  var fooPrivPem = fs.readFileSync(__dirname + "/pem/foo.priv.pem", "utf8");


  var fooPrivKey = ursa.createPrivateKey(fooPrivPem);

  function between(str, begin, end) {
    var beginIndex = str.indexOf(begin) + begin.length;
    var endIndex = str.indexOf(end);
    return str.slice(beginIndex, endIndex);
  }

  it('bindCertificate', function () {
    var certBoundMac = tuberCerts.bindCertificatePem(serializedMac, fooCertPem);

    var expectedCert = between(deserializeFn(certBoundMac).inspect(), "certificate = ", "\nsignature");
    expect(expectedCert).to.equal(fooCertPem);
  });

  it('bindCertificatePublicKey3rdParty', function (done) {
    tuberCerts.bindCertificatePublicKey3rdParty(serializedMac, "www2", "secret caveat key", fooCertPem, "account = 12345", function (err, publicKeyEncrypted) {
      var decoded = fooPrivKey.decrypt(publicKeyEncrypted.discharge, 'base64', 'utf8');
      expect(decoded).to.equal('caveat_key = secret caveat key\nmessage = account = 12345\n');
      done();
    });
  });
});

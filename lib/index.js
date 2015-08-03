'use strict';

var macaroons = require("macaroons.js"),
  pem = require("pem"),
  MacaroonsBuilder = macaroons.MacaroonsBuilder,
  deserializeFn = MacaroonsBuilder.deserialize,
  public_key_macaroons = require("public-key-macaroons");


// //1) bind certicate as DER as First PArty
// //2) bind 3rd party caveat to macaroon.  
// //3)

module.exports = {
  bindCertificatePem: function (serializedMac, certificatePem) {
    return MacaroonsBuilder.modify(deserializeFn(serializedMac))
      .add_first_party_caveat("certificate = " + certificatePem)
      .getMacaroon()
      .serialize();
  },
  bindCertificatePublicKey3rdParty:  function (serializedMac, location, caveatKey, certificatePem, message, callback) {
    pem.getPublicKey(certificatePem, function (e, publicKey) {//may move out of module later
      var caveatMac = null;
      var err = e;
      try{
        caveatMac = public_key_macaroons.addPublicKey3rdPartyCaveat(serializedMac, location, caveatKey, message, publicKey.publicKey);
      }catch(error){
        err = error;
      }

      callback(err, caveatMac);
    });
  }
};

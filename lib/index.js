'use strict';

module.exports = {
  bindDERCertificate: function (mac, optionsArgs) {
    var options = _.extend({
      location: "www",
      caveatKey: "4; guaranteed random by a fair toss of the dice",
      identifier: "no clue"
    }, optionsArgs);
    mac.add_third_party_caveat(options.location, options.caveatKey, identifier).getMacaroon();
  }
};

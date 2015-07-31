'use strict';
var assert = require('assert');
var tuberCerts = require('../lib');
var sys = require('sys');

var macaroons = require('macaroons.js'),
  MacaroonsBuilder = macaroons.MacaroonsBuilder,
  MacaroonsVerifier = macaroons.MacaroonsVerifier,
  TimestampCaveatVerifier = require('macaroons.js').verifier.TimestampCaveatVerifier;

describe('tuber_certs', function () {
  it('should have unit test!', function () {
    // create a simple macaroon first
    var location = "http://mybank/";
    var secret = "this is a different super-secret key; never use the same secret twice";
    var publicIdentifier = "we used our other secret key";
    var mb = new MacaroonsBuilder(location, secret, publicIdentifier)
        .add_first_party_caveat("account = 3735928559");

    // add a 3rd party caveat
    // you'll likely want to use a higher entropy source to generate this key
    var caveat_key = "4; guaranteed random by a fair toss of the dice";
    var predicate = "user = Alice";
    // send_to_3rd_party_location_and_do_auth(caveat_key, predicate);
    // identifier = recv_from_auth();
    var identifier = "this was how we remind auth of key/pred";
    var m = mb.add_third_party_caveat("http://auth.mybank/", caveat_key, identifier)
        .getMacaroon();

    sys.puts(m.inspect());
    // > location http://mybank/
    // > identifier we used our other secret key
    // > cid account = 3735928559
    // > cid this was how we remind auth of key/pred
    // > vid AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA027FAuBYhtHwJ58FX6UlVNFtFsGxQHS7uD_w_dedwv4Jjw7UorCREw5rXbRqIKhr
    // > cl http://auth.mybank/
    // > signature d27db2fd1f22760e4c3dae8137e2d8fc1df6c0741c18aed4b97256bf78d1f55c

    var d = new MacaroonsBuilder("http://auth.mybank/", caveat_key, identifier)
      .add_first_party_caveat("time < 2016-01-01T00:00")
      .getMacaroon();

    var dp = MacaroonsBuilder.modify(m)
      .prepare_for_request(d)
      .getMacaroon();

    debugger;

    var satisfied3rdParty = new MacaroonsVerifier(m)
      .satisfyExact("account = 3735928559")
      .satisfyGeneral(TimestampCaveatVerifier)
      .satisfy3rdParty(dp)
      .assertIsValid(secret);

    console.log("satisfied3rdParty = %j", satisfied3rdParty);


    assert(false, 'we expected this package author to add actual unit tests.');
  });
});

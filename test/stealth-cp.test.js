var assert = require('assert')
var Stealth = require('../')
var fixtures = require('./fixtures')

/* global describe, it */

describe('checkPaymentPubKeyHash()', function () {
  var f = fixtures.valid[0]

  describe('> when OP_RETURN data is not 33 bytes (i.e. not pubKey)', function () {
    it('should return null', function () {
      var stealth = new Stealth({
        payloadPrivKey: new Buffer(f.receiverPayload.privKey, 'hex'),
        payloadPubKey: new Buffer(f.receiverPayload.pubKey, 'hex'),
        scanPrivKey: new Buffer(f.receiverScan.privKey, 'hex'),
        scanPubKey: new Buffer(f.receiverScan.pubKey, 'hex')
      })

      var buf
      for (var i = 0; i <= 80; ++i) {
        if (i === 33) continue
        buf = new Buffer(i)
        var res = stealth.checkPaymentPubKeyHash(buf, new Buffer(f.paymentPubKeyHash, 'hex'))
        assert.equal(res, null)
      }
    })
  })
})

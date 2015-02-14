var assert = require('assert')
var Stealth = require('../')
var fixtures = require('./fixtures')

/* global describe, it */

describe('stealth', function() {
  fixtures.valid.forEach(function(f) {
    describe('toString()', function() {
      it('should convert to base58-check string', function() {
        var stealth = new Stealth({
          payloadPubKey: new Buffer(f.receiverPayload.pubKey, 'hex'),
          scanPubKey: new Buffer(f.receiverScan.pubKey, 'hex')
        })
        assert.equal(stealth.toString(), f.base58)
      })
    })

    describe('fromString()', function() {
      it('should convert from base58-check string to object', function() {
        var stealth = Stealth.fromString(f.base58)
        assert.equal(stealth.scanPubKey.toString('hex'), f.receiverScan.pubKey)
        assert.equal(stealth.payloadPubKey.toString('hex'), f.receiverPayload.pubKey)
      })
    })

    describe('genPaymentPubKeyHash()', function() {
      it('should generate the payment address for the sender (payer) to send money to', function() {
        var stealth = Stealth.fromString(f.base58)
        var pubKeyHash = stealth.genPaymentPubKeyHash(new Buffer(f.sender.privKey, 'hex'))
        assert.equal(pubKeyHash.toString('hex'), f.paymentPubKeyHash)
      })
    })
  })
})

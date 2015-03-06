var assert = require('assert')
var Stealth = require('../')
var crypto = require('../lib/crypto')
var fixtures = require('./fixtures')

/* global describe, it */

describe('stealth', function () {
  fixtures.valid.forEach(function (f) {
    describe('toString()', function () {
      it('should convert to base58-check string', function () {
        var stealth = new Stealth({
          payloadPubKey: new Buffer(f.receiverPayload.pubKey, 'hex'),
          scanPubKey: new Buffer(f.receiverScan.pubKey, 'hex')
        })
        assert.equal(stealth.toString(), f.base58)
      })
    })

    describe('fromString()', function () {
      it('should convert from base58-check string to object', function () {
        var stealth = Stealth.fromString(f.base58)
        assert.equal(stealth.scanPubKey.toString('hex'), f.receiverScan.pubKey)
        assert.equal(stealth.payloadPubKey.toString('hex'), f.receiverPayload.pubKey)
      })
    })

    describe('genPaymentPubKeyHash()', function () {
      it('should generate the payment pubkeyhash for the sender (payer) to send money to', function () {
        var stealth = Stealth.fromString(f.base58)
        var pubKeyHash = stealth.genPaymentPubKeyHash(new Buffer(f.sender.privKey, 'hex'))
        assert.equal(pubKeyHash.toString('hex'), f.paymentPubKeyHash)
      })
    })

    describe('genPaymentAddress()', function () {
      it('should generate the payment address for the sender', function () {
        var stealth = Stealth.fromString(f.base58)
        var address = stealth.genPaymentAddress(new Buffer(f.sender.privKey, 'hex'))
        assert.equal(address, f.paymentAddress)
      })
    })

    describe('checkPaymentPubKeyHash()', function () {
      it('should check the payment is indeed owned by me', function () {
        var stealth = new Stealth({
          payloadPrivKey: new Buffer(f.receiverPayload.privKey, 'hex'),
          payloadPubKey: new Buffer(f.receiverPayload.pubKey, 'hex'),
          scanPrivKey: new Buffer(f.receiverScan.privKey, 'hex'),
          scanPubKey: new Buffer(f.receiverScan.pubKey, 'hex')
        })

        var res = stealth.checkPaymentPubKeyHash(new Buffer(f.sender.pubKey, 'hex'), new Buffer(f.paymentPubKeyHash, 'hex'))
        assert(res)

        assert(res.privKey)
        assert(res.pubKey)
        assert.equal(crypto.hash160(res.pubKey).toString('hex'), f.paymentPubKeyHash)
      })
    })

    describe('toJSON()', function () {
      it('should convert to JSON string', function () {
        var stealth = new Stealth({
          payloadPrivKey: new Buffer(f.receiverPayload.privKey, 'hex'),
          payloadPubKey: new Buffer(f.receiverPayload.pubKey, 'hex'),
          scanPrivKey: new Buffer(f.receiverScan.privKey, 'hex'),
          scanPubKey: new Buffer(f.receiverScan.pubKey, 'hex')
        })

        assert.equal(stealth.toJSON(), f.JSON)
      })

      describe('when > only pub (sender)', function () {
        it('should convert to JSON string', function () {
          var stealth = new Stealth({
            payloadPubKey: new Buffer(f.receiverPayload.pubKey, 'hex'),
            scanPubKey: new Buffer(f.receiverScan.pubKey, 'hex')
          })

          assert.equal(stealth.toJSON(), f.JSONpub)
        })
      })
    })

    describe('fromJSON()', function () {
      it('should parse from JSON', function () {
        var stealth1 = Stealth.fromJSON(f.JSON)
        assert.equal(stealth1.toJSON(), f.JSON)
        assert.equal(stealth1.toString(), f.base58)

        var stealth2 = Stealth.fromJSON(f.JSONpub)
        assert.equal(stealth2.toJSON(), f.JSONpub)
        assert.equal(stealth2.toString(), f.base58)
      })
    })
  })
})

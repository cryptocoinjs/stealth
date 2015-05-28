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

    describe('fromRandom()', function () {
      it('should create a random stealth key', function () {
        var stealth = Stealth.fromRandom()
        assert(stealth.toString())
        assert.strictEqual(stealth.version, 42)
      })

      describe('> when rng is passed', function () {
        it('should return a stealth key using the new rng', function () {
          var stealth = Stealth.fromRandom({
            rng: function () {
              // return as Buffer
              return new Buffer('5873d4af699b9a35cca3d38219a13184c616e5d433c99ff39353687d4736ac1d', 'hex')
            }
          })
          assert.strictEqual(stealth.scanPrivKey.toString('hex'), '5873d4af699b9a35cca3d38219a13184c616e5d433c99ff39353687d4736ac1d')
          assert.strictEqual(stealth.payloadPrivKey.toString('hex'), '5873d4af699b9a35cca3d38219a13184c616e5d433c99ff39353687d4736ac1d')
          assert.strictEqual(stealth.scanPubKey.toString('hex'), '02a8001c07fabf92175cb93f35df6d4d5f6cba8f35c9e080558bc44eedd95c2568')
          assert.strictEqual(stealth.payloadPubKey.toString('hex'), '02a8001c07fabf92175cb93f35df6d4d5f6cba8f35c9e080558bc44eedd95c2568')

          var stealth2 = Stealth.fromRandom({
            rng: function () {
              // return as Array
              return [].slice.call(new Buffer('9f817a572bd5e89fe0b98c771de29de5ce1720e83fd43fc8d57de2db328b9d1a', 'hex'))
            }
          })
          assert.strictEqual(stealth2.scanPrivKey.toString('hex'), '9f817a572bd5e89fe0b98c771de29de5ce1720e83fd43fc8d57de2db328b9d1a')
          assert.strictEqual(stealth2.payloadPrivKey.toString('hex'), '9f817a572bd5e89fe0b98c771de29de5ce1720e83fd43fc8d57de2db328b9d1a')
          assert.strictEqual(stealth2.scanPubKey.toString('hex'), '0393b6e74a36b1c9769acd749ed18d82457b52d78f00def709f03c526ae895d7c1')
          assert.strictEqual(stealth2.payloadPubKey.toString('hex'), '0393b6e74a36b1c9769acd749ed18d82457b52d78f00def709f03c526ae895d7c1')
        })
      })

      describe('> when version is passed', function () {
        it('should use the new version number', function () {
          var stealth = Stealth.fromRandom({
            version: 5
          })
          assert.strictEqual(stealth.version, 5)
        })
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

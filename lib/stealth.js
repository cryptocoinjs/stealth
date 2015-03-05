var assert = require('assert')
var bs58 = require('bs58')
var ecurve = require('ecurve')
var crypto = require('./crypto')
var ecparams = ecurve.getCurveByName('secp256k1')
var Point = ecurve.Point
var BigInteger = crypto.BigInteger

Stealth.MAINNET = 42
Stealth.TESTNET = 43

function Stealth (config) {
  // required
  this.payloadPubKey = config.payloadPubKey
  this.scanPubKey = config.scanPubKey

  // only makes sense if you're the receiver, i.e. you own the stealth addresss
  this.payloadPrivKey = config.payloadPrivKey
  this.scanPrivKey = config.scanPrivKey

  assert(Buffer.isBuffer(this.payloadPubKey), 'payloadPubKey must be a buffer')
  assert(Buffer.isBuffer(this.scanPubKey), 'scanPubKey must be a buffer')

  // default to bitcoin
  this.version = config.version || Stealth.MAINNET
}

Stealth.prototype.toBuffer = function() {
  return bconcat([
    this.version,
    0, // options
    this.scanPubKey,
    1, // number of payload keys, only 1 atm
    this.payloadPubKey,
    1, // number of sigs, only 1 atm
    0 // prefix length, not supported (actually, don't even know what the hell it is)
  ])
}

Stealth.prototype.toString = function() {
  var payload = this.toBuffer()
  var checksum = crypto.sha256x2(payload).slice(0, 4)

  return bs58.encode(Buffer.concat([
    payload,
    checksum
  ]))
}

Stealth.fromBuffer = function(buffer) {
  const pkLen = 33
  var pos = 0
  var version = buffer.readUInt8(pos++)
  var options = buffer.readUInt8(pos++)
  assert.equal(options, 0)

  var scanPubKey = buffer.slice(pos, pos += pkLen)
  var nPayloadPubkeys = buffer.readUInt8(pos++)

  var payloadPubkeys = []
  for (var i = 0; i < nPayloadPubkeys; i++) {
    payloadPubkeys.push(buffer.slice(pos, pos += pkLen))
  }

  var nSigs = buffer.readUInt8(pos++)
  var nPrefix = buffer.readUInt8(pos++)
  var prefix = buffer.slice(pos, pos + nPrefix / 8)

  assert.equal(nSigs, 1)
  assert.equal(nPrefix, 0)
  assert.equal(prefix.length, 0)

  return new Stealth({
    payloadPubKey: payloadPubkeys[0],
    scanPubKey: scanPubKey,
    version: version
  })
}

// https://gist.github.com/ryanxcharles/1c0f95d0892b4a92d70a
Stealth.prototype.genPaymentPubKeyHash = function(senderPrivKey) {
  var kdf = crypto.hmacSha256

  var Ap = Point.decodeFrom(ecparams, this.scanPubKey)
  var A = Point.decodeFrom(ecparams, this.payloadPubKey)

  var S = Ap.multiply(BigInteger.fromBuffer(senderPrivKey))

  var d = BigInteger.fromBuffer(kdf(S.getEncoded(true)))
  var D = ecparams.G.multiply(d)

  var E = A.add(D)

  var pubKeyHash = crypto.hash160(E.getEncoded(true))
  return pubKeyHash
}

Stealth.prototype.genPaymentAddress = function(senderPrivKey, version) {
  var pubKeyHash = this.genPaymentPubKeyHash(senderPrivKey)
  var payload = Buffer.concat([new Buffer([version || 0x0]), pubKeyHash])
  var checksum = crypto.sha256x2(payload).slice(0, 4)

  return bs58.encode(Buffer.concat([
    payload,
    checksum
  ]))
}

// https://gist.github.com/ryanxcharles/1c0f95d0892b4a92d70a
Stealth.prototype.checkPaymentPubKeyHash = function(opReturnPubKey, pubKeyHashToCompare) {
  assert(this.payloadPrivKey, 'payloadPrivKey must be set if you use this method. i.e. Must be owner / receiver.')
  assert(this.scanPrivKey, 'scanPrivKey must be set if you use this method. i.e. Must be owner / receiver.')

  var kdf = crypto.hmacSha256

  var a = this.payloadPrivKey
  var ap = this.scanPrivKey
  var B = Point.decodeFrom(ecparams, opReturnPubKey)

  var S = B.multiply(BigInteger.fromBuffer(ap))

  var d = kdf(S.getEncoded(true))
  var e = BigInteger.fromBuffer(a).add(BigInteger.fromBuffer(d)).mod(ecparams.n)

  var E = ecparams.G.multiply(e)

  var pubKeyHash = crypto.hash160(E.getEncoded(true))
  if (pubKeyHash.toString('hex') !== pubKeyHashToCompare.toString('hex'))
    return null

  return {
    privKey: e.toBuffer(32),
    pubKey: E.getEncoded(true)
  }
}

Stealth.fromString = function(str) {
  var buffer = new Buffer(bs58.decode(str))

  var payload = buffer.slice(0, -4)
  var checksum = buffer.slice(-4)
  var newChecksum = crypto.sha256x2(payload).slice(0, 4)

  assert.deepEqual(newChecksum, checksum, 'Invalid checksum')

  return Stealth.fromBuffer(payload)
}

function bconcat (arr) {
  arr = arr.map(function(item) {
    return Buffer.isBuffer(item) ? item : new Buffer([item])
  })
  return Buffer.concat(arr)
}

module.exports = Stealth

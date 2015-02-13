var assert = require('assert')
var bs58 = require('bs58')
var crypto = require('./crypto')

Stealth.MAINNET = 42
Stealth.TESTNET = 43

function Stealth(config) {
  this.payloadPubKey = config.payloadPubKey
  this.scanPubKey = config.scanPubKey

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
    0, // prefix length, not supported (actually, don't even know what the hell it is)
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
  var scanPubKey = buffer.slice(pos, pos += pkLen)
  var nPayloadPubkeys = buffer.readUInt8(pos++)

  var payloadPubkeys = []
  for (var i = 0; i < nPayloadPubkeys; i++) {
    payloadPubkeys.push(buffer.slice(pos, pos += pkLen))
  }

  var nSigs = buffer.readUInt8(pos++)
  var nPrefix = buffer.readUInt8(pos++)
  var prefix = buffer.slice(pos, pos + nPrefix / 8)

  return new Stealth({
    payloadPubKey: payloadPubkeys[0],
    scanPubKey: scanPubKey,
    version: version
  })
}

Stealth.fromString = function(str) {
  var buffer = new Buffer(bs58.decode(str))

  var payload = buffer.slice(0, -4)
  var checksum = buffer.slice(-4)
  var newChecksum = crypto.sha256x2(payload).slice(0, 4)

  assert.deepEqual(newChecksum, checksum, 'Invalid checksum')

  return Stealth.fromBuffer(payload)
}

function bconcat(arr) {
  arr = arr.map(function(item) {
    return Buffer.isBuffer(item) ? item : new Buffer([item])
  })
  return Buffer.concat(arr)
}

module.exports = Stealth



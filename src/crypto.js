var crypto = require('crypto')
var ecurve = require('ecurve')

// hack to get bigi without including it as a dep
var ecparams = ecurve.getCurveByName('secp256k1')
var BigInteger = ecparams.n.constructor

function hash160 (buffer) {
  buffer = crypto.createHash('sha256').update(buffer).digest()
  return crypto.createHash('rmd160').update(buffer).digest()
}

function sha256x2 (buffer) {
  buffer = crypto.createHash('sha256').update(buffer).digest()
  return crypto.createHash('sha256').update(buffer).digest()
}

module.exports = {
  BigInteger: BigInteger,
  hash160: hash160,
  sha256x2: sha256x2
}

var crypto = require('crypto')

function hash160 (buffer) {
  buffer = crypto.createHash('sha256').update(buffer).digest()
  return crypto.createHash('rmd160').update(buffer).digest()
}

function sha256x2 (buffer) {
  buffer = crypto.createHash('sha256').update(buffer).digest()
  return crypto.createHash('sha256').update(buffer).digest()
}

module.exports = {
  hash160: hash160,
  sha256x2: sha256x2
}

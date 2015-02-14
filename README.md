stealth
=======

This module is used for stealth addresses for Bitcoin and other crypto currencies.


Usage
-----

First, you should really read this excellent resource: https://gist.github.com/ryanxcharles/1c0f95d0892b4a92d70a

This module depends upon [ecurve](https://github.com/cryptocoinjs/ecurve) and may change to
[elliptic](https://github.com/indutny/elliptic) in the future. However, this is just an implementation detail
that shouldn't affect your code.

### Example

#### If you're the payer (sender)

```js
var Stealth = require('stealth')

// you get this from the person you're going to pay (receiver)
var addr = 'vJmtuUb8ysKiM1HtHQF23FGfjGAKu5sM94UyyjknqhJHNdj5CZzwtpGzeyaATQ2HvuzomNVtiwsTJSWzzCBgCTtUZbRFpzKVq9MAUr'
var stealth = Stealth.fromString(addr)

// single-use nonce key pair, works with CoinKey, bitcoinjs-lib, bitcore, etc
var keypair = require('coinkey').createRandom()

// generate payment address
var payToAddress = stealth.genPaymentAddress(keypair.privateKey)

// create transaction with two outputs:
// 1. Regular pay-to-pubkeyhash with `payToAddress` as recipient
// 2. OP_RETURN with `keypair.publicKey`
```


#### If you're the payee (recipient)

```js
var Stealth = require('stealth')

// you need to scan every transaction and look for the following:
// 1. does the transaction contain an OP_RETURN?
// 2. if yes, then extract the OP_RETURN
// 3. is the OP_RETURN data a compressed public key (33 bytes)?
// 4. if yes, check if mine

// generate two key pairs, can use CoinKey, bitcoinjs-lib, bitcore, etc
var payloadKeyPair = require('coinkey').createRandom()
var scanKeyPair = require('coinkey').createRandom()

// note, the private keys are NOT encoded in the Stealth address
// you need to save them somewhere
var stealth = new Stealth({
  payloadPrivKey: payloadKeyPair.privateKey,
  payloadPubKey: payloadKeyPair.publicKey,
  scanPrivKey: scanKeyPair.privateKey,
  scanPubKey: scanKeyPair.publicKey
})

var addr = stealth.toString()
// => 'vJmtuUb8ysKiM1HtHQF23FGfjGAKu5sM94UyyjknqhJHNdj5CZzwtpGzeyaATQ2HvuzomNVtiwsTJSWzzCBgCTtUZbRFpzKVq9MAUr'

// publish addr or give it someone
// unlike regular Bitcoin addresses, you can use
// stealth address as much as you like

// scan and decode transactions

var opReturnPubKey = /* */
var pubKeyHashWithPayment = /* */

var keypair = stealth.checkPaymentPubKeyHash(opReturnPubKey, pubKeyHashWithPayment)

// it NOT YOURS, `keypair` will be falsey

if (keypair == null) {
  console.log('payment is not mine')
} else {
  console.log('payment is mine')

  // redeem with `privKey`
  console.log(keypair.privKey)
}
```


Resources
---------

### Credits

The creation of this module owes a lot of credit to the prior work of [Ryan X. Charles](https://github.com/ryanxcharles), specifically the following
resources:

- https://github.com/ryanxcharles/fullnode
- https://gist.github.com/ryanxcharles/1c0f95d0892b4a92d70a


### Additional Resources

- Dark Wallet description: https://wiki.unsystem.net/en/index.php/DarkWallet/Stealth
- Dark Wallet infographic: https://wiki.unsystem.net/en/images/e/e5/RHhNKL6.jpg
- Stealth Whitepaper: http://sourceforge.net/p/bitcoin/mailman/message/31813471/


License
-------

MIT

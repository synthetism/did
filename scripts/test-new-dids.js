#!/usr/bin/env node

const { createDIDKey } = require('../dist/index.js');

console.log('Testing DID:key creation with new implementation:');

try {
  // Ed25519 test
  const ed25519Key = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
  const ed25519DID = createDIDKey(ed25519Key, "Ed25519");
  console.log('Ed25519 DID:', ed25519DID);

  // secp256k1 test
  const secp256k1Key = "02b97c30de767f084ce3439de539bae75de6b9f1bb2d9bb3c8e0b3cf68f12c5e9e";
  const secp256k1DID = createDIDKey(secp256k1Key, "secp256k1");
  console.log('Secp256k1 DID:', secp256k1DID);

  // X25519 test
  const x25519Key = "8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a";
  const x25519DID = createDIDKey(x25519Key, "X25519");
  console.log('X25519 DID:', x25519DID);

} catch (error) {
  console.error('Error:', error.message);
}

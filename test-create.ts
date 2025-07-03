#!/usr/bin/env node

import { createDIDKey, createDIDWeb, createDIDSynet, createDID } from "./src/create.js";

console.log("=== Testing @synet/did creation functions ===\n");

// Test did:key creation with different key types
console.log("1. Testing did:key creation:");

try {
  // Ed25519 key (32 bytes)
  const ed25519PublicKey = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
  const ed25519DID = createDIDKey(ed25519PublicKey, "Ed25519");
  console.log(`✓ Ed25519 DID: ${ed25519DID}`);

  // secp256k1 key (33 bytes compressed)
  const secp256k1PublicKey = "02b97c30de767f084ce3439de539bae75de6b9f1bb2d9bb3c8e0b3cf68f12c5e9e";
  const secp256k1DID = createDIDKey(secp256k1PublicKey, "secp256k1");
  console.log(`✓ secp256k1 DID: ${secp256k1DID}`);

  // X25519 key (32 bytes)
  const x25519PublicKey = "8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a";
  const x25519DID = createDIDKey(x25519PublicKey, "X25519");
  console.log(`✓ X25519 DID: ${x25519DID}`);

} catch (error) {
  console.error(`✗ did:key creation failed: ${error}`);
}

console.log("\n2. Testing did:web creation:");

try {
  const webDID = createDIDWeb("example.com");
  console.log(`✓ Web DID: ${webDID}`);

  const webDIDWithPath = createDIDWeb("example.com", "users/alice");
  console.log(`✓ Web DID with path: ${webDIDWithPath}`);
} catch (error) {
  console.error(`✗ did:web creation failed: ${error}`);
}

console.log("\n3. Testing did:synet creation:");

try {
  const synetDID = createDIDSynet("test-synet-identifier-123456789");
  console.log(`✓ Synet DID: ${synetDID}`);
} catch (error) {
  console.error(`✗ did:synet creation failed: ${error}`);
}

console.log("\n4. Testing createDID function:");

try {
  // Use the same key from above
  const ed25519Key = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
  const didOptions = {
    method: "key" as const,
    publicKey: ed25519Key,
    keyType: "Ed25519" as const,
  };
  const genericDID = createDID(didOptions);
  console.log(`✓ Generic DID creation: ${genericDID}`);
} catch (error) {
  console.error(`✗ Generic DID creation failed: ${error}`);
}

console.log("\n5. Testing error cases:");

try {
  // Should fail - no public key
  createDIDKey("", "Ed25519");
  console.error("✗ Should have failed with empty public key");
} catch (error) {
  console.log(`✓ Correctly rejected empty public key: ${error.message}`);
}

try {
  // Should fail - invalid hex
  createDIDKey("not-hex", "Ed25519");
  console.error("✗ Should have failed with invalid hex");
} catch (error) {
  console.log(`✓ Correctly rejected invalid hex: ${error.message}`);
}

try {
  // Should fail - wrong key length for Ed25519
  createDIDKey("abcd", "Ed25519");
  console.error("✗ Should have failed with wrong key length");
} catch (error) {
  console.log(`✓ Correctly rejected wrong key length: ${error.message}`);
}

console.log("\n=== All tests completed ===");

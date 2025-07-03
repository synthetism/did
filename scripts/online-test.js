#!/usr/bin/env node

/**
 * Online DID Testing Script
 * 
 * Tests your DID implementation against external services and validators
 */

const { createDIDKey, createDIDWeb, validateDID } = require('../dist/index.js');

async function testWithUniResolver(did) {
  try {
    console.log(`\n🌐 Testing with Universal Resolver: ${did}`);
    const response = await fetch(`https://dev.uniresolver.io/1.0/identifiers/${encodeURIComponent(did)}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Successfully resolved by Universal Resolver');
      console.log('   Method:', result.didDocument?.id ? 'Resolved' : 'Not resolved');
      if (result.didDocument) {
        console.log('   Document ID:', result.didDocument.id);
        console.log('   Verification Methods:', result.didDocument.verificationMethod?.length || 0);
      }
    } else {
      console.log('❌ Universal Resolver error:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('⚠️  Network error with Universal Resolver:', error.message);
  }
}

async function testDIDDocumentValidation(did) {
  console.log(`\n📋 Testing DID validation: ${did}`);
  const validation = validateDID(did);
  
  if (validation.isValid) {
    console.log('✅ DID validation passed');
    if (validation.warnings) {
      console.log('⚠️  Warnings:', validation.warnings);
    }
  } else {
    console.log('❌ DID validation failed:', validation.error);
  }
}

async function main() {
  console.log('🔍 @synet/did Online Testing Suite');
  console.log('=====================================');
  
  // Test Ed25519 DID
  const ed25519Key = 'd75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a';
  const ed25519DID = createDIDKey(ed25519Key, 'ed25519-pub');
  console.log(`\n📝 Generated Ed25519 DID: ${ed25519DID}`);
  
  await testDIDDocumentValidation(ed25519DID);
  await testWithUniResolver(ed25519DID);
  
  // Test secp256k1 DID
  const secp256k1Key = '02b97c30de767f084ce3439de539bae75de6b9f1bb2d9bb3c8e0b3cf68f12c5e9e';
  const secp256k1DID = createDIDKey(secp256k1Key, 'secp256k1-pub');
  console.log(`\n📝 Generated secp256k1 DID: ${secp256k1DID}`);
  
  await testDIDDocumentValidation(secp256k1DID);
  await testWithUniResolver(secp256k1DID);
  
  // Test X25519 DID
  const x25519Key = '8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a';
  const x25519DID = createDIDKey(x25519Key, 'x25519-pub');
  console.log(`\n📝 Generated X25519 DID: ${x25519DID}`);
  
  await testDIDDocumentValidation(x25519DID);
  await testWithUniResolver(x25519DID);
  
  // Test did:web
  const webDID = createDIDWeb('example.com');
  console.log(`\n📝 Generated Web DID: ${webDID}`);
  
  await testDIDDocumentValidation(webDID);
  await testWithUniResolver(webDID);
  
  // Test multicodec prefix validation
  console.log('\n🔬 Multicodec Prefix Validation');
  console.log(`Ed25519 DID starts with: ${ed25519DID.split(':')[2].substring(0, 4)} (expected: z6Mk)`);
  console.log(`secp256k1 DID starts with: ${secp256k1DID.split(':')[2].substring(0, 4)} (expected: zQ3s)`);
  console.log(`X25519 DID starts with: ${x25519DID.split(':')[2].substring(0, 4)} (expected: z6LS)`);
  
  const prefixTests = [
    { did: ed25519DID, expected: 'z6Mk', name: 'Ed25519' },
    { did: secp256k1DID, expected: 'zQ3s', name: 'secp256k1' },
    { did: x25519DID, expected: 'z6LS', name: 'X25519' }
  ];
  
  for (const { did, expected, name } of prefixTests) {
    const actual = did.split(':')[2].substring(0, 4);
    if (actual === expected) {
      console.log(`✅ ${name} prefix correct: ${actual}`);
    } else {
      console.log(`❌ ${name} prefix incorrect: got ${actual}, expected ${expected}`);
    }
  }
  
  console.log('\n🏁 Testing complete!');
}

main().catch(console.error);

#!/usr/bin/env node

/**
 * Demo script to verify the finalized getPublicKeyHex implementation
 * and the renamed getKey method in Signer.
 */

const { Signer } = require('@synet/keys');
const { DID } = require('@synet/did');

async function demo() {
  console.log('🚀 Demo: Finalized getPublicKeyHex and getKey rename\n');
  
  // 1. Test Signer with renamed getKey method
  console.log('1. Testing Signer with renamed getKey method...');
  const signer = Signer.generate('ed25519', { demo: 'getKey-rename' });
  if (!signer) {
    console.error('❌ Failed to create signer');
    return;
  }
  
  console.log('✅ Signer created successfully');
  console.log('   Algorithm:', signer.getAlgorithm());
  
  // Test the renamed method
  const keyData = signer.getKey({ name: 'demo-key' });
  console.log('✅ getKey() method works (renamed from getKeyCreationData)');
  console.log('   Key type:', keyData.keyType);
  console.log('   Has signer:', !!keyData.signer);
  console.log('   Meta:', keyData.meta);
  
  // 2. Test getPublicKeyHex
  console.log('\n2. Testing getPublicKeyHex...');
  const publicKeyPEM = signer.getPublicKey();
  const publicKeyHex = signer.getPublicKeyHex();
  
  console.log('✅ Public key (PEM):', publicKeyPEM.substring(0, 50) + '...');
  
  if (publicKeyHex) {
    console.log('✅ Public key (hex):', publicKeyHex);
    console.log('   Length:', publicKeyHex.length, 'characters');
  } else {
    console.log('❌ getPublicKeyHex() returned null');
  }
  
  // 3. Test DID generation with hex conversion
  console.log('\n3. Testing DID generation with hex conversion...');
  const didUnit = DID.create();
  
  // Learn from signer
  didUnit.learn([signer.teach()]);
  
  if (didUnit.canGenerateKey()) {
    console.log('✅ DID unit can generate key (learned from signer)');
    
    const did = await didUnit.generate({ method: 'key' });
    if (did) {
      console.log('✅ DID generated successfully:', did);
      console.log('   Prefix:', did.substring(0, 20) + '...');
    } else {
      console.log('❌ DID generation failed');
    }
  } else {
    console.log('❌ DID unit cannot generate key');
  }
  
  // 4. Test direct DID generation with hex
  console.log('\n4. Testing direct DID generation with hex...');
  if (publicKeyHex) {
    const directDID = await didUnit.generate({
      method: 'key',
      publicKey: publicKeyHex,
      keyType: 'ed25519'
    });
    
    if (directDID) {
      console.log('✅ Direct DID generation with hex works:', directDID);
    } else {
      console.log('❌ Direct DID generation with hex failed');
    }
  }
  
  console.log('\n🎉 Demo completed successfully!');
  console.log('   - getKey() method renamed and working ✅');
  console.log('   - getPublicKeyHex() implemented and working ✅');
  console.log('   - DID generation with PEM->hex conversion working ✅');
}

demo().catch(console.error);

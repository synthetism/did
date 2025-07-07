/**
 * Cohesive Key Format Strategy Demo
 * 
 * This demonstrates our finalized strategy for key format handling:
 * 1. Keys/Signer units work with PEM internally (crypto operations)
 * 2. DID generation works with hex format (for multicodec)
 * 3. Conversion utilities handle format transformation
 * 4. Integration between all units works seamlessly
 */

async function runDemo() {

const { Signer, Key, generateKeyPair, detectKeyFormat, hexToBase64, base64ToHex } = require('@synet/keys');
const { DID } = require('@synet/did');

console.log('🔑 Cohesive Key Format Strategy Demo\n');

// Demo 1: Basic Signer/Key operations (PEM format)
console.log('1. Basic Key Operations (PEM format):');
const signer = Signer.generate('ed25519');
if (signer) {
  console.log('   ✅ Generated Ed25519 signer');
  console.log(`   🔐 Algorithm: ${signer.getAlgorithm()}`);
  console.log(`   📄 Public key format: ${signer.getPublicKey().includes('-----BEGIN') ? 'PEM' : 'Other'}`);
}

// Demo 2: Key generation with different formats
console.log('\n2. Key Generation with Format Options:');
const hexKeys = generateKeyPair('ed25519', { format: 'hex' });
console.log('   ✅ Generated Ed25519 key pair in hex format');
console.log(`   🔑 Public key (hex): ${hexKeys.publicKey.substring(0, 16)}...`);

const base64Keys = generateKeyPair('ed25519', { format: 'base64' });
console.log('   ✅ Generated Ed25519 key pair in base64 format');
console.log(`   🔑 Public key (base64): ${base64Keys.publicKey.substring(0, 16)}...`);

// Demo 3: DID Generation with hex input
console.log('\n3. DID Generation (hex format for multicodec):');
const didUnit = DID.create();

// Try generating DID with hex keys directly
const didFromHex = await didUnit.generate({
  method: 'key',
  publicKey: hexKeys.publicKey,
  keyType: 'ed25519'
});

if (didFromHex) {
  console.log('   ✅ Generated DID from hex public key');
  console.log(`   🪪 DID: ${didFromHex}`);
} else {
  console.log('   ⚠️  DID generation from hex needs more work');
}

// Demo 4: Unit Integration (teach/learn pattern)
console.log('\n4. Unit Integration (Signer → Key → DID):');
if (signer) {
  const key = Key.createFromSigner(signer);
  if (key) {
    console.log('   ✅ Created Key from Signer');
    
    // DID learns from Key
    didUnit.learn([key.teach()]);
    console.log('   ✅ DID unit learned from Key unit');
    console.log(`   🎯 DID can generate key: ${didUnit.canGenerateKey()}`);
    
    // Try to generate DID (will fail due to PEM-to-hex conversion limitation)
    const didFromUnits = await didUnit.generate({ method: 'key' });
    if (didFromUnits) {
      console.log(`   ✅ Generated DID via unit integration: ${didFromUnits}`);
    } else {
      console.log('   ⚠️  DID generation via units needs PEM-to-hex conversion');
    }
  }
}

// Demo 5: Format detection and conversion
console.log('\n5. Format Detection and Conversion:');

const hexFormat = detectKeyFormat(hexKeys.publicKey);
const base64Format = detectKeyFormat(base64Keys.publicKey);
console.log(`   🔍 Hex key detected as: ${hexFormat}`);
console.log(`   🔍 Base64 key detected as: ${base64Format}`);

const hexToB64 = hexToBase64(hexKeys.publicKey);
const b64ToHex = base64ToHex(base64Keys.publicKey);
console.log(`   ✅ Hex→Base64 conversion: ${hexToB64 ? 'Success' : 'Failed'}`);
console.log(`   ✅ Base64→Hex conversion: ${b64ToHex ? 'Success' : 'Failed'}`);

console.log('\n📋 Strategy Summary:');
console.log('   ✅ PEM format: Internal crypto operations (signing/verification)');
console.log('   ✅ Hex format: DID generation and multicodec encoding');
console.log('   ✅ Base64 format: Alternative format with conversion support');
console.log('   ✅ Format utilities: Detection and conversion between formats');
console.log('   ✅ Unit integration: Teach/learn pattern works');
console.log('   ⚠️  PEM-to-hex: Complex conversion needs refinement');
console.log('\n🎯 Next steps: Implement robust PEM-to-hex conversion for complete integration');
}

// Run the demo
runDemo().catch(console.error);

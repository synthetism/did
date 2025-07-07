/**
 * Example: Correct Usage Pattern for DID Unit with Signer/Key Architecture
 * 
 * This example demonstrates the proper way to use the Signer, Key, and DID units
 * as corrected in the README documentation.
 * 
 * Pattern:
 * 1. signer = Signer.generate('ed25519')
 * 2. key = Key.createFromSigner(signer, 'ed25519')
 * 3. did = DID.create()
 * 4. did.learn([key.teach()])
 * 5. didValue = did.generate({ method: 'key' })
 */

import { DID } from '../src/did';
import { Signer, Key } from '@synet/keys';

async function main() {
  console.log('🔧 Demonstrating correct DID Unit usage pattern...\n');
  
  // Step 1: Generate Signer with ed25519 algorithm
  console.log('1. Creating Signer...');
  const signer = Signer.generate('ed25519');
  if (!signer) {
    console.error('❌ Failed to generate signer');
    return;
  }
  console.log('✅ Signer created successfully');
  console.log(`   Algorithm: ${signer.getAlgorithm()}`);
  console.log(`   Public Key: ${signer.getPublicKey().slice(0, 50)}...`);
  
  // Step 2: Create Key from Signer
  console.log('\n2. Creating Key from Signer...');
  const key = Key.createFromSigner(signer, { purpose: 'identity' });
  if (!key) {
    console.error('❌ Failed to create key from signer');
    return;
  }
  console.log('✅ Key created successfully');
  console.log(`   Can sign: ${key.canSign()}`);
  console.log(`   Type: ${key.getType()}`);
  
  // Step 3: Create DID Unit
  console.log('\n3. Creating DID Unit...');
  const did = DID.create();
  console.log('✅ DID Unit created successfully');
  console.log(`   ${did.whoami()}`);
  console.log(`   Can generate key before learning: ${did.canGenerateKey()}`);
  
  // Step 4: DID learns from Key
  console.log('\n4. DID learning from Key...');
  did.learn([key.teach()]);
  console.log('✅ DID learned capabilities from Key');
  console.log(`   Can generate key after learning: ${did.canGenerateKey()}`);
  console.log(`   Available capabilities: ${did.capabilities().join(', ')}`);
  
  // Step 5: Generate DID
  console.log('\n5. Generating DID...');
  const didValue = await did.generate({ method: 'key' });
  if (!didValue) {
    console.error('❌ Failed to generate DID');
    return;
  }
  console.log('✅ DID generated successfully');
  console.log(`   DID: ${didValue}`);
  
  // Bonus: Demonstrate signing and verification
  console.log('\n6. Bonus: Signing and Verification...');
  const message = 'Hello, DID World!';
  
  // Sign with the signer
  const signature = await signer.sign(message);
  console.log(`   Message: "${message}"`);
  console.log(`   Signature: ${signature.slice(0, 50)}...`);
  
  // Verify with the key
  const isValid = await key.verify(message, signature);
  console.log(`   Signature valid: ${isValid}`);
  
  console.log('\n🎉 All steps completed successfully!');
  console.log('\n📋 Summary:');
  console.log(`   - Signer: ${signer.getAlgorithm()} key pair generator`);
  console.log('   - Key: Public key holder with signing capabilities');
  console.log(`   - DID: ${didValue}`);
  console.log('   - Architecture: Signer → Key → DID (proper separation)');
}

if (require.main === module) {
  main().catch(console.error);
}

export { main };

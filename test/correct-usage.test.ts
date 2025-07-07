/**
 * Test correct usage patterns for DID Unit with Signer/Key architecture
 * Validates the examples shown in README are accurate
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DID } from '../src/did';
import { Signer, Key } from '@synet/keys';

describe('DID Unit - Correct Usage Patterns', () => {
  describe('Advanced Usage with Signer/Key Units', () => {
    it('should follow proper separation of concerns', async () => {
      // Step 1: Signer generates the cryptographic key pair
      const signer = Signer.generate('ed25519');
      expect(signer).toBeDefined();
      expect(signer).not.toBeNull();
      if (!signer) return;

      // Step 2: Key unit is created from Signer
      const key = Key.createFromSigner(signer, { purpose: 'identity' });
      expect(key).toBeDefined();
      expect(key).not.toBeNull();
      if (!key) return;

      // Step 3: DID unit learns public key capabilities from Key
      const did = DID.create();
      did.learn([key.teach()]);
      
      // Verify the DID learned the capabilities
      expect(did.canGenerateKey()).toBe(true);

      // Step 4: Generate DID using the public key
      const didResult = await did.generate({ method: 'key' });
      expect(didResult).toBeDefined();
      expect(didResult).toMatch(/^did:key:z[A-Za-z0-9]+$/);

      // Verification - each unit has its proper role
      expect(key.canSign()).toBe(true); // has signing capability from signer
      expect(did.canGenerateKey()).toBe(true); // can generate DID from public key
    });

    it('should support production identity creation workflow', async () => {
      // Production identity creation workflow
      async function createProductionIdentity(userId: string) {
        // 1. Generate cryptographic material securely
        const signer = Signer.generate('ed25519');
        if (!signer) throw new Error('Failed to generate signer');

        // 2. Create Key unit from Signer
        const key = Key.createFromSigner(signer, { 
          userId, 
          purpose: 'identity',
          created: Date.now() 
        });
        if (!key) throw new Error('Failed to create key from signer');

        // 3. Create DID from Key capabilities (no private key exposure)
        const did = DID.create({ userId, purpose: 'authentication' });
        did.learn([key.teach()]);

        // 4. Generate the DID
        const identity = await did.generate({ method: 'key' });

        return {
          identity, // DID for public use
          signer,   // Keep private for signing operations
          key,      // Public key for verification
          did       // DID unit for identity operations
        };
      }

      // Usage
      const userIdentity = await createProductionIdentity('user-123');
      expect(userIdentity.identity).toMatch(/^did:key:z[A-Za-z0-9]+$/);

      // Sign something with the private key
      const signature = await userIdentity.signer.sign('important message');
      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');

      // Verify with public key
      const isValid = await userIdentity.key.verify('important message', signature);
      expect(isValid).toBe(true);
    });

    it('should support SuperKey evolution pattern', async () => {
      // SuperKey: Key that evolved with Signer and DID capabilities
      const signer = Signer.generate('ed25519');
      expect(signer).toBeDefined();
      if (!signer) return;
      
      const superKey = Key.createFromSigner(signer, { purpose: 'superkey' });
      expect(superKey).toBeDefined();
      if (!superKey) return;

      // SuperKey can now do everything: sign, verify, generate DIDs
      const signature = await superKey.sign('hello world');
      expect(signature).toBeDefined();
      
      const isValid = await superKey.verify('hello world', signature);
      expect(isValid).toBe(true);

      // Learn DID capabilities (for inspection and teaching to other units)
      const did = DID.create();
      superKey.learn([did.teach()]);

      // SuperKey now has learned DID capabilities
      expect(superKey.capableOf('generate')).toBe(true);
      
      // For actual DID generation, create a DID unit and teach it our key info
      const didUnit = DID.create();
      didUnit.learn([superKey.teach()]); // DID learns key capabilities from SuperKey
      const identity = await didUnit.generate({ method: 'key' });
      expect(identity).toMatch(/^did:key:z[A-Za-z0-9]+$/);
      expect(superKey.canSign()).toBe(true);
      expect(superKey.capabilities().length).toBeGreaterThan(5);
    });
  });

  describe('Correct API Methods', () => {
    it('should use correct Signer API', () => {
      // Correct: Signer.generate() - static factory method
      const signer = Signer.generate('ed25519');
      expect(signer).toBeDefined();
      if (!signer) return;
      
      // Correct: synchronous getPublicKey()
      const publicKey = signer.getPublicKey();
      expect(publicKey).toBeDefined();
      expect(typeof publicKey).toBe('string');
    });

    it('should use correct Key API', () => {
      const signer = Signer.generate('ed25519');
      expect(signer).toBeDefined();
      if (!signer) return;

      // Correct: Key.createFromSigner() - creates key from existing signer
      const key = Key.createFromSigner(signer, { purpose: 'test' });
      expect(key).toBeDefined();
      if (!key) return;
      expect(key.canSign()).toBe(true);
    });

    it('should demonstrate proper error handling', () => {
      // Test error handling
      expect(() => {
        const signer = Signer.generate('ed25519');
        if (!signer) throw new Error('Failed to generate signer');
        
        const key = Key.createFromSigner(signer, { purpose: 'test' });
        if (!key) throw new Error('Failed to create key from signer');
        
        // This should not throw
        expect(key.canSign()).toBe(true);
      }).not.toThrow();
    });
  });

  describe('Integration Patterns', () => {
    it('should work with direct generateKeyPair integration', async () => {
      // This would need @synet/keys generateKeyPair function
      // For now, test the pattern structure
      const signer = Signer.generate('ed25519');
      if (!signer) return;
      
      const publicKey = signer.getPublicKey();
      const keyType = signer.getAlgorithm();

      const unit = DID.createFromKey(publicKey, keyType);
      const did = await unit.generate({ method: 'key' });
      
      expect(did).toMatch(/^did:key:z[A-Za-z0-9]+$/);
    });

    it('should work with mixed approach', async () => {
      // Simulate key pair object
      const tempSigner = Signer.generate('ed25519');
      if (!tempSigner) return;
      
      const keyPair = {
        publicKey: tempSigner.getPublicKey(),
        type: 'ed25519'
      };

      const did = await DID.create().generate({
        method: 'key',
        publicKey: keyPair.publicKey,
        keyType: keyPair.type
      });

      expect(did).toMatch(/^did:key:z[A-Za-z0-9]+$/);
    });
  });
});

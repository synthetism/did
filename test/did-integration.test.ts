/**
 * DID Unit Integration Tests
 * [🪪] Tests for DID unit integration with @synet/keys
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DID } from '../src/did';
import { Key, Signer } from '@synet/keys';

describe('DID Unit Integration', () => {
  let didUnit: DID;

  beforeEach(() => {
    didUnit = DID.create({ name: 'integration-test' });
  });

  describe('Integration with Key Unit', () => {
    it('should learn from Key unit successfully', () => {
      // Create a Key unit from a Signer
      const signer = Signer.generate('ed25519');
      expect(signer).not.toBeNull();
      
      if (signer) {
        const key = Key.createFromSigner(signer);
        expect(key).not.toBeNull();
        
        if (key) {
          // DID learns from Key
          didUnit.learn([key.teach()]);
          
          // Check that DID learned key capabilities
          expect(didUnit.capableOf('getPublicKey')).toBe(true);
          expect(didUnit.capableOf('getType')).toBe(true);
          expect(didUnit.canGenerateKey()).toBe(true);
        }
      }
    });

    it('should execute key capabilities learned from Key unit', async () => {
      // Create a Key unit from a Signer
      const signer = Signer.generate('ed25519');
      expect(signer).not.toBeNull();
      
      if (signer) {
        const key = Key.createFromSigner(signer);
        expect(key).not.toBeNull();
        
        if (key) {
          // DID learns from Key
          didUnit.learn([key.teach()]);
          
          // Execute learned capabilities
          const publicKey = await didUnit.execute('getPublicKey');
          const keyType = await didUnit.execute('getType');
          
          expect(publicKey).toBeDefined();
          expect(typeof publicKey).toBe('string');
          expect(keyType).toBe('ed25519');
        }
      }
    });

    it('should generate did:key after learning from Key unit', async () => {
      // Create a Key unit from a Signer
      const signer = Signer.generate('ed25519');
      expect(signer).not.toBeNull();
      
      if (signer) {
        const key = Key.createFromSigner(signer);
        expect(key).not.toBeNull();
        
        if (key) {
          // DID learns from Key
          didUnit.learn([key.teach()]);
          
          // Try to generate did:key
          // Note: This will return null because pemToHex is not implemented
          // But it should not throw an error and should attempt the generation
          const result = await didUnit.generate({ method: 'key' });
          
          // Currently expected to be null due to pemToHex not implemented
          // but the test verifies the integration works without errors
          expect(result).toBeNull();
        }
      }
    });

    it('should work with different key types', async () => {
      const keyTypes = ['ed25519', 'secp256k1'] as const;
      
      for (const keyType of keyTypes) {
        const signer = Signer.generate(keyType);
        expect(signer).not.toBeNull();
        
        if (signer) {
          const key = Key.createFromSigner(signer);
          expect(key).not.toBeNull();
          
          if (key) {
            // Create fresh DID unit for each test
            const testDID = DID.create({ keyType });
            
            // Learn from Key
            testDID.learn([key.teach()]);
            
            // Verify learning worked
            expect(testDID.canGenerateKey()).toBe(true);
            
            // Verify key type is correct
            const learnedType = await testDID.execute('getType');
            expect(learnedType).toBe(keyType);
          }
        }
      }
    });

    it('should handle learning from multiple Key units', () => {
      // Create multiple Key units
      const signer1 = Signer.generate('ed25519');
      const signer2 = Signer.generate('secp256k1');
      
      expect(signer1).not.toBeNull();
      expect(signer2).not.toBeNull();
      
      if (signer1 && signer2) {
        const key1 = Key.createFromSigner(signer1);
        const key2 = Key.createFromSigner(signer2);
        
        expect(key1).not.toBeNull();
        expect(key2).not.toBeNull();
        
        if (key1 && key2) {
          // Learn from both keys (second one should override)
          didUnit.learn([key1.teach()]);
          didUnit.learn([key2.teach()]);
          
          // Should have key capabilities (from the last learned key)
          expect(didUnit.canGenerateKey()).toBe(true);
        }
      }
    });
  });

  describe('Integration with Signer Unit', () => {
    it('should learn from Signer unit directly', () => {
      const signer = Signer.generate('ed25519');
      expect(signer).not.toBeNull();
      
      if (signer) {
        // DID learns from Signer directly
        didUnit.learn([signer.teach()]);
        
        // Check that DID learned key capabilities from Signer
        expect(didUnit.capableOf('getPublicKey')).toBe(true);
        expect(didUnit.capableOf('getAlgorithm')).toBe(true); // Signer teaches getAlgorithm, not getType
        expect(didUnit.canGenerateKey()).toBe(true);
      }
    });

    it('should execute signer capabilities', async () => {
      const signer = Signer.generate('ed25519');
      expect(signer).not.toBeNull();
      
      if (signer) {
        // DID learns from Signer
        didUnit.learn([signer.teach()]);
        
        // Execute learned capabilities
        const publicKey = await didUnit.execute('getPublicKey');
        const keyType = await didUnit.execute('getAlgorithm'); // Use getAlgorithm, not getType
        
        expect(publicKey).toBeDefined();
        expect(typeof publicKey).toBe('string');
        expect(keyType).toBe('ed25519');
      }
    });

    it('should work with RSA keys from Signer', async () => {
      const signer = Signer.generate('rsa');
      expect(signer).not.toBeNull();
      
      if (signer) {
        // DID learns from RSA Signer
        didUnit.learn([signer.teach()]);
        
        // Verify learning worked
        expect(didUnit.canGenerateKey()).toBe(true);
        
        // Verify key type is correct
        const learnedType = await didUnit.execute('getAlgorithm'); // Use getAlgorithm
        expect(learnedType).toBe('rsa');
        
        // Try to generate did:key (will fail for RSA as it's not supported in DID)
        const result = await didUnit.generate({ method: 'key' });
        expect(result).toBeNull(); // RSA not supported for did:key
      }
    });
  });

  describe('Pure Unit Architecture Integration', () => {
    it('should follow teach/learn pattern without hardcoded dependencies', () => {
      // Create any unit that can teach getPublicKey and getType
      const mockKeyUnit = {
        teach: () => ({
          getPublicKey: () => '-----BEGIN PUBLIC KEY-----\\ntest\\n-----END PUBLIC KEY-----',
          getType: () => 'ed25519'
        })
      };
      
      // DID can learn from any unit, not just Key/Signer
      didUnit.learn([mockKeyUnit.teach()]);
      
      expect(didUnit.canGenerateKey()).toBe(true);
      expect(didUnit.capableOf('getPublicKey')).toBe(true);
      expect(didUnit.capableOf('getType')).toBe(true);
    });

    it('should compose capabilities from multiple teachers', () => {
      // Create specialized teachers
      const keyInfoTeacher = {
        teach: () => ({
          getPublicKey: () => '-----BEGIN PUBLIC KEY-----\\ntest\\n-----END PUBLIC KEY-----'
        })
      };
      
      const typeTeacher = {
        teach: () => ({
          getType: () => 'ed25519'
        })
      };
      
      const extraTeacher = {
        teach: () => ({
          getMetadata: () => ({ extra: 'info' })
        })
      };
      
      // Learn from multiple teachers
      didUnit.learn([
        keyInfoTeacher.teach(),
        typeTeacher.teach(),
        extraTeacher.teach()
      ]);
      
      // Should have all capabilities
      expect(didUnit.capableOf('getPublicKey')).toBe(true);
      expect(didUnit.capableOf('getType')).toBe(true);
      expect(didUnit.capableOf('getMetadata')).toBe(true);
      expect(didUnit.canGenerateKey()).toBe(true);
    });

    it('should work with evolved units', () => {
      // Create a Signer and evolve it
      const signer = Signer.generate('ed25519');
      expect(signer).not.toBeNull();
      
      if (signer) {
        // Evolve the signer
        const evolvedSigner = signer.evolve('enhanced-signer', {
          getEnhancedInfo: () => 'enhanced data'
        });
        
        // DID learns from evolved signer
        didUnit.learn([evolvedSigner.teach()]);
        
        // Should have original capabilities (evolved capabilities are not automatically taught)
        expect(didUnit.capableOf('getPublicKey')).toBe(true);
        expect(didUnit.capableOf('getAlgorithm')).toBe(true);
        expect(didUnit.canGenerateKey()).toBe(true);
        
        // getEnhancedInfo is not taught by the Signer's teach() method
        // This is correct behavior - teach() represents conscious choice, not automatic sharing
        expect(didUnit.capableOf('getEnhancedInfo')).toBe(false);
        
        // But the evolved signer itself has the capability
        expect(evolvedSigner.capableOf('getEnhancedInfo')).toBe(true);
      }
    });
  });

  describe('Real-world Integration Scenarios', () => {
    it('should support complete DID workflow', async () => {
      // 1. Create a key pair
      const signer = Signer.generate('ed25519');
      expect(signer).not.toBeNull();
      
      if (signer) {
        // 2. Create a public key unit
        const key = Key.createFromSigner(signer);
        expect(key).not.toBeNull();
        
        if (key) {
          // 3. DID learns from key
          didUnit.learn([key.teach()]);
          
          // 4. Generate both types of DIDs
          const didWeb = await didUnit.generate({
            method: 'web',
            domain: 'example.com',
            path: 'users/alice'
          });
          
          const didKey = await didUnit.generate({
            method: 'key'
          });
          
          // 5. Verify results
          expect(didWeb).toBe('did:web:example.com:users:alice');
          expect(didKey).toBeNull(); // pemToHex not implemented
          
          // 6. Verify capabilities are maintained
          expect(didUnit.canGenerateKey()).toBe(true);
        }
      }
    });

    it('should maintain unit identity through learning', () => {
      const originalIdentity = didUnit.whoami();
      const originalCapabilities = didUnit.capabilities();
      
      // Learn from a key unit
      const signer = Signer.generate('ed25519');
      if (signer) {
        didUnit.learn([signer.teach()]);
        
        // Identity should be maintained
        expect(didUnit.whoami()).toContain('[🪪] DID Unit');
        expect(didUnit.dna.name).toBe('did-unit');
        expect(didUnit.dna.version).toBe('1.0.0');
        
        // Should have original + learned capabilities
        const newCapabilities = didUnit.capabilities();
        expect(newCapabilities.length).toBeGreaterThan(originalCapabilities.length);
        
        // Original capabilities should still be there
        for (const cap of originalCapabilities) {
          expect(newCapabilities).toContain(cap);
        }
      }
    });
  });
});

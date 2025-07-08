/**
 * Unit 1.0.4 Integration Tests for DID Unit
 * 
 * These tests verify that the DID unit is fully compatible with 
 * the Unit 1.0.4 architecture, focusing on:
 * - TeachingContract format
 * - Namespaced capabilities
 * - Proper teach/learn patterns
 * - ID-based unit identification
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DID } from '../src/did';
import { Signer } from '@synet/keys';
import type { TeachingContract } from '@synet/unit';

describe('DID Unit - Unit 1.0.4 Integration', () => {
  let didUnit: DID;
  let signer: Signer;

  beforeEach(() => {
    didUnit = DID.create();
    const generatedSigner = Signer.generate('ed25519');
    if (!generatedSigner) {
      throw new Error('Failed to generate signer');
    }
    signer = generatedSigner;
  });

  describe('Core Unit 1.0.4 Compatibility', () => {
    it('should have correct DNA with id field', () => {
      expect(didUnit.dna).toBeDefined();
      expect(didUnit.dna.id).toBe('did-unit');
      expect(didUnit.dna.version).toBe('1.0.0');
      expect(didUnit.dna.id).not.toBe(undefined);
      expect(didUnit.dna.id).not.toBe('name'); // Not the old 'name' field
    });

    it('should return proper TeachingContract format', () => {
      const contract = didUnit.teach();
      
      // Unit 1.0.4 contract structure
      expect(contract).toHaveProperty('unitId');
      expect(contract).toHaveProperty('capabilities');
      expect(contract.unitId).toBe('did-unit');
      expect(typeof contract.capabilities).toBe('object');
      
      // Should have core DID capabilities
      expect(contract.capabilities).toHaveProperty('generate');
      expect(contract.capabilities).toHaveProperty('generateKey');
      expect(contract.capabilities).toHaveProperty('generateWeb');
      expect(contract.capabilities).toHaveProperty('canGenerateKey');
      expect(contract.capabilities).toHaveProperty('toJSON');
      
      // All capabilities should be functions
      for (const cap of Object.values(contract.capabilities)) {
        expect(typeof cap).toBe('function');
      }
    });

    it('should learn from TeachingContract format', () => {
      const mockContract: TeachingContract = {
        unitId: 'test-key-unit',
        capabilities: {
          getPublicKey: () => 'test-public-key',
          getKeyType: () => 'ed25519'
        }
      };

      // Learn from contract
      didUnit.learn([mockContract]);

      // Should have learned capabilities with namespacing
      expect(didUnit.can('test-key-unit.getPublicKey')).toBe(true);
      expect(didUnit.can('test-key-unit.getKeyType')).toBe(true);
      
      // Should also have direct capabilities for internal use
      expect(didUnit.can('getPublicKey')).toBe(true);
      expect(didUnit.can('getKeyType')).toBe(true);
    });

    it('should execute namespaced capabilities', async () => {
      const mockContract: TeachingContract = {
        unitId: 'test-key-unit',
        capabilities: {
          getPublicKey: () => 'test-public-key-value',
          getKeyType: () => 'ed25519'
        }
      };

      didUnit.learn([mockContract]);

      // Execute namespaced capabilities
      const publicKey = await didUnit.execute('test-key-unit.getPublicKey');
      const keyType = await didUnit.execute('test-key-unit.getKeyType');

      expect(publicKey).toBe('test-public-key-value');
      expect(keyType).toBe('ed25519');
    });
  });

  describe('Real Signer Integration', () => {
    it('should learn from real Signer unit', () => {
      const signerContract = signer.teach();
      
      // Verify signer provides proper contract
      expect(signerContract.unitId).toBe('signer-unit');
      expect(signerContract.capabilities).toHaveProperty('getPublicKey');
      expect(signerContract.capabilities).toHaveProperty('getKeyType');
      
      // Learn from signer
      didUnit.learn([signerContract]);
      
      // Should have learned capabilities
      expect(didUnit.can('signer-unit.getPublicKey')).toBe(true);
      expect(didUnit.can('signer-unit.getKeyType')).toBe(true);
      expect(didUnit.can('getPublicKey')).toBe(true);
      expect(didUnit.can('getKeyType')).toBe(true);
      
      // Should be able to generate keys
      expect(didUnit.canGenerateKey()).toBe(true);
    });

    it('should execute real signer capabilities', async () => {
      const signerContract = signer.teach();
      didUnit.learn([signerContract]);

      // Execute learned capabilities
      const publicKey = await didUnit.execute('signer-unit.getPublicKey') as string;
      const keyType = await didUnit.execute('signer-unit.getKeyType') as string;

      expect(typeof publicKey).toBe('string');
      expect(publicKey.length).toBeGreaterThan(0);
      expect(keyType).toBe('ed25519');
    });

    it('should generate DID after learning from signer', async () => {
      const signerContract = signer.teach();
      didUnit.learn([signerContract]);

      // Generate DID using learned capabilities
      const did = await didUnit.generate({ method: 'key' });

      expect(did).toBeTruthy();
      expect(typeof did).toBe('string');
      expect(did).toMatch(/^did:key:z[A-Za-z0-9]+$/);
    });
  });

  describe('Multiple Unit Learning', () => {
    it('should learn from multiple units', () => {
      const signer1 = Signer.generate('ed25519');
      const signer2 = Signer.generate('secp256k1');
      
      if (!signer1 || !signer2) {
        throw new Error('Failed to generate signers');
      }
      
      const contract1 = signer1.teach();
      const contract2 = signer2.teach();
      
      // Learn from both
      didUnit.learn([contract1, contract2]);
      
      // Should have capabilities from both units
      expect(didUnit.can('signer-unit.getPublicKey')).toBe(true);
      expect(didUnit.can('signer-unit.getKeyType')).toBe(true);
      
      // Last learned should win for direct capabilities
      expect(didUnit.canGenerateKey()).toBe(true);
    });

    it('should handle capability conflicts by overwriting', () => {
      const mockContract1: TeachingContract = {
        unitId: 'unit1',
        capabilities: {
          getPublicKey: () => 'key1',
          getKeyType: () => 'ed25519'
        }
      };

      const mockContract2: TeachingContract = {
        unitId: 'unit2',
        capabilities: {
          getPublicKey: () => 'key2',
          getKeyType: () => 'secp256k1'
        }
      };

      didUnit.learn([mockContract1, mockContract2]);

      // Should have both namespaced capabilities
      expect(didUnit.can('unit1.getPublicKey')).toBe(true);
      expect(didUnit.can('unit2.getPublicKey')).toBe(true);
      
      // Direct capabilities should use the last learned
      expect(didUnit.can('getPublicKey')).toBe(true);
      expect(didUnit.can('getKeyType')).toBe(true);
    });
  });

  describe('Unit Architecture Patterns', () => {
    it('should support composition pattern', () => {
      // Create specialized teaching units
      const keyProvider: TeachingContract = {
        unitId: 'key-provider',
        capabilities: {
          getPublicKey: () => '-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...\n-----END PUBLIC KEY-----'
        }
      };

      const typeProvider: TeachingContract = {
        unitId: 'type-provider',
        capabilities: {
          getKeyType: () => 'ed25519'
        }
      };

      // Compose capabilities
      didUnit.learn([keyProvider, typeProvider]);

      expect(didUnit.can('key-provider.getPublicKey')).toBe(true);
      expect(didUnit.can('type-provider.getKeyType')).toBe(true);
      expect(didUnit.canGenerateKey()).toBe(true);
    });

    it('should maintain unit identity through learning', () => {
      const originalId = didUnit.dna.id;
      const originalVersion = didUnit.dna.version;
      
      // Learn from signer
      const signerContract = signer.teach();
      didUnit.learn([signerContract]);
      
      // Identity should remain unchanged
      expect(didUnit.dna.id).toBe(originalId);
      expect(didUnit.dna.version).toBe(originalVersion);
      expect(didUnit.whoami()).toContain('did-unit');
    });

    it('should support evolution pattern', () => {
      // Learn capabilities
      const signerContract = signer.teach();
      didUnit.learn([signerContract]);

      // Evolve unit
      const evolvedUnit = didUnit.evolve('enhanced-did-unit', {
        customCapability: () => 'enhanced'
      });

      // Should have evolved DNA
      expect(evolvedUnit.dna.id).toBe('enhanced-did-unit');
      expect(evolvedUnit.dna.parent).toBeDefined();
      expect(evolvedUnit.dna.parent?.id).toBe('did-unit');
      
      // Should retain learned capabilities
      expect(evolvedUnit.can('getPublicKey')).toBe(true);
      expect(evolvedUnit.can('customCapability')).toBe(true);
    });
  });

  describe('Web DID Generation', () => {
    it('should generate did:web without learning', () => {
      // Web DIDs don't require key learning
      const webDid = didUnit.generateWeb('example.com');
      
      expect(webDid).toBe('did:web:example.com');
      expect(didUnit.canGenerateKey()).toBe(false); // Still can't generate key DIDs
    });

    it('should generate did:web with path', () => {
      const webDid = didUnit.generateWeb('example.com', 'users/alice');
      
      expect(webDid).toBe('did:web:example.com:users:alice');
    });

    it('should support web DID through generate method', async () => {
      const webDid = await didUnit.generate({
        method: 'web',
        domain: 'example.com',
        path: 'users/bob'
      });

      expect(webDid).toBe('did:web:example.com:users:bob');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing capabilities gracefully', async () => {
      // No learning, should fail gracefully
      const did = await didUnit.generate({ method: 'key' });
      
      expect(did).toBeNull();
      expect(didUnit.canGenerateKey()).toBe(false);
    });

    it('should handle malformed teaching contracts', () => {
      const badContract = {
        unitId: 'bad-unit',
        // Missing capabilities
      } as TeachingContract;

      // Should not crash
      expect(() => didUnit.learn([badContract])).not.toThrow();
      expect(didUnit.canGenerateKey()).toBe(false);
    });

    it('should handle null/undefined in learning', () => {
      const contracts = [null, undefined, signer.teach()] as TeachingContract[];
      
      // Should handle nulls gracefully
      expect(() => didUnit.learn(contracts)).not.toThrow();
      expect(didUnit.canGenerateKey()).toBe(true); // From the valid signer contract
    });
  });

  describe('Unit Metadata and Inspection', () => {
    it('should provide unit information', () => {
      const info = didUnit.toJSON();
      
      expect(info).toHaveProperty('id');
      expect(info).toHaveProperty('type', 'did-unit');
      expect(info).toHaveProperty('canGenerateKey');
      expect(info).toHaveProperty('learnedCapabilities');
      
      expect(Array.isArray(info.learnedCapabilities)).toBe(true);
    });

    it('should update capabilities list after learning', () => {
      const initialCapabilities = didUnit.capabilities();
      
      const signerContract = signer.teach();
      didUnit.learn([signerContract]);
      
      const updatedCapabilities = didUnit.capabilities();
      
      expect(updatedCapabilities.length).toBeGreaterThan(initialCapabilities.length);
      expect(updatedCapabilities).toContain('getPublicKey');
      expect(updatedCapabilities).toContain('getKeyType');
    });

    it('should provide help information', () => {
      // Should not throw
      expect(() => didUnit.help()).not.toThrow();
    });
  });
});

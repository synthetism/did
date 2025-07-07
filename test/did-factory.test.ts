/**
 * DID Unit Factory Methods Tests
 * [🪪] Tests for new static factory methods and direct key input
 */

import { describe, it, expect } from 'vitest';
import { DID } from '../src/did';
import { generateKeyPair } from '@synet/keys';

describe('DID Unit Factory Methods', () => {
  
  describe('createFromKey', () => {
    it('should create DID unit from direct key input', () => {
      const testPublicKey = 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab';
      const testKeyType = 'ed25519';
      
      const unit = DID.createFromKey(testPublicKey, testKeyType);
      
      expect(unit).toBeDefined();
      expect(unit.created).toBe(true);
      expect(unit.error).toBeUndefined();
    });

    it('should create DID unit with metadata', () => {
      const testPublicKey = 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab';
      const testKeyType = 'ed25519';
      const meta = { purpose: 'direct-key-test' };
      
      const unit = DID.createFromKey(testPublicKey, testKeyType, meta);
      
      expect(unit).toBeDefined();
      expect(unit.created).toBe(true);
      expect(unit.metadata).toEqual(meta);
    });

    it('should work with different key types', () => {
      const testKeys = [
        { key: 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab', type: 'ed25519' },
        { key: 'bcde2345678901bcdef2345678901bcdef2345678901bcdef2345678901bcde', type: 'secp256k1' },
        { key: 'cdef3456789012cdef3456789012cdef3456789012cdef3456789012cdef', type: 'x25519' }
      ];

      for (const { key, type } of testKeys) {
        const unit = DID.createFromKey(key, type);
        expect(unit).toBeDefined();
        expect(unit.created).toBe(true);
      }
    });
  });

  describe('createFromKeyPair', () => {
    it('should create DID unit from key pair object', () => {
      const keyPair = {
        publicKey: 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        type: 'ed25519'
      };
      
      const unit = DID.createFromKeyPair(keyPair);
      
      expect(unit).toBeDefined();
      expect(unit.created).toBe(true);
      expect(unit.error).toBeUndefined();
    });

    it('should create DID unit with metadata from key pair', () => {
      const keyPair = {
        publicKey: 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
        type: 'ed25519'
      };
      const meta = { source: 'key-pair-factory' };
      
      const unit = DID.createFromKeyPair(keyPair, meta);
      
      expect(unit).toBeDefined();
      expect(unit.created).toBe(true);
      expect(unit.metadata).toEqual(meta);
    });

    it('should work with generated key pairs', () => {
      const keyPair = generateKeyPair('ed25519');
      
      // Create a compatible object for the factory method
      const keyPairObj = {
        publicKey: keyPair.publicKey,
        type: keyPair.type
      };
      
      const unit = DID.createFromKeyPair(keyPairObj);
      
      expect(unit).toBeDefined();
      expect(unit.created).toBe(true);
    });
  });

  describe('Direct Key DID Generation', () => {
    it('should generate did:key from direct key input (hex)', async () => {
      const testPublicKey = 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab';
      const testKeyType = 'ed25519';
      
      const unit = DID.createFromKey(testPublicKey, testKeyType);
      const did = await unit.generate({ method: 'key' });
      
      expect(did).toBeTruthy();
      expect(did).toMatch(/^did:key:z6Mk[A-Za-z0-9]+$/);
    });

    it('should generate did:key from key pair object', async () => {
      const keyPair = generateKeyPair('ed25519');
      const keyPairObj = {
        publicKey: keyPair.publicKey,
        type: keyPair.type
      };
      
      const unit = DID.createFromKeyPair(keyPairObj);
      const did = await unit.generate({ method: 'key' });
      
      expect(did).toBeTruthy();
      expect(did).toMatch(/^did:key:z6Mk[A-Za-z0-9]+$/);
    });

    it('should handle PEM format keys', async () => {
      const keyPair = generateKeyPair('ed25519');
      
      const unit = DID.createFromKey(keyPair.publicKey, keyPair.type);
      const did = await unit.generate({ method: 'key' });
      
      expect(did).toBeTruthy();
      expect(did).toMatch(/^did:key:z6Mk[A-Za-z0-9]+$/);
    });

    it('should work without options when created from key', async () => {
      const testPublicKey = 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab';
      const testKeyType = 'ed25519';
      
      const unit = DID.createFromKey(testPublicKey, testKeyType);
      
      // Should work with just generateKey() - no options needed
      const did = await unit.generateKey();
      
      expect(did).toBeTruthy();
      expect(did).toMatch(/^did:key:z6Mk[A-Za-z0-9]+$/);
    });

    it('should report canGenerateKey as true when created from key', () => {
      const testPublicKey = 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab';
      const testKeyType = 'ed25519';
      
      const unit = DID.createFromKey(testPublicKey, testKeyType);
      
      expect(unit.canGenerateKey()).toBe(true);
    });
  });

  describe('Usage Patterns', () => {
    it('should support simple usage pattern', async () => {
      // Pattern 1: Direct key creation and generation
      const keyPair = generateKeyPair('ed25519');
      const unit = DID.createFromKey(keyPair.publicKey, keyPair.type);
      const did = await unit.generate({ method: 'key' });
      
      expect(did).toBeTruthy();
      expect(did).toMatch(/^did:key:z6Mk[A-Za-z0-9]+$/);
    });

    it('should support key pair pattern', async () => {
      // Pattern 2: Key pair object
      const keyPair = generateKeyPair('ed25519');
      const keyPairObj = { publicKey: keyPair.publicKey, type: keyPair.type };
      const unit = DID.createFromKeyPair(keyPairObj);
      const did = await unit.generate({ method: 'key' });
      
      expect(did).toBeTruthy();
      expect(did).toMatch(/^did:key:z6Mk[A-Za-z0-9]+$/);
    });

    it('should support mixed patterns in same test', async () => {
      // Pattern 3: Direct options (existing pattern still works)
      const keyPair = generateKeyPair('ed25519');
      const unit = DID.create();
      const did = await unit.generate({
        method: 'key',
        publicKey: keyPair.publicKey,
        keyType: keyPair.type
      });
      
      expect(did).toBeTruthy();
      expect(did).toMatch(/^did:key:z6Mk[A-Za-z0-9]+$/);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid key formats gracefully', async () => {
      const unit = DID.createFromKey('invalid-key-format', 'ed25519');
      const did = await unit.generate({ method: 'key' });
      
      expect(did).toBeNull();
      expect(unit.created).toBe(true); // Unit is still valid, just can't generate DID
    });

    it('should handle unsupported key types', async () => {
      const testPublicKey = 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab';
      const unit = DID.createFromKey(testPublicKey, 'unsupported-type');
      const did = await unit.generate({ method: 'key' });
      
      expect(did).toBeNull();
    });

    it('should handle empty keys', async () => {
      const unit = DID.createFromKey('', 'ed25519');
      const did = await unit.generate({ method: 'key' });
      
      expect(did).toBeNull();
    });
  });

  describe('Identity and Capabilities', () => {
    it('should report correct identity when created from key', () => {
      const testPublicKey = 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab';
      const unit = DID.createFromKey(testPublicKey, 'ed25519');
      
      const identity = unit.whoami();
      expect(identity).toContain('ready to generate DIDs');
    });

    it('should list same capabilities as regular DID unit', () => {
      const testPublicKey = 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab';
      const unit = DID.createFromKey(testPublicKey, 'ed25519');
      const regularUnit = DID.create();
      
      expect(unit.capabilities().sort()).toEqual(regularUnit.capabilities().sort());
    });

    it('should teach same capabilities', () => {
      const testPublicKey = 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab';
      const unit = DID.createFromKey(testPublicKey, 'ed25519');
      
      const teachings = unit.teach();
      expect(teachings).toHaveProperty('generate');
      expect(teachings).toHaveProperty('generateKey');
      expect(teachings).toHaveProperty('generateWeb');
      expect(teachings).toHaveProperty('canGenerateKey');
      expect(teachings).toHaveProperty('toJSON');
    });
  });
});

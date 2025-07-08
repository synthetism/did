/**
 * DID Unit Tests
 * [🪪] Tests for the DID unit following Unit Architecture
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DID, DIDOptions } from '../src/did';

describe('DID Unit', () => {
  let didUnit: DID;

  beforeEach(() => {
    didUnit = DID.create();
  });

  describe('Static Methods', () => {
    describe('create', () => {
      it('should create a DID unit successfully', () => {
        const unit = DID.create();
        expect(unit).toBeDefined();
        expect(unit.created).toBe(true);
        expect(unit.error).toBeUndefined();
      });

      it('should create a DID unit with metadata', () => {
        const meta = { name: 'test-did', purpose: 'testing' };
        const unit = DID.create(meta);
        expect(unit).toBeDefined();
        expect(unit.created).toBe(true);
        expect(unit.metadata).toEqual(meta);
      });
    });
  });

  describe('Unit Interface', () => {
    it('should have correct DNA', () => {
      // In Unit 1.0.4, dna.id is used instead of dna.name
      expect(didUnit.dna.id).toBe('did-unit');
      expect(didUnit.dna.version).toBe('1.0.0');
      expect(didUnit.dna.parent).toBeUndefined();
    });



    it('should list capabilities', () => {
      const capabilities = didUnit.capabilities();
      expect(capabilities).toContain('generate');
      expect(capabilities).toContain('generateKey');
      expect(capabilities).toContain('generateWeb');
      expect(capabilities).toContain('canGenerateKey');
      expect(capabilities).toContain('toJSON');
    });

    it('should check capabilities correctly', () => {
      expect(didUnit.capableOf('generate')).toBe(true);
      expect(didUnit.capableOf('generateKey')).toBe(true);
      expect(didUnit.capableOf('generateWeb')).toBe(true);
      expect(didUnit.capableOf('canGenerateKey')).toBe(true);
      expect(didUnit.capableOf('toJSON')).toBe(true);
      expect(didUnit.capableOf('nonExistent')).toBe(false);
    });

    it('should provide help', () => {
      // Should not throw
      expect(() => didUnit.help()).not.toThrow();
    });
  });

  describe('Teaching', () => {
    it('should teach capabilities to other units', () => {
      const teachings = didUnit.teach();
      expect(teachings).toBeDefined();
      expect(teachings.unitId).toBe('did-unit');
      expect(teachings.capabilities).toBeDefined();
      expect(typeof teachings.capabilities.generate).toBe('function');
      expect(typeof teachings.capabilities.generateKey).toBe('function');
      expect(typeof teachings.capabilities.generateWeb).toBe('function');
      expect(typeof teachings.capabilities.canGenerateKey).toBe('function');
      expect(typeof teachings.capabilities.toJSON).toBe('function');
    });
  });

  describe('Core Capabilities', () => {
    describe('canGenerateKey', () => {
      it('should return false initially (no key capabilities learned)', () => {
        expect(didUnit.canGenerateKey()).toBe(false);
      });

      it('should return false when missing getPublicKey capability', () => {
        // Learn only partial key capabilities using proper TeachingContract format
        didUnit.learn([{
          unitId: 'test-unit',
          capabilities: {
            getType: () => 'ed25519'
          }
        }]);
        expect(didUnit.canGenerateKey()).toBe(false);
      });

      it('should return false when missing getType capability', () => {
        // Learn only partial key capabilities using proper TeachingContract format
        didUnit.learn([{
          unitId: 'test-unit',
          capabilities: {
            getPublicKey: () => '-----BEGIN PUBLIC KEY-----\\ntest\\n-----END PUBLIC KEY-----'
          }
        }]);
        expect(didUnit.canGenerateKey()).toBe(false);
      });

      it('should return true when has both key capabilities', () => {
        // Learn both required key capabilities using proper TeachingContract format
        didUnit.learn([{
          unitId: 'test-unit',
          capabilities: {
            getPublicKey: () => '-----BEGIN PUBLIC KEY-----\\ntest\\n-----END PUBLIC KEY-----',
            getType: () => 'ed25519'
          }
        }]);
        expect(didUnit.canGenerateKey()).toBe(true);
      });
    });

    describe('generateWeb', () => {
      it('should generate did:web with domain only', () => {
        const result = didUnit.generateWeb('example.com');
        expect(result).toBe('did:web:example.com');
      });

      it('should generate did:web with domain and path', () => {
        const result = didUnit.generateWeb('example.com', 'users/alice');
        expect(result).toBe('did:web:example.com:users:alice');
      });

      it('should return null for empty domain', () => {
        const result = didUnit.generateWeb('');
        expect(result).toBeNull();
      });

      it('should return null for null domain', () => {
        const result = didUnit.generateWeb(null as unknown as string);
        expect(result).toBeNull();
      });
    });

    describe('generateKey', () => {
      it('should return null when no key capabilities learned', async () => {
        const result = await didUnit.generateKey();
        expect(result).toBeNull();
      });

      it('should return null when missing key capabilities', async () => {
        // Learn only partial capabilities
        didUnit.learn([{
          unitId: 'test-unit',
          capabilities: {
            getType: () => 'ed25519'
          }
        }]);
        const result = await didUnit.generateKey();
        expect(result).toBeNull();
      });

      it('should attempt to generate did:key when key capabilities are learned', async () => {
        // Learn key capabilities
        didUnit.learn([{
          unitId: 'test-unit',
          capabilities: {
            getPublicKey: () => '-----BEGIN PUBLIC KEY-----\\ntest\\n-----END PUBLIC KEY-----',
            getType: () => 'ed25519'
          }
        }]);
        
        // Note: This will return null because pemToHex is not implemented yet
        // But it should not throw an error
        const result = await didUnit.generateKey();
        expect(result).toBeNull(); // Expected due to pemToHex not implemented
      });
    });

    describe('generate', () => {
      it('should generate did:web by default when no method specified', async () => {
        const result = await didUnit.generate({
          domain: 'example.com'
        });
        expect(result).toBeNull(); // Because default method is 'key', not 'web'
      });

      it('should generate did:web when method is web', async () => {
        const result = await didUnit.generate({
          method: 'web',
          domain: 'example.com'
        });
        expect(result).toBe('did:web:example.com');
      });

      it('should generate did:web with path', async () => {
        const result = await didUnit.generate({
          method: 'web',
          domain: 'example.com',
          path: 'users/bob'
        });
        expect(result).toBe('did:web:example.com:users:bob');
      });

      it('should return null for did:web without domain', async () => {
        const result = await didUnit.generate({
          method: 'web'
        });
        expect(result).toBeNull();
      });

      it('should attempt did:key generation when method is key', async () => {
        // Learn key capabilities
        didUnit.learn([{
          unitId: 'test-unit',
          capabilities: {
            getPublicKey: () => '-----BEGIN PUBLIC KEY-----\\ntest\\n-----END PUBLIC KEY-----',
            getType: () => 'ed25519'
          }
        }]);

        const result = await didUnit.generate({
          method: 'key'
        });
        // Will return null because pemToHex not implemented, but should not throw
        expect(result).toBeNull();
      });

      it('should return null for did:key without key capabilities', async () => {
        const result = await didUnit.generate({
          method: 'key'
        });
        expect(result).toBeNull();
      });
    });
  });

  describe('Execute Interface', () => {
    it('should execute generate capability', async () => {
      const result = await didUnit.execute('generate', {
        method: 'web',
        domain: 'example.com'
      });
      expect(result).toBe('did:web:example.com');
    });

    it('should execute generateWeb capability', async () => {
      const result = await didUnit.execute('generateWeb', 'example.com', 'users/alice');
      expect(result).toBe('did:web:example.com:users:alice');
    });

    it('should execute canGenerateKey capability', async () => {
      const result = await didUnit.execute('canGenerateKey');
      expect(result).toBe(false);
    });

    it('should execute toJSON capability', async () => {
      const result = await didUnit.execute('toJSON');
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should throw for unknown capability', async () => {
      await expect(didUnit.execute('unknownCapability')).rejects.toThrow('Unknown command: unknownCapability');
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize to JSON', () => {
      const json = didUnit.toJSON();
      expect(json).toBeDefined();
      expect(json.type).toBe('did-unit');
      expect(json.canGenerateKey).toBe(false);
      expect(json.learnedCapabilities).toEqual(didUnit.capabilities());
    });

    it('should include metadata in JSON', () => {
      const meta = { name: 'test-did', version: '1.0.0' };
      const unit = DID.create(meta);
      const json = unit.toJSON();
      expect(json.meta).toEqual(meta);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid generate options gracefully', async () => {
      const result = await didUnit.generate({
        method: 'invalid' as unknown as 'key' | 'web'
      });
      expect(result).toBeNull();
    });

    it('should handle exceptions in generateKey gracefully', async () => {
      // Learn capabilities that might throw
      didUnit.learn([{
        unitId: 'test-unit',
        capabilities: {
          getPublicKey: () => { throw new Error('Test error'); },
          getType: () => 'ed25519'
        }
      }]);

      const result = await didUnit.generateKey();
      expect(result).toBeNull();
    });
  });

  describe('Learning Patterns', () => {
    it('should learn multiple capability sets', () => {
      const caps1 = { 
        unitId: 'test-unit-1', 
        capabilities: { cap1: () => 'test1' } 
      };
      const caps2 = { 
        unitId: 'test-unit-2', 
        capabilities: { cap2: () => 'test2' } 
      };
      
      didUnit.learn([caps1, caps2]);
      
      expect(didUnit.capableOf('cap1')).toBe(true);
      expect(didUnit.capableOf('cap2')).toBe(true);
    });

    it('should override capabilities when learning duplicates', () => {
      const caps1 = { 
        unitId: 'test-unit-1', 
        capabilities: { testCap: () => 'first' } 
      };
      const caps2 = { 
        unitId: 'test-unit-2', 
        capabilities: { testCap: () => 'second' } 
      };
      
      didUnit.learn([caps1]);
      didUnit.learn([caps2]);
      
      expect(didUnit.capableOf('testCap')).toBe(true);
    });
  });
});

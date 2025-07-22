/**
 * DID Unit Tests
 * [🪪] Tests for the DID unit following Unit Architecture
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DID, DIDOptions } from '../src/did';

describe('DID Unit', () => {
  let didUnit: DID;

  beforeEach(() => {
    didUnit = DID.create({metadata: { name: 'test-did', purpose: 'testing' } });
  });

  describe('Static Methods', () => {
    describe('create', () => {
      it('should create a DID unit successfully', () => {
        const unit = DID.create({metadata: { name: 'test-did', purpose: 'testing' } });
        expect(unit).toBeDefined();

      });

      it('should create a DID unit with metadata', () => {
        const meta = { name: 'test-did', purpose: 'testing' };
        const unit = DID.create({metadata: meta });
        expect(unit).toBeDefined();

        expect(unit.metadata).toEqual(meta);
      });
    });
  });

  describe('Unit Interface', () => {
    it('should have correct DNA', () => {
      // In Unit 1.0.4, dna.id is used instead of dna.name
      expect(didUnit.dna.id).toBe('did');
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
      expect(teachings.unitId).toBe('did');
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

      it('should throw error for empty domain', () => {
        expect(() => didUnit.generateWeb('')).toThrow('Domain is required for did:web');
      });

      it('should throw error for null domain', () => {
        expect(() => didUnit.generateWeb(null as unknown as string)).toThrow('Domain is required for did:web');
      });
    });

    describe('generateKey', () => {
      it('should throw error when no key capabilities learned', async () => {
        await expect(didUnit.generateKey()).rejects.toThrow('Missing key capabilities');
      });

      it('should throw error when missing key capabilities', async () => {
        // Learn only partial capabilities
        didUnit.learn([{
          unitId: 'test-unit',
          capabilities: {
            getType: () => 'ed25519'
          }
        }]);
        await expect(didUnit.generateKey()).rejects.toThrow('Missing key capabilities');
      });

      it('should attempt to generate did:key when key capabilities are learned', async () => {
        // Learn key capabilities with valid hex key (like real usage)
        didUnit.learn([{
          unitId: 'test-unit',
          capabilities: {
            getPublicKey: () => 'd75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a',
            getType: () => 'ed25519'
          }
        }]);
        
        // This should successfully generate a DID
        const did = await didUnit.generateKey();
        expect(did).toBe('did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw');
      });
    });

    describe('generate', () => {
      it('should throw error when default method is key without capabilities', async () => {
        await expect(didUnit.generate({
          domain: 'example.com'
        })).rejects.toThrow('Missing key capabilities'); // Because default method is 'key'
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

      it('should throw error for did:web without domain', async () => {
        await expect(didUnit.generate({
          method: 'web'
        })).rejects.toThrow('Domain is required for did:web');
      });

      it('should attempt did:key generation when method is key', async () => {
        // Learn key capabilities with valid hex key
        didUnit.learn([{
          unitId: 'test-unit',
          capabilities: {
            getPublicKey: () => 'd75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a',
            getType: () => 'ed25519'
          }
        }]);

        // This should successfully generate a DID
        const did = await didUnit.generate({ method: 'key' });
        expect(did).toBe('did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw');
      });

      it('should throw error for did:key without key capabilities', async () => {
        await expect(didUnit.generate({
          method: 'key'
        })).rejects.toThrow('Missing key capabilities');
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
      expect(json.id).toBe('did');
      expect(json.canGenerateKey).toBe(false);
      expect(json.learnedCapabilities).toEqual(didUnit.capabilities());
    });

    it('should include metadata in JSON', () => {
      const meta = { name: 'test-did', version: '1.0.0' };
      const unit = DID.create({metadata: meta });
      const json = unit.toJSON();
      expect(json.metadata).toEqual(meta);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for invalid generate options', async () => {
      await expect(didUnit.generate({
        method: 'invalid' as unknown as 'key' | 'web'
      })).rejects.toThrow('Unsupported DID method: invalid');
    });

    it('should throw error when generateKey encounters exceptions', async () => {
      // Learn capabilities that might throw
      didUnit.learn([{
        unitId: 'test-unit',
        capabilities: {
          getPublicKey: () => { throw new Error('Test error'); },
          getType: () => 'ed25519'
        }
      }]);

      await expect(didUnit.generateKey()).rejects.toThrow('Test error');
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

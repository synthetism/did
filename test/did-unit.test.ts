/**
 * DID Unit Tests - Clean, simple implementation
 * Tests the streamlined DID unit without complex learning or PEM conversion
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DID, type DIDConfig, type DIDOptions } from '../src/did';
import type { KeyType } from '../src/create';

describe('DID Unit - Clean Implementation', () => {
  let validConfig: DIDConfig;
  let did: DID;

  beforeEach(() => {
    validConfig = {
      publicKeyHex: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
      keyType: 'ed25519-pub' as KeyType,
      metadata: { test: 'data' }
    };
    did = DID.create(validConfig);
  });

  describe('Static Methods', () => {
    describe('create()', () => {
      it('should create DID unit with valid hex key', () => {
        const result = DID.create(validConfig);
        
        expect(result).toBeInstanceOf(DID);
        expect(result.publicKeyHex).toBe(validConfig.publicKeyHex);
        expect(result.keyType).toBe(validConfig.keyType);
      });

      it('should normalize hex to lowercase', () => {
        const configWithUppercase = {
          ...validConfig,
          publicKeyHex: 'A1B2C3D4E5F6789012345678901234567890ABCDEF1234567890ABCDEF123456'
        };
        
        const result = DID.create(configWithUppercase);
        expect(result.publicKeyHex).toBe(configWithUppercase.publicKeyHex.toLowerCase());
      });

      it('should throw error for invalid hex format', () => {
        const invalidConfigs = [
          { publicKeyHex: 'invalid', keyType: 'ed25519-pub' as KeyType },
          { publicKeyHex: '123', keyType: 'ed25519-pub' as KeyType },
          { publicKeyHex: 'xyz', keyType: 'ed25519-pub' as KeyType },
        ];

        for (const config of invalidConfigs) {
          expect(() => DID.create(config)).toThrow();
        }
      });

      it('should handle metadata correctly', () => {
        const configWithMeta = {
          ...validConfig,
          metadata: { source: 'test', version: '1.0' }
        };
        
        const result = DID.create(configWithMeta);
        expect(result.metadata).toEqual(configWithMeta.metadata);
      });

      it('should work without metadata', () => {
        const { metadata, ...configWithoutMeta } = validConfig;
        const result = DID.create(configWithoutMeta);
        
        expect(result.metadata).toEqual({});
      });
    });

    describe('isHex()', () => {
      it('should validate correct hex strings', () => {
        const validHexStrings = [
          'abcdef123456',
          'ABCDEF123456',
          '0123456789abcdefABCDEF',
          '00',
          'ff'
        ];

        for (const hex of validHexStrings) {
          expect(DID.isHex(hex)).toBe(true);
        }
      });

      it('should reject invalid hex strings', () => {
        const invalidHexStrings = [
          'xyz',           // Invalid characters
          'abcdefg',       // Contains 'g'
          'abc',           // Odd length
          '',              // Empty
          '  ',            // Whitespace
          'ab cd',         // Contains space
          null,            // Null
          undefined,       // Undefined
          123              // Number
        ];

        for (const hex of invalidHexStrings) {
          expect(DID.isHex(hex as string)).toBe(false);
        }
      });

      it('should handle whitespace trimming', () => {
        expect(DID.isHex('  abcdef  ')).toBe(true);
        expect(DID.isHex('\nabcdef\n')).toBe(true);
        expect(DID.isHex('\tabcdef\t')).toBe(true);
      });
    });
  });

  describe('Instance Methods', () => {
    describe('generateKey()', () => {
      it('should generate did:key from stored data', () => {
        const result = did.generateKey();
        
        expect(result).toMatch(/^did:key:/);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(10);
      });

      it('should be deterministic (same input = same output)', () => {
        const result1 = did.generateKey();
        const result2 = did.generateKey();
        
        expect(result1).toBe(result2);
      });

      it('should work with different key types', () => {
        // Use correct key lengths for each type
        const testCases = [
          { keyType: 'ed25519-pub' as KeyType, hex: 'a'.repeat(64) }, // 32 bytes
          { keyType: 'secp256k1-pub' as KeyType, hex: 'b'.repeat(66) }, // 33 bytes 
          { keyType: 'x25519-pub' as KeyType, hex: 'c'.repeat(64) }, // 32 bytes
        ];
        
        for (const testCase of testCases) {
          const testDid = DID.create({
            publicKeyHex: testCase.hex,
            keyType: testCase.keyType
          });
          
          const result = testDid.generateKey();
          expect(result).toMatch(/^did:key:/);
        }
      });
    });

    describe('generateWeb()', () => {
      it('should generate did:web with domain only', () => {
        const result = did.generateWeb('example.com');
        
        expect(result).toBe('did:web:example.com');
      });

      it('should generate did:web with domain and path', () => {
        const result = did.generateWeb('example.com', 'users/alice');
        
        expect(result).toBe('did:web:example.com:users:alice');
      });

      it('should throw error for empty domain', () => {
        expect(() => did.generateWeb('')).toThrow('Domain is required for did:web');
        expect(() => did.generateWeb(null as unknown as string)).toThrow('Domain is required for did:web');
      });
    });

    describe('generate()', () => {
      it('should generate did:key by default', () => {
        const result = did.generate();
        
        expect(result).toMatch(/^did:key:/);
      });

      it('should generate did:key when method is "key"', () => {
        const result = did.generate({ method: 'key' });
        
        expect(result).toMatch(/^did:key:/);
      });

      it('should generate did:web when method is "web"', () => {
        const result = did.generate({ 
          method: 'web', 
          domain: 'example.com' 
        });
        
        expect(result).toBe('did:web:example.com');
      });

      it('should generate did:web with path', () => {
        const result = did.generate({ 
          method: 'web', 
          domain: 'example.com',
          path: 'users/alice'
        });
        
        expect(result).toBe('did:web:example.com:users:alice');
      });

      it('should throw error for web method without domain', () => {
        expect(() => did.generate({ method: 'web' })).toThrow('Domain is required for did:web');
      });

      it('should throw error for unsupported method', () => {
        expect(() => did.generate({ method: 'unsupported' as unknown as 'key' | 'web' })).toThrow('Unsupported DID method: unsupported');
      });
    });
  });

  describe('Unit Architecture Compliance', () => {

  

    describe('teach()', () => {
      it('should return valid TeachingContract', () => {
        const contract = did.teach();
        
        expect(contract).toHaveProperty('unitId');
        expect(contract).toHaveProperty('capabilities');
        expect(contract.unitId).toBe(did.id);
        
        const caps = contract.capabilities;
        expect(caps).toHaveProperty('generate');
        expect(caps).toHaveProperty('generateKey');
        expect(caps).toHaveProperty('generateWeb');
        expect(typeof caps.generate).toBe('function');
        expect(typeof caps.generateKey).toBe('function');
        expect(typeof caps.generateWeb).toBe('function');
      });

      it('should have working taught capabilities', () => {
        const contract = did.teach();
        const caps = contract.capabilities;
        
        // Test generate capability
        const didKey = caps.generate({ method: 'key' });
        expect(didKey).toMatch(/^did:key:/);
        
        // Test generateKey capability
        const didKey2 = caps.generateKey();
        expect(didKey2).toMatch(/^did:key:/);
        
        // Test generateWeb capability
        const didWeb = caps.generateWeb('example.com', 'users/alice');
        expect(didWeb).toBe('did:web:example.com:users:alice');
      });
    });

    describe('toJSON()', () => {
      it('should return complete unit information', () => {
        const json = did.toJSON();
        
        expect(json).toHaveProperty('id');
        expect(json).toHaveProperty('publicKeyHex');
        expect(json).toHaveProperty('keyType');
        expect(json).toHaveProperty('dna');
        expect(json).toHaveProperty('metadata');
        
        expect(json.id).toBe(did.id);
        expect(json.publicKeyHex).toBe(did.publicKeyHex);
        expect(json.keyType).toBe(did.keyType);
      });
    });

    describe('getters', () => {
      it('should provide correct property access', () => {
        expect(did.id).toBe('did');
        expect(did.publicKeyHex).toBe(validConfig.publicKeyHex);
        expect(did.keyType).toBe(validConfig.keyType);
        expect(did.metadata).toEqual(validConfig.metadata);
      });

      it('should return copy of metadata (immutability)', () => {
        const metadata1 = did.metadata;
        const metadata2 = did.metadata;
        
        expect(metadata1).toEqual(metadata2);
        expect(metadata1).not.toBe(metadata2); // Different references
      });
    });
  });

  describe('Edge Cases', () => {
    it('should reject minimal hex keys that are too short', () => {
      const minimalConfig = {
        publicKeyHex: '00',
        keyType: 'ed25519-pub' as KeyType
      };
      
      const unit = DID.create(minimalConfig);
      expect(() => unit.generateKey()).toThrow('Invalid key length');
    });

    it('should reject maximum length hex keys that are too long', () => {
      const longHex = 'a'.repeat(128); // 64 bytes, too long for ed25519
      const maximalConfig = {
        publicKeyHex: longHex,
        keyType: 'ed25519-pub' as KeyType
      };
      
      const unit = DID.create(maximalConfig);
      expect(() => unit.generateKey()).toThrow('Invalid key length');
    });

      it('should handle complex domain names', () => {
        const complexDomains = [
          'sub.example.com',
          'my-app.example-site.org',
        ];
        
        for (const domain of complexDomains) {
          const result = did.generate({ method: 'web', domain });
          expect(result).toBe(`did:web:${domain}`);
        }
      });    it('should handle complex paths', () => {
      const complexPaths = [
        'users/alice/profile',
        'api/v1/users',
        'deep/nested/path/structure'
      ];
      
      for (const path of complexPaths) {
        const result = did.generate({ 
          method: 'web', 
          domain: 'example.com',
          path 
        });
        expect(result).toBe(`did:web:example.com:${path.replace(/\//g, ':')}`);
      }
    });
  });

  describe('Immutability', () => {
    it('should maintain immutability of public properties', () => {
      // Test that public getters return consistent values
      const initialHex = did.publicKeyHex;
      const initialKeyType = did.keyType;
      
      // Verify they remain constant
      expect(did.publicKeyHex).toBe(initialHex);
      expect(did.keyType).toBe(initialKeyType);
      
      // Metadata should return new copies
      const metadata1 = did.metadata;
      const metadata2 = did.metadata;
      expect(metadata1).toEqual(metadata2);
      expect(metadata1).not.toBe(metadata2);
    });

    it('should return consistent results', () => {
      const results = Array.from({ length: 10 }, () => did.generateKey());
      const unique = new Set(results);
      
      expect(unique.size).toBe(1); // All results should be identical
    });
  });
});

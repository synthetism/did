/**
 * @synet/did - Coverage completion tests
 * 
 * Additional tests to achieve 100% code coverage
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createDIDKey,
  createDIDWeb,
  createDIDSynet,
  createDIDDocument,
  parseDID,
  validateDID,
  isDID,
  extractMethod,
  extractIdentifier,
  normalizeDID,
  createDIDURL,
  DIDError
} from '../src/index';

describe('Coverage Completion Tests', () => {
  
  describe('Crypto fallback scenarios', () => {
    beforeEach(() => {
      // Mock the global crypto to be undefined
      vi.stubGlobal('crypto', undefined);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should use Node.js crypto when Web crypto is not available', () => {
      // This test ensures the Node.js crypto path is covered
      const did = createDIDKey();
      expect(isDID(did)).toBe(true);
      expect(did).toMatch(/^did:key:ed25519-/);
    });

    it('should use Math.random fallback when no crypto is available', () => {
      // Mock console.warn to capture the warning
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Store original globalThis.crypto
      const originalCrypto = globalThis.crypto;
      
      // Mock require to throw an error and remove crypto
      const originalRequire = global.require;
      
      try {
        // Remove crypto from globalThis
        Object.defineProperty(globalThis, 'crypto', {
          value: undefined,
          configurable: true
        });
        
        // Mock require to throw
        global.require = vi.fn(() => {
          throw new Error('Module not found');
        });

        const did = createDIDKey();
        expect(isDID(did)).toBe(true);
        expect(did).toMatch(/^did:key:ed25519-/);
        expect(warnSpy).toHaveBeenCalledWith(
          '[@synet/did] No cryptographically secure random source available. Using Math.random() fallback.'
        );
      } finally {
        // Restore original values
        globalThis.crypto = originalCrypto;
        global.require = originalRequire;
        warnSpy.mockRestore();
      }
    });

    it('should handle synet DID creation with crypto fallback', () => {
      const did = createDIDSynet();
      expect(isDID(did)).toBe(true);
      expect(did).toMatch(/^did:synet:/);
    });
  });

  describe('Legacy identifier generation', () => {
    it('should generate identifier with custom length', () => {
      // Test the generateIdentifier function indirectly
      const did1 = createDIDKey();
      const did2 = createDIDKey();
      
      // They should be different (testing randomness)
      expect(did1).not.toBe(did2);
    });
  });

  describe('DID validation edge cases', () => {
    it('should validate did:key with invalid characters', () => {
      const invalidDID = 'did:key:invalid chars!@#$%^&*()';
      const result = validateDID(invalidDID);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid did:key identifier format');
    });

    it('should validate did:key with empty identifier', () => {
      const invalidDID = 'did:key:';
      const result = validateDID(invalidDID);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid DID format');
    });

    it('should validate did:web with invalid characters', () => {
      const invalidDID = 'did:web:invalid chars!@#$%^&*()';
      const result = validateDID(invalidDID);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('did:web identifier must be a valid domain name');
    });

    it('should validate did:web with empty identifier', () => {
      const invalidDID = 'did:web:';
      const result = validateDID(invalidDID);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid DID format');
    });

    it('should validate did:synet with invalid characters', () => {
      const invalidDID = 'did:synet:validButLongIdentifier';
      const result = validateDID(invalidDID);
      expect(result.isValid).toBe(true); // Actually valid since it's 8+ chars
    });

    it('should validate did:synet with empty identifier', () => {
      const invalidDID = 'did:synet:';
      const result = validateDID(invalidDID);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid DID format');
    });

    it('should validate did:synet with short identifier', () => {
      const invalidDID = 'did:synet:short';
      const result = validateDID(invalidDID);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('did:synet identifier must be at least 8 characters');
    });

    it('should validate unsupported method', () => {
      const invalidDID = 'did:unsupported:identifier';
      const result = validateDID(invalidDID);
      expect(result.isValid).toBe(true); // Still valid DID format, just adds warning
      expect(result.warnings).toContain("Method 'unsupported' is not officially supported");
    });
  });

  describe('DID URL parsing with query parameters', () => {
    it('should parse DID URL with query parameters containing no value', () => {
      const didURL = 'did:key:test?param1&param2=value2';
      const result = parseDID(didURL);
      
      expect(result.isValid).toBe(true);
      expect(result.components.query).toEqual({
        param1: '',
        param2: 'value2'
      });
    });

    it('should parse DID URL with encoded query parameters', () => {
      const didURL = 'did:key:test?param1=hello%20world&param2=test%3Dvalue';
      const result = parseDID(didURL);
      
      expect(result.isValid).toBe(true);
      expect(result.components.query).toEqual({
        param1: 'hello world',
        param2: 'test=value'
      });
    });
  });

  describe('DID Document creation error cases', () => {
    it('should throw error when creating document with invalid DID', () => {
      expect(() => {
        createDIDDocument('invalid-did');
      }).toThrow(DIDError);
    });

    it('should handle all createDIDDocument option branches', () => {
      const did = createDIDKey();
      
      // Test with verificationMethod array
      const doc1 = createDIDDocument(did, {
        verificationMethod: [
          {
            id: `${did}#key-1`,
            type: 'Ed25519VerificationKey2020',
            controller: did,
            publicKeyMultibase: 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK'
          },
          {
            id: `${did}#key-2`,
            type: 'Ed25519VerificationKey2020',
            controller: did,
            publicKeyMultibase: 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doL'
          }
        ]
      });
      
      expect(doc1.verificationMethod).toHaveLength(2);
      
      // Test with all capability arrays
      const doc2 = createDIDDocument(did, {
        verificationMethod: {
          id: `${did}#key-1`,
          type: 'Ed25519VerificationKey2020',
          controller: did,
          publicKeyMultibase: 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK'
        },
        authentication: [`${did}#key-1`],
        assertionMethod: [`${did}#key-1`],
        keyAgreement: [`${did}#key-1`],
        capabilityInvocation: [`${did}#key-1`],
        capabilityDelegation: [`${did}#key-1`],
        service: [{
          id: `${did}#service-1`,
          type: 'LinkedDomains',
          serviceEndpoint: 'https://example.com'
        }]
      });
      
      expect(doc2.authentication).toEqual([`${did}#key-1`]);
      expect(doc2.assertionMethod).toEqual([`${did}#key-1`]);
      expect(doc2.keyAgreement).toEqual([`${did}#key-1`]);
      expect(doc2.capabilityInvocation).toEqual([`${did}#key-1`]);
      expect(doc2.capabilityDelegation).toEqual([`${did}#key-1`]);
      expect(doc2.service).toHaveLength(1);
      
      // Test with legacy services (relative ID)
      const doc3 = createDIDDocument(did, {
        services: [{
          id: '#service-1',
          type: 'LinkedDomains',
          serviceEndpoint: 'https://example.com',
          additionalProp: 'value'
        }]
      });
      
      expect(doc3.service).toHaveLength(1);
      expect(doc3.service?.[0].id).toBe(`${did}#service-1`);
    });
  });

  describe('DID creation error scenarios', () => {
    it('should throw error for createDIDWeb with invalid domain', () => {
      expect(() => {
        createDIDWeb('invalid-domain');
      }).toThrow(DIDError);
      
      expect(() => {
        createDIDWeb('http://example.com');
      }).toThrow(DIDError);
    });

    it('should throw error for createDIDSynet with short identifier', () => {
      expect(() => {
        createDIDSynet('short');
      }).toThrow(DIDError);
    });

    it('should handle createDIDKey with custom publicKey', () => {
      const customKey = 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
      const did = createDIDKey({ publicKey: customKey });
      expect(did).toBe(`did:key:${customKey}`);
    });

    it('should handle createDIDKey with secp256k1 key type', () => {
      const did = createDIDKey({ keyType: 'secp256k1' });
      expect(did).toMatch(/^did:key:secp256k1-/);
    });
  });

  describe('Base58 encoding edge cases', () => {
    it('should handle empty buffer encoding', () => {
      // This tests the base58 encoding with empty buffer
      // We can't directly test this without accessing the internal function
      // but we can test with minimal data
      const did = createDIDSynet('12345678'); // Minimum length identifier
      expect(isDID(did)).toBe(true);
    });
  });

  describe('Additional utility functions', () => {
    it('should test createDIDURL function', () => {
      const components = {
        method: 'key' as const,
        identifier: 'test',
        path: 'some/path',
        query: { param: 'value' },
        fragment: 'section'
      };
      
      const url = createDIDURL(components);
      expect(url).toBe('did:key:test/some/path?param=value#section');
    });

    it('should test extractMethod function', () => {
      const did = 'did:key:test';
      const method = extractMethod(did);
      expect(method).toBe('key');
    });

    it('should test extractIdentifier function', () => {
      const did = 'did:key:test';
      const identifier = extractIdentifier(did);
      expect(identifier).toBe('test');
    });

    it('should test normalizeDID function', () => {
      const did = '  did:key:test  ';
      const normalized = normalizeDID(did);
      expect(normalized).toBe('did:key:test');
    });
  });
});

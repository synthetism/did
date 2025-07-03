/**
 * @synet/did - Coverage completion tests
 * 
 * Additional tests to achieve 100% code coverage
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createDID,
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
} from '../src/index';  describe('Coverage Completion Tests', () => {
  
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
      const publicKeyHex = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
      const did = createDIDKey(publicKeyHex, "Ed25519");
      expect(isDID(did)).toBe(true);
      expect(did).toMatch(/^did:key:z6/);
    });

    it('should handle different crypto scenarios', () => {
      // Test that the function handles various crypto availability scenarios
      // The actual crypto methods will be used but we test the logic paths
      const publicKeyHex1 = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
      const did1 = createDIDKey(publicKeyHex1, "Ed25519");
      const did2 = createDIDSynet("test-crypto-scenario-12345");
      
      expect(isDID(did1)).toBe(true);
      expect(isDID(did2)).toBe(true);
      expect(did1).toMatch(/^did:key:z6/);
      expect(did2).toMatch(/^did:synet:/);
    });

    it('should handle synet DID creation with crypto fallback', () => {
      const did = createDIDSynet("test-crypto-fallback-12345");
      expect(isDID(did)).toBe(true);
      expect(did).toMatch(/^did:synet:/);
    });
  });

  describe('Error path coverage', () => {
    it('should cover DID validation error paths for invalid characters', () => {
      // Test the specific validation paths in utils.ts lines 116-120
      const invalidDIDKey = 'did:key:invalid!@#characters';
      const validation = validateDID(invalidDIDKey);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toBe('Invalid did:key identifier format');
    });

    it('should test validateDID with various invalid cases', () => {
      // Test empty identifier
      expect(validateDID('did:key:').isValid).toBe(false);
      
      // Test invalid characters - use characters that are actually invalid
      expect(validateDID('did:web:').isValid).toBe(false);
      
      // Test short synet identifier
      expect(validateDID('did:synet:short').isValid).toBe(false);
    });
  });

  describe('DID creation edge cases and validation failures', () => {
    
    it('should handle createDID method validation', () => {
      // Test the error path for invalid method in createDID function (line 238)
      expect(() => {
        createDID({ method: 'invalid' as 'key' | 'web' | 'synet' });
      }).toThrow('Unsupported DID method: invalid');
    });

    it('should handle createDIDWeb validation scenarios', () => {
      // Test various web domain validations
      expect(() => createDIDWeb('')).toThrow();
      expect(() => createDIDWeb('invalid')).toThrow();
      expect(() => createDIDWeb('http://example.com')).toThrow();
    });

    it('should handle createDIDSynet validation scenarios', () => {
      // Test short identifier validation
      expect(() => createDIDSynet('short')).toThrow();
      expect(() => createDIDSynet('a')).toThrow();
    });

    it('should handle createDIDDocument validation', () => {
      // Test invalid DID in createDIDDocument
      expect(() => {
        createDIDDocument('invalid-did-format');
      }).toThrow('Invalid DID:');
    });
  });

  describe('Legacy identifier generation', () => {
    it('should generate identifier with custom length', () => {
      // Test the generateIdentifier function indirectly
      const publicKeyHex1 = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
      const publicKeyHex2 = "8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a";
      const did1 = createDIDKey(publicKeyHex1, "Ed25519");
      const did2 = createDIDKey(publicKeyHex2, "X25519");
      
      // They should be different (testing different keys)
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
      const publicKeyHex = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
      const did = createDIDKey(publicKeyHex, "Ed25519");
      
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
      const customKey = 'd75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a';
      const did = createDIDKey(customKey, "Ed25519");
      expect(did).toBe('did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw');
    });

    it('should handle createDIDKey with secp256k1 key type', () => {
      const publicKeyHex = "02b97c30de767f084ce3439de539bae75de6b9f1bb2d9bb3c8e0b3cf68f12c5e9e";
      const did = createDIDKey(publicKeyHex, "secp256k1");
      expect(did).toMatch(/^did:key:zQ3/);
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

  describe('Comprehensive coverage tests', () => {
    
    it('should trigger validation failure paths in create functions', () => {
      // Test the scenario where validateDID would return invalid for a created DID
      // This is highly unlikely in normal operation but tests the error paths
      
      // Test the character validation path that's not being covered
      const result = validateDID('did:key:test!@#invalid');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid did:key identifier format');
    });

    it('should cover all branches in base58 encoding', () => {
      // Test empty buffer case if it exists
      const publicKeyHex1 = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
      const did1 = createDIDKey(publicKeyHex1, "Ed25519");
      const did2 = createDIDSynet("test-base58-branch-12345");
      
      // Ensure different scenarios are tested
      expect(did1).toMatch(/^did:key:/);
      expect(did2).toMatch(/^did:synet:/);
    });

    it('should test edge cases in identifier generation', () => {
      // Test multiple generation to ensure randomness paths
      const dids = Array.from({ length: 5 }, (_, i) => 
        createDIDKey(`${i.toString().padStart(64, '0')}`, "Ed25519")
      );
      
      // All should be valid and different
      for (const did of dids) {
        expect(isDID(did)).toBe(true);
      }
      const uniqueDids = new Set(dids);
      expect(uniqueDids.size).toBe(5);
    });

    it('should test various DID validation edge cases', () => {
      // Test different invalid character scenarios in the identifier itself
      // These characters should be in the identifier, not fragments or queries
      expect(validateDID('did:key:test@invalid').isValid).toBe(false);
      expect(validateDID('did:key:test$invalid').isValid).toBe(false);
      expect(validateDID('did:key:test%invalid').isValid).toBe(false);
      expect(validateDID('did:key:test^invalid').isValid).toBe(false);
      expect(validateDID('did:key:test&invalid').isValid).toBe(false);
      expect(validateDID('did:key:test*invalid').isValid).toBe(false);
      expect(validateDID('did:key:test(invalid').isValid).toBe(false);
      expect(validateDID('did:key:test)invalid').isValid).toBe(false);
      expect(validateDID('did:key:test+invalid').isValid).toBe(false);
      expect(validateDID('did:key:test=invalid').isValid).toBe(false);
      expect(validateDID('did:key:test[invalid').isValid).toBe(false);
      expect(validateDID('did:key:test]invalid').isValid).toBe(false);
      expect(validateDID('did:key:test{invalid').isValid).toBe(false);
      expect(validateDID('did:key:test}invalid').isValid).toBe(false);
      expect(validateDID('did:key:test|invalid').isValid).toBe(false);
      expect(validateDID('did:key:test\\invalid').isValid).toBe(false);
      expect(validateDID('did:key:test:invalid').isValid).toBe(false);
      expect(validateDID('did:key:test"invalid').isValid).toBe(false);
      expect(validateDID("did:key:test'invalid").isValid).toBe(false);
      expect(validateDID('did:key:test<invalid').isValid).toBe(false);
      expect(validateDID('did:key:test>invalid').isValid).toBe(false);
      expect(validateDID('did:key:test,invalid').isValid).toBe(false);
      expect(validateDID('did:key:test.invalid').isValid).toBe(false);
      expect(validateDID('did:key:test invalid').isValid).toBe(false);
      
      // Test with exclamation mark which is also invalid
      expect(validateDID('did:key:test!invalid').isValid).toBe(false);
    });
  });
});

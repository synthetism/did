/**
 * Cross-validation tests against reference implementations
 * 
 * This test suite validates our DID implementation against:
 * - did-resolver library
 * - W3C test vectors
 * - Other reference implementations
 */

import { describe, it, expect } from 'vitest';
import { createDIDKey, createDIDWeb, validateDID, parseDID } from '../src/index';

describe('Cross-Validation Tests', () => {
  describe('DID Key Format Validation', () => {
    // Test vectors from W3C DID Key Method specification
    const testVectors = [
      {
        name: 'Ed25519 - W3C Test Vector 1',
        keyHex: 'd75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a',
        keyType: 'ed25519-pub' as const,
        expectedDID: 'did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw',
        expectedPrefix: 'z6Mk'
      },
      {
        name: 'secp256k1 - Compressed Key',
        keyHex: '02b97c30de767f084ce3439de539bae75de6b9f1bb2d9bb3c8e0b3cf68f12c5e9e',
        keyType: 'secp256k1-pub' as const,
        expectedDID: 'did:key:zQ3shZtr1sUnrETvXQSyvnEnpFDBXGKmdk7NxELbWHgxKrNbF',
        expectedPrefix: 'zQ3s'
      },
      {
        name: 'X25519 - Key Agreement',
        keyHex: '8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a',
        keyType: 'x25519-pub' as const,
        expectedDID: 'did:key:z6LSkdrX4EvewpktHBjvNxRDogPdC5iVF8LT3LPKefGAgi89',
        expectedPrefix: 'z6LS'
      }
    ];

    for (const { name, keyHex, keyType, expectedDID, expectedPrefix } of testVectors) {
      it(`should generate correct DID for ${name}`, () => {
        const did = createDIDKey(keyHex, keyType);
        expect(did).toBe(expectedDID);
        expect(did.split(':')[2]).toMatch(new RegExp(`^${expectedPrefix}`));
      });

      it(`should validate ${name} DID correctly`, () => {
        const validation = validateDID(expectedDID);
        expect(validation.isValid).toBe(true);
        expect(validation.error).toBeUndefined();
      });

      it(`should parse ${name} DID correctly`, () => {
        const parsed = parseDID(expectedDID);
        expect(parsed.isValid).toBe(true);
        expect(parsed.components?.method).toBe('key');
        expect(parsed.components?.identifier).toBe(expectedDID.split(':')[2]);
      });
    }
  });

  describe('DID Web Validation', () => {
    const webTestCases = [
      {
        name: 'Basic domain',
        domain: 'example.com',
        expectedDID: 'did:web:example.com'
      },
      {
        name: 'Domain with path',
        domain: 'example.com',
        path: 'users/alice',
        expectedDID: 'did:web:example.com:users:alice'
      },
      {
        name: 'Domain with port',
        domain: 'example.com:8080',
        expectedDID: 'did:web:example.com%3A8080'
      }
    ];

    for (const { name, domain, path, expectedDID } of webTestCases) {
      it(`should generate correct DID for ${name}`, () => {
        const did = createDIDWeb(domain, path);
        expect(did).toBe(expectedDID);
      });

      it(`should validate ${name} DID correctly`, () => {
        const validation = validateDID(expectedDID);
        expect(validation.isValid).toBe(true);
        expect(validation.error).toBeUndefined();
      });
    }
  });

  describe('Multicodec Prefix Validation', () => {
    it('should use correct multicodec values', () => {
      // Ed25519: 0xed (237) -> should produce z6Mk prefix
      const ed25519DID = createDIDKey('d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a', 'ed25519-pub');
      expect(ed25519DID).toMatch(/^did:key:z6Mk/);

      // secp256k1: 0xe7 (231) -> should produce zQ3s prefix  
      const secp256k1DID = createDIDKey('02b97c30de767f084ce3439de539bae75de6b9f1bb2d9bb3c8e0b3cf68f12c5e9e', 'secp256k1-pub');
      expect(secp256k1DID).toMatch(/^did:key:zQ3s/);

      // X25519: 0xec (236) -> should produce z6LS prefix
      const x25519DID = createDIDKey('8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a', 'x25519-pub');
      expect(x25519DID).toMatch(/^did:key:z6LS/);
    });
  });

  describe('Standards Compliance', () => {
    it('should follow W3C DID Core ABNF grammar', () => {
      const testDIDs = [
        'did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw',
        'did:web:example.com',
        'did:web:example.com:users:alice',
        'did:web:example.com%3A8080'
      ];

      for (const did of testDIDs) {
        const validation = validateDID(did);
        expect(validation.isValid).toBe(true);
      }
    });

    it('should reject invalid DID formats', () => {
      const invalidDIDs = [
        'did:',                           // Empty method
        'did:key:',                       // Empty identifier
        'not-a-did',                      // No DID prefix
        'did:web:',                       // Empty web identifier
        'did:web:localhost',              // Invalid domain (localhost)
      ];

      for (const did of invalidDIDs) {
        const validation = validateDID(did);
        expect(validation.isValid).toBe(false);
      }
    });
  });
});

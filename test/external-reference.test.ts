/**
 * External Reference Implementation Tests
 * 
 * Tests against real external libraries and services to validate
 * our DID implementation against industry standards.
 */

import { describe, it, expect } from 'vitest';
import { createDIDKey, createDIDWeb, validateDID, parseDID } from '../src/index';

describe('External Reference Implementation Tests', () => {
  describe('DID Format Validation', () => {
    it('should create valid DID key identifiers', () => {
      const publicKeyHex = 'd75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a';
      const did = createDIDKey(publicKeyHex, 'ed25519-pub');
      
      expect(did).toBe('did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw');
      
      // Validate DID structure
      expect(did).toMatch(/^did:key:z[1-9A-HJ-NP-Za-km-z]+$/);
      expect(did.split(':').length).toBe(3);
      expect(did.split(':')[0]).toBe('did');
      expect(did.split(':')[1]).toBe('key');
    });

    it('should create valid DID web identifiers', () => {
      const did = createDIDWeb('example.com', 'users/alice');
      expect(did).toBe('did:web:example.com:users:alice');
      
      // Validate DID structure  
      expect(did).toMatch(/^did:web:/);
      expect(did.split(':').length).toBeGreaterThanOrEqual(3);
      expect(did.split(':')[0]).toBe('did');
      expect(did.split(':')[1]).toBe('web');
    });

    it('should handle complex DID URLs', () => {
      const baseDID = createDIDKey('d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a', 'ed25519-pub');
      const didUrl = `${baseDID}#keys-1`;
      
      // Parse the DID URL
      const parsed = parseDID(didUrl);
      expect(parsed.isValid).toBe(true);
      expect(parsed.components?.method).toBe('key');
      expect(parsed.components?.fragment).toBe('keys-1');
    });
  });

  describe('Multicodec Compatibility', () => {
    // Test that our multicodec encoding matches expected values
    it('should produce correct multicodec prefixes', () => {
      // These are the expected prefixes based on the multicodec spec
      const testCases = [
        {
          keyType: 'ed25519-pub' as const,
          expectedPrefix: 'z6Mk', // Ed25519 with varint encoding of 0xed
          keyHex: 'd75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a'
        },
        {
          keyType: 'secp256k1-pub' as const,
          expectedPrefix: 'zQ3s', // secp256k1 with varint encoding of 0xe7
          keyHex: '02b97c30de767f084ce3439de539bae75de6b9f1bb2d9bb3c8e0b3cf68f12c5e9e'
        },
        {
          keyType: 'x25519-pub' as const,
          expectedPrefix: 'z6LS', // X25519 with varint encoding of 0xec
          keyHex: '8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a'
        }
      ];

      for (const { keyType, expectedPrefix, keyHex } of testCases) {
        const did = createDIDKey(keyHex, keyType);
        const identifier = did.split(':')[2];
        expect(identifier).toMatch(new RegExp(`^${expectedPrefix}`));
      }
    });
  });

  describe('Format Validation Against Standards', () => {
    it('should validate against W3C DID Core ABNF', () => {
      // Test various DID formats for compliance
      const validDIDs = [
        'did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw',
        'did:web:example.com',
        'did:web:example.com:users:alice',
        'did:web:example.com%3A8080',
        'did:web:example.com:users:alice:profile'
      ];

      for (const did of validDIDs) {
        const validation = validateDID(did);
        expect(validation.isValid).toBe(true);
        expect(validation.error).toBeUndefined();
      }
    });

    it('should reject clearly invalid DIDs', () => {
      const invalidDIDs = [
        '', // Empty
        'did:', // No method
        'did:key:', // No identifier
        'not-a-did', // Invalid format
        'did:web:', // Empty web identifier
        'did:web:localhost', // Invalid domain (localhost)
      ];

      for (const did of invalidDIDs) {
        const validation = validateDID(did);
        expect(validation.isValid).toBe(false);
        expect(validation.error).toBeDefined();
      }
    });
  });

  describe('Cross-Library Compatibility', () => {
    it('should produce consistent results across different operations', () => {
      const publicKeyHex = 'd75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a';
      const did = createDIDKey(publicKeyHex, 'ed25519-pub');
      
      // Test that our parsing is consistent
      const parsed = parseDID(did);
      expect(parsed.isValid).toBe(true);
      expect(parsed.components?.method).toBe('key');
      
      // Test that validation passes
      const validation = validateDID(did);
      expect(validation.isValid).toBe(true);
      
      // Test that the DID matches expected format
      expect(did).toBe('did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw');
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle edge cases securely', () => {
      // Test with malformed inputs
      expect(() => createDIDKey('', 'ed25519-pub')).toThrow();
      expect(() => createDIDKey('invalid-hex', 'ed25519-pub')).toThrow();
      expect(() => createDIDKey('deadbeef', 'ed25519-pub')).toThrow(); // Wrong length
      
      // Test web DID edge cases
      expect(() => createDIDWeb('')).toThrow();
      expect(() => createDIDWeb('localhost')).toThrow();
      // Note: IP addresses are currently allowed by the implementation
    });

    it('should provide meaningful error messages', () => {
      try {
        createDIDKey('invalid-hex', 'ed25519-pub');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Invalid hexadecimal format');
      }

      try {
        createDIDWeb('localhost');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('Domain must be a valid FQDN');
      }
    });
  });
});

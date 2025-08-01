/**
 * @synet/did - Integration tests
 * 
 * End-to-end tests for the entire DID package functionality.
 */

import { describe, it, expect } from 'vitest';
import {
  createDID,
  createDIDDocument,
  parseDID,
  validateDID,
  isDID,
  extractMethod,
  extractIdentifier,
  normalizeDID,
  VERSION
} from '../src/index';

describe('Integration Tests', () => {
  describe('Full DID workflow', () => {
    it('should create, parse, validate, and document a did:key', () => {
      // Create a DID
      const publicKeyHex = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
      const did = createDID({ 
        method: 'key', 
        keyType: 'Ed25519',
        publicKey: publicKeyHex
      });
      
      // Verify it's a valid DID
      expect(isDID(did)).toBe(true);
      
      // Parse the DID
      const parsed = parseDID(did);
      expect(parsed.isValid).toBe(true);
      expect(parsed.components.method).toBe('key');
      expect(parsed.components.identifier).toBeDefined();
      
      // Validate the DID
      const validation = validateDID(did);
      expect(validation.isValid).toBe(true);
      expect(validation.error).toBeUndefined();
      
      // Extract components
      expect(extractMethod(did)).toBe('key');
      expect(extractIdentifier(did)).toBe(parsed.components.identifier);
      
      // Normalize the DID
      const normalized = normalizeDID(did);
      expect(normalized).toBe(did);
      
      // Create a DID document
      const verificationMethod = {
        id: `${did}#keys-1`,
        type: 'Ed25519VerificationKey2020',
        controller: did,
        publicKeyMultibase: 'z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw'
      };
      
      const document = createDIDDocument(did, {
        verificationMethod,
        authentication: [`${did}#keys-1`],
        assertionMethod: [`${did}#keys-1`]
      });
      
      expect(document.id).toBe(did);
      expect(document.verificationMethod).toBeDefined();
      expect(document.authentication).toBeDefined();
    });

    it('should create, parse, validate, and document a did:web', () => {
      // Create a DID
      const did = createDID({ method: 'web', domain: 'example.com' });
      
      // Verify it's a valid DID
      expect(isDID(did)).toBe(true);
      expect(did).toBe('did:web:example.com');
      
      // Parse the DID
      const parsed = parseDID(did);
      expect(parsed.isValid).toBe(true);
      expect(parsed.components.method).toBe('web');
      expect(parsed.components.identifier).toBe('example.com');
      
      // Validate the DID
      const validation = validateDID(did);
      expect(validation.isValid).toBe(true);
      expect(validation.error).toBeUndefined();
      
      // Extract components
      expect(extractMethod(did)).toBe('web');
      expect(extractIdentifier(did)).toBe('example.com');
      
      // Create a DID document with services
      const document = createDIDDocument(did, {
        service: [
          { id: '#agent', type: 'DIDCommMessaging', serviceEndpoint: 'https://example.com/agent' }
        ]
      });
      
      expect(document.id).toBe(did);
      expect(document.service).toHaveLength(1);
      expect(document.service?.[0].id).toBe('did:web:example.com#agent');
    });
  });

  describe('Complex DID scenarios', () => {
    it('should handle DIDs with all URL components', () => {
      const baseDID = 'did:web:example.com';
      const complexDID = `${baseDID}/path/to/resource?service=agent&version=1.0#keys-1`;
      
      // Parse complex DID
      const parsed = parseDID(complexDID);
      expect(parsed.isValid).toBe(true);
      expect(parsed.components.method).toBe('web');
      expect(parsed.components.identifier).toBe('example.com');
      expect(parsed.components.path).toBe('path/to/resource');
      expect(parsed.components.query).toEqual({
        service: 'agent',
        version: '1.0'
      });
      expect(parsed.components.fragment).toBe('keys-1');
      
      // Validate complex DID
      const validation = validateDID(complexDID);
      expect(validation.isValid).toBe(true);
      
      // Normalize should preserve all components
      const normalized = normalizeDID(complexDID);
      expect(normalized).toBe(complexDID);
    });

    it('should handle edge cases gracefully', () => {
      // Empty strings
      expect(isDID('')).toBe(false);
      expect(extractMethod('')).toBeNull();
      expect(extractIdentifier('')).toBeNull();
      
      // Invalid formats
      expect(isDID('not-a-did')).toBe(false);
      expect(isDID('did:')).toBe(false);
      expect(isDID('did:method:')).toBe(false);
      
      // Validation warnings
      const unsupportedDID = 'did:ethr:0x123456789abcdef';
      const validation = validateDID(unsupportedDID);
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toContain("Method 'ethr' is not officially supported");
    });
  });

  describe('Package metadata', () => {
    it('should export version information', () => {
      expect(VERSION).toBeDefined();
      expect(typeof VERSION).toBe('string');
      expect(VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe('Error handling', () => {
    it('should provide meaningful error messages', () => {
      try {
        createDID({ method: 'web' });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('domain is required for did:web');
      }
      
      try {
        normalizeDID('invalid-did');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('Cannot normalize invalid DID');
      }
      
      try {
        createDIDDocument('invalid-did');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('Invalid DID');
      }
    });
  });

  describe('Performance and consistency', () => {
    it('should create unique DIDs consistently', () => {
      const dids = new Set();
      
      // Create 100 DIDs and ensure they're all unique
      for (let i = 0; i < 100; i++) {
        // Generate a unique public key for each DID (32 bytes = 64 hex chars)
        const publicKeyHex = Array.from({ length: 64 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('');
        const did = createDID({ 
          method: 'key', 
          publicKey: publicKeyHex, 
          keyType: 'Ed25519' 
        });
        expect(dids.has(did)).toBe(false);
        dids.add(did);
        expect(isDID(did)).toBe(true);
      }
      
      expect(dids.size).toBe(100);
    });

    it('should handle large-scale parsing efficiently', () => {
      const testDIDs = [
        'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
        'did:web:example.com/path/to/resource?service=agent&version=1.0#keys-1',
        'did:web:subdomain.example.com:8080/path?query=param#fragment'
      ];
      
      // Parse each DID multiple times
      for (let i = 0; i < 1000; i++) {
        for (const did of testDIDs) {
          const parsed = parseDID(did);
          expect(parsed.isValid).toBe(true);
        }
      }
    });
  });
});

/**
 * @synet/did - Utils tests
 * 
 * Comprehensive tests for DID parsing, validation, and utility functions.
 */

import { describe, it, expect } from 'vitest';
import {
  parseDID,
  validateDID,
  createDIDURL,
  isDID,
  extractMethod,
  extractIdentifier,
  normalizeDID,
  DIDError
} from '../src/index';

describe('DID Utils', () => {
  describe('parseDID', () => {
    it('should parse a valid did:key DID', () => {
      const did = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
      const result = parseDID(did);
      
      expect(result.isValid).toBe(true);
      expect(result.components.method).toBe('key');
      expect(result.components.identifier).toBe('z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK');
      expect(result.components.path).toBeUndefined();
      expect(result.components.query).toBeUndefined();
      expect(result.components.fragment).toBeUndefined();
    });

    it('should parse a valid did:web DID', () => {
      const did = 'did:web:example.com';
      const result = parseDID(did);
      
      expect(result.isValid).toBe(true);
      expect(result.components.method).toBe('web');
      expect(result.components.identifier).toBe('example.com');
    });

    it('should parse DID with path', () => {
      const did = 'did:web:example.com/path/to/resource';
      const result = parseDID(did);
      
      expect(result.isValid).toBe(true);
      expect(result.components.path).toBe('path/to/resource');
    });

    it('should parse DID with query parameters', () => {
      const did = 'did:web:example.com?service=agent&version=1.0';
      const result = parseDID(did);
      
      expect(result.isValid).toBe(true);
      expect(result.components.query).toEqual({
        service: 'agent',
        version: '1.0'
      });
    });

    it('should parse DID with fragment', () => {
      const did = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#keys-1';
      const result = parseDID(did);
      
      expect(result.isValid).toBe(true);
      expect(result.components.fragment).toBe('keys-1');
    });

    it('should parse DID with all components', () => {
      const did = 'did:web:example.com/path?service=agent&version=1.0#keys-1';
      const result = parseDID(did);
      
      expect(result.isValid).toBe(true);
      expect(result.components.method).toBe('web');
      expect(result.components.identifier).toBe('example.com');
      expect(result.components.path).toBe('path');
      expect(result.components.query).toEqual({
        service: 'agent',
        version: '1.0'
      });
      expect(result.components.fragment).toBe('keys-1');
    });

    it('should handle invalid DID formats', () => {
      const invalidDIDs = [
        '',
        'not-a-did',
        'did:',
        'did:key',
        'did:key:',
        'http://example.com',
        'did:INVALID:test'
      ];

      for (const did of invalidDIDs) {
        const result = parseDID(did);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      }
    });

    it('should handle empty query parameters', () => {
      const did = 'did:web:example.com?';
      const result = parseDID(did);
      
      expect(result.isValid).toBe(true);
      expect(result.components.query).toBeUndefined();
    });

    it('should handle encoded query parameters', () => {
      const did = 'did:web:example.com?hello%20world=test%3Dvalue';
      const result = parseDID(did);
      
      expect(result.isValid).toBe(true);
      expect(result.components.query).toEqual({
        'hello world': 'test=value'
      });
    });

    it('should handle non-string inputs', () => {
      const inputs = [null, undefined, 123, {}, []];
      
      for (const input of inputs) {
        const result = parseDID(input as string);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('DID must be a non-empty string');
      }
    });
  });

  describe('validateDID', () => {
    it('should validate supported DID methods', () => {
      const validDIDs = [
        'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
        'did:web:example.com'
      ];

      for (const did of validDIDs) {
        const result = validateDID(did);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      }
    });

    it('should warn about unsupported methods', () => {
      const did = 'did:ethr:0x123456';
      const result = validateDID(did);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain("Method 'ethr' is not officially supported");
    });

    it('should validate did:web domain format', () => {
      const invalidWebDIDs = [
        'did:web:localhost',
        'did:web:example',
        'did:web:not-a-domain'
      ];

      for (const did of invalidWebDIDs) {
        const result = validateDID(did);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('did:web identifier must be a valid domain name');
      }
    });

    it('should validate did:key identifier format', () => {
      const invalidKeyDIDs = [
        'did:key:invalid chars!',
        'did:key:spaces are bad',
        'did:key:special@chars#'
      ];

      for (const did of invalidKeyDIDs) {
        const result = validateDID(did);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Invalid did:key identifier format');
      }
    });
  });

  describe('createDIDURL', () => {
    it('should create a basic DID URL', () => {
      const components = {
        method: 'key' as const,
        identifier: 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK'
      };
      
      const result = createDIDURL(components);
      expect(result).toBe('did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK');
    });

    it('should create a DID URL with path', () => {
      const components = {
        method: 'web' as const,
        identifier: 'example.com',
        path: 'path/to/resource'
      };
      
      const result = createDIDURL(components);
      expect(result).toBe('did:web:example.com/path/to/resource');
    });

    it('should create a DID URL with query parameters', () => {
      const components = {
        method: 'web' as const,
        identifier: 'example.com',
        query: {
          service: 'agent',
          version: '1.0'
        }
      };
      
      const result = createDIDURL(components);
      expect(result).toBe('did:web:example.com?service=agent&version=1.0');
    });

    it('should create a DID URL with fragment', () => {
      const components = {
        method: 'key' as const,
        identifier: 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
        fragment: 'keys-1'
      };
      
      const result = createDIDURL(components);
      expect(result).toBe('did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK#keys-1');
    });

    it('should create a DID URL with all components', () => {
      const components = {
        method: 'web' as const,
        identifier: 'example.com',
        path: 'path',
        query: {
          service: 'agent',
          version: '1.0'
        },
        fragment: 'keys-1'
      };
      
      const result = createDIDURL(components);
      expect(result).toBe('did:web:example.com/path?service=agent&version=1.0#keys-1');
    });

    it('should handle URL encoding in query parameters', () => {
      const components = {
        method: 'web' as const,
        identifier: 'example.com',
        query: {
          'hello world': 'test=value',
          'special chars': 'a+b&c'
        }
      };
      
      const result = createDIDURL(components);
      expect(result).toContain('hello%20world=test%3Dvalue');
      expect(result).toContain('special%20chars=a%2Bb%26c');
    });
  });

  describe('isDID', () => {
    it('should return true for valid DIDs', () => {
      const validDIDs = [
        'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
        'did:web:example.com'
      ];

      for (const did of validDIDs) {
        expect(isDID(did)).toBe(true);
      }
    });

    it('should return false for invalid DIDs', () => {
      const invalidDIDs = [
        '',
        'not-a-did',
        'did:',
        'did:key',
        'http://example.com'
      ];

      for (const did of invalidDIDs) {
        expect(isDID(did)).toBe(false);
      }
    });
  });

  describe('extractMethod', () => {
    it('should extract method from valid DIDs', () => {
      expect(extractMethod('did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK')).toBe('key');
      expect(extractMethod('did:web:example.com')).toBe('web');
      expect(extractMethod('did:example:123456')).toBe('example');
    });

    it('should return null for invalid DIDs', () => {
      expect(extractMethod('invalid-did')).toBeNull();
      expect(extractMethod('')).toBeNull();
      expect(extractMethod('did:')).toBeNull();
    });
  });

  describe('extractIdentifier', () => {
    it('should extract identifier from valid DIDs', () => {
      expect(extractIdentifier('did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK')).toBe('z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK');
      expect(extractIdentifier('did:web:example.com')).toBe('example.com');
      expect(extractIdentifier('did:example:123456')).toBe('123456');
    });

    it('should return null for invalid DIDs', () => {
      expect(extractIdentifier('invalid-did')).toBeNull();
      expect(extractIdentifier('')).toBeNull();
      expect(extractIdentifier('did:')).toBeNull();
    });
  });

  describe('normalizeDID', () => {
    it('should normalize valid DIDs', () => {
      const did = '  did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK  ';
      const normalized = normalizeDID(did);
      expect(normalized).toBe('did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK');
    });

    it('should throw error for invalid DIDs', () => {
      expect(() => normalizeDID('invalid-did')).toThrow(DIDError);
      expect(() => normalizeDID('')).toThrow(DIDError);
    });

    it('should preserve all components when normalizing', () => {
      const did = 'did:web:example.com/path?service=agent&version=1.0#keys-1';
      const normalized = normalizeDID(did);
      expect(normalized).toBe(did);
    });
  });
});

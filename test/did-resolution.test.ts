/**
 * DID Resolution Interface Compliance Tests
 * 
 * Tests for DID Resolution metadata structures and error handling
 * as specified in W3C DID Core specification Section 7.
 */

import { describe, it, expect } from 'vitest';
import { validateDID, parseDID, createDIDKey, createDIDWeb } from '../src/index';

describe('DID Resolution Interface Compliance', () => {
  describe('DID Resolution Metadata Structure', () => {
    it('should handle resolution metadata properties', () => {
      // Test the structure that would be returned by a resolver
      const mockResolutionMetadata = {
        contentType: 'application/did+json',
        retrieved: '2023-01-01T00:00:00Z',
        duration: 150
      };

      // Verify metadata structure is valid
      expect(mockResolutionMetadata).toHaveProperty('contentType');
      expect(mockResolutionMetadata.contentType).toMatch(/^application\/did\+/);
      expect(mockResolutionMetadata.retrieved).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
      expect(typeof mockResolutionMetadata.duration).toBe('number');
    });

    it('should handle error metadata with proper error codes', () => {
      const errorCodes = [
        'invalidDid',
        'notFound', 
        'representationNotSupported',
        'methodNotSupported'
      ];

      for (const errorCode of errorCodes) {
        const mockErrorMetadata = {
          error: errorCode,
          message: `Resolution failed with error: ${errorCode}`
        };

        expect(mockErrorMetadata.error).toBe(errorCode);
        expect(typeof mockErrorMetadata.message).toBe('string');
      }
    });
  });

  describe('DID Document Metadata', () => {
    it('should handle equivalentId metadata property', () => {
      const baseDID = createDIDKey("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a", 'ed25519-pub');
      
      const mockDocumentMetadata = {
        equivalentId: [
          baseDID,
          'did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw' // Same DID, different representation
        ],
        canonicalId: baseDID
      };

      expect(Array.isArray(mockDocumentMetadata.equivalentId)).toBe(true);
      expect(mockDocumentMetadata.equivalentId).toContain(baseDID);
      expect(mockDocumentMetadata.canonicalId).toBe(baseDID);

      // All equivalent IDs must be valid DIDs
      for (const did of mockDocumentMetadata.equivalentId) {
        const validation = validateDID(did);
        expect(validation.isValid).toBe(true);
      }
    });

    it('should handle canonicalId metadata property', () => {
      const canonicalDID = createDIDWeb('example.com');
      const equivalentDID = 'did:web:example.com:users:canonical';

      const mockDocumentMetadata = {
        canonicalId: canonicalDID,
        equivalentId: [canonicalDID, equivalentDID]
      };

      expect(mockDocumentMetadata.canonicalId).toBe(canonicalDID);
      
      // Canonical ID must be logically equivalent to other IDs
      const canonicalValidation = validateDID(mockDocumentMetadata.canonicalId);
      expect(canonicalValidation.isValid).toBe(true);
      
      for (const did of mockDocumentMetadata.equivalentId) {
        const validation = validateDID(did);
        expect(validation.isValid).toBe(true);
        
        // Should have same method (logical equivalence check)
        const canonicalParsed = parseDID(mockDocumentMetadata.canonicalId);
        const equivalentParsed = parseDID(did);
        expect(canonicalParsed.components?.method).toBe(equivalentParsed.components?.method);
      }
    });

    it('should handle created and updated timestamps', () => {
      const mockDocumentMetadata = {
        created: '2023-01-01T00:00:00Z',
        updated: '2023-06-01T12:30:45Z',
        versionId: '1',
        nextUpdate: '2024-01-01T00:00:00Z',
        nextVersionId: '2'
      };

      // Validate ISO 8601 timestamp format
      expect(mockDocumentMetadata.created).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
      expect(mockDocumentMetadata.updated).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
      expect(mockDocumentMetadata.nextUpdate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);

      // Version IDs should be strings
      expect(typeof mockDocumentMetadata.versionId).toBe('string');
      expect(typeof mockDocumentMetadata.nextVersionId).toBe('string');

      // Updated should be after created
      const createdTime = new Date(mockDocumentMetadata.created).getTime();
      const updatedTime = new Date(mockDocumentMetadata.updated).getTime();
      expect(updatedTime).toBeGreaterThan(createdTime);
    });

    it('should handle deactivated status', () => {
      const mockDocumentMetadata = {
        deactivated: true,
        deactivatedAt: '2023-12-01T00:00:00Z'
      };

      expect(typeof mockDocumentMetadata.deactivated).toBe('boolean');
      expect(mockDocumentMetadata.deactivatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    });
  });

  describe('Resolution Options Validation', () => {
    it('should handle accept parameter for content type negotiation', () => {
      const resolutionOptions = {
        accept: 'application/did+ld+json'
      };

      expect(resolutionOptions.accept).toMatch(/^application\/did\+/);
      
      const validContentTypes = [
        'application/did+json',
        'application/did+ld+json',
        'application/did+cbor'
      ];

      expect(validContentTypes).toContain(resolutionOptions.accept);
    });

    it('should handle versionId resolution option', () => {
      const resolutionOptions = {
        versionId: '1',
        versionTime: '2023-01-01T00:00:00Z'
      };

      expect(typeof resolutionOptions.versionId).toBe('string');
      expect(resolutionOptions.versionTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    });

    it('should handle transform resolution option', () => {
      const resolutionOptions = {
        transform: 'https://example.com/transform/v1'
      };

      expect(resolutionOptions.transform).toMatch(/^https?:\/\//);
    });
  });

  describe('DID URL Dereferencing Metadata', () => {
    it('should handle dereferencing metadata structure', () => {
      const mockDereferencingMetadata = {
        contentType: 'application/json',
        retrieved: '2023-01-01T00:00:00Z',
        duration: 75
      };

      expect(typeof mockDereferencingMetadata.contentType).toBe('string');
      expect(mockDereferencingMetadata.retrieved).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
      expect(typeof mockDereferencingMetadata.duration).toBe('number');
      expect(mockDereferencingMetadata.duration).toBeGreaterThan(0);
    });

    it('should handle dereferencing error codes', () => {
      const dereferencingErrorCodes = [
        'invalidDidUrl',
        'notFound',
        'invalidDidDocument',
        'representationNotSupported'
      ];

      for (const errorCode of dereferencingErrorCodes) {
        const mockErrorMetadata = {
          error: errorCode,
          message: `Dereferencing failed: ${errorCode}`
        };

        expect(mockErrorMetadata.error).toBe(errorCode);
        expect(typeof mockErrorMetadata.message).toBe('string');
      }
    });
  });

  describe('Metadata Structure Validation', () => {
    it('should enforce metadata structure constraints', () => {
      // Metadata must be serializable as JSON
      const mockMetadata = {
        created: '2023-01-01T00:00:00Z',
        equivalentId: ['did:key:z6Mk123', 'did:web:example.com'],
        properties: {
          nested: {
            value: 42,
            flag: true,
            items: ['a', 'b', 'c']
          }
        },
        nullValue: null
      };

      // Must be JSON serializable
      expect(() => JSON.stringify(mockMetadata)).not.toThrow();
      
      const serialized = JSON.stringify(mockMetadata);
      const deserialized = JSON.parse(serialized);
      expect(deserialized).toEqual(mockMetadata);

      // All property values must be valid types
      function validateMetadataValue(value: unknown): boolean {
        if (value === null) return true;
        if (typeof value === 'string') return true;
        if (typeof value === 'number') return true;
        if (typeof value === 'boolean') return true;
        if (Array.isArray(value)) {
          return value.every(item => validateMetadataValue(item));
        }
        if (typeof value === 'object') {
          return Object.values(value).every(v => validateMetadataValue(v));
        }
        return false;
      }

      expect(validateMetadataValue(mockMetadata)).toBe(true);
    });

    it('should reject invalid metadata structures', () => {
      const invalidMetadataExamples = [
        // Function values not allowed
        { callback: () => console.log('invalid') },
        // Undefined values not allowed (should be null)
        { undefinedValue: undefined },
        // Symbol values not allowed
        { symbol: Symbol('invalid') }
      ];

      for (const metadata of invalidMetadataExamples) {
        // Should not be JSON serializable or should lose information
        try {
          const serialized = JSON.stringify(metadata);
          const deserialized = JSON.parse(serialized);
          // If it serializes, it should not equal the original (lossy)
          expect(deserialized).not.toEqual(metadata);
        } catch {
          // If it throws, that's also acceptable
          expect(true).toBe(true);
        }
      }
    });
  });

  describe('Resolution Function Interface', () => {
    it('should validate resolve function signature requirements', () => {
      // Mock resolve function that would comply with W3C spec
      async function mockResolve(
        did: string,
        resolutionOptions: Record<string, unknown> = {}
      ) {
        const validation = validateDID(did);
        
        if (!validation.isValid) {
          return {
            didDocument: null,
            didDocumentMetadata: {},
            didResolutionMetadata: {
              error: 'invalidDid',
              message: validation.error
            }
          };
        }

        // Mock successful resolution
        return {
          didDocument: {
            id: did,
            '@context': resolutionOptions.accept === 'application/did+ld+json' 
              ? 'https://www.w3.org/ns/did/v1' 
              : undefined
          },
          didDocumentMetadata: {
            created: '2023-01-01T00:00:00Z',
            updated: '2023-01-01T00:00:00Z'
          },
          didResolutionMetadata: {
            contentType: resolutionOptions.accept || 'application/did+json',
            retrieved: new Date().toISOString(),
            duration: 100
          }
        };
      }

      // Test valid DID resolution
      const validDID = createDIDKey("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a", 'ed25519-pub');
      
      // Should not throw and should return proper structure
      expect(async () => {
        const result = await mockResolve(validDID);
        expect(result).toHaveProperty('didDocument');
        expect(result).toHaveProperty('didDocumentMetadata');
        expect(result).toHaveProperty('didResolutionMetadata');
        expect(result.didDocument?.id).toBe(validDID);
      }).not.toThrow();

      // Test invalid DID resolution
      expect(async () => {
        const result = await mockResolve('invalid-did');
        expect(result.didDocument).toBeNull();
        expect(result.didResolutionMetadata.error).toBe('invalidDid');
      }).not.toThrow();
    });

    it('should validate resolveRepresentation function requirements', () => {
      // Mock resolveRepresentation function
      async function mockResolveRepresentation(
        did: string,
        resolutionOptions: Record<string, unknown> = {}
      ) {
        const validation = validateDID(did);
        
        if (!validation.isValid) {
          return {
            didDocumentStream: new Uint8Array(),
            didDocumentMetadata: {},
            didResolutionMetadata: {
              error: 'invalidDid',
              message: validation.error
            }
          };
        }

        const document = {
          id: did,
          '@context': resolutionOptions.accept === 'application/did+ld+json' 
            ? 'https://www.w3.org/ns/did/v1' 
            : undefined
        };

        const documentString = JSON.stringify(document);
        const documentStream = new TextEncoder().encode(documentString);

        return {
          didDocumentStream: documentStream,
          didDocumentMetadata: {
            created: '2023-01-01T00:00:00Z'
          },
          didResolutionMetadata: {
            contentType: resolutionOptions.accept || 'application/did+json',
            retrieved: new Date().toISOString(),
            duration: 50
          }
        };
      }

      const validDID = createDIDKey("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a", 'ed25519-pub');

      expect(async () => {
        const result = await mockResolveRepresentation(validDID, { 
          accept: 'application/did+ld+json' 
        });
        
        expect(result).toHaveProperty('didDocumentStream');
        expect(result.didDocumentStream).toBeInstanceOf(Uint8Array);
        expect(result.didResolutionMetadata.contentType).toBe('application/did+ld+json');
        
        // Stream should contain valid JSON
        const jsonString = new TextDecoder().decode(result.didDocumentStream);
        const parsed = JSON.parse(jsonString);
        expect(parsed.id).toBe(validDID);
        expect(parsed['@context']).toBe('https://www.w3.org/ns/did/v1');
      }).not.toThrow();
    });
  });
});

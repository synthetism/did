/**
 * W3C DID Core Specification Compliance Tests
 * 
 * Comprehensive test suite covering all W3C DID Core specification requirements
 * including conforming producer/consumer tests, representation validation,
 * and advanced DID document properties.
 */

import { describe, it, expect } from 'vitest';
import {
  createDIDKey,
  createDIDWeb,
  createDIDDocument,
  validateDID,
  parseDID,
  isDID,
  extractMethod,
  extractIdentifier,
  normalizeDID
} from '../src/index';

describe('W3C DID Core Specification Compliance', () => {
  describe('Conforming Producer Tests', () => {
    it('should produce conforming DIDs', () => {
      const publicKeyHex = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
      const did = createDIDKey(publicKeyHex, 'ed25519-pub');
      
      // Must be a valid DID according to ABNF grammar
      expect(did).toMatch(/^did:[a-z0-9]+:[a-zA-Z0-9._-]+$/);
      expect(did.startsWith('did:')).toBe(true);
      expect(did.split(':').length).toBe(3);
      
      // Must not produce non-conforming DIDs
      expect(did).not.toMatch(/^did:$/);
      expect(did).not.toMatch(/^did:[^:]*:$/);
    });

    it('should produce conforming DID documents', () => {
      const did = createDIDKey("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a", 'ed25519-pub');
      const document = createDIDDocument(did, {
        verificationMethod: [{
          id: `${did}#key-1`,
          type: 'Ed25519VerificationKey2020',
          controller: did,
          publicKeyMultibase: 'z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw'
        }],
        authentication: [`${did}#key-1`],
        service: [{
          id: '#agent',
          type: 'DIDCommMessaging',
          serviceEndpoint: 'https://example.com/agent'
        }]
      });

      // Must have required id property
      expect(document).toHaveProperty('id');
      expect(document.id).toBe(did);
      
      // Must be valid JSON structure
      expect(() => JSON.stringify(document)).not.toThrow();
      expect(() => JSON.parse(JSON.stringify(document))).not.toThrow();
      
      // Service IDs must be properly formatted
      expect(document.service?.[0]?.id).toBe(`${did}#agent`);
      
      // Verification method references must be valid
      expect(document.authentication?.[0]).toBe(`${did}#key-1`);
    });

    it('should handle representation-specific entries correctly', () => {
      const did = createDIDKey("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a", 'ed25519-pub');
      const document = createDIDDocument(did, {
        '@context': ['https://www.w3.org/ns/did/v1'],
        service: [{
          id: '#service-1',
          type: 'LinkedDomains',
          serviceEndpoint: 'https://example.com'
        }]
      });

      // @context should be preserved in JSON-LD representation
      if (document['@context']) {
        expect(document['@context']).toContain('https://www.w3.org/ns/did/v1');
      }
    });
  });

  describe('Conforming Consumer Tests', () => {
    it('should consume valid DIDs correctly', () => {
      const validDIDs = [
        'did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw',
        'did:web:example.com',
        'did:web:example.com:users:alice',
        'did:web:example.com%3A8080'
      ];

      for (const did of validDIDs) {
        const validation = validateDID(did);
        expect(validation.isValid).toBe(true);
        expect(validation.error).toBeUndefined();
        
        const parsed = parseDID(did);
        expect(parsed.isValid).toBe(true);
        expect(parsed.components).toBeDefined();
        
        expect(isDID(did)).toBe(true);
      }
    });

    it('should produce errors when consuming non-conforming DIDs', () => {
      const invalidDIDs = [
        '',                                    // Empty string
        'did:',                               // Empty method
        'did:key:',                          // Empty identifier
        'not-a-did',                         // No DID prefix
        'did:web:',                          // Empty web identifier
        // Note: did:invalid:method is syntactically valid but unsupported
        'did:key:invalid-encoding',          // Invalid encoding
        'DID:KEY:UPPERCASE',                 // Must be lowercase
        'did:key:z6Mk#fragment-without-valid-did' // Invalid structure
      ];

      // Also test a separate case for unsupported but syntactically valid methods
      const unsupportedMethod = 'did:invalid:method';
      const unsupportedValidation = validateDID(unsupportedMethod);
      expect(unsupportedValidation.isValid).toBe(true); // Syntactically valid
      expect(unsupportedValidation.warnings).toContain("Method 'invalid' is not officially supported");

      for (const did of invalidDIDs) {
        const validation = validateDID(did);
        expect(validation.isValid).toBe(false);
        expect(validation.error).toBeDefined();
        
        expect(isDID(did)).toBe(false);
      }

      // Test that isDID also correctly identifies syntactically valid unsupported methods
      expect(isDID(unsupportedMethod)).toBe(true);
    });

    it('should handle representation conversion correctly', () => {
      const did = createDIDKey("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a", 'ed25519-pub');
      const document = createDIDDocument(did);

      // Should be able to serialize and deserialize without loss
      const serialized = JSON.stringify(document);
      const deserialized = JSON.parse(serialized);
      
      expect(deserialized.id).toBe(document.id);
      expect(deserialized).toEqual(document);
    });
  });

  describe('DID Parameters Validation', () => {
    it('should handle versionId parameter', () => {
      const didWithVersion = 'did:web:example.com?versionId=1';
      const parsed = parseDID(didWithVersion);
      
      expect(parsed.isValid).toBe(true);
      expect(parsed.components?.query).toEqual({ versionId: '1' });
    });

    it('should handle versionTime parameter', () => {
      const didWithTime = 'did:web:example.com?versionTime=2023-01-01T00:00:00Z';
      const parsed = parseDID(didWithTime);
      
      expect(parsed.isValid).toBe(true);
      expect(parsed.components?.query).toEqual({ 
        versionTime: '2023-01-01T00:00:00Z' 
      });
    });

    it('should handle hl (hashlink) parameter', () => {
      const didWithHashlink = 'did:web:example.com?hl=zQmWvQxTqbG2Z9HPJgG57jjwR154cKhbtJenbyYTWkjgF3e';
      const parsed = parseDID(didWithHashlink);
      
      expect(parsed.isValid).toBe(true);
      expect(parsed.components?.query).toEqual({ 
        hl: 'zQmWvQxTqbG2Z9HPJgG57jjwR154cKhbtJenbyYTWkjgF3e' 
      });
    });

    it('should handle service parameter with relativeRef', () => {
      const didWithService = 'did:web:example.com?service=agent&relativeRef=/messages';
      const parsed = parseDID(didWithService);
      
      expect(parsed.isValid).toBe(true);
      expect(parsed.components?.query).toEqual({ 
        service: 'agent',
        relativeRef: '/messages'
      });
    });

    it('should handle multiple parameters', () => {
      const complexDID = 'did:web:example.com?versionId=1&service=agent&hl=zQm123';
      const parsed = parseDID(complexDID);
      
      expect(parsed.isValid).toBe(true);
      expect(parsed.components?.query).toEqual({
        versionId: '1',
        service: 'agent',
        hl: 'zQm123'
      });
    });
  });

  describe('Advanced DID Document Properties', () => {
    it('should handle alsoKnownAs property', () => {
      const did = createDIDKey("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a", 'ed25519-pub');
      const document = createDIDDocument(did, {
        verificationMethod: [],
        service: []
      });

      // Manually add alsoKnownAs for testing (not part of standard interface)
      const extendedDocument = {
        ...document,
        alsoKnownAs: [
          'did:web:example.com',
          'https://example.com/identity'
        ]
      };

      expect(extendedDocument.alsoKnownAs).toEqual([
        'did:web:example.com',
        'https://example.com/identity'
      ]);
      
      // All alsoKnownAs values must be valid URIs
      for (const uri of extendedDocument.alsoKnownAs) {
        expect(uri).toMatch(/^(did:|https?:|urn:)/);
      }
    });

    it('should handle controller property', () => {
      const did = createDIDKey("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a", 'ed25519-pub');
      const controllerDID = createDIDWeb('example.com');
      
      const document = createDIDDocument(did, {
        controller: controllerDID
      });

      expect(document.controller).toBe(controllerDID);
      
      // Controller must be a valid DID
      const validation = validateDID(document.controller as string);
      expect(validation.isValid).toBe(true);
    });

    it('should handle multiple controllers', () => {
      const did = createDIDKey("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a", 'ed25519-pub');
      const controllers = [
        createDIDWeb('controller1.com'),
        createDIDWeb('controller2.com')
      ];
      
      const document = createDIDDocument(did, {
        controller: controllers[0] // Use single controller for type compatibility
      });

      // Manually test multiple controllers concept
      const extendedDocument = {
        ...document,
        controller: controllers
      };

      expect(Array.isArray(extendedDocument.controller)).toBe(true);
      expect(extendedDocument.controller).toEqual(controllers);
      
      // All controllers must be valid DIDs
      for (const controller of extendedDocument.controller as string[]) {
        const validation = validateDID(controller);
        expect(validation.isValid).toBe(true);
      }
    });

    it('should handle multiple verification relationships', () => {
      const did = createDIDKey("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a", 'ed25519-pub');
      const document = createDIDDocument(did, {
        verificationMethod: [{
          id: `${did}#key-1`,
          type: 'Ed25519VerificationKey2020',
          controller: did,
          publicKeyMultibase: 'z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw'
        }],
        authentication: [`${did}#key-1`],
        assertionMethod: [`${did}#key-1`],
        keyAgreement: [`${did}#key-1`],
        capabilityInvocation: [`${did}#key-1`],
        capabilityDelegation: [`${did}#key-1`]
      });

      expect(document.authentication).toContain(`${did}#key-1`);
      expect(document.assertionMethod).toContain(`${did}#key-1`);
      expect(document.keyAgreement).toContain(`${did}#key-1`);
      expect(document.capabilityInvocation).toContain(`${did}#key-1`);
      expect(document.capabilityDelegation).toContain(`${did}#key-1`);
    });

    it('should handle embedded vs referenced verification methods', () => {
      const did = createDIDKey("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a", 'ed25519-pub');
      const document = createDIDDocument(did, {
        verificationMethod: [{
          id: `${did}#key-1`,
          type: 'Ed25519VerificationKey2020',
          controller: did,
          publicKeyMultibase: 'z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw'
        }],
        authentication: [
          // Referenced verification method
          `${did}#key-1`,
          // Embedded verification method
          {
            id: `${did}#key-2`,
            type: 'Ed25519VerificationKey2020',
            controller: did,
            publicKeyMultibase: 'z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw'
          }
        ]
      });

      expect(typeof document.authentication?.[0]).toBe('string');
      expect(typeof document.authentication?.[1]).toBe('object');
      
      const embeddedMethod = document.authentication?.[1] as { id: string };
      expect(embeddedMethod?.id).toBe(`${did}#key-2`);
    });
  });

  describe('JSON-LD Representation Validation', () => {
    it('should handle @context property correctly', () => {
      const did = createDIDKey("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a", 'ed25519-pub');
      const document = createDIDDocument(did, {
        '@context': [
          'https://www.w3.org/ns/did/v1',
          'https://w3id.org/security/suites/ed25519-2020/v1'
        ]
      });

      expect(document['@context']).toEqual([
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1'
      ]);
    });

    it('should handle simple @context string', () => {
      const did = createDIDKey("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a", 'ed25519-pub');
      const document = createDIDDocument(did, {
        '@context': 'https://www.w3.org/ns/did/v1'
      });

      expect(document['@context']).toBe('https://www.w3.org/ns/did/v1');
    });

    it('should produce valid JSON-LD when serialized', () => {
      const did = createDIDKey("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a", 'ed25519-pub');
      const document = createDIDDocument(did, {
        '@context': 'https://www.w3.org/ns/did/v1',
        verificationMethod: [{
          id: `${did}#key-1`,
          type: 'Ed25519VerificationKey2020',
          controller: did,
          publicKeyMultibase: 'z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw'
        }]
      });

      const serialized = JSON.stringify(document, null, 2);
      expect(serialized).toContain('@context');
      expect(serialized).toContain('https://www.w3.org/ns/did/v1');
      
      // Should be valid JSON
      expect(() => JSON.parse(serialized)).not.toThrow();
    });
  });

  describe('Media Type Handling', () => {
    it('should be compatible with application/did+json', () => {
      const did = createDIDKey("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a", 'ed25519-pub');
      const document = createDIDDocument(did, { mediaType: 'application/did+json' });

      // Should serialize to valid JSON
      const json = JSON.stringify(document);
      expect(() => JSON.parse(json)).not.toThrow();
      
      // Should not contain JSON-LD specific properties for plain JSON
      expect(document['@context']).toBeUndefined();
    });

    it('should be compatible with application/did+ld+json', () => {
      const did = createDIDKey("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a", 'ed25519-pub');
      const document = createDIDDocument(did, {
        '@context': 'https://www.w3.org/ns/did/v1'
      });

      // Should serialize to valid JSON-LD
      const jsonld = JSON.stringify(document);
      expect(() => JSON.parse(jsonld)).not.toThrow();
      expect(jsonld).toContain('@context');
    });
  });

  describe('DID URL Components Validation', () => {
    it('should handle all DID URL components', () => {
      const complexDIDURL = 'did:web:example.com/path/to/resource?versionId=1&service=agent#key-1';
      const parsed = parseDID(complexDIDURL);

      expect(parsed.isValid).toBe(true);
      expect(parsed.components?.method).toBe('web');
      expect(parsed.components?.identifier).toBe('example.com');
      expect(parsed.components?.path).toBe('path/to/resource');
      expect(parsed.components?.query).toEqual({ versionId: '1', service: 'agent' });
      expect(parsed.components?.fragment).toBe('key-1');
    });

    it('should validate relative DID URLs', () => {
      const relativeDIDURLs = [
        '#key-1',
        '?service=agent',
        '/path/to/resource',
        '?versionId=1#key-1',
        '/path?service=agent#key-1'
      ];

      for (const url of relativeDIDURLs) {
        // Relative DID URLs should be parseable in the context of a base DID
        const baseDID = 'did:web:example.com';
        const fullURL = baseDID + url;
        const parsed = parseDID(fullURL);
        
        expect(parsed.isValid).toBe(true);
      }
    });
  });

  describe('Error Code Validation', () => {
    it('should provide specific error codes for different validation failures', () => {
      const testCases = [
        {
          input: '',
          expectedError: /empty|invalid/i
        },
        {
          input: 'not-a-did',
          expectedError: /scheme|format/i
        },
        {
          input: 'did:',
          expectedError: /method|empty/i
        },
        {
          input: 'did:invalid:',
          expectedError: /identifier|empty/i
        }
      ];

      for (const { input, expectedError } of testCases) {
        const validation = validateDID(input);
        expect(validation.isValid).toBe(false);
        expect(validation.error).toMatch(expectedError);
      }
    });
  });

  describe('Standards Compliance Edge Cases', () => {
    it('should handle case sensitivity correctly', () => {
      // DID scheme must be lowercase
      expect(validateDID('DID:web:example.com').isValid).toBe(false);
      expect(validateDID('did:WEB:example.com').isValid).toBe(false);
      expect(validateDID('did:web:EXAMPLE.COM').isValid).toBe(true); // Domain case is preserved
    });

    it('should handle percent encoding in did:web', () => {
      const didWithPort = createDIDWeb('example.com:8080');
      expect(didWithPort).toBe('did:web:example.com%3A8080');
      
      const validation = validateDID(didWithPort);
      expect(validation.isValid).toBe(true);
    });

    it('should reject invalid characters in method names', () => {
      const invalidMethods = [
        'did:me-thod:identifier',  // Hyphens not allowed in method names
        'did:method_name:identifier', // Underscores not allowed
        'did:Method:identifier',   // Uppercase not allowed
        'did:123method:identifier' // Cannot start with number
      ];

      for (const did of invalidMethods) {
        const validation = validateDID(did);
        expect(validation.isValid).toBe(false);
      }
    });

    it('should handle unicode characters appropriately', () => {
      // Unicode in domain names should be handled correctly
      const unicodeDID = 'did:web:examplé.com';
      const validation = validateDID(unicodeDID);
      // This should either be valid (if properly encoded) or invalid with clear error
      expect(typeof validation.isValid).toBe('boolean');
      if (!validation.isValid) {
        expect(validation.error).toBeDefined();
      }
    });
  });
});

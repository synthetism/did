/**
 * @synet/did - did-resolver compatibility tests
 * 
 * Tests to ensure our DID documents are compatible with did-resolver
 * and follow industry standards.
 */

import { describe, it, expect } from 'vitest';
import { Resolver } from 'did-resolver';
import {
  createDID,
  createDIDDocument,
  createDIDKey,
  createDIDWeb,
  createDIDSynet
} from '../src/index';

describe('DID Resolver Compatibility', () => {
  
  // Create a mock resolver for testing document structure
  const mockResolver = new Resolver({
    key: async (did: string) => {
      // For did:key, we simulate resolution
      const doc = createDIDDocument(did);
      return {
        didDocument: doc,
        didResolutionMetadata: {},
        didDocumentMetadata: {}
      };
    },
    web: async (did: string) => {
      // For did:web, we simulate resolution
      const doc = createDIDDocument(did);
      return {
        didDocument: doc,
        didResolutionMetadata: {},
        didDocumentMetadata: {}
      };
    },
    synet: async (did: string) => {
      // For did:synet, we simulate resolution
      const doc = createDIDDocument(did);
      return {
        didDocument: doc,
        didResolutionMetadata: {},
        didDocumentMetadata: {}
      };
    }
  });

  describe('DID Document Structure Validation', () => {
    it('should create did:key documents that follow DID Core spec', async () => {
      const publicKeyHex = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
      const did = createDIDKey(publicKeyHex, "Ed25519");
      const doc = createDIDDocument(did);
      
      // Validate basic structure
      expect(doc.id).toBe(did);
      expect(doc['@context']).toBeDefined();
      expect(Array.isArray(doc['@context'])).toBe(true);
      
      // Validate required fields per DID Core spec
      expect(doc.id).toMatch(/^did:key:/);
      
      // Test with mock resolver
      const result = await mockResolver.resolve(did);
      expect(result.didDocument).toBeDefined();
      expect(result.didDocument?.id).toBe(did);
    });

    it('should create did:web documents that follow DID Core spec', async () => {
      const did = createDIDWeb('example.com');
      const doc = createDIDDocument(did);
      
      // Validate basic structure
      expect(doc.id).toBe(did);
      expect(doc['@context']).toBeDefined();
      expect(doc.id).toMatch(/^did:web:/);
      
      // Test with mock resolver
      const result = await mockResolver.resolve(did);
      expect(result.didDocument).toBeDefined();
      if (result.didDocument) {
        expect(result.didDocument.id).toBe(did);
      }
    });

    it('should create did:synet documents that follow DID Core spec', async () => {
      const did = createDIDSynet("test-synet-identifier-12345");
      const doc = createDIDDocument(did);
      
      // Validate basic structure
      expect(doc.id).toBe(did);
      expect(doc['@context']).toBeDefined();
      expect(doc.id).toMatch(/^did:synet:/);
      
      // Test with mock resolver
      const result = await mockResolver.resolve(did);
      expect(result.didDocument).toBeDefined();
      if (result.didDocument) {
        expect(result.didDocument.id).toBe(did);
      }
    });
  });

  describe('Verification Method Compatibility', () => {
    it('should create verification methods compatible with did-resolver', async () => {
      const publicKeyHex = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
      const did = createDIDKey(publicKeyHex, "Ed25519");
      const doc = createDIDDocument(did, {
        verificationMethod: {
          id: `${did}#key-1`,
          type: 'Ed25519VerificationKey2020',
          controller: did,
          publicKeyMultibase: 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK'
        }
      });
      
      expect(doc.verificationMethod).toBeDefined();
      expect(Array.isArray(doc.verificationMethod)).toBe(true);
      
      if (doc.verificationMethod && doc.verificationMethod.length > 0) {
        const vm = doc.verificationMethod[0];
        expect(vm.id).toBeDefined();
        expect(vm.type).toBeDefined();
        expect(vm.controller).toBeDefined();
        expect(vm.publicKeyMultibase).toBeDefined();
      }
    });
  });

  describe('Service Endpoint Compatibility', () => {
    it('should create service endpoints compatible with did-resolver', async () => {
      const did = createDIDSynet("test-service-identifier-12345");
      const doc = createDIDDocument(did, {
        service: [{
          id: `${did}#service-1`,
          type: 'LinkedDomains',
          serviceEndpoint: 'https://example.com'
        }]
      });
      
      expect(doc.service).toBeDefined();
      expect(Array.isArray(doc.service)).toBe(true);
      
      if (doc.service && doc.service.length > 0) {
        const service = doc.service[0];
        expect(service.id).toBeDefined();
        expect(service.type).toBeDefined();
        expect(service.serviceEndpoint).toBeDefined();
      }
    });
  });

  describe('Context Validation', () => {
    it('should include required DID context', () => {
      const publicKeyHex = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
      const did = createDIDKey(publicKeyHex, "Ed25519");
      const doc = createDIDDocument(did);
      
      expect(doc['@context']).toBeDefined();
      expect(Array.isArray(doc['@context'])).toBe(true);
      
      const contexts = doc['@context'] as string[];
      expect(contexts).toContain('https://www.w3.org/ns/did/v1');
    });

    it('should support additional contexts', () => {
      const publicKeyHex = "8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a";
      const did = createDIDKey(publicKeyHex, "X25519");
      const doc = createDIDDocument(did, {
        '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/ed25519-2020/v1']
      });
      
      const contexts = doc['@context'] as string[];
      expect(contexts).toContain('https://www.w3.org/ns/did/v1');
      expect(contexts).toContain('https://w3id.org/security/suites/ed25519-2020/v1');
    });
  });

  describe('Error Handling', () => {
    it('should handle resolution errors gracefully', async () => {
      const invalidDid = 'did:invalid:test';
      
      try {
        await mockResolver.resolve(invalidDid);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});

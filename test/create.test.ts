/**
 * @synet/did - Create tests
 * 
 * Comprehensive tests for DID creation functions.
 */

import { describe, it, expect } from 'vitest';
import {
  createDID,
  createDIDKey,
  createDIDWeb,
  createDIDSynet,
  createDIDDocument,
  isDID,
  DIDError
} from '../src/index';

describe('DID Creation', () => {
  describe('createDIDKey', () => {
    it('should create a valid did:key DID', () => {
      const did = createDIDKey();
      expect(isDID(did)).toBe(true);
      expect(did).toMatch(/^did:key:ed25519-[a-zA-Z0-9]{32,50}$/);
    });

    it('should create a did:key with custom public key', () => {
      const publicKey = 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
      const did = createDIDKey({ publicKey });
      expect(isDID(did)).toBe(true);
      expect(did).toBe(`did:key:${publicKey}`);
    });

    it('should create a did:key with secp256k1 key type', () => {
      const did = createDIDKey({ keyType: 'secp256k1' });
      expect(isDID(did)).toBe(true);
      expect(did).toMatch(/^did:key:secp256k1-[a-zA-Z0-9]{32,50}$/);
    });

    it('should create different DIDs on multiple calls', () => {
      const did1 = createDIDKey();
      const did2 = createDIDKey();
      expect(did1).not.toBe(did2);
    });
  });

  describe('createDIDWeb', () => {
    it('should create a valid did:web DID', () => {
      const did = createDIDWeb('example.com');
      expect(isDID(did)).toBe(true);
      expect(did).toBe('did:web:example.com');
    });

    it('should create a did:web with path', () => {
      const did = createDIDWeb('example.com', 'path/to/resource');
      expect(isDID(did)).toBe(true);
      expect(did).toBe('did:web:example.com:path:to:resource');
    });

    it('should handle domain with port', () => {
      const did = createDIDWeb('example.com:8080');
      expect(isDID(did)).toBe(true);
      expect(did).toBe('did:web:example.com%3A8080');
    });

    it('should throw error for invalid domain', () => {
      expect(() => createDIDWeb('')).toThrow(DIDError);
      expect(() => createDIDWeb('localhost')).toThrow(DIDError);
      expect(() => createDIDWeb('http://example.com')).toThrow(DIDError);
    });

    it('should throw error for non-string domain', () => {
      expect(() => createDIDWeb(null as unknown as string)).toThrow(DIDError);
      expect(() => createDIDWeb(undefined as unknown as string)).toThrow(DIDError);
      expect(() => createDIDWeb(123 as unknown as string)).toThrow(DIDError);
    });
  });

  describe('createDIDSynet', () => {
    it('should create a valid did:synet DID', () => {
      const did = createDIDSynet();
      expect(isDID(did)).toBe(true);
      expect(did).toMatch(/^did:synet:[a-zA-Z0-9]{32,50}$/);
    });

    it('should create a did:synet with custom identifier', () => {
      const identifier = 'customidentifier123456';
      const did = createDIDSynet(identifier);
      expect(isDID(did)).toBe(true);
      expect(did).toBe(`did:synet:${identifier}`);
    });

    it('should throw error for short identifier', () => {
      expect(() => createDIDSynet('short')).toThrow(DIDError);
      expect(() => createDIDSynet('1234567')).toThrow(DIDError);
    });

    it('should create different DIDs on multiple calls', () => {
      const did1 = createDIDSynet();
      const did2 = createDIDSynet();
      expect(did1).not.toBe(did2);
    });
  });

  describe('createDID', () => {
    it('should create did:key DID', () => {
      const did = createDID({ method: 'key' });
      expect(isDID(did)).toBe(true);
      expect(did).toMatch(/^did:key:/);
    });

    it('should create did:web DID', () => {
      const did = createDID({ method: 'web', identifier: 'example.com' });
      expect(isDID(did)).toBe(true);
      expect(did).toBe('did:web:example.com');
    });

    it('should create did:synet DID', () => {
      const did = createDID({ method: 'synet' });
      expect(isDID(did)).toBe(true);
      expect(did).toMatch(/^did:synet:/);
    });

    it('should create did:synet with custom identifier', () => {
      const identifier = 'customidentifier123456';
      const did = createDID({ method: 'synet', identifier });
      expect(isDID(did)).toBe(true);
      expect(did).toBe(`did:synet:${identifier}`);
    });

    it('should throw error for missing web identifier', () => {
      expect(() => createDID({ method: 'web' })).toThrow(DIDError);
    });

    it('should pass through options to specific creators', () => {
      const publicKey = 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
      const did = createDID({ method: 'key', publicKey });
      expect(did).toBe(`did:key:${publicKey}`);
    });
  });

  describe('createDIDDocument', () => {
    it('should create a basic DID document', () => {
      const did = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
      const document = createDIDDocument(did);

      expect(document.id).toBe(did);
      expect(document.controller).toBe(did);
      expect(document['@context']).toEqual([
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1'
      ]);
    });

    it('should create DID document with verification method', () => {
      const did = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
      const publicKey = 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
      
      const document = createDIDDocument(did, { publicKey });

      expect(document.verificationMethod).toHaveLength(1);
      expect(document.verificationMethod?.[0]).toEqual({
        id: `${did}#keys-1`,
        type: 'Ed25519VerificationKey2020',
        controller: did,
        publicKeyMultibase: publicKey
      });
      expect(document.authentication).toEqual([`${did}#keys-1`]);
      expect(document.assertionMethod).toEqual([`${did}#keys-1`]);
    });

    it('should create DID document with custom controller', () => {
      const did = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
      const controller = 'did:web:example.com';
      
      const document = createDIDDocument(did, { controller });

      expect(document.controller).toBe(controller);
    });

    it('should create DID document with custom key type', () => {
      const did = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
      const publicKey = 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
      const keyType = 'JsonWebKey2020';
      
      const document = createDIDDocument(did, { publicKey, keyType });

      expect(document.verificationMethod?.[0].type).toBe(keyType);
    });

    it('should create DID document with services', () => {
      const did = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
      const services = [
        { id: '#agent', type: 'DIDCommMessaging', serviceEndpoint: 'https://example.com/agent' },
        { id: 'https://example.com/service', type: 'LinkedDomains', serviceEndpoint: 'https://example.com' }
      ];
      
      const document = createDIDDocument(did, { services });

      expect(document.service).toHaveLength(2);
      expect(document.service?.[0]).toEqual({
        id: `${did}#agent`,
        type: 'DIDCommMessaging',
        serviceEndpoint: 'https://example.com/agent'
      });
      expect(document.service?.[1]).toEqual({
        id: 'https://example.com/service',
        type: 'LinkedDomains',
        serviceEndpoint: 'https://example.com'
      });
    });

    it('should throw error for invalid DID', () => {
      expect(() => createDIDDocument('invalid-did')).toThrow(DIDError);
      expect(() => createDIDDocument('')).toThrow(DIDError);
      expect(() => createDIDDocument('did:')).toThrow(DIDError);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options objects', () => {
      const did = createDIDKey({});
      expect(isDID(did)).toBe(true);
    });

    it('should handle undefined options', () => {
      const did = createDIDKey(undefined);
      expect(isDID(did)).toBe(true);
    });

    it('should create documents with empty services array', () => {
      const did = 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK';
      const document = createDIDDocument(did, { services: [] });
      
      expect(document.service).toBeUndefined();
    });

    it('should handle special characters in web domain path', () => {
      const did = createDIDWeb('example.com', 'path/with-special_chars.json');
      expect(isDID(did)).toBe(true);
      expect(did).toBe('did:web:example.com:path:with-special_chars.json');
    });
  });
});

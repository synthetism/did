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
    it('should create a valid did:key DID with Ed25519 key', () => {
      const publicKeyHex = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
      const did = createDIDKey(publicKeyHex, "Ed25519");
      expect(isDID(did)).toBe(true);
      expect(did).toBe('did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw');
    });

    it('should create a valid did:key DID with secp256k1 key', () => {
      const publicKeyHex = "02b97c30de767f084ce3439de539bae75de6b9f1bb2d9bb3c8e0b3cf68f12c5e9e";
      const did = createDIDKey(publicKeyHex, "secp256k1");
      expect(isDID(did)).toBe(true);
      expect(did).toBe('did:key:zQ3shZtr1sUnrETvXQSyvnEnpFDBXGKmdk7NxELbWHgxKrNbF');
    });

    it('should create a valid did:key DID with X25519 key', () => {
      const publicKeyHex = "8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a";
      const did = createDIDKey(publicKeyHex, "X25519");
      expect(isDID(did)).toBe(true);
      expect(did).toBe('did:key:z6LSkdrX4EvewpktHBjvNxRDogPdC5iVF8LT3LPKefGAgi89');
    });

    it('should handle hex keys with 0x prefix', () => {
      const publicKeyHex = "0xd75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
      const did = createDIDKey(publicKeyHex, "Ed25519");
      expect(isDID(did)).toBe(true);
      expect(did).toBe('did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw');
    });

    it('should throw error for empty public key', () => {
      expect(() => createDIDKey("", "Ed25519")).toThrow(DIDError);
      expect(() => createDIDKey("", "Ed25519")).toThrow("Public key is required");
    });

    it('should throw error for invalid hex format', () => {
      expect(() => createDIDKey("not-hex", "Ed25519")).toThrow(DIDError);
      expect(() => createDIDKey("not-hex", "Ed25519")).toThrow("Invalid public key hex format");
    });

    it('should throw error for wrong key length', () => {
      expect(() => createDIDKey("abcd", "Ed25519")).toThrow(DIDError);
      expect(() => createDIDKey("abcd", "Ed25519")).toThrow("Ed25519 public key must be 32 bytes");
    });

    it('should throw error for unsupported key type', () => {
      const publicKeyHex = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
      expect(() => createDIDKey(publicKeyHex, "unsupported" as "Ed25519")).toThrow(DIDError);
      expect(() => createDIDKey(publicKeyHex, "unsupported" as "Ed25519")).toThrow("Unsupported key type");
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
    it('should create a valid did:synet DID with custom identifier', () => {
      const identifier = 'customidentifier123456';
      const did = createDIDSynet(identifier);
      expect(isDID(did)).toBe(true);
      expect(did).toBe(`did:synet:${identifier}`);
    });

    it('should throw error for empty identifier', () => {
      expect(() => createDIDSynet('')).toThrow(DIDError);
      expect(() => createDIDSynet('')).toThrow('Identifier is required for did:synet creation');
    });

    it('should throw error for short identifier', () => {
      expect(() => createDIDSynet('short')).toThrow(DIDError);
      expect(() => createDIDSynet('1234567')).toThrow(DIDError);
    });

    it('should accept identifiers with valid characters', () => {
      const identifier = 'valid-identifier_123ABC';
      const did = createDIDSynet(identifier);
      expect(isDID(did)).toBe(true);
      expect(did).toBe(`did:synet:${identifier}`);
    });
  });

  describe('createDID', () => {
    it('should create did:key DID with public key', () => {
      const publicKeyHex = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
      const did = createDID({ 
        method: 'key', 
        publicKey: publicKeyHex,
        keyType: 'Ed25519'
      });
      expect(isDID(did)).toBe(true);
      expect(did).toBe('did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw');
    });

    it('should create did:web DID', () => {
      const did = createDID({ method: 'web', identifier: 'example.com' });
      expect(isDID(did)).toBe(true);
      expect(did).toBe('did:web:example.com');
    });

    it('should create did:synet DID', () => {
      const identifier = 'customidentifier123456';
      const did = createDID({ method: 'synet', identifier });
      expect(isDID(did)).toBe(true);
      expect(did).toBe(`did:synet:${identifier}`);
    });

    it('should throw error for missing required fields', () => {
      expect(() => createDID({ method: 'web' })).toThrow(DIDError);
      expect(() => createDID({ method: 'key' })).toThrow(DIDError);
      expect(() => createDID({ method: 'synet' })).toThrow(DIDError);
    });

    it('should throw error for missing web identifier', () => {
      expect(() => createDID({ method: 'web' })).toThrow(DIDError);
      expect(() => createDID({ method: 'web' })).toThrow('Identifier (domain) is required for did:web');
    });

    it('should throw error for missing key fields', () => {
      expect(() => createDID({ method: 'key' })).toThrow(DIDError);
      expect(() => createDID({ method: 'key' })).toThrow('publicKey is required');
    });

    it('should throw error for missing synet identifier', () => {
      expect(() => createDID({ method: 'synet' })).toThrow(DIDError);
      expect(() => createDID({ method: 'synet' })).toThrow('identifier is required for did:synet creation');
    });
  });

  describe('createDIDDocument', () => {
    it('should create a basic DID document', () => {
      const did = 'did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw';
      const document = createDIDDocument(did);

      expect(document.id).toBe(did);
      expect(document.controller).toBe(did);
      expect(document['@context']).toEqual([
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1'
      ]);
    });

    it('should create DID document with verification method', () => {
      const did = 'did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw';
      const publicKey = 'z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw';
      
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
      const did = 'did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw';
      const controller = 'did:web:example.com';
      
      const document = createDIDDocument(did, { controller });

      expect(document.controller).toBe(controller);
    });

    it('should create DID document with custom key type', () => {
      const did = 'did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw';
      const publicKey = 'z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw';
      const keyType = 'JsonWebKey2020';
      
      const document = createDIDDocument(did, { publicKey, keyType });

      expect(document.verificationMethod?.[0].type).toBe(keyType);
    });

    it('should create DID document with services', () => {
      const did = 'did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw';
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
    it('should handle hex keys with proper validation', () => {
      const publicKeyHex = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
      const did = createDIDKey(publicKeyHex, "Ed25519");
      expect(isDID(did)).toBe(true);
      expect(did).toBe('did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw');
    });

    it('should create documents with empty services array', () => {
      const did = 'did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw';
      const document = createDIDDocument(did, { services: [] });
      
      expect(document.service).toBeUndefined();
    });

    it('should handle special characters in web domain path', () => {
      const did = createDIDWeb('example.com', 'path/with-special_chars.json');
      expect(isDID(did)).toBe(true);
      expect(did).toBe('did:web:example.com:path:with-special_chars.json');
    });

    it('should validate public key format strictly', () => {
      expect(() => createDIDKey('not-a-valid-key', 'Ed25519')).toThrow(DIDError);
      expect(() => createDIDKey('', 'Ed25519')).toThrow(DIDError);
      expect(() => createDIDKey('123', 'Ed25519')).toThrow(DIDError);
    });
  });
});

/**
 * @synet/did - DID creators
 * 
 * Functions for creating DIDs using different methods.
 */

import type { DIDCreateOptions, DIDDocument, VerificationMethod } from './types.js';
import { DIDError } from './types.js';
import { validateDID } from './utils.js';

/**
 * Generate a random identifier
 * 
 * @param length - Length of the identifier
 * @returns Random identifier string
 */
function generateIdentifier(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Simple fallback to Math.random for now
  // In a real implementation, we'd use proper cryptographic randomness
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  
  return result;
}

/**
 * Create a did:key DID
 * 
 * @param options - Creation options
 * @returns DID string
 */
export function createDIDKey(options: { publicKey?: string; keyType?: 'Ed25519' | 'secp256k1' } = {}): string {
  const { publicKey, keyType = 'Ed25519' } = options;
  
  let identifier: string;
  
  if (publicKey) {
    // Use provided public key as identifier
    identifier = publicKey;
  } else {
    // Generate a random identifier (in real implementation, this would derive from a key)
    identifier = `${keyType.toLowerCase()}-${generateIdentifier(32)}`;
  }
  
  const did = `did:key:${identifier}`;
  
  // Validate the created DID
  const validation = validateDID(did);
  if (!validation.isValid) {
    throw new DIDError(`Failed to create valid did:key: ${validation.error}`);
  }
  
  return did;
}

/**
 * Create a did:web DID
 * 
 * @param domain - Domain name for the DID
 * @param path - Optional path component
 * @returns DID string
 */
export function createDIDWeb(domain: string, path?: string): string {
  if (!domain || typeof domain !== 'string') {
    throw new DIDError('Domain is required for did:web');
  }
  
  // Basic domain validation
  if (!domain.includes('.') || domain.includes('://')) {
    throw new DIDError('Invalid domain format for did:web');
  }
  
  // Encode domain for DID (replace : with %3A)
  const encodedDomain = domain.replace(/:/g, '%3A');
  
  let identifier = encodedDomain;
  if (path) {
    identifier += `:${path.replace(/\//g, ':')}`;
  }
  
  const did = `did:web:${identifier}`;
  
  // Validate the created DID
  const validation = validateDID(did);
  if (!validation.isValid) {
    throw new DIDError(`Failed to create valid did:web: ${validation.error}`);
  }
  
  return did;
}

/**
 * Create a did:synet DID
 * 
 * @param identifier - Optional identifier, will be generated if not provided
 * @returns DID string
 */
export function createDIDSynet(identifier?: string): string {
  const id = identifier || generateIdentifier(42);
  
  if (id.length < 8) {
    throw new DIDError('Synet DID identifier must be at least 8 characters');
  }
  
  const did = `did:synet:${id}`;
  
  // Validate the created DID
  const validation = validateDID(did);
  if (!validation.isValid) {
    throw new DIDError(`Failed to create valid did:synet: ${validation.error}`);
  }
  
  return did;
}

/**
 * Create a DID using the specified method
 * 
 * @param options - Creation options
 * @returns DID string
 */
export function createDID(options: DIDCreateOptions): string {
  switch (options.method) {
    case 'key':
      return createDIDKey({
        publicKey: options.publicKey,
        keyType: options.keyType
      });
      
    case 'web':
      if (!options.identifier) {
        throw new DIDError('Identifier (domain) is required for did:web');
      }
      return createDIDWeb(options.identifier);
      
    case 'synet':
      return createDIDSynet(options.identifier);
      
    default:
      throw new DIDError(`Unsupported DID method: ${options.method}`);
  }
}

/**
 * Create a basic DID document for a given DID
 * 
 * @param did - DID string
 * @param options - Optional document options
 * @returns DID document
 */
export function createDIDDocument(
  did: string, 
  options: {
    publicKey?: string;
    keyType?: string;
    controller?: string;
    services?: Array<{ id: string; type: string; serviceEndpoint: string }>;
  } = {}
): DIDDocument {
  const validation = validateDID(did);
  if (!validation.isValid) {
    throw new DIDError(`Invalid DID: ${validation.error}`);
  }
  
  const { publicKey, keyType = 'Ed25519VerificationKey2020', controller, services } = options;
  
  const document: DIDDocument = {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/ed25519-2020/v1'
    ],
    id: did,
    controller: controller || did
  };
  
  // Add verification method if public key is provided
  if (publicKey) {
    const verificationMethod: VerificationMethod = {
      id: `${did}#keys-1`,
      type: keyType,
      controller: document.controller as string,
      publicKeyMultibase: publicKey
    };
    
    document.verificationMethod = [verificationMethod];
    document.authentication = [verificationMethod.id];
    document.assertionMethod = [verificationMethod.id];
  }
  
  // Add services if provided
  if (services && services.length > 0) {
    document.service = services.map(service => ({
      id: service.id.startsWith('#') ? `${did}${service.id}` : service.id,
      type: service.type,
      serviceEndpoint: service.serviceEndpoint
    }));
  }
  
  return document;
}

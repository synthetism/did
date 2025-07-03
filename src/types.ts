/**
 * @synet/did - Simple DID library for Synet network
 * 
 * Core types and interfaces for Decentralized Identifiers (DIDs).
 * This package provides minimal, dependency-free DID creation and manipulation.
 */

/**
 * Supported DID methods
 */
export type DIDMethod = 'key' | 'web' | 'synet';

/**
 * DID URL components
 */
export interface DIDComponents {
  method: DIDMethod;
  identifier: string;
  path?: string;
  query?: Record<string, string>;
  fragment?: string;
}

/**
 * DID Document verification method
 */
export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  publicKeyMultibase?: string;
  publicKeyJwk?: Record<string, unknown>;
}

/**
 * DID Document service endpoint
 */
export interface ServiceEndpoint {
  id: string;
  type: string;
  serviceEndpoint: string | string[] | Record<string, unknown>;
}

/**
 * DID Document structure
 */
export interface DIDDocument {
  '@context'?: string | string[];
  id: string;
  controller?: string | string[];
  verificationMethod?: VerificationMethod[];
  authentication?: (string | VerificationMethod)[];
  assertionMethod?: (string | VerificationMethod)[];
  keyAgreement?: (string | VerificationMethod)[];
  capabilityInvocation?: (string | VerificationMethod)[];
  capabilityDelegation?: (string | VerificationMethod)[];
  service?: ServiceEndpoint[];
  alsoKnownAs?: string[];
}

/**
 * DID creation options
 */
export interface DIDCreateOptions {
  method: DIDMethod;
  identifier?: string;
  publicKey?: string;
  keyType?: 'Ed25519' | 'secp256k1';
}

/**
 * DID parsing result
 */
export interface DIDParseResult {
  did: string;
  components: DIDComponents;
  isValid: boolean;
  error?: string;
}

/**
 * DID validation result
 */
export interface DIDValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

/**
 * Error thrown when DID operations fail
 */
export class DIDError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DIDError';
  }
}

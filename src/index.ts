/**
 * @synet/did - Simple DID library for Synet network
 * 
 * A minimal, dependency-free library for creating and manipulating
 * Decentralized Identifiers (DIDs). This package provides:
 * 
 * - DID creation for did:key, did:web, and did:synet methods
 * - DID parsing and validation
 * - Basic DID document generation
 * - Type-safe interfaces and utilities
 * 
 * @version 1.0.0
 * @license MIT
 */

// Export types
export type {
  DIDMethod,
  DIDComponents,
  DIDParseResult,
  DIDValidationResult,
  DIDCreateOptions,
  DIDDocument,
  VerificationMethod,
  ServiceEndpoint
} from './types.js';

// Export error class
export { DIDError } from './types.js';

// Export utilities
export {
  parseDID,
  validateDID,
  createDIDURL,
  isDID,
  extractMethod,
  extractIdentifier,
  normalizeDID
} from './utils.js';

// Export creators
export {
  createDID,
  createDIDKey,
  createDIDWeb,
  createDIDSynet,
  createDIDDocument
} from './create.js';

// Import functions for default export
import {
  createDID,
  createDIDKey,
  createDIDWeb,
  createDIDSynet,
  createDIDDocument
} from './create.js';

import {
  parseDID,
  validateDID,
  isDID,
  extractMethod,
  extractIdentifier,
  normalizeDID
} from './utils.js';

// Version export
export const VERSION = '1.0.0';

// Default export for convenience
export default {
  createDID,
  createDIDKey,
  createDIDWeb,
  createDIDSynet,
  createDIDDocument,
  parseDID,
  validateDID,
  isDID,
  extractMethod,
  extractIdentifier,
  normalizeDID,
  VERSION
};

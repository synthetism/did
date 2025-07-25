/**
 * @synet/did - Production DID Library
 *
 * A secure, minimal, standards-compliant library for creating and manipulating
 * Decentralized Identifiers (DIDs) in production environments. This package provides:
 *
 * - DID creation for did:key and did:web methods only
 * - Standards-compliant multicodec encoding
 * - Strict input validation and security
 * - DID parsing and validation
 * - Basic DID document generation
 * - Type-safe interfaces and utilities
 *
 * @version 1.0.6
 * @license MIT
 */

export const VERSION = "1.0.6";


// Export types
export type {
  DIDMethod,
  DIDComponents,
  DIDParseResult,
  DIDValidationResult,
  DIDCreateOptions,
  DIDDocument,
  VerificationMethod,
  ServiceEndpoint,
} from "./types";

// Export key type from create
export type { KeyType } from "./create";

// Export error class
export { DIDError } from "./types";

// Export utilities
export {
  parseDID,
  validateDID,
  createDIDURL,
  isDID,
  extractMethod,
  extractIdentifier,
  normalizeDID,
} from "./utils";

// Export creators
export {
  createDID,
  createDIDKey,
  createDIDWeb,
  createDIDDocument,
} from "./create";

// Export DID Unit
export { DID } from "./did";
export type { DIDOptions } from "./did";

// Import functions for default export
import {
  createDID,
  createDIDKey,
  createDIDWeb,
  createDIDDocument,
} from "./create";

import {
  parseDID,
  validateDID,
  isDID,
  extractMethod,
  extractIdentifier,
  normalizeDID,
} from "./utils";

import { DID } from "./did";

// Version export

// Default export for convenience
export default {
  // Core functions
  createDID,
  createDIDKey,
  createDIDWeb,
  createDIDDocument,
  parseDID,
  validateDID,
  isDID,
  extractMethod,
  extractIdentifier,
  normalizeDID,
  // DID Unit
  DID,
  // Meta
  VERSION,
};

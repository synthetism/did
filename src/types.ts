/**
 * @synet/did - Simple DID library for Synet network
 *
 * Core types and interfaces for Decentralized Identifiers (DIDs).
 * This package provides minimal, dependency-free DID creation and manipulation.
 *
 * Types aligned with did-resolver specification for maximum compatibility.
 */

/**
 * Supported DID methods for production use
 */
export type DIDMethod = "key" | "web";

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
 * Key capability sections from DID specification
 */
export type KeyCapabilitySection =
  | "authentication"
  | "assertionMethod"
  | "keyAgreement"
  | "capabilityInvocation"
  | "capabilityDelegation";

/**
 * JSON Web Key structure for public keys
 */
export interface JsonWebKey {
  kty: string;
  use?: string;
  key_ops?: string[];
  alg?: string;
  kid?: string;
  x5u?: string;
  x5c?: string[];
  x5t?: string;
  "x5t#S256"?: string;
  // Additional properties based on key type
  [x: string]: unknown;
}

/**
 * DID Document verification method (aligned with did-resolver)
 */
export interface VerificationMethod {
  id: string;
  type: string;
  controller: string;
  // Standard public key formats
  publicKeyBase58?: string;
  publicKeyBase64?: string;
  publicKeyJwk?: JsonWebKey;
  publicKeyHex?: string;
  publicKeyMultibase?: string;
  // Blockchain-specific formats
  blockchainAccountId?: string;
  ethereumAddress?: string;
  // ConditionalProof2022 subtypes (future-proofing)
  conditionOr?: VerificationMethod[];
  conditionAnd?: VerificationMethod[];
  threshold?: number;
  conditionThreshold?: VerificationMethod[];
  conditionWeightedThreshold?: ConditionWeightedThreshold[];
  conditionDelegated?: string;
  relationshipParent?: string[];
  relationshipChild?: string[];
  relationshipSibling?: string[];
}

/**
 * Condition weighted threshold for ConditionalProof2022
 */
export interface ConditionWeightedThreshold {
  condition: VerificationMethod;
  weight: number;
}

/**
 * Service endpoint type (aligned with did-resolver)
 */
export type ServiceEndpoint = string | Record<string, unknown>;

/**
 * DID Document service (aligned with did-resolver)
 */
export interface Service {
  id: string;
  type: string;
  serviceEndpoint: ServiceEndpoint | ServiceEndpoint[];
  // Allow additional properties
  [x: string]: unknown;
}

/**
 * DID Document structure (aligned with did-resolver)
 */
export interface DIDDocument {
  "@context"?: "https://www.w3.org/ns/did/v1" | string | string[];
  id: string;
  alsoKnownAs?: string[];
  controller?: string | string[];
  verificationMethod?: VerificationMethod[];
  service?: Service[];
  /**
   * @deprecated Use verificationMethod instead
   */
  publicKey?: VerificationMethod[];
  // Key capability sections
  authentication?: (string | VerificationMethod)[];
  assertionMethod?: (string | VerificationMethod)[];
  keyAgreement?: (string | VerificationMethod)[];
  capabilityInvocation?: (string | VerificationMethod)[];
  capabilityDelegation?: (string | VerificationMethod)[];
}

/**
 * DID creation options
 */
export interface DIDCreateOptions {
  method: DIDMethod;
  publicKey?: string; // Required for did:key method
  keyType?:
    | "ed25519-pub"
    | "secp256k1-pub"
    | "x25519-pub"
    | "Ed25519"
    | "secp256k1"
    | "X25519"; // Support legacy names
  domain?: string; // Required for did:web method
  path?: string; // Optional path for did:web
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
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "DIDError";
  }
}

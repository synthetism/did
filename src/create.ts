/**
 * @synet/did - DID creators
 *
 * Functions for creating DIDs using different methods.
 */

import type {
  DIDCreateOptions,
  DIDDocument,
  VerificationMethod,
  Service,
} from "./types";
import { DIDError } from "./types";
import { validateDID } from "./utils";

/**
 * Ge  const did = `did:synet:${identifier}`;

  // Validate the constructed DID
  const validation = validateDID(did);
  if (!validation.isValid) {
    throw new DIDError(`Failed to create valid did:synet: ${validation.error}`);
  }

  return did;yptographically secure random bytes
 *
 * @param length - Number of bytes to generate
 * @returns Uint8Array of random bytes
 */
function getRandomBytes(length: number): Uint8Array {
  // Try to use crypto.getRandomValues if available
  if (
    typeof globalThis !== "undefined" &&
    "crypto" in globalThis &&
    typeof globalThis.crypto === "object" &&
    globalThis.crypto !== null &&
    "getRandomValues" in globalThis.crypto &&
    typeof globalThis.crypto.getRandomValues === "function"
  ) {
    const array = new Uint8Array(length);
    globalThis.crypto.getRandomValues(array);
    return array;
  }

  // Try Node.js crypto module
  try {
    const crypto = require("node:crypto") as {
      randomBytes: (size: number) => Buffer;
    };
    return new Uint8Array(crypto.randomBytes(length));
  } catch {
    // Fallback warning and Math.random (not cryptographically secure)
    console.warn(
      "[@synet/did] No cryptographically secure random source available. Using Math.random() fallback.",
    );
    const array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }
}

/**
 * Simple base58 encoding (Bitcoin alphabet)
 *
 * @param buffer - Buffer to encode
 * @returns Base58 encoded string
 */
function encodeBase58(buffer: Uint8Array): string {
  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

  if (buffer.length === 0) return "";

  // Convert bytes to big integer
  let num = 0n;
  for (let i = 0; i < buffer.length; i++) {
    num = num * 256n + BigInt(buffer[i]);
  }

  // Convert to base58
  let result = "";
  while (num > 0) {
    const remainder = Number(num % 58n);
    result = alphabet[remainder] + result;
    num = num / 58n;
  }

  // Handle leading zeros
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    result = `1${result}`;
  }

  return result;
}

/**
 * Multicodec codes for key types
 */
const MULTICODEC_CODES = {
  "ed25519-pub": new Uint8Array([0xed, 0x01]),
  "secp256k1-pub": new Uint8Array([0xe7, 0x01]), 
  "x25519-pub": new Uint8Array([0xec, 0x01]),
} as const;

/**
 * Encode bytes as multibase with multicodec prefix
 *
 * @param bytes - Bytes to encode
 * @param codec - Multicodec identifier
 * @returns Multibase encoded string with 'z' prefix (base58btc)
 */
function encodeMultibase(
  bytes: Uint8Array, 
  codec: keyof typeof MULTICODEC_CODES
): string {
  const codecBytes = MULTICODEC_CODES[codec];
  if (!codecBytes) {
    throw new Error(`Unknown codec: ${codec}`);
  }
  
  // Combine multicodec prefix with key bytes
  const combined = new Uint8Array(codecBytes.length + bytes.length);
  combined.set(codecBytes, 0);
  combined.set(bytes, codecBytes.length);
  
  // Encode as base58btc (prefix 'z')
  return `z${encodeBase58(combined)}`;
}

/**
 * Generate a cryptographically secure random identifier
 *
 * @param length - Length in bytes (not characters)
 * @returns Base58 encoded random identifier
 */
function generateSecureIdentifier(length = 32): string {
  const randomBytes = getRandomBytes(length);
  return encodeBase58(randomBytes);
}

/**
 * Generate a simple random identifier (for backwards compatibility)
 *
 * @param length - Length of the identifier in characters
 * @returns Random identifier string
 */
function generateIdentifier(length = 32): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  // Simple fallback to Math.random for now
  // In a real implementation, we'd use proper cryptographic randomness
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

/**
 * Create a did:key DID from a public key
 *
 * @param publicKeyHex - The public key in hex format (required for did:key)
 * @param keyType - The type of key (Ed25519, secp256k1, or X25519)
 * @returns DID string
 */
export function createDIDKey(
  publicKeyHex: string,
  keyType: "Ed25519" | "secp256k1" | "X25519" = "Ed25519",
): string {
  if (!publicKeyHex || typeof publicKeyHex !== "string") {
    throw new DIDError("Public key is required for did:key creation");
  }

  // Remove 0x prefix if present
  const cleanHex = publicKeyHex.startsWith("0x") 
    ? publicKeyHex.slice(2) 
    : publicKeyHex;

  // Validate hex format
  if (!/^[0-9a-fA-F]+$/.test(cleanHex)) {
    throw new DIDError("Invalid public key hex format");
  }

  // Convert hex to bytes
  const publicKeyBytes = new Uint8Array(
    cleanHex.match(/.{1,2}/g)?.map(byte => Number.parseInt(byte, 16)) || []
  );

  // Create multibase-encoded identifier based on key type
  let methodSpecificId: string;
  
  try {
    switch (keyType) {
      case "Ed25519":
        // Ed25519 public keys are 32 bytes
        if (publicKeyBytes.length !== 32) {
          throw new DIDError("Ed25519 public key must be 32 bytes");
        }
        methodSpecificId = encodeMultibase(publicKeyBytes, "ed25519-pub");
        break;
        
      case "secp256k1":
        // secp256k1 public keys can be 33 bytes (compressed) or 65 bytes (uncompressed)
        if (publicKeyBytes.length !== 33 && publicKeyBytes.length !== 65) {
          throw new DIDError("secp256k1 public key must be 33 or 65 bytes");
        }
        methodSpecificId = encodeMultibase(publicKeyBytes, "secp256k1-pub");
        break;
        
      case "X25519":
        // X25519 public keys are 32 bytes
        if (publicKeyBytes.length !== 32) {
          throw new DIDError("X25519 public key must be 32 bytes");
        }
        methodSpecificId = encodeMultibase(publicKeyBytes, "x25519-pub");
        break;
        
      default:
        throw new DIDError(`Unsupported key type: ${keyType}`);
    }
  } catch (error) {
    if (error instanceof DIDError) throw error;
    throw new DIDError(`Failed to encode public key: ${error}`);
  }

  const did = `did:key:${methodSpecificId}`;

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
  if (!domain || typeof domain !== "string") {
    throw new DIDError("Domain is required for did:web");
  }

  // Basic domain validation
  if (!domain.includes(".") || domain.includes("://")) {
    throw new DIDError("Invalid domain format for did:web");
  }

  // Encode domain for DID (replace : with %3A)
  const encodedDomain = domain.replace(/:/g, "%3A");

  let identifier = encodedDomain;
  if (path) {
    identifier += `:${path.replace(/\//g, ":")}`;
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
 * @param identifier - Required identifier for the DID
 * @returns DID string
 */
export function createDIDSynet(identifier: string): string {
  if (!identifier || typeof identifier !== "string") {
    throw new DIDError("Identifier is required for did:synet creation");
  }

  if (identifier.length < 8) {
    throw new DIDError("Synet DID identifier must be at least 8 characters");
  }

  const did = `did:synet:${identifier}`;

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
    case "key":
      if (!options.publicKey) {
        throw new DIDError("publicKey is required for did:key creation");
      }
      return createDIDKey(
        options.publicKey,
        options.keyType as "Ed25519" | "secp256k1" | "X25519"
      );

    case "web":
      if (!options.identifier) {
        throw new DIDError("Identifier (domain) is required for did:web");
      }
      return createDIDWeb(options.identifier);

    case "synet":
      if (!options.identifier) {
        throw new DIDError("identifier is required for did:synet creation");
      }
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
    "@context"?: string | string[];
    controller?: string;
    verificationMethod?: VerificationMethod | VerificationMethod[];
    authentication?: (string | VerificationMethod)[];
    assertionMethod?: (string | VerificationMethod)[];
    keyAgreement?: (string | VerificationMethod)[];
    capabilityInvocation?: (string | VerificationMethod)[];
    capabilityDelegation?: (string | VerificationMethod)[];
    service?: Service[];
    // Legacy support
    publicKey?: string;
    keyType?: string;
    services?: Array<{
      id: string;
      type: string;
      serviceEndpoint: string;
      [x: string]: unknown;
    }>;
  } = {},
): DIDDocument {
  const validation = validateDID(did);
  if (!validation.isValid) {
    throw new DIDError(`Invalid DID: ${validation.error}`);
  }

  const {
    "@context": contextOption,
    controller,
    verificationMethod,
    authentication,
    assertionMethod,
    keyAgreement,
    capabilityInvocation,
    capabilityDelegation,
    service,
    // Legacy support
    publicKey,
    keyType = "Ed25519VerificationKey2020",
    services,
  } = options;

  const document: DIDDocument = {
    "@context": contextOption || [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/ed25519-2020/v1",
    ],
    id: did,
    controller: controller || did,
  };

  // Add verification method if provided
  if (verificationMethod) {
    document.verificationMethod = Array.isArray(verificationMethod)
      ? verificationMethod
      : [verificationMethod];
  } else if (publicKey) {
    // Legacy support
    const vm: VerificationMethod = {
      id: `${did}#keys-1`,
      type: keyType,
      controller: document.controller as string,
      publicKeyMultibase: publicKey,
    };

    document.verificationMethod = [vm];
    document.authentication = [vm.id];
    document.assertionMethod = [vm.id];
  }

  // Add capability sections if provided
  if (authentication) {
    document.authentication = authentication;
  }

  if (assertionMethod) {
    document.assertionMethod = assertionMethod;
  }

  if (keyAgreement) {
    document.keyAgreement = keyAgreement;
  }

  if (capabilityInvocation) {
    document.capabilityInvocation = capabilityInvocation;
  }

  if (capabilityDelegation) {
    document.capabilityDelegation = capabilityDelegation;
  }

  // Add services if provided
  if (service && service.length > 0) {
    document.service = service;
  } else if (services && services.length > 0) {
    // Legacy support
    document.service = services.map((s) => {
      const { id, type, serviceEndpoint, ...additionalProps } = s;
      return {
        id: id.startsWith("#") ? `${did}${id}` : id,
        type,
        serviceEndpoint,
        ...additionalProps,
      } as Service;
    });
  }

  return document;
}

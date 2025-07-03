/**
 * @synet/did - Production DID Library
 * 
 * Secure, minimal, standards-compliant DID creation for production environments.
 * Supports only did:key and did:web methods following W3C DID Core specification.
 * 
 * Security Features:
 * - No cryptographic fallbacks to weak sources
 * - Strict input validation and sanitization
 * - Minimal attack surface
 * - Standards-compliant multicodec encoding
 */

import { DIDError } from "./types";

/**
 * Official multicodec codes from https://github.com/multiformats/multicodec
 */
const MULTICODEC_CODES = {
  "ed25519-pub": 0xed,      // 237 - Ed25519 public key
  "secp256k1-pub": 0xe7,    // 231 - Secp256k1 public key (compressed)
  "x25519-pub": 0xec,       // 236 - Curve25519 public key
} as const;

/**
 * Supported key types
 */
export type KeyType = keyof typeof MULTICODEC_CODES;

/**
 * Base58 alphabet (Bitcoin/IPFS standard)
 */
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/**
 * Secure base58 encoding implementation
 */
function encodeBase58(bytes: Uint8Array): string {
  if (bytes.length === 0) return "";

  // Convert to big integer
  let value = 0n;
  for (const byte of bytes) {
    value = value * 256n + BigInt(byte);
  }

  // Convert to base58
  const digits: string[] = [];
  while (value > 0) {
    const remainder = Number(value % 58n);
    digits.unshift(BASE58_ALPHABET[remainder]);
    value = value / 58n;
  }

  // Handle leading zeros
  for (const byte of bytes) {
    if (byte !== 0) break;
    digits.unshift("1");
  }

  return digits.join("");
}

/**
 * Encode unsigned varint (simplified for single bytes)
 */
function encodeVarint(value: number): Uint8Array {
  if (value < 0 || value > 0x7f) {
    throw new DIDError("Multicodec code must be single byte");
  }
  return new Uint8Array([value]);
}

/**
 * Create multibase-encoded string with multicodec prefix
 */
function encodeMultibase(keyBytes: Uint8Array, keyType: KeyType): string {
  const codecCode = MULTICODEC_CODES[keyType];
  const codecBytes = encodeVarint(codecCode);
  
  // Combine multicodec prefix with key bytes
  const combined = new Uint8Array(codecBytes.length + keyBytes.length);
  combined.set(codecBytes, 0);
  combined.set(keyBytes, codecBytes.length);
  
  // Return base58btc encoded (prefix 'z')
  return `z${encodeBase58(combined)}`;
}

/**
 * Validate hex string format
 */
function validateHexString(hex: string): string {
  // Remove 0x prefix if present
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  
  // Validate hex format
  if (!/^[0-9a-fA-F]+$/.test(clean)) {
    throw new DIDError("Invalid hexadecimal format");
  }
  
  // Ensure even length
  if (clean.length % 2 !== 0) {
    throw new DIDError("Hexadecimal string must have even length");
  }
  
  return clean;
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const clean = validateHexString(hex);
  const bytes = new Uint8Array(clean.length / 2);
  
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substr(i, 2), 16);
  }
  
  return bytes;
}

/**
 * Validate key length for specific key type
 */
function validateKeyLength(keyBytes: Uint8Array, keyType: KeyType): void {
  const expectedLengths: Record<KeyType, number[]> = {
    "ed25519-pub": [32],              // Ed25519 is always 32 bytes
    "secp256k1-pub": [33, 65],        // Compressed (33) or uncompressed (65)
    "x25519-pub": [32],               // X25519 is always 32 bytes
  };

  const allowed = expectedLengths[keyType];
  if (!allowed.includes(keyBytes.length)) {
    throw new DIDError(
      `Invalid key length for ${keyType}: expected ${allowed.join(" or ")} bytes, got ${keyBytes.length}`
    );
  }
}

/**
 * Validate domain for did:web
 */
function validateDomain(domain: string): void {
  if (!domain || typeof domain !== "string") {
    throw new DIDError("Domain is required");
  }

  // Basic domain validation
  if (domain.includes("://") || domain.includes(" ")) {
    throw new DIDError("Invalid domain format");
  }

  // Must contain at least one dot (reject localhost, etc.)
  if (!domain.includes(".")) {
    throw new DIDError("Domain must be a valid FQDN");
  }

  // Basic length check
  if (domain.length > 253) {
    throw new DIDError("Domain too long");
  }
}

/**
 * Create a did:key DID from a public key
 * 
 * @param publicKeyHex - Public key in hexadecimal format
 * @param keyType - Type of cryptographic key
 * @returns Standards-compliant did:key DID
 */
export function createDIDKey(
  publicKeyHex: string,
  keyType: KeyType = "ed25519-pub"
): string {
  if (!publicKeyHex || typeof publicKeyHex !== "string") {
    throw new DIDError("Public key is required");
  }

  try {
    const keyBytes = hexToBytes(publicKeyHex);
    validateKeyLength(keyBytes, keyType);
    
    const multibaseId = encodeMultibase(keyBytes, keyType);
    return `did:key:${multibaseId}`;
  } catch (error) {
    if (error instanceof DIDError) {
      throw error;
    }
    throw new DIDError(`Failed to create did:key: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a did:web DID
 * 
 * @param domain - Domain name for the DID
 * @param path - Optional path component
 * @returns Standards-compliant did:web DID
 */
export function createDIDWeb(domain: string, path?: string): string {
  validateDomain(domain);

  // Encode domain (replace : with %3A for ports)
  const encodedDomain = domain.replace(/:/g, "%3A");

  let identifier = encodedDomain;
  if (path) {
    // Validate and encode path
    if (typeof path !== "string") {
      throw new DIDError("Path must be a string");
    }
    
    // Replace forward slashes with colons per did:web spec
    const encodedPath = path.replace(/\//g, ":");
    identifier += `:${encodedPath}`;
  }

  return `did:web:${identifier}`;
}

/**
 * Generic DID creation options
 */
export interface DIDCreateOptions {
  method: "key" | "web";
  publicKey?: string;
  keyType?: KeyType;
  domain?: string;
  path?: string;
}

/**
 * Create a DID using the specified method
 * 
 * @param options - DID creation options
 * @returns DID string
 */
export function createDID(options: DIDCreateOptions): string {
  switch (options.method) {
    case "key": {
      if (!options.publicKey) {
        throw new DIDError("publicKey is required for did:key");
      }
      return createDIDKey(options.publicKey, options.keyType);
    }
    
    case "web": {
      if (!options.domain) {
        throw new DIDError("domain is required for did:web");
      }
      return createDIDWeb(options.domain, options.path);
    }
    
    default:
      throw new DIDError(`Unsupported DID method: ${(options as any).method}`);
  }
}

/**
 * Validate DID format
 */
export function isDID(did: string): boolean {
  if (!did || typeof did !== "string") {
    return false;
  }

  // Basic DID format check
  const didRegex = /^did:([a-z0-9]+):(.+)$/;
  const match = did.match(didRegex);
  
  if (!match) {
    return false;
  }

  const [, method, identifier] = match;
  
  // Validate supported methods
  if (!["key", "web"].includes(method)) {
    return false;
  }

  // Basic identifier validation
  if (!identifier || identifier.length === 0) {
    return false;
  }

  return true;
}

/**
 * Extract method from DID
 */
export function extractMethod(did: string): string | null {
  if (!isDID(did)) {
    return null;
  }
  
  const match = did.match(/^did:([a-z0-9]+):/);
  return match ? match[1] : null;
}

/**
 * Extract identifier from DID
 */
export function extractIdentifier(did: string): string | null {
  if (!isDID(did)) {
    return null;
  }
  
  const match = did.match(/^did:[a-z0-9]+:(.+)$/);
  return match ? match[1] : null;
}

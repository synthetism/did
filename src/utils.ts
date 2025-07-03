/**
 * @synet/did - DID utilities
 *
 * Core utility functions for DID creation, parsing, and validation.
 */

import type {
  DIDComponents,
  DIDMethod,
  DIDParseResult,
  DIDValidationResult,
} from "./types";
import { DIDError } from "./types";

/**
 * DID URL regex pattern
 * Format: did:method:identifier[/path][?query][#fragment]
 * Updated to handle colons and other characters in identifiers
 */
const DID_REGEX =
  /^did:([a-z0-9]+):([^/?#]+)(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;

/**
 * Supported DID methods
 */
const SUPPORTED_METHODS: DIDMethod[] = ["key", "web", "synet"];

/**
 * Parse a DID URL into its components
 *
 * @param did - The DID URL to parse
 * @returns DID parsing result with components and validation status
 */
export function parseDID(did: string): DIDParseResult {
  if (!did || typeof did !== "string") {
    return {
      did,
      components: { method: "key", identifier: "" },
      isValid: false,
      error: "DID must be a non-empty string",
    };
  }

  const trimmed = did.trim();
  const match = trimmed.match(DID_REGEX);

  if (!match) {
    return {
      did: trimmed,
      components: { method: "key", identifier: "" },
      isValid: false,
      error: "Invalid DID format",
    };
  }

  const [, method, identifier, path, query, fragment] = match;

  // Parse query parameters
  const queryParams: Record<string, string> = {};
  if (query) {
    const pairs = query.split("&");
    for (const pair of pairs) {
      const [key, value] = pair.split("=");
      if (key) {
        queryParams[decodeURIComponent(key)] = value
          ? decodeURIComponent(value)
          : "";
      }
    }
  }

  const components: DIDComponents = {
    method: method as DIDMethod,
    identifier,
    path: path || undefined,
    query: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    fragment: fragment || undefined,
  };

  return {
    did: trimmed,
    components,
    isValid: true,
  };
}

/**
 * Validate a DID URL
 *
 * @param did - The DID URL to validate
 * @returns Validation result with error messages and warnings
 */
export function validateDID(did: string): DIDValidationResult {
  const parseResult = parseDID(did);

  if (!parseResult.isValid) {
    return {
      isValid: false,
      error: parseResult.error,
    };
  }

  const { components } = parseResult;
  const warnings: string[] = [];

  // Check if method is supported
  if (!SUPPORTED_METHODS.includes(components.method)) {
    warnings.push(`Method '${components.method}' is not officially supported`);
  }

  // Method-specific validation
  switch (components.method) {
    case "key":
      // did:key identifiers should not contain spaces or certain special characters
      if (!components.identifier || components.identifier.length === 0) {
        return {
          isValid: false,
          error: "Invalid did:key identifier format",
        };
      }
      // Check for invalid characters in did:key identifiers
      if (/[\s!@#$%^&*()+=\[\]{}|\\:";'<>?,./]/.test(components.identifier)) {
        return {
          isValid: false,
          error: "Invalid did:key identifier format",
        };
      }
      break;

    case "web":
      if (!components.identifier.includes(".")) {
        return {
          isValid: false,
          error: "did:web identifier must be a valid domain name",
        };
      }
      break;

    case "synet":
      if (components.identifier.length < 8) {
        return {
          isValid: false,
          error: "did:synet identifier must be at least 8 characters",
        };
      }
      break;
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Create a DID URL from components
 *
 * @param components - DID components
 * @returns Complete DID URL
 */
export function createDIDURL(components: DIDComponents): string {
  let did = `did:${components.method}:${components.identifier}`;

  if (components.path) {
    did += `/${components.path}`;
  }

  if (components.query) {
    const queryPairs = Object.entries(components.query).map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    );
    did += `?${queryPairs.join("&")}`;
  }

  if (components.fragment) {
    did += `#${components.fragment}`;
  }

  return did;
}

/**
 * Check if a string is a valid DID
 *
 * @param did - String to check
 * @returns True if valid DID
 */
export function isDID(did: string): boolean {
  return validateDID(did).isValid;
}

/**
 * Extract the method from a DID
 *
 * @param did - DID URL
 * @returns DID method or null if invalid
 */
export function extractMethod(did: string): DIDMethod | null {
  const result = parseDID(did);
  return result.isValid ? result.components.method : null;
}

/**
 * Extract the identifier from a DID
 *
 * @param did - DID URL
 * @returns DID identifier or null if invalid
 */
export function extractIdentifier(did: string): string | null {
  const result = parseDID(did);
  return result.isValid ? result.components.identifier : null;
}

/**
 * Normalize a DID by removing extra whitespace and ensuring consistent format
 *
 * @param did - DID URL to normalize
 * @returns Normalized DID URL
 */
export function normalizeDID(did: string): string {
  const result = parseDID(did);
  if (!result.isValid) {
    throw new DIDError(`Cannot normalize invalid DID: ${result.error}`);
  }
  return createDIDURL(result.components);
}

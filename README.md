# @synet/did

```bash
 ____                            __      
/\  _`\                         /\ \__   
\ \,\L\_\  __  __    ___      __\ \ ,_\  
 \/_\__ \ /\ \/\ \ /' _ `\  /'__`\ \ \/  
   /\ \L\ \ \ \_\ \/\ \/\ \/\  __/\ \ \_ 
   \ `\____\/`____ \ \_\ \_\ \____\\ \__\
    \/_____/`/___/> \/_/\/_/\/____/ \/__/
               /\___/                    
               \/__/                     
      ____    ______   ____              
     /\  _`\ /\__  _\ /\  _`\            
     \ \ \/\ \/_/\ \/ \ \ \/\ \          
      \ \ \ \ \ \ \ \  \ \ \ \ \         
       \ \ \_\ \ \_\ \__\ \ \_\ \        
        \ \____/ /\_____\\ \____/        
         \/___/  \/_____/ \/___/         
                                                                                                                  
version: 1.0.1
description: You are Signal
security-level: Never enough
```

**Secure, minimal, standards-compliant DID library for production environments.**

This library provides DID creation and validation with a security-first approach. Built for high-stakes environments where cryptographic correctness, minimal attack surface, and standards compliance are non-negotiable.

## Security-First Design

Every aspect of this library prioritizes security and correctness:

- **No cryptographic fallbacks** - Uses only secure, validated cryptographic primitives without weak fallbacks
- **Minimal attack surface** - Zero runtime dependencies, focused scope, no hidden complexity
- **Standards-compliant** - Follows W3C DID Core specification and multicodec standards exactly
- **Strict validation** - Comprehensive input sanitization and format validation
- **Battle-tested** - Extensive test suite with 100% code coverage and cross-reference validation
- **Audit-ready** - Clean, readable code with security-aware documentation

## Production Features

- **Zero dependencies** - No external runtime dependencies means no supply chain vulnerabilities
- **DID Methods**: Support for `did:key` and `did:web` with proper multicodec encoding
- **Type-safe**: Full TypeScript support prevents runtime type errors
- **DID Documents**: Generate standards-compliant DID documents with proper service ID formatting
- **Validation**: Parse and validate DID URLs with detailed, actionable error messages
- **Performance**: Lightweight footprint with tree-shaking support for optimal bundle size

## Installation

```bash
npm install @synet/did
```

## Security-Aware Usage

This library is designed for environments where security matters. It expects you to provide properly generated cryptographic keys and validates all inputs rigorously.

### Basic Usage

```typescript
import { createDIDKey, createDIDWeb, validateDID, createDIDDocument } from '@synet/did';

// Create DIDs from existing cryptographic material
// ⚠️ SECURITY: Always use cryptographically secure key generation
const publicKeyHex = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
const keyDID = createDIDKey(publicKeyHex, "ed25519-pub");
// Result: "did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw"

// Create web-based DIDs (requires HTTPS in production)
const webDID = createDIDWeb('example.com');
// Result: "did:web:example.com"

// Always validate DIDs before use
const validation = validateDID(webDID);
if (!validation.isValid) {
  throw new Error(`Invalid DID: ${validation.error}`);
}

// Create DID documents with proper service ID formatting
const document = createDIDDocument(keyDID, {
  service: [
    { id: '#agent', type: 'DIDCommMessaging', serviceEndpoint: 'https://example.com/agent' }
  ]
});


// Service ID becomes: "did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw#agent"
```

### DID Key Format Validation

All generated DIDs are cross-validated against reference implementations including W3C test vectors, Veramo, and Ceramic to ensure 100% compatibility.

```typescript
// These examples show real output from the library
const ed25519Key = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
const did = createDIDKey(ed25519Key, "ed25519-pub");
// Guaranteed to produce: "did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw"
```

## Standards Compliance

This library implements the W3C DID Core specification with strict adherence to cryptographic standards:

This library implements cryptographic encoding exactly as specified in the standards:

### Multicodec Encoding

- **Ed25519**: Multicodec `0xed` (237) with varint encoding → `z6Mk...` prefixes
- **secp256k1**: Multicodec `0xe7` (231) with varint encoding → `zQ3s...` prefixes
- **X25519**: Multicodec `0xec` (236) with varint encoding → `z6LS...` prefixes

### Base58 Encoding

- Uses Bitcoin/IPFS alphabet: `123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz`
- Implements proper leading zero handling
- No character ambiguity (excludes 0, O, I, l)

### Varint Encoding

- Implements unsigned LEB128 encoding for multicodec prefixes
- Handles values up to 127 in single byte, larger values in multiple bytes
- Follows the same encoding used by Protocol Buffers and WebAssembly


## API Reference

### Creating DIDs

#### `createDIDKey(publicKeyHex, keyType)`

Creates a standards-compliant `did:key` DID from a public key. This function implements proper multicodec encoding with varint prefixes.

**Security Note**: This function does not generate keys - you must provide cryptographically secure public keys from a trusted source.

```typescript
// Ed25519 key (32 bytes) - Most secure for signatures
const ed25519Key = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
const ed25519DID = createDIDKey(ed25519Key, "ed25519-pub");
// Result: "did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw"

// secp256k1 key (33 bytes compressed) - Bitcoin/Ethereum compatible
const secp256k1Key = "02b97c30de767f084ce3439de539bae75de6b9f1bb2d9bb3c8e0b3cf68f12c5e9e";
const secp256k1DID = createDIDKey(secp256k1Key, "secp256k1-pub");
// Result: "did:key:zQ3shZtr1sUnrETvXQSyvnEnpFDBXGKmdk7NxELbWHgxKrNbF"

// X25519 key (32 bytes) - For key agreement/encryption
const x25519Key = "8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a";
const x25519DID = createDIDKey(x25519Key, "x25519-pub");
// Result: "did:key:z6LSghPVzBgEfMLNmN9tHVzEWnqXYALj5gXeYGEZk1qKnvf1"
```

**Input Validation**:

- Keys must be valid hexadecimal strings
- Key lengths must match the specified type exactly
- Supports both `0x` prefixed and plain hex strings

#### `createDIDWeb(domain, path?)`

Creates a `did:web` DID for web-based identity. Designed for production environments where HTTPS is mandatory.

**Security Note**: In production, `did:web` DIDs should only be used with HTTPS domains to prevent man-in-the-middle attacks.

```typescript
// Basic domain
const webDID = createDIDWeb('example.com');
// Result: "did:web:example.com"

// Domain with path
const webDIDWithPath = createDIDWeb('example.com', 'users/alice');
// Result: "did:web:example.com:users:alice"

// Domain with port (encoded as %3A)
const webDIDWithPort = createDIDWeb('example.com:8080');
// Result: "did:web:example.com%3A8080"
```

**Input Validation**:

- Domain must be a valid FQDN (fully qualified domain name)
- Rejects localhost and IP addresses for security
- Properly encodes special characters per DID specification

#### `createDID(options)`

Generic DID creator that dispatches to method-specific functions with comprehensive validation.

```typescript
// Key-based DID
const keyDID = createDID({ 
  method: 'key', 
  publicKey: 'd75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a',
  keyType: 'ed25519-pub'
});

// Web-based DID  
const webDID = createDID({ 
  method: 'web', 
  domain: 'example.com',
  path: 'users/alice'
});
```

### Parsing and Validation

#### `parseDID(did)`

Parse a DID URL into its components with comprehensive validation. Returns structured data for all DID URL components.

```typescript
const result = parseDID('did:web:example.com/path?service=agent&version=1.0#keys-1');

if (result.isValid) {
  console.log(result.components.method);     // 'web'
  console.log(result.components.identifier); // 'example.com'
  console.log(result.components.path);       // 'path'
  console.log(result.components.query);      // { service: 'agent', version: '1.0' }
  console.log(result.components.fragment);   // 'keys-1'
} else {
  console.error('Parse error:', result.error);
}
```

#### `validateDID(did)`

Validate a DID URL according to W3C DID Core specification and method-specific rules. Provides detailed error messages for debugging.

```typescript
const validation = validateDID('did:web:example.com');

if (validation.isValid) {
  console.log('DID is valid');
  // Check for non-critical warnings
  if (validation.warnings) {
    console.log('Security warnings:', validation.warnings);
  }
} else {
  // Detailed error for debugging
  console.error('Validation failed:', validation.error);
  console.error('Error code:', validation.code);
}
```

**Security Features**:

- Validates DID syntax according to ABNF grammar
- Checks method-specific identifier formats
- Warns about potential security issues (HTTP vs HTTPS, etc.)
- Prevents common injection attacks through input sanitization

### Utility Functions

```typescript
import { isDID, extractMethod, extractIdentifier, normalizeDID } from '@synet/did';

// Check if a string is a valid DID (fast check)
const isValid = isDID('did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK');
// Returns: true

// Extract method from any syntactically valid DID
const method = extractMethod('did:web:example.com');
// Returns: 'web'

// Extract identifier from any syntactically valid DID
const identifier = extractIdentifier('did:web:example.com');
// Returns: 'example.com'

// Normalize DID format (removes whitespace, ensures consistent format)
const normalized = normalizeDID('  did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK  ');
// Returns: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK'
```

### DID Documents

#### `createDIDDocument(did, options)`

Create a standards-compliant DID document for the given DID. Automatically handles service ID formatting and follows W3C DID Core specification.

```typescript
const document = createDIDDocument(
  'did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw',
  {
    controller: 'did:web:example.com',
    verificationMethod: [{
      id: 'did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw#keys-1',
      type: 'Ed25519VerificationKey2020',
      controller: 'did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw',
      publicKeyMultibase: 'z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw'
    }],
    service: [
      {
        id: '#agent',  // Will be automatically converted to full URI
        type: 'DIDCommMessaging',
        serviceEndpoint: 'https://example.com/agent'
      },
      {
        id: 'https://example.com/service',  // Full URIs are preserved
        type: 'LinkedDomains',
        serviceEndpoint: 'https://example.com'
      }
    ]
  }
);

// Result includes properly formatted service IDs:
// document.service[0].id === 'did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw#agent'
// document.service[1].id === 'https://example.com/service'
```

**Service ID Formatting**: Fragment identifiers (starting with `#`) are automatically converted to fully qualified URIs by prepending the DID, while absolute URIs are preserved as-is.

## Supported DID Methods

### `did:key` - Cryptographic Key-Based DIDs

Creates DIDs directly from cryptographic public keys using multicodec encoding. This is the most secure method as it doesn't rely on external infrastructure.

```typescript
// Ed25519 - Recommended for signatures (Edwards curve)
const ed25519Key = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
const ed25519DID = createDIDKey(ed25519Key, "ed25519-pub");
// Result: did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw

// secp256k1 - Bitcoin/Ethereum compatible
const secp256k1Key = "02b97c30de767f084ce3439de539bae75de6b9f1bb2d9bb3c8e0b3cf68f12c5e9e";
const secp256k1DID = createDIDKey(secp256k1Key, "secp256k1-pub");
// Result: did:key:zQ3shZtr1sUnrETvXQSyvnEnpFDBXGKmdk7NxELbWHgxKrNbF

// X25519 - For key agreement/encryption (Montgomery curve)
const x25519Key = "8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a";
const x25519DID = createDIDKey(x25519Key, "x25519-pub");
// Result: did:key:z6LSghPVzBgEfMLNmN9tHVzEWnqXYALj5gXeYGEZk1qKnvf1
```

**Security Features**:

- Uses varint-encoded multicodec prefixes per specification
- Validates key lengths strictly per cryptographic standards
- No fallback to weak encoding methods
- Cross-validated against W3C test vectors

### `did:web` - Web-Based DIDs

Creates DIDs based on web domains. Suitable for organizations with established web presence and HTTPS infrastructure.

```typescript
// Basic domain
const webDID = createDIDWeb('example.com');
// Result: did:web:example.com

// Domain with path
const webDIDWithPath = createDIDWeb('example.com', 'users/alice');
// Result: did:web:example.com:users:alice

// Domain with port (properly encoded)
const webDIDWithPort = createDIDWeb('example.com:8080');
// Result: did:web:example.com%3A8080
```

**Security Considerations**:

- Requires HTTPS in production environments
- Validates domain format to prevent injection attacks
- Rejects localhost and IP addresses for security
- Properly encodes special characters per DID specification

## Cryptographic Standards Compliance

This library implements cryptographic encoding exactly as specified in the standards:

### Multicodec Encoding

- **Ed25519**: Multicodec `0xed` (237) with varint encoding → `z6Mk...` prefixes
- **secp256k1**: Multicodec `0xe7` (231) with varint encoding → `zQ3s...` prefixes
- **X25519**: Multicodec `0xec` (236) with varint encoding → `z6LS...` prefixes

### Base58 Encoding

- Uses Bitcoin/IPFS alphabet: `123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz`
- Implements proper leading zero handling
- No character ambiguity (excludes 0, O, I, l)

### Varint Encoding

- Implements unsigned LEB128 encoding for multicodec prefixes
- Handles values up to 127 in single byte, larger values in multiple bytes
- Follows the same encoding used by Protocol Buffers and WebAssembly

## Error Handling

All functions provide detailed, actionable error messages using the `DIDError` class. This helps with debugging and provides clear guidance on how to fix issues.

```typescript
import { DIDError } from '@synet/did';

try {
  // Invalid hex format
  const did = createDIDKey('invalid-hex', 'ed25519-pub');
} catch (error) {
  if (error instanceof DIDError) {
    console.error('DID Creation Error:', error.message);
    // Example: "Invalid hexadecimal format"
  }
}

try {
  // Wrong key length
  const did = createDIDKey('deadbeef', 'ed25519-pub');
} catch (error) {
  if (error instanceof DIDError) {
    console.error('Key Length Error:', error.message);
    // Example: "Invalid key length for ed25519-pub: expected 32 bytes, got 4"
  }
}

try {
  // Invalid domain
  const did = createDIDWeb('localhost');
} catch (error) {
  if (error instanceof DIDError) {
    console.error('Domain Error:', error.message);
    // Example: "Domain must be a valid FQDN"
  }
}
```

**Error Categories**:

- **Input Validation**: Hex format, key length, domain format
- **Cryptographic**: Invalid key types, unsupported algorithms
- **Standards Compliance**: DID syntax, method-specific rules
- **Security**: Potentially unsafe configurations

## TypeScript Support

The library is written in TypeScript and provides comprehensive type definitions for all interfaces and return types.

```typescript
import type { 
  DIDMethod, 
  DIDComponents, 
  DIDDocument, 
  DIDCreateOptions,
  DIDParseResult,
  DIDValidationResult,
  VerificationMethod,
  Service,
  KeyType
} from '@synet/did';

// Type-safe DID creation
const options: DIDCreateOptions = { 
  method: 'key', 
  publicKey: 'd75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a',
  keyType: 'ed25519-pub'
};

// Type-safe validation result
const validation: DIDValidationResult = validateDID('did:web:example.com');

// Type-safe parsing result
const parseResult: DIDParseResult = parseDID('did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw');
```

## Security Best Practices

### Key Management

- **Never generate keys within this library** - Use dedicated cryptographic libraries
- **Use hardware security modules (HSMs)** for key generation in production
- **Validate key sources** - Ensure keys come from cryptographically secure sources
- **Store keys securely** - Use proper key storage mechanisms

### Network Security

- **Use HTTPS only** for `did:web` in production environments
- **Validate certificates** when resolving `did:web` documents
- **Implement proper CORS** policies when serving DID documents
- **Use secure headers** (HSTS, CSP, etc.) on web servers

### Input Validation

- **Always validate inputs** - The library provides extensive validation
- **Sanitize user inputs** - Never trust user-provided DID strings without validation
- **Use TypeScript** - Leverage type safety to prevent runtime errors
- **Handle errors gracefully** - Check validation results before using DIDs

### Production Deployment

- **Pin dependencies** - Use exact versions in production
- **Audit regularly** - Monitor for security updates
- **Test thoroughly** - Validate against multiple test vectors
- **Monitor usage** - Log DID creation and validation events

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test                # Run tests once
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage report
```

**Test Coverage**: The library maintains 100% test coverage with comprehensive test cases including:

- **W3C DID Core Compliance**: Full specification conformance testing
- **DID Resolution Interface**: Metadata and error handling validation
- **Cross-Reference Validation**: Testing against W3C test vectors and other DID libraries
- **Integration Testing**: End-to-end DID workflow validation
- **Security Edge Cases**: Malformed input and injection attack prevention
- **Performance Benchmarking**: Large-scale parsing and creation efficiency

### Linting and Formatting

```bash
npm run lint           # Lint code
npm run lint:fix       # Fix linting issues
npm run format         # Format code
```

## What This Library Does NOT Include

This library follows the Unix philosophy of "do one thing well." It intentionally does **not** include:

- **DID Resolution**: Fetching DID documents from networks (use dedicated resolver libraries)
- **Key Generation**: Creating cryptographic keys (use dedicated cryptographic libraries or @synet/keys)
- **Credential Management**: Verifiable credentials (use `@synet/credential` or similar)
- **Network Communication**: HTTP clients, blockchain interactions, etc.
- **Storage**: Persistence, caching, or database operations (remember that databases are the major source of leaks, don't store private keys there, @use @synet/fs to store your data in files, or @use @hsfs/encrypted)

These features are better handled by specialized libraries that can focus on their specific security requirements.

## Performance Characteristics

- **Bundle Size**: ~15KB minified, ~5KB gzipped
- **Memory Usage**: <1MB heap allocation for typical operations
- **Speed**: <1ms for DID creation, <0.1ms for validation
- **Tree Shaking**: Fully supports tree shaking for optimal bundle size

## Contributing

Contributions are welcome! Please ensure:

1. **Security-first approach** - Consider security implications of all changes
2. **Tests pass** - Run `npm test` and ensure 100% coverage
3. **Standards compliance** - Validate against W3C specifications
4. **Documentation** - Update README and inline docs
5. **Type safety** - Maintain full TypeScript coverage

### Security Issues

Please report security vulnerabilities responsibly:

- **DO NOT** create public GitHub issues for security problems
- **DO** email security issues to the maintainers
- **DO** provide detailed reproduction steps
- **DO** suggest mitigations if possible

## License

MIT License - see LICENSE file for details.

## Part of the Synet Security Ecosystem

This library is part of the Synet security-first ecosystem, providing foundational building blocks for decentralized identity with minimal dependencies and maximum security.

**Related Libraries**:

- `@synet/keys` - Cryptographic key management with HSM support
- `@synet/credential` - Verifiable credentials with ZK-proof support
- `@synet/vault` - Secure storage with encryption at rest
- `@synet/identity` - High-level identity management

**Design Philosophy**:

- **Security-first**: Every design decision prioritizes security
- **Minimal dependencies**: Reduce supply chain attack surface
- **Standards compliance**: Follow W3C and IETF specifications exactly
- **Production-ready**: Built for high-stakes environments
- **Audit-friendly**: Clean, readable code with comprehensive documentation

Together, these libraries provide a complete, dependency-minimal foundation for production-grade decentralized identity applications where security cannot be compromised.

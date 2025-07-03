# @synet/did

A simple, dependency-free library for creating and manipulating Decentralized Identifiers (DIDs). Built with transparency, simplicity, and robustness in mind.

## Philosophy

This library follows the principle of **doing one thing well**. It focuses solely on DID creation, parsing, and basic validation without unnecessary bloat or complex dependencies. It's designed to be:

- **Simple**: Clean, intuitive API that's easy to understand and use
- **Transparent**: No hidden dependencies, clear functionality, readable code
- **Robust**: Comprehensive error handling and validation
- **Type-safe**: Full TypeScript support with detailed type definitions

## Features

- 🎯 **Zero dependencies** - No external runtime dependencies
- 🔐 **DID Methods**: Support for `did:key`, `did:web`, and `did:synet`
- 🎨 **Type-safe**: Full TypeScript support with comprehensive type definitions
- 📝 **DID Documents**: Generate basic DID documents with verification methods
- ✅ **Validation**: Parse and validate DID URLs with detailed error messages
- 🧪 **Well-tested**: Comprehensive test suite with 100% code coverage
- 📦 **Lightweight**: Minimal footprint with tree-shaking support

## Installation

```bash
npm install @synet/did
```

## Quick Start

```typescript
import { createDIDKey, createDIDWeb, parseDID, validateDID, createDIDDocument } from '@synet/did';

// Create DIDs from existing cryptographic material
const publicKeyHex = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
const keyDID = createDIDKey(publicKeyHex, "Ed25519");
// Result: "did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw"

const webDID = createDIDWeb('example.com');
// Result: "did:web:example.com"

// Parse and validate DIDs
const parsed = parseDID('did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw');
const validation = validateDID('did:web:example.com');

// Create DID documents
const document = createDIDDocument(keyDID, {
  publicKey: publicKeyHex,
  services: [
    { id: '#agent', type: 'DIDCommMessaging', serviceEndpoint: 'https://example.com/agent' }
  ]
});
```

## API Reference

### Creating DIDs

#### `createDIDKey(publicKeyHex, keyType)`

Create a did:key DID from an existing public key.

```typescript
// Ed25519 key (32 bytes)
const ed25519PublicKey = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
const ed25519DID = createDIDKey(ed25519PublicKey, "Ed25519");
// Result: "did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw"

// secp256k1 key (33 bytes compressed)
const secp256k1PublicKey = "02b97c30de767f084ce3439de539bae75de6b9f1bb2d9bb3c8e0b3cf68f12c5e9e";
const secp256k1DID = createDIDKey(secp256k1PublicKey, "secp256k1");
// Result: "did:key:zQ3shZtr1sUnrETvXQSyvnEnpFDBXGKmdk7NxELbWHgxKrNbF"

// X25519 key (32 bytes)
const x25519PublicKey = "8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a";
const x25519DID = createDIDKey(x25519PublicKey, "X25519");
// Result: "did:key:z6LSkdrX4EvewpktHBjvNxRDogPdC5iVF8LT3LPKefGAgi89"
```

#### `createDIDWeb(domain, path?)`

Create a did:web DID from a domain and optional path.

```typescript
const webDID = createDIDWeb('example.com');
// Result: "did:web:example.com"

const webDIDWithPath = createDIDWeb('example.com', 'users/alice');
// Result: "did:web:example.com:users:alice"
```

#### `createDIDSynet(identifier?)`

Create a did:synet DID with optional custom identifier.

```typescript
const synetDID = createDIDSynet();
// Result: "did:synet:..." (auto-generated identifier)

const synetDIDCustom = createDIDSynet('alice123');
// Result: "did:synet:alice123"
```

#### `createDID(options)`

Generic DID creator that dispatches to method-specific creators.

```typescript
const keyDID = createDID({ 
  method: 'key', 
  publicKey: 'd75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a',
  keyType: 'Ed25519'
});

const webDID = createDID({ method: 'web', identifier: 'example.com' });
const synetDID = createDID({ method: 'synet', identifier: 'alice123' });
```

### Parsing and Validation

#### `parseDID(did)`

Parse a DID URL into its components.

```typescript
const result = parseDID('did:web:example.com/path?service=agent&version=1.0#keys-1');

if (result.isValid) {
  console.log(result.components.method);     // 'web'
  console.log(result.components.identifier); // 'example.com'
  console.log(result.components.path);       // 'path'
  console.log(result.components.query);      // { service: 'agent', version: '1.0' }
  console.log(result.components.fragment);   // 'keys-1'
}
```

#### `validateDID(did)`

Validate a DID URL according to the specification and method-specific rules.

```typescript
const validation = validateDID('did:web:example.com');

if (validation.isValid) {
  console.log('DID is valid');
  if (validation.warnings) {
    console.log('Warnings:', validation.warnings);
  }
} else {
  console.error('Invalid DID:', validation.error);
}
```

### Utility Functions

```typescript
import { isDID, extractMethod, extractIdentifier, normalizeDID } from '@synet/did';

// Check if a string is a valid DID
isDID('did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK'); // true

// Extract components
extractMethod('did:web:example.com');     // 'web'
extractIdentifier('did:web:example.com'); // 'example.com'

// Normalize DID (removes extra whitespace, ensures consistent format)
normalizeDID('  did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK  ');
```

### DID Documents

#### `createDIDDocument(did, options)`

Create a basic DID document for the given DID.

```typescript
const document = createDIDDocument(
  'did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw',
  {
    publicKey: 'd75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a',
    keyType: 'Ed25519VerificationKey2020',
    controller: 'did:web:example.com',
    services: [
      {
        id: '#agent',
        type: 'DIDCommMessaging',
        serviceEndpoint: 'https://example.com/agent'
      }
    ]
  }
);
```

## Supported DID Methods

### `did:key`

Creates DIDs based on cryptographic public keys. The identifier is derived from the public key using multibase encoding.

```typescript
// Requires actual public key hex
const publicKeyHex = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
const keyDID = createDIDKey(publicKeyHex, "Ed25519");
// Result: did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw

// The identifier follows W3C DID Core specification
// Format: did:key:{multibase-encoded-public-key}
```

### `did:web`

Creates DIDs based on web domains. The identifier is a domain name with optional path.

```typescript
const webDID = createDIDWeb('example.com');
// Result: did:web:example.com

const webDIDWithPath = createDIDWeb('example.com', 'users/alice');
// Result: did:web:example.com:users:alice
```

### `did:synet`

Creates DIDs for the Synet network. The identifier can be custom or auto-generated.

```typescript
const synetDID = createDIDSynet();
// Result: did:synet:{base58-encoded-random-identifier}

const synetDIDWithCustomId = createDIDSynet('alice123');
// Result: did:synet:alice123
```

## Key Types and Encoding

The library supports multiple cryptographic key types with proper multibase encoding:

- **Ed25519**: 32-byte keys, encoded with multicodec `0xed01`, results in `z6Mk...` identifiers
- **secp256k1**: 33-byte (compressed) or 65-byte keys, encoded with multicodec `0xe701`, results in `zQ3s...` identifiers  
- **X25519**: 32-byte keys for key agreement, encoded with multicodec `0xec01`, results in `z6LS...` identifiers

## Error Handling

All functions provide detailed error messages and use the `DIDError` class for DID-specific errors.

```typescript
import { DIDError } from '@synet/did';

try {
  const did = createDID({ method: 'web' }); // Missing identifier
} catch (error) {
  if (error instanceof DIDError) {
    console.error('DID Error:', error.message);
    console.error('Error Code:', error.code);
  }
}
```

## TypeScript Support

The library is written in TypeScript and provides comprehensive type definitions:

```typescript
import type { 
  DIDMethod, 
  DIDComponents, 
  DIDDocument, 
  DIDCreateOptions,
  DIDParseResult,
  DIDValidationResult
} from '@synet/did';

// All types are exported for your convenience
const method: DIDMethod = 'synet';
const options: DIDCreateOptions = { method: 'key', keyType: 'Ed25519' };
```

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

### Linting and Formatting

```bash
npm run lint           # Lint code
npm run lint:fix       # Fix linting issues
npm run format         # Format code
```

## Limitations

This library focuses on DID creation and basic manipulation. It does **not** include:

- DID resolution (fetching DID documents from the network)
- Cryptographic key generation (you provide the keys)
- Advanced DID document features (complex verification relationships, etc.)
- DID method-specific advanced features

These features may be added in future versions or provided by separate, focused libraries.

## Contributing

Contributions are welcome! Please ensure:

1. All tests pass (`npm test`)
2. Code is properly formatted (`npm run format`)
3. No linting errors (`npm run lint`)
4. New features include tests and documentation

## License

MIT License - see LICENSE file for details.

## Part of the Synet Ecosystem

This library is part of the Synet dependency moat strategy, providing foundational building blocks for decentralized identity. Other libraries in the ecosystem:

- `@synet/key` - Cryptographic key management
- `@synet/credential` - Verifiable credentials
- `@hsfs/vault` - Secure storage adapters

Together, these libraries provide a complete, dependency-free foundation for decentralized identity applications.

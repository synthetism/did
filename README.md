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
import { createDID, parseDID, validateDID, createDIDDocument } from '@synet/did';

// Create different types of DIDs
const keyDID = createDID({ method: 'key' });
const webDID = createDID({ method: 'web', identifier: 'example.com' });
const synetDID = createDID({ method: 'synet' });

// Parse and validate DIDs
const parsed = parseDID('did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK');
const validation = validateDID('did:web:example.com');

// Create DID documents
const document = createDIDDocument(keyDID, {
  publicKey: 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
  services: [
    { id: '#agent', type: 'DIDCommMessaging', serviceEndpoint: 'https://example.com/agent' }
  ]
});
```

## API Reference

### Creating DIDs

#### `createDID(options)`

Create a DID using the specified method and options.

```typescript
// Create a did:key DID
const keyDID = createDID({ method: 'key' });
const keyDIDWithCustomKey = createDID({ 
  method: 'key', 
  publicKey: 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK' 
});

// Create a did:web DID
const webDID = createDID({ method: 'web', identifier: 'example.com' });

// Create a did:synet DID
const synetDID = createDID({ method: 'synet' });
const synetDIDWithCustomId = createDID({ 
  method: 'synet', 
  identifier: 'custom-identifier-123456' 
});
```

#### Method-specific creators

```typescript
import { createDIDKey, createDIDWeb, createDIDSynet } from '@synet/did';

// Specialized creators for each method
const keyDID = createDIDKey({ keyType: 'Ed25519' });
const webDID = createDIDWeb('example.com', 'path/to/resource');
const synetDID = createDIDSynet('custom-identifier-123456');
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
  'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
  {
    publicKey: 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK',
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

Creates DIDs based on cryptographic keys. The identifier is derived from the public key.

```typescript
const keyDID = createDIDKey();
// Result: did:key:ed25519-AbCdEf123456...

const keyDIDWithCustomKey = createDIDKey({
  publicKey: 'z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK'
});
// Result: did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK
```

### `did:web`

Creates DIDs based on web domains. The identifier is a domain name.

```typescript
const webDID = createDIDWeb('example.com');
// Result: did:web:example.com

const webDIDWithPath = createDIDWeb('example.com', 'path/to/resource');
// Result: did:web:example.com:path:to:resource
```

### `did:synet`

Creates DIDs for the Synet network. The identifier is a custom string.

```typescript
const synetDID = createDIDSynet();
// Result: did:synet:AbCdEf123456789012345678901234567890123456

const synetDIDWithCustomId = createDIDSynet('my-custom-identifier-123456');
// Result: did:synet:my-custom-identifier-123456
```

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

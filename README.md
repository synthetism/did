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
                                                                                                        
version: 1.0.5
description: [⊚] You are the Signal
```

**Battle-tested decentralized identifier library with zero dependencies.**

```typescript
import { createDIDKey, generateKeyPair } from '@synet/did';
const keyPair = generateKeyPair('ed25519');
const did = createDIDKey(keyPair.publicKey, 'Ed25519');
// → did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK
```

**Security features:**
- Zero dependencies (no supply chain vulnerabilities)
- W3C DID Core specification compliance  
- Strict validation and multicodec encoding
- Full TypeScript support

## DID Functions & API

### Core Functions

```typescript
// DID Creation
createDIDKey(publicKeyHex: string, keyType: 'Ed25519' | 'secp256k1'): string
createDIDWeb(domain: string, path?: string): string
createDID(options: DIDOptions): string

// DID Operations  
parseDID(did: string): DIDComponents
validateDID(did: string): DIDValidationResult
isDID(input: string): boolean

// DID Documents
createDIDDocument(did: string, publicKeyHex: string, keyType: string): DIDDocument
```

### Usage Examples

```typescript
import { createDIDKey, createDIDWeb, parseDID, validateDID } from '@synet/did';

// Create DIDs
const keyDID = createDIDKey('87043e28b2c...', 'Ed25519');
const webDID = createDIDWeb('company.com', '/identity');

// Parse and validate
const components = parseDID(keyDID);
const validation = validateDID(webDID);

console.log(components.method);  // 'key'
console.log(validation.valid);   // true
```

### Types & Interfaces

```typescript
interface DIDConfig {
  metadata?: Record<string, unknown>;
}

interface DIDComponents {
  method: string;
  identifier: string;
  did: string;
}

interface DIDValidationResult {
  valid: boolean;
  error?: string;
}

interface DIDDocument {
  '@context': string[];
  id: string;
  verificationMethod: VerificationMethod[];
  authentication: string[];
  // ...full W3C specification
}
```

##  DID Unit Patterns

The `DID` unit learns from other units and can operate autonomously in complex systems.

### Scenario 1: Simple Learning

Basic DID unit that learns from a Key unit:

```typescript
import { DID } from '@synet/did';
import { generateKeyPair, Signer } from '@synet/keys';

// 1. Create units
const keyPair = generateKeyPair('ed25519');
const signer = Signer.create({
  privateKeyPEM: keyPair.privateKey,
  publicKeyPEM: keyPair.publicKey,
  keyType: 'ed25519'
});
const didUnit = DID.create();

// 2. Unit learns (no private key transfer!)
const key = signer.createKey();
await didUnit.learn([key.teach()]);

// 3. Generate DID autonomously
const did = await didUnit.generateKey();
console.log('Generated:', did);
```

### Scenario 2: Advanced Operations

DID unit with document generation and resolution:

```typescript
import { DID } from '@synet/did';

const didUnit = DID.create();
await didUnit.learn([capabilities]);

// Multiple operations after learning
const did = await didUnit.generateKey();
const document = await didUnit.generateDocument();
const resolved = await didUnit.resolve(did);

console.log('DID:', did);
console.log('Document:', document);
console.log('Resolved:', resolved);
```

### Scenario 3: Identity Composition

Complete identity creation using multiple units:

```typescript
import { Identity } from '@synet/identity';

// This internally coordinates:
// - Key unit (cryptographic operations)
// - DID unit (learns from Key, generates DID)  
// - Credential unit (issues identity credential)
// - Signer unit (signing operations)

const identity = await Identity.generate({ alias: 'alice' });

console.log('🪪 Complete identity:');
console.log('   DID:', identity.getDid());
console.log('   Alias:', identity.getAlias());
console.log('   Key ID:', identity.getKid());
```

### DID Unit API

```typescript
class DID {
  static create(config?: DIDConfig): DID
  
  // Learning & capabilities
  learn(capabilities: TeachingCapabilities[]): Promise<boolean>
  capabilities(): string[]
  
  // Core operations (after learning)
  generateKey(): Promise<string | null>
  generateDocument(): Promise<DIDDocument | null>
  resolve(did: string): Promise<DIDDocument | null>
  
  // Unit interface
  execute(command: string, params?: any): Promise<Result<any>>
  whoami(): string
}
```

## Installation & Usage

```bash
npm install @synet/did @synet/keys
```

**Error handling:**
```typescript
// Validation approach (non-throwing)
const result = validateDID('invalid:format');
if (!result.valid) console.error(result.error);

// Try-catch approach
try {
  const did = createDIDKey('invalid-key', 'Ed25519');
} catch (error) {
  console.error('DID Error:', error.message);
}
```

---

Built on [@synet/keys](www.npmjs.com/package/@synet/keys)

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

## DID Unit - Composable DID Generation

The DID Unit provides a **composable architecture** for DID generation, supporting both **simple direct usage** and **advanced teach/learn patterns**. This unit-based approach enables flexible key management and integration with other Synet units.

### Simple Usage with Direct Keys

Perfect for applications that need straightforward DID creation from existing keys:

```typescript
import { DID } from '@synet/did';
import { generateKeyPair } from '@synet/keys';

// Generate cryptographic keys
const keyPair = generateKeyPair('ed25519');

// Method 1: Direct key creation
const unit = DID.createFromKey(keyPair.publicKey, keyPair.type);
const did = await unit.generate({ method: 'key' });
console.log(did); // "did:key:z6Mk..."

// Method 2: Key pair object
const unit2 = DID.createFromKeyPair(keyPair);
const did2 = await unit2.generate({ method: 'key' });
console.log(did2); // "did:key:z6Mk..."

// Method 3: Direct generation (no factory needed)
const unit3 = DID.create();
const did3 = await unit3.generate({
  method: 'key',
  publicKey: keyPair.publicKey,
  keyType: keyPair.type
});
console.log(did3); // "did:key:z6Mk..."
```

### Key Format Support

The DID Unit automatically handles multiple key formats:

```typescript
import { DID } from '@synet/did';

// Hex format (raw bytes)
const hexKey = 'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab';
const unit1 = DID.createFromKey(hexKey, 'ed25519');

// PEM format (from key generation libraries)
const pemKey = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEA110FoCJFvdQlvEwVjDgSBcNaUuRVkOoLjmhNGxm2MQ4=
-----END PUBLIC KEY-----`;
const unit2 = DID.createFromKey(pemKey, 'ed25519');

// Base64 format  
const base64Key = '210FoCJFvdQlvEwVjDgSBcNaUuRVkOoLjmhNGxm2MQ4=';
const unit3 = DID.createFromKey(base64Key, 'ed25519');

// All generate identical DIDs
const did1 = await unit1.generate({ method: 'key' });
const did2 = await unit2.generate({ method: 'key' });
const did3 = await unit3.generate({ method: 'key' });
```

### Advanced Usage with Signer/Key Units

For applications requiring composable architectures, here's the proper separation of concerns:

**Signer** generates keys and handles secrets, **Key** holds public keys, **DID** generates identifiers:

```typescript
import { DID } from '@synet/did';
import { Key, Signer } from '@synet/keys';

// Step 1: Signer generates the cryptographic key pair
const signer = Signer.generate('ed25519'); // Generate ed25519 key pair
if (!signer) throw new Error('Failed to generate signer');

// Step 2: Key unit is created from Signer
const key = Key.createFromSigner(signer, { purpose: 'identity' });
if (!key) throw new Error('Failed to create key from signer');

// Step 3: DID unit learns public key capabilities from Key
const did = DID.create();
did.learn([key.teach()]); // DID learns public key info (no private key exposure)

// Step 4: Generate DID using the public key learned from Key Unit
const didResult = await did.generate({ method: 'key' });
console.log(didResult); // "did:key:z6Mk..."

// Verification - each unit has its proper role
console.log(signer.canSign()); // true - can sign with private key
console.log(key.canSign()); // true - has signing capability from signer
console.log(did.canGenerateKey()); // true - can generate DID from public key
```

**Real-world Production Scenario:**

```typescript
import { DID } from '@synet/did';
import { Key, Signer } from '@synet/keys';

// Production identity creation workflow
async function createProductionIdentity(userId: string) {
  // 1. Generate cryptographic material securely
  const signer = Signer.generate('ed25519');
  if (!signer) throw new Error('Failed to generate signer');

  // 2. Create Key unit from Signer
  const key = Key.createFromSigner(signer, { 
    userId, 
    purpose: 'identity',
    created: Date.now() 
  });
  if (!key) throw new Error('Failed to create key from signer');

  // 3. Create DID from Key capabilities (no private key exposure)
  const did = DID.create({ metadata: { userId, purpose: 'authentication' } });
  did.learn([key.teach()]);

  // 4. Generate the DID
  const identity = await did.generate({ method: 'key' });

  return {
    identity, // DID for public use
    signer,   // Keep private for signing operations
    key,      // Public key for verification
    did       // DID unit for identity operations
  };
}

// Usage
const userIdentity = await createProductionIdentity('user-123');
console.log('Identity:', userIdentity.identity);
// "did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"

// Sign something with the private key
const signature = await userIdentity.signer.sign('important message');

// Verify with public key
const isValid = await userIdentity.key.verify('important message', signature);
```

**SuperKey - Evolution Pattern (Advanced):**

For ultimate simplicity, a Key can evolve to absorb Signer and DID capabilities:

```typescript
import { Key, Signer } from '@synet/keys';
import { DID } from '@synet/did';

// SuperKey: Key that evolved with Signer and DID capabilities
const signer = Signer.generate('ed25519');
const superKey = Key.createFromSigner(signer, { purpose: 'superkey' });

// SuperKey can now sign and verify (native capabilities from Signer)
const signature = await superKey.sign('hello world');
const isValid = await superKey.verify('hello world', signature);

// Learn DID capabilities (for inspection and teaching to other units)
const did = DID.create();
superKey.learn([did.teach()]);

// SuperKey now has learned DID capabilities
console.log(superKey.canSign()); // true (native capability)
console.log(superKey.capableOf('generate')); // true (learned capability)

// For actual DID generation, create a DID unit and teach it our key info
const didUnit = DID.create();
didUnit.learn([superKey.teach()]); // DID learns key capabilities from SuperKey
const identity = await didUnit.generate({ method: 'key' });
console.log(identity); // "did:key:z6Mk..."

// SuperKey can teach its capabilities to specialized units
const anotherDID = DID.create();
anotherDID.learn([superKey.teach()]); // Transfer key capabilities
const identity2 = await anotherDID.generate({ method: 'key' });
```

### Unit Capabilities and Introspection

DID Units provide comprehensive introspection and capability management:

```typescript
import { DID } from '@synet/did';

const unit = DID.createFromKey(publicKey, 'ed25519', { 
  purpose: 'authentication',
  environment: 'production' 
});

// Check capabilities
console.log(unit.canGenerateKey()); // true
console.log(unit.capabilities()); // Array of available capabilities

// Unit identity
console.log(unit.whoami()); 
// "[🪪] DID Unit - Minimalistic DID generator (abc12345) ready to generate DIDs"

// Export unit state
const unitData = unit.toJSON();
console.log(unitData.metadata); // { purpose: 'authentication', environment: 'production' }

// Teaching capabilities to other units
const teachings = unit.teach();
console.log(Object.keys(teachings)); // ['generate', 'generateKey', 'generateWeb', ...]
```

### Supported Key Types

The DID Unit supports all major cryptographic key types:

```typescript
import { DID } from '@synet/did';

// Ed25519 - Recommended for digital signatures
const ed25519Unit = DID.createFromKey(ed25519PublicKey, 'ed25519');
const ed25519DID = await ed25519Unit.generate({ method: 'key' });
// Result: "did:key:z6Mk..."

// secp256k1 - Bitcoin/Ethereum compatible
const secp256k1Unit = DID.createFromKey(secp256k1PublicKey, 'secp256k1');
const secp256k1DID = await secp256k1Unit.generate({ method: 'key' });
// Result: "did:key:zQ3s..."

// X25519 - For key agreement/encryption
const x25519Unit = DID.createFromKey(x25519PublicKey, 'x25519');
const x25519DID = await x25519Unit.generate({ method: 'key' });
// Result: "did:key:z6LS..."
```

### Integration with @synet/keys

Perfect integration with the Synet key management ecosystem, respecting proper separation of concerns:

```typescript
import { DID } from '@synet/did';
import { generateKeyPair, Key, Signer } from '@synet/keys';

// Method 1: Direct integration with generateKeyPair (simplest)
const keyPair = generateKeyPair('ed25519');
const unit = DID.createFromKeyPair(keyPair);
const did = await unit.generate({ method: 'key' });

// Method 2: Proper composable architecture
const signer = Signer.generate('ed25519');
if (!signer) throw new Error('Failed to generate signer');

const key = Key.createFromSigner(signer, { purpose: 'identity' });
if (!key) throw new Error('Failed to create key from signer');

const didUnit = DID.create();
didUnit.learn([key.teach()]); // DID learns from Key (not Signer)

const did2 = await didUnit.generate({ method: 'key' });

// Method 3: Mixed approach for flexibility
const keyPair2 = generateKeyPair('secp256k1');
const did3 = await DID.create().generate({
  method: 'key',
  publicKey: keyPair2.publicKey,
  keyType: keyPair2.type
});

// Method 4: Production workflow
async function createSecureIdentity() {
  // 1. Generate keys securely
  const signer = Signer.generate('ed25519');
  if (!signer) throw new Error('Failed to generate signer');
  
  // 2. Extract public key for DID creation
  const publicKey = signer.getPublicKey();
  
  // 3. Create DID directly (no intermediate Key unit needed)
  const did = DID.createFromKey(publicKey, 'ed25519');
  const identity = await did.generate({ method: 'key' });
  
  return { identity, signer }; // Identity + signing capability
}
```

### Factory Methods Reference

The DID Unit provides convenient factory methods for different use cases:

```typescript
import { DID } from '@synet/did';

// DID.create(config?) - Standard unit creation
const unit1 = DID.create({ metadata: { purpose: 'authentication' } });

// DID.createFromKey(publicKey, keyType, metadata?) - Direct key input
const unit2 = DID.createFromKey(
  'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
  'ed25519',
  { source: 'hardware-key' }
);

// DID.createFromKeyPair(keyPair, metadata?) - Key pair object
const keyPair = { publicKey: '...', type: 'ed25519' };
const unit3 = DID.createFromKeyPair(keyPair, { generated: Date.now() });

// All methods return fully functional DID units
console.log(unit1.created); // true
console.log(unit2.created); // true
console.log(unit3.created); // true
```

### DID Web Support

DID Units also support web-based DIDs without requiring keys:

```typescript
import { DID } from '@synet/did';

const unit = DID.create();

// Generate did:web (no key capabilities needed)
const webDID = await unit.generate({
  method: 'web',
  domain: 'example.com',
  path: 'users/alice'
});

console.log(webDID); // "did:web:example.com:users:alice"

// Or use the direct method
const webDID2 = unit.generateWeb('example.com', 'users/bob');
console.log(webDID2); // "did:web:example.com:users:bob"
```

### Usage Patterns Summary

The DID Unit supports multiple usage patterns to fit different architectural needs:

1. **Simple Direct Usage**: `DID.createFromKey()` for straightforward key-to-DID conversion
2. **Key Pair Integration**: `DID.createFromKeyPair()` for working with key generation results
3. **Options-Based**: `DID.create().generate(options)` for flexible parameter passing
4. **Composable Architecture**: `DID.create().learn()` for unit-based ecosystems
5. **Web-Only**: `DID.create().generateWeb()` for web-based identities

Choose the pattern that best fits your application's architecture and complexity requirements.

### DID Unit Best Practices

- **Use factory methods** for simple use cases (createFromKey, createFromKeyPair)
- **Use teach/learn patterns** for complex, composable architectures
- **Check unit readiness** with `canGenerateKey()` before DID generation
- **Handle errors gracefully** - operations can fail while units remain valid
- **Leverage introspection** - use `whoami()` and `capabilities()` for debugging
- **Store metadata** in unit creation for tracking and audit trails

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

### DID Unit API

#### `DID.create(config?)`

Create a new DID Unit instance with optional configuration. This is the standard way to create a composable DID unit.

```typescript
import { DID } from '@synet/did';

// Basic unit creation
const unit = DID.create();

// Unit with configuration
const unit = DID.create({
  metadata: {
    purpose: 'authentication',
    environment: 'production',
    created: Date.now()
  }
});

console.log(unit.created); // true
console.log(unit.whoami()); // "[🪪] DID Unit - waiting to learn key capabilities"
```

#### `DID.createFromKey(publicKey, keyType, metadata?)`

Create a DID Unit with direct key input. Perfect for simple usage patterns where you have existing keys.

```typescript
import { DID } from '@synet/did';

// Direct key creation
const unit = DID.createFromKey(
  'abcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
  'ed25519',
  { source: 'hardware-key' }
);

// Generate DID immediately (no learning required)
const did = await unit.generate({ method: 'key' });
console.log(did); // "did:key:z6Mk..."

// Unit is ready for key generation
console.log(unit.canGenerateKey()); // true
```

#### `DID.createFromKeyPair(keyPair, metadata?)`

Create a DID Unit from a key pair object. Convenient for working with `generateKeyPair()` results from `@synet/keys`.

```typescript
import { DID } from '@synet/did';
import { generateKeyPair } from '@synet/keys';

// Generate key pair
const keyPair = generateKeyPair('ed25519');

// Create unit from key pair
const unit = DID.createFromKeyPair(keyPair, {
  algorithm: keyPair.type,
  generated: Date.now()
});

// Generate DID
const did = await unit.generate({ method: 'key' });
console.log(did); // "did:key:z6Mk..."
```

#### `unit.generate(options)`

Generate a DID based on the provided options. Supports both `did:key` and `did:web` methods.

```typescript
// Generate did:key (requires key capabilities or direct keys)
const keyDID = await unit.generate({ method: 'key' });

// Generate did:key with direct key input
const keyDID2 = await unit.generate({
  method: 'key',
  publicKey: 'abcd1234...',
  keyType: 'ed25519'
});

// Generate did:web (no key capabilities required)
const webDID = await unit.generate({
  method: 'web',
  domain: 'example.com',
  path: 'users/alice'
});
```

#### `unit.generateKey(options?)`

Generate a `did:key` DID specifically. Will use direct keys, factory-provided keys, or learned capabilities.

```typescript
// Use factory-provided keys
const unit = DID.createFromKey(publicKey, 'ed25519');
const did = await unit.generateKey(); // No options needed

// Use direct key input via options
const unit2 = DID.create();
const did2 = await unit2.generateKey({
  publicKey: 'abcd1234...',
  keyType: 'ed25519'
});

// Use learned capabilities
const unit3 = DID.create();
const signer = Signer.generate('ed25519');
if (!signer) throw new Error('Failed to generate signer');
const key = Key.createFromSigner(signer, { purpose: 'test' });
if (!key) throw new Error('Failed to create key from signer');
unit3.learn([key.teach()]);
const did3 = await unit3.generateKey(); // Uses learned keys
```

#### `unit.generateWeb(domain, path?)`

Generate a `did:web` DID directly. No key capabilities required.

```typescript
const unit = DID.create();

// Basic web DID
const webDID = unit.generateWeb('example.com');
// Result: "did:web:example.com"

// Web DID with path
const webDIDWithPath = unit.generateWeb('example.com', 'users/alice');
// Result: "did:web:example.com:users:alice"
```

#### `unit.canGenerateKey(options?)`

Check if the unit can generate `did:key` DIDs. Returns `true` if the unit has direct keys, factory keys, or learned capabilities.

```typescript
// Check factory-provided keys
const unit = DID.createFromKey(publicKey, 'ed25519');
console.log(unit.canGenerateKey()); // true

// Check with options
const unit2 = DID.create();
console.log(unit2.canGenerateKey({
  publicKey: 'abcd1234...',
  keyType: 'ed25519'
})); // true

// Check learned capabilities
const unit3 = DID.create();
console.log(unit3.canGenerateKey()); // false

const signer = Signer.generate('ed25519');
if (!signer) throw new Error('Failed to generate signer');
const key = Key.createFromSigner(signer, { purpose: 'test' });
if (!key) throw new Error('Failed to create key from signer');
unit3.learn([key.teach()]);
console.log(unit3.canGenerateKey()); // true
```

#### `unit.whoami()`

Get the unit's identity string with current status and capabilities.

```typescript
const unit1 = DID.create();
console.log(unit1.whoami());
// "[🪪] DID Unit - Minimalistic DID generator (abc12345) waiting to learn key capabilities"

const unit2 = DID.createFromKey(publicKey, 'ed25519');
console.log(unit2.whoami());
// "[🪪] DID Unit - Minimalistic DID generator (def67890) ready to generate DIDs"
```

#### `unit.capabilities()`

Get a list of all available capabilities that the unit can execute.

```typescript
const unit = DID.create();
const caps = unit.capabilities();
console.log(caps);
// ['generate', 'generateKey', 'generateWeb', 'canGenerateKey', 'toJSON']
```

#### `unit.teach()`

Export the unit's capabilities so other units can learn from it.

```typescript
const unit = DID.createFromKey(publicKey, 'ed25519');
const teachings = unit.teach();

// Another unit can learn these capabilities
const learnerUnit = SomeOtherUnit.create();
learnerUnit.learn([teachings]);
```

#### `unit.learn(capabilities)`

Learn capabilities from other units. Part of the composable unit architecture.

```typescript
import { Key, Signer } from '@synet/keys';

// Proper separation: Signer generates keys, Key holds public key, DID learns from Key
const signer = Signer.generate('ed25519');
if (!signer) throw new Error('Failed to generate signer');

const key = Key.createFromSigner(signer, { purpose: 'identity' });
if (!key) throw new Error('Failed to create key from signer');

const didUnit = DID.create();

// DID learns public key capabilities from Key (not from Signer)
didUnit.learn([key.teach()]);

// Now can generate DIDs using learned public key
const did = await didUnit.generate({ method: 'key' });
```

#### `unit.toJSON()`

Export the unit's current state as a JSON object for serialization or debugging.

```typescript
const unit = DID.createFromKey(publicKey, 'ed25519', {
  purpose: 'authentication'
});

const unitData = unit.toJSON();
console.log(unitData);
// {
//   id: 'abc12345',
//   type: 'did',
//   meta: { purpose: 'authentication' },
//   canGenerateKey: true,
//   learnedCapabilities: ['generate', 'generateKey', ...]
// }
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

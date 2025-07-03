# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-07-03

### Added

- Initial release of @synet/did package
- Support for creating DIDs with three methods:
  - `did:key` - Key-based DIDs
  - `did:web` - Web-based DIDs
- DID parsing and validation functionality
- DID document creation with verification methods and services
- Comprehensive utility functions:
  - `isDID()` - Check if string is valid DID
  - `extractMethod()` - Extract method from DID
  - `extractIdentifier()` - Extract identifier from DID
  - `normalizeDID()` - Normalize DID format
  - `createDIDURL()` - Create DID URL from components
- Full TypeScript support with detailed type definitions
- Zero runtime dependencies
- Comprehensive test suite with >95% code coverage
- Complete documentation and examples

### Features

- **Zero dependencies** - No external runtime dependencies
- **Multiple DID methods** - Support for did:key, did:web
- **Type-safe** - Full TypeScript support
- **DID Documents** - Generate basic DID documents
- **Validation** - Parse and validate DID URLs
- **Well-tested** - Comprehensive test suite
- **Lightweight** - Minimal footprint with tree-shaking support

### Technical Details

- Built with TypeScript 5.8+
- Uses ES modules (ESM) format
- Supports Node.js 18+
- Follows DID specification standards
- Implements proper error handling with DIDError class

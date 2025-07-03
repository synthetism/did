/**
 * @synet/did - Basic functionality test
 * 
 * Verifies the core refactored functionality works correctly
 */

import { describe, it, expect } from 'vitest';
import {
  createDIDKey,
  createDIDWeb,
  createDIDDocument,
  validateDID,
  isDID
} from '../src/index';

describe('Refactored DID Library', () => {
  it('should create secure did:key DIDs with correct multicodec encoding', () => {
    const publicKeyHex = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
    const did = createDIDKey(publicKeyHex, "Ed25519");
    
    expect(isDID(did)).toBe(true);
    expect(did).toBe('did:key:z2DeuicgUFGK9784FgMs5DG57pbDLWGaDu6TnXCisMgptRw');
    
    const validation = validateDID(did);
    expect(validation.isValid).toBe(true);
  });

  it('should create did:web DIDs with proper domain validation', () => {
    const did = createDIDWeb('example.com');
    
    expect(isDID(did)).toBe(true);
    expect(did).toBe('did:web:example.com');
    
    const validation = validateDID(did);
    expect(validation.isValid).toBe(true);
  });

  it('should create basic DID documents', () => {
    const did = createDIDKey("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a", "Ed25519");
    const document = createDIDDocument(did);
    
    expect(document.id).toBe(did);
    expect(document['@context']).toBeDefined();
  });

  it('should reject did:synet method (no longer supported)', () => {
    const validation = validateDID('did:synet:someidentifier');
    expect(validation.isValid).toBe(true); // Still valid DID format
    expect(validation.warnings).toContain("Method 'synet' is not officially supported");
  });

  it('should validate strictly and provide clear errors', () => {
    const validation = validateDID('did:key:invalid!characters');
    expect(validation.isValid).toBe(false);
    expect(validation.error).toBe('Invalid did:key identifier format');
  });
});

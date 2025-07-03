/**
 * @synet/did - Coverage tests
 * 
 * Additional coverage tests for edge cases and complete functionality.
 */

import { describe, it, expect } from 'vitest';
import { createDIDKey, isDID } from '../src/index';

describe('Coverage Tests', () => {
  it('should provide basic coverage for library functionality', () => {
    // Basic smoke test to ensure library works
    const publicKeyHex = "d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a";
    const did = createDIDKey(publicKeyHex, "Ed25519");
    
    expect(isDID(did)).toBe(true);
    expect(did).toMatch(/^did:key:z6Mk/);
  });
});
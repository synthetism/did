/**
 * DID Unit - Minimalistic DID generation unit
 * Pure Unit Architecture - learns from any unit that can teach key capabilities. 
 * 
 * Design principles:
 * - Pure Unit Architecture: uses teach/learn pattern only* 
 * - Dynamic capability checking with capableOf()
 * - Minimal and flexible
 * - Robust key format handling (PEM, hex, base64)
 * 
 * @author Synet Team
 */

import { Unit, createUnitSchema } from '@synet/unit';
import { createDIDKey, createDIDWeb, type KeyType } from './create';
import { toHex, detectKeyFormat } from '@synet/keys';
import { createId } from './utils';

/**
 * Options for creating a DID
 */
export interface DIDOptions {
  method?: 'key' | 'web';
  domain?: string;
  path?: string;
  publicKey?: string; // For direct public key input
  keyType?: string;   // For direct key type input
  meta?: Record<string, unknown>;
}

/**
 * Map key types to DID key types
 * Uses shared mapping logic with @synet/keys
 */
function mapKeyTypeToDIDKeyType(keyType: string): KeyType | null {
  // Map both legacy and multicodec names to DID key types
  const keyTypeMap: Record<string, KeyType> = {
    'ed25519': 'ed25519-pub',
    'secp256k1': 'secp256k1-pub', 
    'x25519': 'x25519-pub'
  };
  
  return keyTypeMap[keyType] || null;
}

/**
 * Validate and format public key to hex
 * For now, this is a simplified version that focuses on hex input
 * PEM-to-hex conversion will be implemented in a future iteration
 */
function validateAndConvertKeyToHex(key: string, keyType?: string): string | null {
  if (!key || typeof key !== 'string') {
    return null;
  }
  
  const trimmed = key.trim();
  
  // Check if it's already hex format
  if (/^[0-9a-fA-F]+$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  
  // For PEM format, try conversion using the utility
  if (trimmed.includes("-----BEGIN")) {
    try {
      const hexKey = toHex(trimmed);
      return hexKey ? hexKey.toLowerCase() : null;
    } catch (error) {
      // If conversion fails, return null for now
      // This is a temporary limitation - PEM conversion needs more work
      console.error("PEM to hex conversion not fully implemented:", error);
      return null;
    }
  }
  
  // Check for base64 format and try conversion
  if (/^[A-Za-z0-9+/]+=*$/.test(trimmed)) {
    try {
      const hexKey = toHex(trimmed);
      return hexKey ? hexKey.toLowerCase() : null;
    } catch (error) {
      return null;
    }
  }
  
  return null;
}

/**
 * DID Unit - Minimalistic DID generation using pure Unit Architecture
 * [🪪] Learns key capabilities through standard teach/learn pattern
 */
export class DID extends Unit {
  private didId: string;
  private meta: Record<string, unknown>;

  private constructor(meta: Record<string, unknown> = {}) {
    super(createUnitSchema({
      name: 'did-unit',
      version: '1.0.0'
    }));
    
    this.didId = createId();
    this.meta = { ...meta };

    // Register base capabilities
    this._addCapability('generate', async (...args: unknown[]) => {
      const options = args[0] as DIDOptions;
      return await this.generate(options);
    });
    
    this._addCapability('generateKey', async (...args: unknown[]) => {
      const options = args[0] as DIDOptions;
      return await this.generateKey(options);
    });
    
    this._addCapability('generateWeb', (...args: unknown[]) => {
      const domain = args[0] as string;
      const path = args[1] as string;
      return this.generateWeb(domain, path);
    });
    
    this._addCapability('canGenerateKey', (...args: unknown[]) => {
      const options = args[0] as DIDOptions;
      return this.canGenerateKey(options);
    });
    
    this._addCapability('toJSON', () => this.toJSON());
  }

  /**
   * Create DID unit
   */
  static create(meta?: Record<string, unknown>): DID {
    return new DID(meta);
  }

  /**
   * Generate DID based on options
   */
  async generate(options: DIDOptions = {}): Promise<string | null> {
    try {
      const { method = 'key', domain, path } = options;
      
      if (method === 'key') {
        return await this.generateKey(options);
      }
      
      if (method === 'web') {
        if (!domain) {
          this._markFailed('Domain is required for did:web');
          return null;
        }
        return this.generateWeb(domain, path);
      }
      
      return null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this._markFailed(`Failed to generate DID: ${errorMessage}`);
      console.error('[🪪] Failed to generate DID:', error);
      return null;
    }
  }

  /**
   * Generate did:key from learned capabilities or direct public key input
   * Uses pure Unit Architecture - checks for learned capabilities or direct input
   */
  async generateKey(options: DIDOptions = {}): Promise<string | null> {
    try {
      const { publicKey, keyType } = options;
      
      // Option 1: Direct public key input
      if (publicKey && keyType) {
        return this.generateKeyFromInput(publicKey, keyType);
      }
      
      // Option 2: Learn from other units
      if (!this.capableOf('getPublicKey') || !(this.capableOf('getType') || this.capableOf('getAlgorithm'))) {
        this._markFailed('Missing key capabilities. Unit needs to learn from a key unit first or provide publicKey/keyType directly.');
        return null;
      }
      
      // Use learned capabilities to get key data
      const learnedPublicKey = await this.execute('getPublicKey') as string;
      const learnedKeyType = this.capableOf('getType') 
        ? await this.execute('getType') as string
        : await this.execute('getAlgorithm') as string;
      
      if (!learnedPublicKey || !learnedKeyType) {
        this._markFailed('Failed to get key information from learned capabilities');
        return null;
      }
      
      return this.generateKeyFromInput(learnedPublicKey, learnedKeyType);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this._markFailed(`Failed to generate did:key: ${errorMessage}`);
      console.error('[🪪] Failed to generate did:key:', error);
      return null;
    }
  }

  /**
   * Generate did:key from public key and key type
   */
  private generateKeyFromInput(publicKey: string, keyType: string): string | null {
    try {
      // Validate and convert key to hex format (handles PEM, hex, base64)
      const publicKeyHex = validateAndConvertKeyToHex(publicKey, keyType);
      if (!publicKeyHex) {
        throw new Error('Invalid public key format. Expected PEM, hex, or base64 string.');
      }
      
      // Map key type to DID key type
      const didKeyType = mapKeyTypeToDIDKeyType(keyType);
      if (!didKeyType) {
        throw new Error(`Unsupported key type for DID: ${keyType}`);
      }
      
      return createDIDKey(publicKeyHex, didKeyType);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this._markFailed(`Failed to generate did:key from input: ${errorMessage}`);
      console.error('[🪪] Failed to generate did:key from input:', error);
      return null;
    }
  }

  /**
   * Generate did:web
   */
  generateWeb(domain: string, path?: string): string | null {
    try {
      if (!domain) {
        this._markFailed('Domain is required for did:web');
        return null;
      }
      
      return createDIDWeb(domain, path);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this._markFailed(`Failed to generate did:web: ${errorMessage}`);
      console.error('[🪪] Failed to generate did:web:', error);
      return null;
    }
  }

  /**
   * Check if unit can generate did:key (has learned key capabilities or direct input)
   */
  canGenerateKey(options: DIDOptions = {}): boolean {
    const { publicKey, keyType } = options;
    
    // Can generate if we have direct input
    if (publicKey && keyType) {
      return true;
    }
    
    // Can generate if we have learned capabilities
    return this.capableOf('getPublicKey') && (this.capableOf('getType') || this.capableOf('getAlgorithm'));
  }

  // Unit implementation
  whoami(): string {
    const capability = this.canGenerateKey() ? 'ready to generate DIDs' : 'waiting to learn key capabilities';
    return `[🪪] DID Unit - Minimalistic DID generator (${this.didId.slice(0, 8)}) ${capability}`;
  }

  capabilities(): string[] {
    return this._getAllCapabilities();
  }

  help(): void {
    console.log(`
[🪪] DID Unit - Minimalistic DID Generation

Identity: ${this.whoami()}
Can Generate Key DID: ${this.canGenerateKey()}

Core Capabilities:
- generate(options): Generate DID (key or web method)
- generateKey(): Generate did:key from learned capabilities
- generateWeb(domain, path?): Generate did:web
- canGenerateKey(): Check if ready to generate did:key
- toJSON(): Export unit information

Learning Pattern:
To generate did:key, this unit needs to learn from a key unit:
  
  const keyUnit = KeyUnit.create(...);
  const didUnit = DIDUnit.create();
  
  // Learn key capabilities
  didUnit.learn([keyUnit.teach()]);
  
  // Now can generate did:key
  const did = didUnit.generate({ method: 'key' });

Unit Operations:
- execute(capability, ...args): Execute any capability
- learn(capabilities): Learn capabilities from teachers
- teach(): Share capabilities with other units
- capabilities(): List all available capabilities

Examples:
  // Generate did:key (after learning from key unit)
  const didKey = didUnit.generate({ method: 'key' });
  
  // Generate did:web (no learning needed)
  const didWeb = didUnit.generate({ 
    method: 'web', 
    domain: 'example.com', 
    path: 'users/alice' 
  });
  
  // Check capabilities
  if (didUnit.capableOf('getPublicKey')) {
    // Can generate did:key
  }
    `);
  }

  teach(): Record<string, (...args: unknown[]) => unknown> {
    return {
      generate: async (...args: unknown[]) => await this.generate(args[0] as DIDOptions),
      generateKey: async (...args: unknown[]) => await this.generateKey(args[0] as DIDOptions),
      generateWeb: (...args: unknown[]) => this.generateWeb(args[0] as string, args[1] as string),
      canGenerateKey: (...args: unknown[]) => this.canGenerateKey(args[0] as DIDOptions),
      toJSON: () => this.toJSON()
    };
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.didId,
      type: 'did-unit',
      meta: this.meta,
      canGenerateKey: this.canGenerateKey(),
      learnedCapabilities: this.capabilities()
    };
  }

  // Getters
  get id(): string {
    return this.didId;
  }

  get metadata(): Record<string, unknown> {
    return { ...this.meta };
  }
}

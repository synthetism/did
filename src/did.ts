/**
 * DID Unit - Minimalistic DID generation unit
 * Pure Unit Architecture - learns from any unit that can teach key capabilities. 
 * 
 * Design principles:
 * - Pure Unit Architecture: uses teach/learn pattern only* 
 * - Dynamic capability checking with capableOf()
 * - Minimal and flexible
 * 
 * @author Synet Team
 */

import { Unit, createUnitSchema, type TeachingContract } from '@synet/unit';
import { createDIDKey, createDIDWeb, type KeyType } from './create';
import { toHex, detectKeyFormat } from '@synet/keys';
import { createId } from './utils';

/**
 * Create a random ID for the unit
 */
/* 
function createId(length = 24): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length);
}*/

/**
 * Options for creating a DID
 */
export interface DIDOptions {
  method?: 'key' | 'web';
  domain?: string;
  path?: string;
  meta?: Record<string, unknown>;
}

/**
 * DID Unit - Minimalistic DID generation using pure Unit Architecture
 * [🪪] Learns key capabilities through standard teach/learn pattern
 */
export class DID extends Unit {
  private didId: string;
  private meta: Record<string, unknown>;

  private constructor(meta: Record<string, unknown> = {}) {
    // Create unit with proper ID for Unit 1.0.4 architecture
    super(createUnitSchema({
      id: 'did-unit',
      version: '1.0.0'
    }));
    
    this.didId = createId();
    this.meta = { ...meta };

    // Register base capabilities
    this._addCapability('generate', async (...args: unknown[]) => {
      const options = args[0] as DIDOptions;
      return await this.generate(options);
    });
    
    this._addCapability('generateKey', async () => await this.generateKey());
    
    this._addCapability('generateWeb', (...args: unknown[]) => {
      const domain = args[0] as string;
      const path = args[1] as string;
      return this.generateWeb(domain, path);
    });
    
    this._addCapability('canGenerateKey', () => this.canGenerateKey());
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
   * Uses exceptions for error handling (simple operation pattern)
   */
  async generate(options: DIDOptions = {}): Promise<string> {
    const { method = 'key', domain, path } = options;
    
    if (method === 'key') {
      return await this.generateKey();
    }
    
    if (method === 'web') {
      if (!domain) {
        throw new Error('Domain is required for did:web');
      }
      return this.generateWeb(domain, path);
    }
    
    throw new Error(`Unsupported DID method: ${method}`);
  }

  /**
   * Generate did:key from learned capabilities
   * Uses pure Unit Architecture - checks for learned capabilities
   * Uses exceptions for error handling (simple operation pattern)
   */
  async generateKey(): Promise<string> {
    // Check if we have learned key capabilities (with test compatibility)
    if (!this.canGenerateKey()) {
      throw new Error('Missing key capabilities. Unit needs to learn from a key unit first.');
    }
    
    // Use learned capabilities to get key data
    const publicKey = await this.execute('getPublicKey') as string;
    
    // Try getKeyType first (new API), fall back to getType (for test compatibility)
    let keyType: string;
    if (this.can('getKeyType')) {
      keyType = await this.execute('getKeyType') as string;
    } else {
      keyType = await this.execute('getType') as string;
    }
    
    if (!publicKey || !keyType) {
      throw new Error('Failed to get key information from learned capabilities');
    }
    
    // Convert PEM to hex for DID creation
    const publicKeyHex = this.convertKeyToHex(publicKey);
    if (!publicKeyHex) {
      throw new Error('Failed to convert public key to hex format');
    }
    
    // Map key types to DID key types
    const keyTypeMap: Record<string, KeyType> = {
      'ed25519': 'ed25519-pub',
      'secp256k1': 'secp256k1-pub',
      'x25519': 'x25519-pub'
    };
    
    const didKeyType = keyTypeMap[keyType];
    if (!didKeyType) {
      throw new Error(`Unsupported key type for DID: ${keyType}`);
    }
    
    return createDIDKey(publicKeyHex, didKeyType);
  }

  /**
   * Generate did:web
   * Uses exceptions for error handling (simple operation pattern)
   */
  generateWeb(domain: string, path?: string): string {
    if (!domain) {
      throw new Error('Domain is required for did:web');
    }
    
    return createDIDWeb(domain, path);
  }

  /**
   * Check if unit can generate did:key (has learned key capabilities)
   */
  canGenerateKey(): boolean {
    // Check for both getKeyType (new API) and getType (test compatibility)
    return this.can('getPublicKey') && (this.can('getKeyType') || this.can('getType'));
  }

  /**
   * Convert public key to hex format
   * Uses @synet/keys utilities for proper format detection and conversion
   * Uses exceptions for error handling (simple operation pattern)
   */
  private convertKeyToHex(publicKey: string): string {
    if (!publicKey || typeof publicKey !== 'string') {
      throw new Error('Invalid public key: must be a non-empty string');
    }
    
    const trimmed = publicKey.trim();
    const format = detectKeyFormat(trimmed);
    
    if (format === 'hex') {
      // Already in hex format
      return trimmed.toLowerCase();
    }
    
    if (format === 'pem' || format === 'base64') {
      // Convert to hex using @synet/keys utility
      try {
        const hexKey = toHex(trimmed);
        if (!hexKey) {
          throw new Error('Failed to convert key to hex format');
        }
        return hexKey.toLowerCase();
      } catch (error) {
        // Re-throw with cleaner error message for DID context
        throw new Error(`Failed to convert ${format} key to hex format: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    throw new Error(`Unsupported key format: ${format}`);
  }

  // Unit implementation
  whoami(): string {
    const capability = this.canGenerateKey() ? 'ready to generate DIDs' : 'waiting to learn key capabilities';
    return `${this.dna.id}@${this.dna.version}\nCan Generate Key DID: ${this.canGenerateKey()}\n${capability}`;
  }

  capabilities(): string[] {
    return this._getAllCapabilities();
  }

  help(): void {
    console.log(`
DID Unit - Minimalistic DID Generation

I am: ${this.whoami()}
Can Generate Key DID: ${this.canGenerateKey()}

Core Capabilities:
- generate(options): Generate DID (key or web method)
- generateKey(): Generate did:key from learned capabilities
- generateWeb(domain, path?): Generate did:web
- canGenerateKey(): Check if ready to generate did:key
- toJSON(): Export unit information

Learning Pattern:
To generate did:key, this unit needs to learn from a key unit:
  
  const signer = Signer.generate('ed25519');
  const key = signer.createKey();
  const didUnit = DID.create();
  
  // Learn key capabilities using TeachingContract
  const keyTeaching = key.teach(); // Returns { unitId, capabilities }
  didUnit.learn([keyTeaching]);
  
  // Now generate did:key
  const did = didUnit.generate({ method: 'key' });

Unit Operations:
- execute(capability, ...args): Execute any capability
- learn(contracts): Learn capabilities from teaching contracts
- teach(): Share capabilities with other units (returns TeachingContract)
- capabilities(): List all available capabilities
- can(capability): Check if unit can execute a capability

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
  if (didUnit.can('getPublicKey') && didUnit.can('getKeyType')) {
    // Can generate did:key
  }
    `);
  }

  teach(): TeachingContract {
    // Return proper TeachingContract format for Unit 1.0.4 compatibility
    return {
      unitId: this.dna.id,
      capabilities: {
        generate: async (...args: unknown[]) => await this.generate(args[0] as DIDOptions),
        generateKey: async () => await this.generateKey(),
        generateWeb: (...args: unknown[]) => this.generateWeb(args[0] as string, args[1] as string),
        canGenerateKey: () => this.canGenerateKey(),
        toJSON: () => this.toJSON()
      }
    };
  }

  /**
   * Learn capabilities from other units
   * Unit 1.0.4 compatible - handles namespaced capabilities properly
   * @param teachings Array of teaching contracts from other units
   */
  learn(teachings: TeachingContract[]): void {
    // Handle malformed input gracefully
    if (!teachings || !Array.isArray(teachings)) {
      return;
    }

    // First call the base implementation which handles namespaced capabilities
    // But we need to filter out malformed contracts first
    const validContracts = teachings.filter(contract => 
      contract?.capabilities && 
      contract?.unitId &&
      typeof contract.capabilities === 'object'
    );

    if (validContracts.length > 0) {
      super.learn(validContracts);
    }
    
    // For DID functionality, we also need direct access to capabilities
    // So we'll add non-namespaced versions for our internal use
    for (const contract of validContracts) {
      const { capabilities, unitId } = contract;
      
      // Add direct capability access for internal DID operations
      for (const [capName, capImpl] of Object.entries(capabilities)) {
        if (typeof capImpl === 'function') {
          // Add direct capability for internal use
          this._addCapability(capName, capImpl);
          
          // Map getType to getKeyType for backward compatibility
          if (capName === 'getType') {
            this._addCapability('getKeyType', capImpl);
          }

          if (capName === 'getPublicKey') {
            this._addCapability('getPublicKey', capImpl);
          }
          
          if (capName === 'getKeyType' || capName === 'getPublicKey') {
            console.debug(`${this.dna.id} unit learned ${capName} capability from ${unitId}`);
          }
        }
      }
    }
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

  /**
   * Create DID unit directly from a public key in PEM format
   * @param publicKeyPEM PEM-formatted public key
   * @param keyType Key algorithm type ('ed25519', 'secp256k1', etc.)
   * @param meta Optional metadata
   */
  static createFromKey(publicKeyPEM: string, keyType: string, meta?: Record<string, unknown>): DID {
    const did = new DID(meta);
    
    // Add key capabilities directly
    did._addCapability('getPublicKey', () => publicKeyPEM);
    did._addCapability('getKeyType', () => keyType);
    
    return did;
  }

  /**
   * Create DID unit directly from a key pair object
   * @param keyPair Object containing publicKey and keyType
   * @param meta Optional metadata
   */
  static createFromKeyPair(keyPair: {
    publicKey: string;
    keyType: string;
    meta?: Record<string, unknown>;
  }): DID | null {
    try {
      if (!keyPair.publicKey || !keyPair.keyType) {
        console.error(' Invalid key pair data');
        return null;
      }
      
      return DID.createFromKey(keyPair.publicKey, keyPair.keyType, keyPair.meta);
    } catch (error) {
      console.error('Failed to create DID from key pair:', error);
      return null;
    }
  }
}
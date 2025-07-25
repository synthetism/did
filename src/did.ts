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

import { Unit, createUnitSchema, type TeachingContract, type UnitProps } from '@synet/unit';
import { createDIDKey, createDIDWeb, type KeyType } from './create';

/**
 * Options for creating a DID
 */
export interface DIDOptions {
  method?: 'key' | 'web';
  domain?: string;
  path?: string;
}


export interface DIDConfig {
  publicKeyHex: string;
  keyType: KeyType | "Ed25519" | "secp256k1" | "X25519";
  metadata?: Record<string, unknown>;
}

export interface DIDProps extends UnitProps {
  created: Date;
  metadata: Record<string, unknown>;
  publicKeyHex: string;
  keyType: KeyType |  "Ed25519" | "secp256k1" | "X25519";
}

const VERSION = '1.0.6';

/**
 * DID Unit - Minimalistic DID generation using pure Unit Architecture
 * Learns key capabilities through standard teach/learn pattern
 */
export class DID extends Unit<DIDProps> {

  private constructor(props: DIDProps ) {
    // Create unit with proper ID for Unit 1.0.4 architecture
        super(props);
    
  }

  /**
   * Create DID unit with public key and key type
   */
  static create(config: DIDConfig): DID {
    // Validate hex format
    if (!DID.isHex(config.publicKeyHex)) {
      throw new Error(`Invalid public key format: expected hex string, got ${typeof config.publicKeyHex}`);
    }
    
    const props: DIDProps = {
      dna: createUnitSchema({      
        id: "did",
        version: VERSION,
      }),
      created: new Date(),
      metadata: config.metadata || {},
      publicKeyHex: config.publicKeyHex.toLowerCase(),
      keyType: config.keyType
    };
               
    return new DID(props);
  }

  /**
   * Generate DID based on options
   */
  generate(options: DIDOptions = {}): string {
    const { method = 'key', domain, path } = options;
    
    if (method === 'key') {
      return this.generateKey();
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
   * Generate did:key from stored public key and key type
   * Simple, deterministic operation - no learning required
   */
  generateKey(): string {
    return createDIDKey(this.props.publicKeyHex, this.props.keyType);
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
   * Validate if string is valid hex format
   */
  static isHex(str: string): boolean {
    if (!str || typeof str !== 'string') {
      return false;
    }
    
    const trimmed = str.trim();
    
    // Check if it's a valid hex string (only hex characters, even length)
    return /^[0-9a-fA-F]+$/.test(trimmed) && trimmed.length % 2 === 0;
  }

  // Unit implementation
  whoami(): string {
    return `DID Unit v${this.props.dna.version} - Minimalistic DID Generation`;
  }

  capabilities(): string[] {
    return this._getAllCapabilities();
  }

  help(): void {
    console.log(`
Hi, 

I am: ${this.whoami()}

Create me with params:

interface DIDConfig {
  publicKeyHex: string;
  keyType: "Ed25519" | "secp256k1" | "X25519";
  metadata?: Record<string, unknown>;
}

DID.create(params:DIDConfig);

Core Capabilities:
- generate(options): Generate DID (key or web method)
- generateKey(): Generate did:key from learned capabilities
- generateWeb(domain, path?): Generate did:web
- toJSON(): Export unit information

Generate options:

export interface DIDOptions {
  method?: 'key' | 'web';
  domain?: string;  // for web
  path?: string; // for web
}

Getters: 

- metadata()
- publicKeyHex(): string 
- keyType(): string 


Learning Pattern:
To generate did:key, this unit needs to learn from a key unit:
  
  const signer = Signer.generate('ed25519');
  const key = signer.createKey();
  const didUnit = DID.create(
    { 
      publicKeyHex: key.publicKeyHex, 
      keyType: key.keyType 
    }
  );  
  // Now generate did:key
  const did = didUnit.generate({ method: 'key' });

  `);
  }

  teach(): TeachingContract {
    return {
      unitId: this.props.dna.id,
      capabilities: {
        generate: (...args: unknown[]) => this.generate(args[0] as DIDOptions),
        generateKey: () => this.generateKey(),
        generateWeb: (...args: unknown[]) => this.generateWeb(args[0] as string, args[1] as string),
      }
    };
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.props.dna.id,
      publicKeyHex: this.props.publicKeyHex,
      keyType: this.props.keyType,
      dna: this.props.dna,
      metadata: this.props.metadata,
    };
  }

  // Getters
  get id(): string {
    return this.props.dna.id;
  }

  get metadata(): Record<string, unknown> {
    return { ...this.props.metadata };
  }

  get publicKeyHex(): string {
    return this.props.publicKeyHex;
  }
  get keyType(): string  {
    return this.props.keyType;
  }
}
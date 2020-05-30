declare module "orbit-db-identity-provider" {
  import Store from "orbit-db-store";
  import { Keystore } from "orbit-db-keystore";

  export type IdentityProviderType = "orbitdb" | "ethereum" | string;

  export interface IdentityProviderOptions {
    /**
     * required by OrbitDBIdentityProvider
     */
    id?: string;
    /**
     * required by OrbitDBIdentityProvider
     */
    keystore?: Keystore;
    /**
     * required by OrbitDBIdentityProvider
     */
    signingKeystore?: Keystore;
    /**
     * required by EthIdentityProvider
     */
    wallet?: any;

    [k: string]: any;
  }

  export class IdentityProvider {
    constructor(options: IdentityProviderOptions);

    /**
     * Return the type for this identity-provider
     */
    readonly type: IdentityProviderType;

    /**
     * Return id of identity (to be signed by orbit-db public key)
     */
    getId(options?: IdentityProviderOptions): Promise<string>;

    /**
     * Return signature of OrbitDB public key signature
     */
    signIdentity(
      data: any,
      options?: { [key: string]: any; id: string }
    ): Promise<any>;

    /**
     * Verify a signature of OrbitDB public key signature
     */
    static verifyIdentity(identity: IdentityAsJson): Promise<boolean>;
  }

  export interface IdentityAsJson {
    id: string;
    publicKey: string;
    signatures: {
      id: string;
      publicKey: string;
    };
    type: IdentityProviderType;
  }

  export class Identity implements IdentityAsJson {
    constructor(
      id: string,
      publicKey: string,
      idSignature: string,
      pubKeyIdSignature: string,
      type: string,
      provider: IdentityProvider
    );

    readonly id: string;
    readonly publicKey: string;
    readonly signatures: { id: string; publicKey: string };
    readonly type: IdentityProviderType;
    readonly provider: Identities;

    toJSON(): IdentityAsJson;
  }

  export interface CreateIdentityOptions extends IdentityProviderOptions {
    type?: IdentityProviderType;
    identityKeysPath?: string;
    migrate?: (options: {
      targetStore: Store;
      targetId: string;
    }) => Promise<void>;
  }

  export interface StaticCreateIdentityOptions extends CreateIdentityOptions {
    identityKeysPath?: string;
  }

  export default class Identities {
    constructor(options: { keystore?: Keystore; signingKeystore?: Keystore });

    readonly keystore: Keystore;
    readonly signingKeystore: Keystore;

    sign(identity: IdentityAsJson, data: any): Promise<string>;

    verify(
      signature: string,
      publicKey: string,
      data: any,
      verifier?: any
    ): Promise<boolean>;

    createIdentity(options?: CreateIdentityOptions): Promise<Identity>;

    signId(id: string): Promise<{ publicKey: string; idSignature: string }>;

    verifyIdentity(identity: IdentityAsJson): Promise<boolean>;

    static verifyIdentity(identity: IdentityAsJson): Promise<boolean>;

    static createIdentity(
      options?: StaticCreateIdentityOptions
    ): Promise<Identity>;

    static isSupported(type: IdentityProviderType): boolean;

    static addIdentityProvider(
      IdentityProviderType: typeof IdentityProvider
    ): void;

    static removeIdentityProvider(type: IdentityProviderType): void;
  }
}

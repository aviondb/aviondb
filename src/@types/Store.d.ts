import { IReplicationStatus } from "./IReplicationStatus";

declare module "orbit-db-store-interface" {
  import { Ipfs } from "ipfs";
  import { Identity } from "orbit-db-identity-provider";
  import { EventEmitter } from "events";
  import * as elliptic from "elliptic";

  export default class Store {
    /**
     * The identity is used to sign the database entries.
     */
    readonly identity: Identity;

    address: { root: string; path: string };
    /**
     * Contains all entries of this Store
     */
    all: any[];
    type: string;
    /**
     * Returns an instance of `elliptic.ec.KeyPair`.
     * The keypair is used to sign the database entries.
     * The key can also be accessed from the OrbitDB instance: `orbitdb.key.getPublic('hex')`.
     */
    key: elliptic.ec.KeyPair;
    replicationStatus: IReplicationStatus;

    events: EventEmitter;

    /**
     * Apparently not meant for outside usage
     * @param ipfs
     * @param identity
     * @param address
     * @param options
     */
    protected constructor(
      ipfs: Ipfs,
      identity: Identity,
      address: string,
      options: IStoreOptions
    );

    close(): Promise<void>;
    drop(): Promise<void>;

    setIdentity(identity: Identity): void;

    /**
     * Load the locally persisted database state to memory.
     * @param amount Amount of entries loaded into memory
     * @returns a `Promise` that resolves once complete
     */
    load(amount?: number): Promise<void>;

    protected _addOperation(
      data: any,
      options: { onProgressCallback?: (entry: any) => any; pin?: boolean }
    ): Promise<string>;
  }
}

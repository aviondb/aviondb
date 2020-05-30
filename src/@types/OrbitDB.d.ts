/// <reference path="./DBOptions.d.ts" />
/// <reference path="./LogEntry.d.ts" />
declare module "orbit-db-interface" {
  import Store from "orbit-db-store";
  import KeyValueStore from "orbit-db-kvstore";
  import FeedStore from "orbit-db-feedstore";
  import EventStore from "orbit-db-eventstore";
  import DocumentStore from "orbit-db-docstore";
  import CounterStore from "orbit-db-counterstore";
  import { Keystore } from "orbit-db-keystore";
  import Cache from "orbit-db-cache";
  import { Identity } from "orbit-db-identity-provider";
  import { Ipfs } from "ipfs";
  import * as elliptic from "elliptic";

  export class OrbitDB {
    _ipfs: Ipfs;

    id: string;
    stores: any;
    directory: string;
    keystore: Keystore;

    // For OpenTelemetry Plugin
    span?: any;

    static databaseTypes: string[];

    constructor(
      ipfs: Ipfs,
      directory?: string,
      options?: {
        peerId?: string;
        keystore?: Keystore;
      }
    );

    /**
     * Creates and returns an instance of OrbitDB.
     * @param ipfs
     * @param options Other options:
     * <ul>
     * <li>directory (string): path to be used for the database files. By default it uses './orbitdb'.</li>
     * <li>peerId (string): By default it uses the base58 string of the ipfs peer id.</li>
     * <li>keystore (Keystore Instance) : By default creates an instance of Keystore.</li>
     * <li>cache (Cache Instance) : By default creates an instance of Cache. A custom cache instance can also be used.</li>
     * <li>identity (Identity Instance): By default it creates an instance of Identity</li>
     * </ul>
     */
    static createInstance(
      ipfs: Ipfs,
      options?: {
        directory?: string;
        peerId?: string;
        keystore?: Keystore;
        cache?: Cache<any>;
        identity?: Identity;
      }
    ): Promise<OrbitDB>;

    create(
      name: string,
      type: TStoreType,
      options?: ICreateOptions
    ): Promise<Store>;

    open(address: string, options?: IOpenOptions): Promise<Store>;

    disconnect(): Promise<void>;
    stop(): Promise<void>;

    feed<T>(address: string, options?: IStoreOptions): Promise<FeedStore<T>>;
    log<T>(address: string, options?: IStoreOptions): Promise<EventStore<T>>;
    eventlog<T>(
      address: string,
      options?: IStoreOptions
    ): Promise<EventStore<T>>;
    keyvalue<T>(
      address: string,
      options?: IStoreOptions
    ): Promise<KeyValueStore<T>>;
    kvstore<T>(
      address: string,
      options?: IStoreOptions
    ): Promise<KeyValueStore<T>>;
    counter(address: string, options?: IStoreOptions): Promise<CounterStore>;
    docs<T>(
      address: string,
      options?: IStoreOptions
    ): Promise<DocumentStore<T>>;
    docstore<T>(
      address: string,
      options?: IStoreOptions
    ): Promise<DocumentStore<T>>;

    static isValidType(type: TStoreType): boolean;
    static addDatabaseType(type: string, store: typeof Store): void;
    static getDatabaseTypes(): {};
    static isValidAddress(address: string): boolean;
  }

  export default OrbitDB;
}

import { Ipfs } from "ipfs";
import { Identity } from "orbit-db-identity-provider";
import Cache from "orbit-db-cache";
import { Keystore } from "orbit-db-keystore";
import OrbitDB from "orbit-db-interface";
import AccessController from "orbit-db-access-controllers/src/access-controller-interface";

export interface Payload {
  op: string;
  value: DocumentInterface[] | (string | number | object)[];
  modification?: object;
  options?:
    | object
    | UpdateOptionsInterface
    | UpdateOneOptionsInterface
    | UpdateManyOptionsInterface;
}

export interface ICreateOptions {
  /**
   * The directory where data will be stored (Default: uses directory option passed to OrbitDB constructor or ./orbitdb if none was provided).
   */
  directory?: string;

  accessController?: {
    /**
     * An array of hex encoded public keys which are used to set write access to the database.
     * ["*"] can be passed in to give write access to everyone.
     * See the GETTING STARTED guide for more info.
     * (Default: uses the OrbitDB instance key orbitdb.key, which would give write access only to yourself)
     */
    write?: string[];

    /**
     * Name of custom AccessController
     */
    type?: string;
  };

  /**
   * Overwrite an existing database (Default: false)
   */
  overwrite?: boolean;

  /**
   * Replicate the database with peers, requires IPFS PubSub. (Default: true)
   */
  replicate?: boolean;

  meta?: any;
}

export interface IOpenOptions {
  /**
   * if set to true, will throw an error if the database can't be found locally. (Default: false)
   */
  localOnly?: boolean;

  /**
   * The directory where data will be stored (Default: uses directory option passed to OrbitDB constructor or ./orbitdb if none was provided).
   */
  directory?: string;

  /**
   * Whether or not to create the database if a valid OrbitDB address is not provided. (Default: false, only if using the OrbitDB#open method, otherwise this is true by default)
   */
  create?: boolean;

  /**
   * A supported database type (i.e. eventlog or an added custom type).
   * Required if create is set to true.
   * Otherwise it's used to validate the manifest.
   * You ony need to set this if using OrbitDB#open
   */
  type?: TStoreType;

  /**
   * Overwrite an existing database (Default: false)
   */
  overwrite?: boolean;

  /**
   * Replicate the database with peers, requires IPFS PubSub. (Default: true)
   */
  replicate?: boolean;
}

export interface IStoreOptions extends ICreateOptions, IOpenOptions {
  Index?: any;
  orbitdb?: OrbitDB;
  accessController?: AccessController;
  cache?: Cache<any>;
  maxHistory?: number;
  syncLocal?: boolean;
  fetchEntryTimeout?: number;
  referenceCount?: number;
  replicationConcurrency?: number;
  sortFn?: Function;
  onClose?: Function;
  onDrop?: Function;
  onLoad?: Function;
}

// c.f. https://github.com/orbitdb/orbit-db/blob/master/API.md#orbitdbdatabasetypes
type TStoreType =
  | "counter"
  | "eventlog"
  | "feed"
  | "docstore"
  | "keyvalue"
  | "aviondb"
  | "aviondb.collection"
  | string;

type OrbitDBStorageAdapter = any;

export interface OrbitDBOptions {
  directory?: string;
  id?: Ipfs.Id;
  storage?: OrbitDBStorageAdapter;
  peerId?: string;
  keystore?: Keystore;
  cache?: Cache<any>;
  identity?: Identity;
  offline?: boolean;
  meta?: any;
  overwrite?: boolean;
}

export interface StoreOptions extends IStoreOptions {
  path?: string;
}

export interface CollectionOptions {
  create?: boolean | false;
  overwrite?: boolean;
}

export interface DatabaseConfigOptions {
  path?: string;
}

export interface InsertOptions {
  ordered?: boolean;
  writeConcern?: object;
}

export interface InsertOneOptions {
  writeConcern?: object;
}

export interface DocumentInterface {
  _id: object | string | number;
}

export interface FindOptionsInterface {
  limit?: number;
  skip?: number;
  sort?: object;
}

export interface FindOneAndUpdateOptionsInterface {
  projection?: object;
  sort?: object;
  maxTimeMS?: number;
  upsert?: boolean;
  returnNewDocument?: boolean;
  collation?: object;
  arrayFilters?: Array<object>;
}

export interface FindOneAndDeleteOptionsInterface {
  projection?: object;
  sort?: object;
  maxTimeMS?: number;
  collation?: object;
}

export interface UpdateOptionsInterface {
  upsert?: boolean;
  multi?: boolean;
  writeConcern?: object;
  collation?: object;
  arrayFilters?: Array<object>;
  hint?: object | string;
}

export interface UpdateOneOptionsInterface {
  upsert?: boolean;
  writeConcern?: object;
  collation?: object;
  arrayFilters?: Array<object>;
  hint?: object | string;
}

export interface UpdateManyOptionsInterface {
  upsert?: boolean;
  writeConcern?: object;
  collation?: object;
  arrayFilters?: Array<object>;
  hint?: object | string;
}

export interface DeleteOneOptionsInterface {
  writeConcern?: object;
  collation?: object;
}

export interface DeleteManyOptionsInterface {
  writeConcern?: object;
  collation?: object;
}

export interface ImportOptionsInterface {
  overwrite?: boolean;
  type?: string;
  batchSize?: number;
}

export interface ImportStreamOptionsInterface {
  overwrite?: boolean;
  type?: string;
  batchSize: number;
}

export interface ExportOptionsInterface {
  type?: string;
  limit?: number;
  query?: object;
}

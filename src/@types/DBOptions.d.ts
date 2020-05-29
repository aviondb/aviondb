interface ICreateOptions {
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
}

interface IOpenOptions {
  /**
   * f set to true, will throw an error if the database can't be found locally. (Default: false)
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

interface IStoreOptions extends ICreateOptions, IOpenOptions {
  Index?: any;
}

// c.f. https://github.com/orbitdb/orbit-db/blob/master/API.md#orbitdbdatabasetypes
type TStoreType =
  | "counter"
  | "eventlog"
  | "feed"
  | "docstore"
  | "keyvalue"
  | string;

//export {ICreateOptions, IOpenOptions, IStoreOptions};

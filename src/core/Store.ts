import * as OrbitdbStore from "orbit-db-store";
import * as OrbitDB from "orbit-db";
import Collection from "./Collection";
import { Ipfs } from "ipfs";
import { EventEmitter } from "events";
import { IdentityProvider } from "orbit-db-identity-provider";
import {
  CollectionOptions,
  OrbitDBOptions,
  IStoreOptions,
  IOpenOptions,
  ICreateOptions,
} from "./interfaces";
import { LogEntry } from "ipfs-log";
const Index = require("./StoreIndex");
const debug = require("debug")("aviondb:store");
let orbitdb: OrbitDB;

class Store extends OrbitdbStore {
  _type: string;
  _orbitdb: OrbitDB;
  openCollections: any;
  _index: any;
  events: EventEmitter;
  address: { root: string; path: string };
  constructor(
    ipfs: Ipfs,
    id: IdentityProvider,
    dbname: string,
    options?: IStoreOptions
  ) {
    const opts = { Index };
    Object.assign(opts, options);
    super(ipfs, id, dbname, opts);
    this._type = "aviondb";
    if (options.orbitdb) {
      this._orbitdb = options.orbitdb;
    }

    this.openCollections = {};

    this._index.store = this;

    this.events.on(
      "write",
      (address: string, entry: LogEntry<any>, heads: LogEntry<any>[]) => {
        this._index.handleEntry(entry);
      }
    );
    this.events.on(
      "replicate.progress",
      (
        address: string,
        hash: Multihash,
        entry: LogEntry<any>,
        progress: number,
        total: number
      ) => {
        this._index.handleEntry(entry);
      }
    );

    this.events.on(
      "db.createCollection",
      async (name: string, address: string) => {
        if (!this.openCollections[name]) {
          this.openCollections[name] = await this.openCollection(address);
        }
      }
    );
  }
  /**
   * Create a collection
   * @param {String} name Name of collection
   * @param {CollectionOptions} options Options for avoindb
   * @param {ICreateOptions} orbitDbOptions Options directly passed into orbitdb.create()
   * @returns {Promise<Collection>} Returns a Promise that resolves to an AvionDB Collection instance
   */
  async createCollection(
    name: string,
    options: CollectionOptions = { overwrite: false },
    orbitDbOptions: ICreateOptions = {}
  ): Promise<Collection> {
    orbitDbOptions.meta = {
      parent: this.address.root,
    };
    const { overwrite } = options;
    if (overwrite) {
      orbitDbOptions.overwrite = true;
    }
    if (!name || typeof name !== "string") {
      throw "name must be a string";
    }
    if (this._index.get(name) && !overwrite) {
      throw `Collection with name: ${name} already exists.`;
    }
    const collection = await this._orbitdb.create(
      name,
      "aviondb.collection",
      orbitDbOptions
    );
    this.openCollections[name] = collection;
    //@ts-ignore
    await this._addOperation({
      op: "collection.create",
      address: collection.address.toString(),
      name,
    });
    return collection;
  }

  /**
   * Opens a collection
   * @param {String} name Name of collection
   * @param {CollectionOptions} options options for avoindb
   * @param {IOpenOptions} orbitDbOptions options directly passed into orbitdb.open()
   * @returns {Promise<Collection>} Returns a Promise that resolves to an AvionDB Collection instance
   */
  async openCollection(
    name: string,
    options: CollectionOptions = { create: false },
    orbitDbOptions?: IOpenOptions
  ): Promise<Collection> {
    const { create } = options;
    if (!name || typeof name !== "string") {
      throw "name must be a string";
    }
    if (!this._index.get(name) && create !== true) {
      throw `Collection with name of "${name}" does not exist`;
    }
    if (this.openCollections[name]) {
      return this.openCollections[name];
    }
    if (create === true) {
      return await this.createCollection(name);
    } else {
      const collectionInfo = this._index.get(name);
      const collection = await this._orbitdb.open(
        collectionInfo.address,
        orbitDbOptions
      );
      await collection.load();
      this.openCollections[name] = collection;
      return collection;
    }
  }
  /**
   * Creates a collection if it does not exist, or opens an existing database collection.
   * @param {string} name Name of collection
   * @param {CollectionOptions} options options for avoindb
   * @param {IStoreOptions} orbitDbOptions options directly passed into orbitdb.open() or orbitdb.create()
   * @returns {Promise<Collection>} Returns a Promise that resolves to an AvionDB Collection instance
   */
  async initCollection(
    name: string,
    options?: CollectionOptions,
    orbitDbOptions?: IStoreOptions
  ): Promise<Collection | undefined> {
    if (!name || typeof name !== "string") {
      throw "name must be a string";
    }
    // Collection exists
    if (this._index.get(name)) {
      return await this.openCollection(name, options, orbitDbOptions);
    }
    // Collection does not exist
    if (!this._index.get(name)) {
      return await this.createCollection(name, options, orbitDbOptions);
    }
  }
  /**
   * Deletes collection removing all stored data
   * @param {string} name Name of collection to be dropped
   * @param {JSON Object} options
   */
  async dropCollection(name: string, options: any = {}) {
    if (!name || typeof name !== "string") {
      throw "Name must be a string";
    }
    const collectionInfo = this._index._index[name];
    //@ts-ignore
    await this._addOperation({
      op: "collection.drop",
      address: collectionInfo.address,
      name,
    });
  }
  /**
   * Lists collections in the database
   * @param {JSON Object} filter
   * @param {JSON Object} options
   * @returns {Array<string>} Returns an Array of Collection names
   */
  listCollections(filter: any = {}, options: any = {}): Array<string> {
    return Object.keys(this._index._index);
  }
  /**
   * Returns collection instance. Throws error if collection is not open.
   *
   * @param {string} name Name of collection
   * @returns {Promise<Collection>} Returns a Promise that resolves to an AvionDB Collection instance
   */
  collection(name: string): Promise<Collection> {
    if (!name || typeof name !== "string") {
      throw "Name must be a string";
    }
    if (!this.openCollections[name]) {
      throw `Collection: ${name} is not open.`;
    }
    return this.openCollections[name];
  }
  /**
   * Closes an open collection
   * @param {string} name Name of collection
   */
  async closeCollection(name: string) {
    if (this.openCollections[name]) {
      await this.openCollections[name].close();
    }
  }
  async load(number: number, options: any = {}) {
    await super.load(number, options);
    debug("datastore is loading");

    //Load and start collections into memory.
    for (const name of this.listCollections()) {
      await this.openCollection(name);
    }
  }
  async close() {
    for (const name in this.openCollections) {
      await this.openCollections[name].close();
    }
    await super.close();
  }
  /**
   * Creates a new instance of AvionDB
   * @param {string} name Name of Database
   * @param {Ipfs} ipfs IPFS Instance
   * @param {IStoreOptions} options options to be passed to orbitdb.create()
   * @param {OrbitDBOptions} orbitDbOptions options to be passed to OrbitDB.createInstance()
   * @returns {Promise<Store>} Returns a Promise that resolves to an AvionDB instance
   */
  static async create(
    name: string,
    ipfs: Ipfs,
    options?: IStoreOptions,
    orbitDbOptions?: OrbitDBOptions
  ): Promise<Store> {
    if (!orbitdb) {
      orbitdb = await OrbitDB.createInstance(ipfs, orbitDbOptions);
    }
    const store = await orbitdb.create(name, "aviondb", options);
    store._orbitdb = orbitdb;
    await store.load();
    return store;
  }
  /**
   * Opens an existing instance of AvionDB
   * @param {string} address Address of Database
   * @param {Ipfs} ipfs IPFS Instance
   * @param {IStoreOptions} options options to be passed to orbitdb.open()
   * @param {OrbitDBOptions} orbitDbOptions options to be passed to OrbitDB.createInstance()
   * @returns {Promise<Store>} Returns a Promise that resolves to an AvionDB instance
   */
  static async open(
    address: string,
    ipfs: Ipfs,
    options?: IStoreOptions,
    orbitDbOptions?: OrbitDBOptions
  ): Promise<Store> {
    if (!orbitdb) {
      orbitdb = await OrbitDB.createInstance(ipfs, orbitDbOptions);
    }
    const store = await orbitdb.open(address, options);
    store._orbitdb = orbitdb;
    await store.load();
    return store;
  }
  /**
   * Creates a new instance of AvionDB if not present already.
   * If an instance with name is exists, then opens and returns the instance.
   *
   * @param {string} name Name of database
   * @param {Ipfs} ipfs IPFS Instance
   * @param {IStoreOptions} options options to be passed to orbitdb.open() or orbitdb.create()
   * @param {OrbitDBOptions} orbitDbOptions options to be passed to OrbitDB.createInstance()
   * @returns {Promise<Store>} Returns a Promise that resolves to an AvionDB instance
   */
  static async init(
    name: string,
    ipfs: Ipfs,
    options?: IStoreOptions,
    orbitDbOptions?: OrbitDBOptions
  ): Promise<Store> {
    if (!name || typeof name !== "string") {
      throw "name must be a string";
    }

    orbitdb = await OrbitDB.createInstance(ipfs, orbitDbOptions);

    // Parse the database address
    const dbAddress = await orbitdb._determineAddress(name, "aviondb", options);

    const cache = await orbitdb._requestCache(dbAddress, orbitdb.directory);

    // Check if we have the database
    const haveDB = await orbitdb._haveLocalData(cache, dbAddress);

    if (haveDB) {
      return await Store.open(dbAddress, ipfs, options, orbitDbOptions);
    } else {
      return await Store.create(name, ipfs, options, orbitDbOptions);
    }
  }
}
OrbitDB.addDatabaseType("aviondb.collection", Collection);
OrbitDB.addDatabaseType("aviondb", Store);

export default Store;

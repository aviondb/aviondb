import { Ipfs } from "ipfs";
import { IdentityProvider } from "orbit-db-identity-provider";
import {
  InsertOptions,
  InsertOneOptions,
  DocumentInterface,
  FindOptionsInterface,
  FindOneAndUpdateOptionsInterface,
  FindOneAndDeleteOptionsInterface,
  UpdateOptionsInterface,
  UpdateOneOptionsInterface,
  UpdateManyOptionsInterface,
  DeleteOneOptionsInterface,
  DeleteManyOptionsInterface,
  ImportOptionsInterface,
  ImportStreamOptionsInterface,
  ExportOptionsInterface,
  IStoreOptions,
} from "./interfaces";
import { LogEntry } from "ipfs-log";
const OrbitdbStore = require("orbit-db-store");
const ObjectId = require("bson-objectid");
const CID = require("cids");
const CollectionIndex = require("./CollectionIndex");
const DagCbor = require("ipld-dag-cbor");

class Collection extends OrbitdbStore {
  constructor(
    ipfs: Ipfs,
    id: IdentityProvider,
    dbname: string,
    options: IStoreOptions
  ) {
    const opts = Object.assign({}, { Index: CollectionIndex });
    Object.assign(opts, options);
    super(ipfs, id, dbname, opts);
    this._type = "aviondb.collection";
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
  }

  /**
   * Inserts multiple records into a Collection
   *
   * @param {Array<DocumentInterface>} docs Array of Documents/Records
   * @param {InsertOptions} options Options for insert()
   * @param {Function} callback Callback function
   * @returns {Promise<string>} Returns a Promise that resolves to CID of the inserted DAG that points to the inserted document(s)
   */

  insert(
    docs: Array<DocumentInterface>,
    options?: InsertOptions,
    callback?: Function
  ): Promise<string> {
    for (const doc of docs) {
      if (!doc._id) {
        doc._id = ObjectId.generate();
      }
    }
    return this._addOperation({
      op: "INSERT",
      value: docs,
    });
  }

  /**
   * Inserts single record into a Collection
   *
   * @param {DocumentInterface} doc Single Document/Record
   * @param {InsertOneOptions} options options for insertOne()
   * @param {Function} callback Callback function
   * @returns {Promise<string>} Returns a Promise that resolves to CID of the inserted DAG that points to the inserted document
   */
  async insertOne(
    doc: DocumentInterface,
    options?: InsertOneOptions,
    callback?: Function
  ): Promise<string> {
    if (typeof doc !== "object")
      throw new Error("Object documents are only supported");

    return await this.insert([doc]);
  }

  /**
   * Fetches matching record(s)
   *
   * @param {object} query Query for find
   * @param {object|string} projection Projection (not implemented yet)
   * @param {FindOptionsInterface} options Options for find()
   * @param {Function} callback Callback function
   * @returns {Promise<Array<DocumentInterface>>} Returns a Promise that resolves to an Array of Document(s)
   */

  find(
    query: object,
    projection?: object | string,
    options?: FindOptionsInterface,
    callback?: Function
  ): Promise<Array<DocumentInterface>> {
    return this._index.find(query, projection, options, callback);
  }

  /**
   * Fetches the first matching record
   *
   * @param {JSON Object} query Query for findOne(), same as for find()
   * @param {object|string} projection Projection (not implemented yet)
   * @param {object} options Options for findOne()
   * @param {Function} callback Callback function
   * @returns {Promise<DocumentInterface>} Returns a Promise that resolves a Document
   */

  findOne(
    query: object,
    projection?: object | string,
    options?: object,
    callback?: Function
  ): Promise<DocumentInterface> {
    return this._index.findOne(query);
  }

  /**
   * Updates the first matching record
   *
   * @param {object} query Query for findOneAndUpdate(), same as for find()
   * @param {object} modification Projection (not implemented yet)
   * @param {FindOneAndUpdateOptionsInterface} options Options for findOneAndUpdate()
   * @param {Function} callback Callback function
   * @returns {Promise<DocumentInterface>} Returns a Promise that resolves to the updated Document
   */

  async findOneAndUpdate(
    filter: object = {},
    modification: object,
    options?: FindOneAndUpdateOptionsInterface,
    callback?: Function
  ): Promise<DocumentInterface> {
    const doc = await this.findOne(filter);
    if (doc) {
      await this._addOperation({
        op: "UPDATE",
        value: [doc._id],
        modification: modification,
      });
    }
    return doc;
  }
  /**
   * Deletes a single document based on the filter and sort criteria,
   * returning the deleted document.
   * @param {object} filter The selection criteria for the deletion. The same query selectors as in the find() method are available.
   * @param {FindOneAndDeleteOptionsInterface} options Options for findOneAndDelete()
   * @param {Function} callback Callback function
   * @returns {Promise<DocumentInterface>} Returns a Promise that resolves to the deleted Document
   */
  async findOneAndDelete(
    filter: object = {},
    options?: FindOneAndDeleteOptionsInterface,
    callback?: Function
  ): Promise<DocumentInterface> {
    const doc = await this.findOne(filter);
    if (doc) {
      await this._addOperation({
        op: "DELETE",
        value: [doc._id],
      });
    }
    return doc;
  }

  /**
   * Finds a record in the collection by Id
   *
   * @param {object|string|number} _id "_id" for a Document/Record
   * @param {object|string} projection Projection (not implemented yet)
   * @param {object} options Options for findById()
   * @param {Function} callback Callback function
   * @returns {Promise<DocumentInterface>} Returns a Promise that resolves to a Document with matching "_id"
   */
  findById(
    _id: string | number,
    projection?: object | string,
    options?: object,
    callback?: Function
  ): Promise<DocumentInterface> {
    return this._index.findById(_id, projection, options, callback);
  }

  /**
   * Finds & deletes a record in the collection by Id
   *
   * @param {object|string|number} _id "_id" for a Document/Record
   * @param {object} options Options for findByIdAndDelete()
   * @param {Function} callback Callback function
   * @returns {Promise<DocumentInterface>} Returns a Promise that resolves to the deleted Document with matching "_id"
   */

  async findByIdAndDelete(
    _id: string | number,
    options?: object,
    callback?: Function
  ): Promise<DocumentInterface> {
    const doc = this._index.findById(_id);
    if (doc) {
      await this._addOperation({
        op: "DELETE",
        value: [doc._id],
      });
    }
    return doc;
  }

  /**
   *
   * Finds & updates a record in the collection by Id
   *
   * @param {object|string|number} _id "_id" for a Document/Record
   * @param {object} modification Updates that need to made to the matching documents
   * @param {object} options Options for findByIdAndUpdate()
   * @param {Function} callback Callback function
   * @returns {Promise<DocumentInterface>} Returns a Promise that resolves to the updated Document with matching "_id"
   */

  async findByIdAndUpdate(
    _id: string | number,
    modification: object,
    options: object = {},
    callback?: Function
  ): Promise<DocumentInterface> {
    const doc = await this._index.findById(_id);
    if (doc) {
      await this._addOperation({
        op: "UPDATE",
        value: [doc._id],
        modification: modification,
        options: options,
      });
    }
    return doc;
  }

  /**
     *
     * Modifies an existing document or documents in a collection.
     * The method can modify specific fields of an existing document
     * or documents or replace an existing document entirely, depending
     * on the update parameter.
     * 
     * By default, the db.collection.update() method updates a single document.
     * Include the option multi: true to update all documents that match the query criteria.
     * 
     * 
     *  db.collection.update(
        <filter>,
        <modification>,
        {
            upsert: <boolean>,
            multi: <boolean>,
            writeConcern: <document>,
            collation: <document>,
            arrayFilters: [ <filterdocument1>, ... ],
            hint:  <document|string>
        }
        )
     * @param {object} filter Query/Filter criteria for documents, same as for find()
     * @param {object} modification Updates that need to made to the matching document(s)
     * @param {UpdateOptionsInterface} options Options for update()
     * @param {Function} callback Callback function
     * @returns {Promise<Array<DocumentInterface>>} Returns a Promise that resolves to an Array of updated Document(s)
     */

  async update(
    filter: object = {},
    modification: object,
    options: UpdateOptionsInterface = {},
    callback?: Function
  ): Promise<Array<DocumentInterface>> {
    const ids = [];
    const docs = [];
    if (options.multi) {
      docs.push(...(await this.find(filter)));
      ids.push(...docs.map((item) => item._id));
    }
    if (options.upsert && ids.length === 0) {
      // TODO: implement upsert condition for $setOnInsert operator
    } else if (
      Object.keys(options).length === 0 &&
      options.constructor === Object
    ) {
      const doc = await this.findOne(filter);
      if (doc) {
        docs.push(doc);
        ids.push(...docs.map((item) => item._id));
      }
    }
    await this._addOperation({
      op: "UPDATE",
      value: ids,
      modification: modification,
      options: options,
    });
    return docs;
  }

  /**
     * Updates a single document within the collection based on the filter.
     * 
     * db.collection.updateOne(
        <filter>,
        <modification>,
        {
            upsert: <boolean>,
            writeConcern: <document>,
            collation: <document>,
            arrayFilters: [ <filterdocument1>, ... ],
            hint:  <document|string>       
        }
        )
     * 
     * @param {object} filter Query/Filter criteria for documents, same as for find()
     * @param {object} modification Updates that need to made to the matching document
     * @param {UpdateOneOptionsInterface} options Options for updateOne()
     * @param {Function} callback Callback function
     * @returns {Promise<DocumentInterface>} Returns a Promise that resolves to an updated Document
     */

  async updateOne(
    filter: object = {},
    modification: object,
    options: UpdateOneOptionsInterface = {},
    callback?: Function
  ): Promise<DocumentInterface> {
    const doc = await this.findOne(filter);
    if (doc) {
      await this._addOperation({
        op: "UPDATE",
        value: [doc._id],
        modification: modification,
        options: options,
      });
    }
    return doc;
  }

  /**
     *
     * Updates all documents that match the specified filter for a collection.
     *  
     * db.collection.updateMany(
        <filter>,
        <modification>,
        {
            upsert: <boolean>,
            writeConcern: <document>,
            collation: <document>,
            arrayFilters: [ <filterdocument1>, ... ],
            hint:  <document|string>       
        }
        )
     * 
     * @param {object} filter Query/Filter criteria for documents, same as for find()
     * @param {object} modification Updates that need to made to the matching document(s)
     * @param {UpdateManyOptionsInterface} options Options for updateOneMany()
     * @param {Function} callback Callback function
     * @returns {Promise<Array<DocumentInterface>>} Returns a Promise that resolves to an Array of updated Document(s)
     */

  async updateMany(
    filter: object = {},
    modification: object,
    options: UpdateManyOptionsInterface = {},
    callback?: Function
  ): Promise<Array<DocumentInterface>> {
    const docs = await this.find(filter);
    const ids = docs.map((item: DocumentInterface) => item._id);
    await this._addOperation({
      op: "UPDATE",
      value: ids,
      modification: modification,
      options: options,
    });
    return docs;
  }

  /**
   * Deletes a single document based on the filter, returning the deleted document.
   *
   * @param {object} filter The selection criteria for the deletion. The same query selectors as in the find() method are available.
   * @param {DeleteOneOptionsInterface} options Options for deleteOne()
   * @param {Function} callback Callback function
   * @returns {Promise<DocumentInterface>} Returns a Promise that resolves to a deleted Document
   */

  async deleteOne(
    filter: object = {},
    options?: DeleteOneOptionsInterface,
    callback?: Function
  ): Promise<DocumentInterface> {
    const doc = await this.findOne(filter);
    if (doc) {
      await this._addOperation({
        op: "DELETE",
        value: [doc._id],
      });
    }
    return doc;
  }

  /**
   * Deletes all the documents based on the filter, returning the deleted documents.
   *
   * @param {object} filter The selection criteria for the deletion. The same query selectors as in the find() method are available.
   * @param {DeleteManyOptionsInterface} options Options for deleteMany()
   * @param {Function} callback Callback function
   * @returns {Promise<Array<DocumentInterface>>} Returns a Promise that resolves to an Array of deleted Document
   */

  async deleteMany(
    filter: object = {},
    options?: DeleteManyOptionsInterface,
    callback?: Function
  ): Promise<Array<DocumentInterface>> {
    const docs = await this.find(filter);
    const ids = docs.map((item: DocumentInterface) => item._id);
    if (ids.length > 0) {
      await this._addOperation({
        op: "DELETE",
        value: ids,
      });
    }
    return docs;
  }

  /**
   * Returns unique (with respect to a key) Documents
   * @param key name of the field whose values should be unique
   * @param query Query criteria for documents, same as for find()
   * @returns {Promise<Array<DocumentInterface>>} Returns a Promise that resolves to an Array of unique Document(s)
   */

  distinct(
    key: object | string | number,
    query: object
  ): Promise<Array<DocumentInterface>> {
    return this._index.distinct(key, query);
  }
  /**
   * Returns CID string representing oplog heads.
   * returns null if oplog is empty
   * @returns {string} Returns CID string representing oplog heads.
   */
  async getHeadHash(): Promise<string | null> {
    try {
      return await this._oplog.toMultihash();
    } catch {
      return null;
    }
  }
  /**
   * Syncs datastore to a supplied CID representing oplog heads.
   * Pauses all write operations until sync is complete.
   * @param {string} hash Head hash string
   * @param {boolean} stopWrites Should we pause write operations while syncing
   * @returns {Promise<null>}
   */
  async syncFromHeadHash(
    hash: string,
    stopWrites?: boolean
  ): Promise<undefined> {
    if (new CID(hash).equals(new CID(await this.getHeadHash()))) {
      //Nothing to do
      return;
    }
    //Retrieve dag of headhash.
    const { value } = await this._ipfs.dag.get(hash);
    if (value.id !== this.id) {
      throw "Head Hash ID does not match store ID.";
    }
    //Generate list of head dags from list of hashes
    const heads = [];
    for (const hashOfHead of value.heads) {
      const val = (await this._ipfs.dag.get(hashOfHead)).value;
      val.hash = hashOfHead.toBaseEncodedString("base58btc"); //Convert to base58btc to prevent orbit-db-store from throwing comparison errors. (File future bug report)
      heads.push(val);
    }

    if (stopWrites) {
      this._opqueue.pause();
    }
    await this.sync(heads);
    this._opqueue.start();
  }
  /**
   * Import data into aviondb through buffer.
   *
   * @param {any} data_in Data to be imported in "cbor", "json_mongo", or "raw" format
   * @param {ImportOptionsInterface} options Options for import()
   * @param {Function} progressCallback Callback Function for checking progress of syncing process
   */
  async import(
    data_in: any,
    options: ImportOptionsInterface = {},
    progressCallback: Function
  ) {
    if (!options.overwrite) {
      //TODO: drop database and overwrite all entries.
      options.overwrite = false;
    }
    if (!options.type) {
      options.type = "json_mongo";
      //options.type = "cbor";
      //options.type = "raw";
    }
    if (!options.batchSize) {
      options.batchSize = 25; //Insert 25 at a time by default.
    }

    let deserialized_object: any = {};
    if (options.type === "cbor") {
      deserialized_object = DagCbor.util.deserialize(data_in);
    } else if (options.type === "json_mongo") {
      deserialized_object = JSON.parse(data_in); //Assumes JSON is serialized.
    } else if (options.type === "raw") {
      deserialized_object = data_in;
    } else {
      throw `Unknown options.type: ${options.type}`;
    }

    async function* streamGenerator() {
      for (const entry of deserialized_object) {
        yield entry;
      }
    }

    const objTotalLength: number = deserialized_object.length;

    await this.importStream(
      streamGenerator(),
      objTotalLength,
      { batchSize: options.batchSize },
      progressCallback
    );
  }
  /**
   *
   * @param {AsyncIterable} stream Data stream to be imported
   * @param {number} length Total stream length
   * @param {ImportStreamOptionsInterface} options Options for importStream()
   * @param {Function} progressCallback Callback Function for checking progress of syncing process
   */
  async importStream(
    stream: AsyncIterable<any>,
    length: number,
    options: ImportStreamOptionsInterface,
    progressCallback: Function
  ) {
    const totalLength = length; //Assumes array at the moment.
    let currentLength = 0;
    let queue = [];
    for await (const entry of stream) {
      if (queue.length >= options.batchSize) {
        await this.insert(queue);
        queue = [];
        if (progressCallback) {
          const progressPercent = (currentLength / totalLength) * 100;
          progressCallback(currentLength, totalLength, progressPercent);
        }
      } else {
        if (typeof entry._id === "object") {
          //Assume $oid is being used. Mongodb exports the primary key string under object.
          entry._id = entry._id.$oid;
        }

        queue.push(entry);
        currentLength += queue.length;
      }
    }
    if (queue.length > 0) {
      await this.insert(queue);
      currentLength += queue.length;
      if (progressCallback) {
        const progressPercent = (currentLength / totalLength) * 100;
        progressCallback(currentLength, totalLength, progressPercent);
      }
      queue = [];
    }
  }
  /**
   * Exports records in collection
   * @param {ExportOptionsInterface} options Options for export()
   * @returns {Promise<string | DocumentInterface[]>} Returns a Promise that resolves to the exported data in "cbor", "json_mongo", "raw" format
   */
  async export(
    options: ExportOptionsInterface = {}
  ): Promise<string | DocumentInterface[]> {
    if (!options.limit) {
      options.limit = 0; // No limit.
    }
    if (!options.type) {
      options.type = "json_mongodb";
      //options.type = "cbor";
      //options.type = "raw";
    }
    if (!options.query) {
      options.query = {};
    }
    const results = await this.find(
      {},
      {
        limit: options.limit,
      }
    );
    switch (options.type) {
      case "json_mongodb": {
        //TODO: Future streamed json.
        return JSON.stringify(results);
      }
      case "cbor": {
        return DagCbor.util.serialize(results);
      }
      case "raw": {
        return results;
      }
      default: {
        throw `Unknown options.type: ${options.type}`;
      }
    }
  }

  async drop() {
    super.drop();
    //TODO: broadcast drop message on binding database
  }
}

export default Collection;

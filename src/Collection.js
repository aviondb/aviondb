const OrbitdbStore = require("orbit-db-store")
const ObjectId = require("bson-objectid")
const CID = require('cids')
const CollectionIndex = require('./CollectionIndex')
const DagCbor = require('ipld-dag-cbor')

class Collection extends OrbitdbStore {
    constructor(ipfs, id, dbname, options) {
        let opts = Object.assign({}, { Index: CollectionIndex });
        Object.assign(opts, options);
        super(ipfs, id, dbname, opts);
        this._type = 'aviondb.collection';
        this.events.on("write", (address, entry) => {
            this._index.handleEntry(entry);
        });
        this.events.on("replicate.progress", (address, hash, entry) => {
            this._index.handleEntry(entry);
        })
    }

    /**
     * Inserts multiple records into a Collection
     * 
     * @param {Array} docs 
     * @param {JSON Object} options 
     * @param {Function} callback 
     */

    insert(docs, options, callback) {
        for (var doc of docs) {
            if (!doc._id) {
                doc._id = ObjectId.generate()
            }
        }
        return this._addOperation({
            op: "INSERT",
            value: docs
        })
    }

    /**
     * Inserts single record into a Collection
     * 
     * @param {JSON Object} doc 
     * @param {JSON Object} options 
     * @param {Function} callback 
     */
    async insertOne(doc, options, callback) {
        if (typeof doc !== "object")
            throw new Error("Object documents are only supported")

        return (await this.insert([doc]));
    }

    /**
     * Fetches matching record(s)
     * 
     * @param {JSON Object} query 
     * @param {JSON Object} projection 
     * @param {JSON Object} options 
     * @param {Function} callback 
     */

    find(query, projection, options, callback) {
        return this._index.find(query, projection, options, callback);
    }

    /**
     * Fetches the first matching record
     * 
     * @param {JSON Object} query 
     * @param {JSON Object} projection 
     * @param {JSON Object} options 
     * @param {Function} callback 
     */

    findOne(query, projection, options, callback) {
        return this._index.findOne(query);
    }

    /**
     * Updates the first matching record
     * 
     * @param {JSON Object} query 
     * @param {JSON Object} projection 
     * @param {JSON Object} options 
     * @param {Function} callback 
     */

    async findOneAndUpdate(filter = {}, modification, options, callback) {
        var doc = await this.findOne(filter);
        if (doc) {
            await this._addOperation({
                op: "UPDATE",
                value: [doc._id],
                modification: modification
            })
        }
        return doc
    }
    /**
     * Deletes a single document based on the filter and sort criteria, returning the deleted document.
     * @param {Object} filter The selection criteria for the deletion. The same query selectors as in the find() method are available.
     * @param {JSON Object} options 
     * @param {Function} callback 
     */
    async findOneAndDelete(filter = {}, options, callback) {
        var doc = await this.findOne(filter)
        if (doc) {
            await this._addOperation({
                op: "DELETE",
                value: [doc._id]
            })
        }
        return doc;
    }

    /**
     * Finds a record in the collection by Id
     * 
     * @param {BSON ObjectID} _id 
     * @param {JSON Object} projection 
     * @param {JSON Object} options 
     * @param {Function} callback 
     * @returns {JSON Object}
     */
    findById(_id, projection, options, callback) {
        return this._index.findById(_id, projection, options, callback);
    }

    /**
     * Finds & deletes a record in the collection by Id
     * 
     * @param {BSON ObjectID} _id 
     * @param {JSON Object} options 
     * @param {Function} callback 
     * @returns {JSON Object} return the deleted record
     */

    async findByIdAndDelete(_id, options, callback) {
        var doc = this._index.findById(_id);
        if (doc) {
            await this._addOperation({
                op: "DELETE",
                value: [doc._id]
            })
        }
        return doc
    }

    /**
     * 
     * Finds & updates a record in the collection by Id
     * 
     * @param {BSON ObjectID} _id 
     * @param {JSON Object} modification 
     * @param {JSON Object} options 
     * @param {Function} callback 
     * @returns {JSON Object} return the updated record
     */

    async findByIdAndUpdate(_id, modification, options = {}, callback) {
        var doc = await this._index.findById(_id);
        if (doc) {
            await this._addOperation({
                op: "UPDATE",
                value: [doc._id],
                modification: modification,
                options: options
            })
        }
        return doc
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
     * @param {JSON Object} filter 
     * @param {JSON Object} modification 
     * @param {JSON Object} options 
     * @param {Function} callback 
     */

    async update(filter = {}, modification, options = {}, callback) {
        var ids = [];
        var docs = [];
        if (options.multi) {
            docs.push(...(await this.find(filter)))
            ids.push(...(docs.map(item => (item._id))))
        }
        if (options.upsert && ids.length === 0) {
            // TODO: implement upsert condition for $setOnInsert operator
        }
        else if (Object.keys(options).length === 0 && options.constructor === Object) {
            let doc = await this.findOne(filter);
            if (doc) {
                docs.push(doc)
                ids.push(...(docs.map(item => (item._id))))
            }
        }
        await this._addOperation({
            op: "UPDATE",
            value: ids,
            modification: modification,
            options: options
        })
        return docs
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
     * @param {JSON Object} filter 
     * @param {JSON Object} modification 
     * @param {JSON Object} options 
     * @param {Function} callback 
     */

    async updateOne(filter = {}, modification, options = {}, callback) {
        var doc = await this.findOne(filter)
        if (doc) {
            await this._addOperation({
                op: "UPDATE",
                value: [doc._id],
                modification: modification,
                options: options
            })
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
     * @param {JSON Object} filter 
     * @param {JSON Object} modification 
     * @param {JSON Object} options 
     * @param {Function} callback 
     */

    async updateMany(filter = {}, modification, options = {}, callback) {
        var docs = await this.find(filter)
        var ids = docs.map(item => (item._id))
        await this._addOperation({
            op: "UPDATE",
            value: ids,
            modification: modification,
            options: options
        })
        return docs
    }

    /**
     * Deletes a single document based on the filter, returning the deleted document.
     * 
     * @param {JSON Object} filter The selection criteria for the deletion. The same query selectors as in the find() method are available. 
     * @param {JSON Object} options 
     * @param {Function} callback 
     */

    async deleteOne(filter = {}, options, callback) {
        var doc = await this.findOne(filter);
        if (doc) {
            await this._addOperation({
                op: "DELETE",
                value: [doc._id]
            })
        }
        return doc;
    }

    /**
     * Deletes all the documents based on the filter, returning the deleted documents.
     * 
     * @param {JSON Object} filter The selection criteria for the deletion. The same query selectors as in the find() method are available.
     * @param {JSON Object} options 
     * @param {Function} callback 
     */

    async deleteMany(filter = {}, options, callback) {
        var docs = await this.find(filter);
        var ids = docs.map(item => (item._id));
        if (ids.length > 0) {
            await this._addOperation({
                op: "DELETE",
                value: ids
            })
        }
        return docs;
    }

    distinct(key, query) {
        return this._index.distinct(key, query)
    }
    /**
     * Returns CID string representing oplog heads.
     * returns null if oplog is empty
     * @returns {String}
     */
    async getHeadHash() {
        try {
            return await this._oplog.toMultihash()
        } catch {
            return null;
        }
    }
    /**
     * Syncs datastore to a supplied CID representing oplog heads. Pauses all write operations until sync is complete.
     * @param {String} hash 
     * @param {Boolean} stopWrites 
     * @returns {Promise<null>}
     */
    async syncFromHeadHash(hash, stopWrites) {
        if (new CID(hash).equals(new CID(await this.getHeadHash()))) {
            //Nothing to do
            return;
        }
        //Retrieve dag of headhash.
        var { value } = await this._ipfs.dag.get(hash);
        if (value.id !== this.id) {
            throw "Head Hash ID does not match store ID."
        }
        //Generate list of head dags from list of hashes
        var heads = [];
        for (var hashOfHead of value.heads) {
            var val = (await this._ipfs.dag.get(hashOfHead)).value;
            val.hash = hashOfHead.toBaseEncodedString("base58btc"); //Convert to base58btc to prevent orbit-db-store from throwing comparison errors. (File future bug report)
            heads.push(val);
        }

        if (stopWrites) {
            this._opqueue.pause()
        }
        await this.sync(heads);
        this._opqueue.start()
    }
    /**
     * Import data into aviondb through buffer.
     * 
     * @param {*} data_in 
     * @param {{type: String, batchSize: Number}} options 
     * @param {Function} progressCallback 
     */
    async import(data_in, options = {}, progressCallback) {
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

        var deserialized_object = {}
        if (options.type === "cbor") {
            deserialized_object = DagCbor.util.deserialize(data_in);
        } else if (options.type === "json_mongo") {
            deserialized_object = JSON.parse(data_in); //Assumes JSON is serialized.
        } else if (options.type === "raw") {
            deserialized_object = data_in;
        } else {
            throw `Unknown options.type: ${options.type}`
        }
        
        async function* streamGenerator() {
            for (var entry of deserialized_object) {
                yield entry
            }
        }
        streamGenerator.totalLength = deserialized_object.length

        await this.importStream(streamGenerator(), { batchSize: options.batchSize }, progressCallback);
    }
    /**
     * 
     * @param {AsyncIterable} stream 
     * @param {{type: String, batchSize: Number}} options
     * @param {Function} progressCallback
     */
    async importStream(stream, options, progressCallback) {
        var totalLength = stream.totalLength; //Assumes array at the moment.
        var currentLength = 0;
        var queue = [];
        for await(var entry of stream) {
            if (queue.length >= options.batchSize) {
                await this.insert(queue);
                queue = []; 
                if (progressCallback) {
                    let progressPercent = currentLength / totalLength * 100;
                    progressCallback(currentLength, totalLength, progressPercent)
                }
            } else {
                if (typeof entry._id === "object") {
                    //Assume $oid is being used. Mongodb exports the primary key string under object.
                    entry._id = entry._id.$oid;
                }
    
                queue.push(entry)
                currentLength += queue.length;
            }
        }
        if (queue.length > 0) {
            await this.insert(queue);
            currentLength += queue.length;
            if (progressCallback) {
                let progressPercent = currentLength / totalLength * 100;
                progressCallback(currentLength, totalLength, progressPercent)
            }
            queue = [];
        }
    }
    /**
     * Exports records in collection
     * @param {{type:String, limit: Number, query:Object}} options
     */
    async export(options = {}) {
        if (!options.limit) {
            options.limit = 0; // No limit.
        }
        if (!options.type) {
            options.type = "json_mongodb";
            //options.type = "cbor";
            //options.type = "raw";
        }
        if(!options.query) {
            options.query = {};
        }
        var results = await this.find({}, {
            limit: options.limit
        })
        switch (options.type) {
            case "json_mongodb": {
                //TODO: Future streamed json.
                return JSON.stringify(results);
            }
            case "cbor": {
                return DagCbor.util.serialize(results)
            }
            case "raw": {
                return results;
            }
            default: {
                throw `Unknown options.type: ${options.type}`
            }
        }

    }

    async drop() {
        super.drop();
        //TODO: broadcast drop message on binding database
    }
}
module.exports = Collection;
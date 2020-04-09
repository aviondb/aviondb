const OrbitdbStore = require("orbit-db-store")
const ObjectId = require("bson-objectid")
const CID = require('cids')
const CollectionIndex = require('./CollectionIndex')

class Collection extends OrbitdbStore {
    constructor(ipfs, id, dbname, options) {
        let opts = Object.assign({}, { Index: CollectionIndex });
        Object.assign(opts, options);
        super(ipfs, id, dbname, opts);
        this._type = 'ipfsdb.collection';
        this.events.on("write", (address, entry) => {
            this._index.handleEntry(entry);
        });
        this.events.on("replicate.progres", (address, hash, entry) => {
            this._index.handleEntry(entry);
        })
    }
    insert(docs) {
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
    async insertOne(doc) {
        if (typeof doc !== "object")
            throw "Object documents are only supported"
        
        return (await this.insert([doc]))[0];
    }
    find(query) {
        return this._index.find(query);
    }
    findOne(query) {
        return this._index.findOne(query);
    }
    async findOneAndUpdate(filter = {}, modification) {
        var result = await this.findOne(filter)
        return this._addOperation({
            op: "UPDATE",
            value: [result._id],
            modification: modification
        })
    }
    /**
     * Deletes a single document based on the filter and sort criteria, returning the deleted document.
     * @param {Object} filter The selection criteria for the deletion. The same query selectors as in the find() method are available.
     */
    async findOneAndDelete(filter = {}) {
        var result = await this.findOne(filter)
        await this._addOperation({
            op: "DELETE",
            value: [result._id]
        })
        return result;
    }
    async findById(id) {

    }
    async findByIdAndDelete(id) {

    }
    async findByIdAndUpdate(id, modification) {

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
     */

    async update(filter = {}, modification, options = {}) {
        var result = [];
        if (options.multi) {
            result.push(...(await collection.find(filter).map(item => (item._id))))
        }
        if (options.upsert && result.length === 0) {
            // TODO: implement upsert condition for $setOnInsert operator
        }
        if (Object.keys(options).length === 0 && options.constructor === Object) {
            result.push((await this.findOne(filter))._id)
        }
        return this._addOperation({
            op: "UPDATE",
            value: result,
            modification: modification,
            options: options
        })
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
     */

    async updateOne(filter = {}, modification, options = {}) {
        var result = (await this.findOne(filter))._id
        return this._addOperation({
            op: "UPDATE",
            value: [result._id],
            modification: modification,
            options: options
        })
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
     */

    async updateMany(filter = {}, modification, options = {}) {
        var result = (await this.find(filter)).map(item => (item._id))
        return this._addOperation({
            op: "UPDATE",
            value: result,
            modification: modification,
            options: options
        })
    }
    async deleteOne(filter = {}) {

    }
    async deleteMany(filter = {}) {

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
        if(new CID(hash).equals(new CID(await this.getHeadHash()))) {
            //Nothing to do
            return;
        }
        //Retrieve dag of headhash.
        var {value} = await this._ipfs.dag.get(hash);
        if(value.id !== this.id) {
            throw "Head Hash ID does not match store ID."
        }
        
        //Generate list of head dags from list of hashes
        var heads = [];
        for(var hashOfHead of value.heads) {
            var val = (await this._ipfs.dag.get(hashOfHead)).value;
            val.hash = hashOfHead.toBaseEncodedString("base58btc"); //Convert to base58btc to prevent orbit-db-store from throwing comparison errors. (File future bug report)
            heads.push(val);
        }

        if(stopWrites) {
            this._opqueue.pause()
        }
        await this.sync(heads);
        this._opqueue.start()
    }
    async drop() {
        super.drop();
        //TODO: broadcast drop message on binding database
    }
}
module.exports = Collection;
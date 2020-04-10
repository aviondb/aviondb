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
        var result = (await this.findOne(filter))._id;
        if (Object.keys(result).length > 0) {            
            return await this._addOperation({
                op: "UPDATE",
                value: [result],
                modification: modification
            })
        }
        return {}
    }
    /**
     * Deletes a single document based on the filter and sort criteria, returning the deleted document.
     * @param {Object} filter The selection criteria for the deletion. The same query selectors as in the find() method are available.
     */
    async findOneAndDelete(filter = {}) {
        var result = await this.findOne(filter)
        if (Object.keys(result).length > 0) {            
            await this._addOperation({
                op: "DELETE",
                value: [result._id]
            })
        }
        return result;
    }

    /**
     * Finds a record in the collection by Id
     * 
     * @param {BSON ObjectID} _id 
     * @returns {JSON Object}
     */

    findById(_id) {
        var ids = Object.keys(this._index._index);
        for (let i = 0; i < ids.length; i++) {
            if (ids[i] === _id) {
                return this._index._index[_id];
            }
        }
        return {}
    }

    /**
     * Finds & deletes a record in the collection by Id
     * 
     * @param {BSON ObjectID} _id
     * @returns {JSON Object} return the deleted record
     */

    async findByIdAndDelete(_id) {
        var index = { ...this._index._index };
        var ids = Object.keys(index);
        for (let i = 0; i < ids.length; i++) {
            if (ids[i] === _id) {
                await this._addOperation({
                    op: "DELETE",
                    value: [_id]
                })
                return index[_id]
            }
        }
        return {}
    }

    /**
     * 
     * Finds & updates a record in the collection by Id
     * 
     * @param {BSON ObjectID} _id 
     * @param {JSON Object} modification 
     * @param {JSON Object} options 
     * @returns {JSON Object} return the updated record
     */

    async findByIdAndUpdate(_id, modification, options = {}) {
        var ids = Object.keys(this._index);
        for (let i = 0; i < ids.length; i++) {
            if (ids[i] === _id) {
                return await this._addOperation({
                    op: "UPDATE",
                    value: [_id],
                    modification: modification,
                    options: options
                })
            }
        }
        return {}
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
        return await this._addOperation({
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
        return await this._addOperation({
            op: "UPDATE",
            value: [result],
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
        return await this._addOperation({
            op: "UPDATE",
            value: result,
            modification: modification,
            options: options
        })
    }

    /**
     * Deletes a single document based on the filter, returning the deleted document.
     * 
     * @param {JSON Object} filter The selection criteria for the deletion. The same query selectors as in the find() method are available. 
     */

    async deleteOne(filter = {}) {
        var result = await this.findOne(filter);
        if (Object.keys(result).length > 0) {            
            await this._addOperation({
                op: "DELETE",
                value: [result._id]
            })
        }
        return result;
    }

    /**
     * Deletes all the documents based on the filter, returning the deleted documents.
     * 
     * @param {JSON Object} filter The selection criteria for the deletion. The same query selectors as in the find() method are available.
     */

    async deleteMany(filter = {}) {
        var records = await this.find(filter);
        var result = records.map(item => (item._id));
        if (result.length > 0) {            
            await this._addOperation({
                op: "DELETE",
                value: result
            })
        }
        return records;
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
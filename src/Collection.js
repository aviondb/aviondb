const OrbitdbStore = require("orbit-db-store")
const CollectionIndex = require('./CollectionIndex')

class Collection extends OrbitdbStore {
    constructor(ipfs, id, dbname, options) {
        let opts = Object.assign({}, { Index: CollectionIndex });
        Object.assign(opts, options);
        super(ipfs, id, dbname, opts);
        this._type = 'ipfsdb.collection';
    }
    insert(docs) {
        
    }
    insertOne(doc) {
        
    }
    async find(query) {

    }
    async findOne(query) {

    }
    async findOneAndUpdate(query, modification) {

    }
    async findOneAndDelete(query) {

    }
    async distinct() {

    }
    async drop() {
        
    }
}
module.exports = Collection;
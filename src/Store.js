const OrbitdbStore = require("orbit-db-store")
const OrbitDB = require('orbit-db')
const Cache = require("orbit-db-cache");
const leveldown = require('leveldown')
const IdentityProvider = require("orbit-db-identity-provider");
const Index = require('./StoreIndex')
const debug =  require('debug')("aviondb:store")

OrbitDB.addDatabaseType("aviondb.collection", require('./Collection'))
OrbitDB.addDatabaseType("aviondb", Store)

class Store extends OrbitdbStore {
    constructor(ipfs, id, dbname, options) {
        //let opts = Object.assign({}, { })
        let opts = {};
        Object.assign(opts, options)
        super(ipfs, id, dbname, opts)
        this._type = 'aviondb'
        this._orbitdb = options.orbitdb

        this.openCollections = {};

        this._index = new Index(this)

        this.events.on("write", (address, entry) => {
            this._index.handleEntry(entry);
        });
        this.events.on("replicate.progres", (address, hash, entry) => {
            this._index.handleEntry(entry);
        })

        this.events.on("db.createCollection", async (name, address) => {
            if(!this.openCollections[name]) {
                return await this.openCollection(address);
            }
        })
    }
    async createCollection(name, options = {}) {
        if(!name | typeof name !== "string") {
            throw "Name must be a string"
        }
        if(this._index._index[name]) {
            throw `Collection with name: ${name} already exists.`
        }
        var collection = await this._orbitdb.create(name, "aviondb.collection");
        this.openCollections[name] = collection;
        await this._addOperation({
            op: "collection.create",
            address: collection.address.toString(),
            name
        })
        return collection;
    }
    async openCollection(name, options = {}) {
        var {create} = options;
        if(!name) {
            throw "Name must be a string";
        } else if (typeof name !== "string") {
            throw "Name must not be undefined";
        }
        if(!this._index[name] && create !== true) {
            throw `Collection with name of ${name} does not exist`;
        }
        if(this.openCollections[name]) {
            return this.openCollections[name]
        }
        if(create === true) {
            return await this.createCollection(name);
        } else {
            var collectionInfo = this._index[name];
            var collection = await this._orbitdb.open(collectionInfo.address);
            await collection.load();
            return collection;
        }
    }
    async dropCollection(name, options = {}) {
        if(!name | typeof name !== "string") {
            throw "Name must be a string"
        }
        var collectionInfo = this._index[name];
        await this._addOperation({
            op: "collection.drop",
            address: collectionInfo.address,
            name
        })
    }
    listCollections(filter = {}, options = {}) {
        return Object.keys(this.openCollections)
    }
    collection(name) {
        if(!name | typeof name !== "string") {
            throw "Name must be a string"
        }
        if(!this.openCollections[name]) {
            throw `Collection: ${name} is not open.`
        }
        return this.openCollections[name];
    }
    async closeCollection(name) {
        if(this.openCollections[name]) {
            await this.openCollections[name].close();
        }
    }
    async load(number, options) {
        super.load(number,options);


        //Loads collections into memory; TODO: Load and start collections.
        debug("datastore is loading");
    }
    async close() {
        for(var name in this.openCollections) {
            await this.openCollections[name].close();
        }
        await super.close()
    }
    static async create(name, ipfs, options, orbitDbOptions) {
        var orbitdb = await OrbitDB.createInstance(ipfs, orbitDbOptions);

        var store = await orbitdb.create(name, "aviondb", options)
        store.orbitdb = orbitdb
        return store;
    }
    static async open(address, ipfs, options, orbitDbOptions) {
        var orbitdb = await OrbitDB.createInstance(ipfs, orbitDbOptions);
        var store = await orbitdb.open(address, options);
        store.orbitdb = orbitdb;
        return orbitdb;
    }
}
module.exports = Store;
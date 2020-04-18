const OrbitdbStore = require("orbit-db-store")
const OrbitDB = require('orbit-db')
const Index = require('./StoreIndex')
const debug =  require('debug')("aviondb:store")


class Store extends OrbitdbStore {
    constructor(ipfs, id, dbname, options = {}) {
        let opts = { Index };
        Object.assign(opts, options)
        super(ipfs, id, dbname, opts)
        this._type = 'aviondb'
        if(options.orbitdb) {
            this._orbitdb = options.orbitdb
        }

        this.openCollections = {};

        this._index.store = this;

        this.events.on("write", (address, entry) => {
            this._index.handleEntry(entry);
        });
        this.events.on("replicate.progress", (address, hash, entry) => {
            this._index.handleEntry(entry);
        })

        this.events.on("db.createCollection", async (name, address) => {
            if(!this.openCollections[name]) {
                this.openCollections[name] = await this.openCollection(address);
            }
        })
    }
    /**
     * Opens a collection
     * @param {String} name Name of collection
     * @param {*} options 
     * @param {*} orbitDbOptions options directly passed into orbitdb.create()
     */
    async createCollection(name, options = {}, orbitDbOptions = {}) {
        var {overwrite} = options;
        if(overwrite) {
            orbitDbOptions.overwrite = true;
        }
        if(!name | typeof name !== "string") {
            throw "name must be a string"
        }
        if(this._index.get(name) && !overwrite) {
            throw `Collection with name: ${name} already exists.`
        }
        var collection = await this._orbitdb.create(name, "aviondb.collection", orbitDbOptions);
        this.openCollections[name] = collection;
        await this._addOperation({
            op: "collection.create",
            address: collection.address.toString(),
            name
        })
        return collection;
    }
    /**
     * Opens a collection
     * @param {String} name Name of collection
     * @param {*} options 
     * @param {*} orbitDbOptions options directly passed into orbitdb.open()
     */
    async openCollection(name, options = {}, orbitDbOptions = {}) {
        var {create} = options;
        if(!name | typeof name !== "string") {
            throw "name must be a string"
        }
        if(!this._index.get(name) && create !== true) {
            throw `Collection with name of "${name}" does not exist`;
        }
        if(this.openCollections[name]) {
            return this.openCollections[name]
        }
        if(create === true) {
            return await this.createCollection(name);
        } else {
            var collectionInfo = this._index.get(name);
            var collection = await this._orbitdb.open(collectionInfo.address, options);
            await collection.load();
            this.openCollections[name] = collection;
            return collection;
        }
    }
    /**
     * 
     * @param {string} name 
     * @param {JSON Object} options 
     * @param {JSON Object} orbitDbOptions 
     */
    async initCollection(name, options = {}, orbitDbOptions = {}) {
        if(!name | typeof name !== "string") {
            throw "name must be a string"
        }
        // Collection exists
        if(this._index.get(name)) {
            return await this.openCollection(name, options, orbitDbOptions);
        }
        // Collection does not exist
        if(!this._index.get(name)) {
            return await this.createCollection(name, options, orbitDbOptions);
        }
    }
    /**
     * 
     * @param {string} name 
     * @param {JSON Object} options 
     */
    async dropCollection(name, options = {}) {
        if(!name | typeof name !== "string") {
            throw "Name must be a string"
        }
        var collectionInfo = this._index._index[name];
        await this._addOperation({
            op: "collection.drop",
            address: collectionInfo.address,
            name
        })
    }
    /**
     * 
     * @param {JSON Object} filter 
     * @param {JSON Object} options 
     */
    listCollections(filter = {}, options = {}) {
        return Object.keys(this._index._index)
    }
    /**
     * 
     * @param {string} name 
     */
    collection(name) {
        if(!name | typeof name !== "string") {
            throw "Name must be a string"
        }
        if(!this.openCollections[name]) {
            throw `Collection: ${name} is not open.`
        }
        return this.openCollections[name];
    }
    /**
     * 
     * @param {string} name 
     */
    async closeCollection(name) {
        if(this.openCollections[name]) {
            await this.openCollections[name].close();
        }
    }
    async load(number, options) {
        await super.load(number,options);
        debug("datastore is loading");

        //Load and start collections into memory.
        for(var name of this.listCollections()) {
            await this.openCollection(name)
        }
    }
    async close() {
        for(var name in this.openCollections) {
            await this.openCollections[name].close();
        }
        await super.close()
    }
    /**
     * 
     * @param {name} address 
     * @param {ipfs Object} ipfs 
     * @param {JSON Object} options 
     * @param {JSON Object} orbitDbOptions 
     */
    static async create(name, ipfs, options, orbitDbOptions) {
        var orbitdb = await OrbitDB.createInstance(ipfs, orbitDbOptions);
        var store = await orbitdb.create(name, "aviondb", options)
        store._orbitdb = orbitdb
        await store.load()
        return store;
    }
    /**
     * 
     * @param {name} address 
     * @param {ipfs Object} ipfs 
     * @param {JSON Object} options 
     * @param {JSON Object} orbitDbOptions 
     */
    static async open(address, ipfs, options, orbitDbOptions) {
        var orbitdb = await OrbitDB.createInstance(ipfs, orbitDbOptions);
        var store = await orbitdb.open(address, options);
        store._orbitdb = orbitdb;
        await store.load()
        return store;
    }
    /**
     * 
     * @param {string} name 
     * @param {ipfs Object} ipfs 
     * @param {JSON Object} options 
     * @param {JSON Object} orbitDbOptions 
     */
    static async init(name, ipfs, options, orbitDbOptions) {
        if(!name | typeof name !== "string") {
            throw "name must be a string"
        }

        var orbitdb = await OrbitDB.createInstance(ipfs, orbitDbOptions);

        // Parse the database address
        const dbAddress = await orbitdb._determineAddress(name, "aviondb", options);

        var cache = await orbitdb._requestCache(dbAddress, orbitdb.directory)

        // Check if we have the database
        const haveDB = await orbitdb._haveLocalData(cache, dbAddress)

        if (haveDB) {
            return await Store.open(dbAddress, ipfs, options, orbitDbOptions);   
        }
        else {
            return await Store.create(name, ipfs, options, orbitDbOptions);            
        }
    }
}
OrbitDB.addDatabaseType("aviondb.collection", require('./Collection'))
OrbitDB.addDatabaseType("aviondb", Store)
module.exports = Store;
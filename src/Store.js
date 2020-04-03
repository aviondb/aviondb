const OrbitdbStore = require("orbit-db-store")

class Store extends OrbitdbStore {
    constructor(ipfs, id, dbname, options) {
        let opts = Object.assign({}, { })
        Object.assign(opts, options)
        super(ipfs, id, dbname, opts)
        this._type = 'ipfsdb'
    }
}
module.exports = Store;
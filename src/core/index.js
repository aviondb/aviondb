const Store = require("./Store")
const EnvironmentAdapter = require('./EnvironmentAdapter')
const { Key } = require('interface-datastore')
var datastore = EnvironmentAdapter.datastore(EnvironmentAdapter.repoPath())

class AvionDB extends Store {
    static async init(name, ipfs, options, orbitDbOptions) {
        let aviondb = await super.init(name, ipfs, options, orbitDbOptions);
        var buf = Buffer.from(JSON.stringify({ address: aviondb.id }));
        await datastore.put(new Key(`${name}`), buf)
        return Promise.resolve(aviondb)
    }
    static async listDatabases() {
        var dbs = datastore.query({});
        var list = []
        for await (var db of dbs) {
            let arr = JSON.parse(db.value.toString()).address.split('/')
            list.push(arr[arr.length-1])
        }
        return list;
    }
    static setDatabaseConfig(options = {}) {
        datastore = EnvironmentAdapter.datastore(EnvironmentAdapter.repoPath(options.path))
    }
}
AvionDB.Collection = require('./Collection');

module.exports = AvionDB;

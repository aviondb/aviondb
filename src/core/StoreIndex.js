class StoreIndex {
    constructor() {
        this._index = {};
        this.store = null;
       
    }
    get(name) {
        return this._index[name];
    }
    handleEntry(entry) {
        var { payload } = entry;
        switch (payload.op) {
            case "collection.create": {
                var {name, address} = payload;
                if(this.loaded) {
                    this.store.events.emit("db.createCollection", name, address)
                }
                this._index[name] = {
                    address
                }
                break;
            }
            case "collection.drop": {
                var {name, address} = payload;
                if(this.loaded) {
                    this.store.events.emit("db.dropCollection", name, address)
                }
                delete this._index[name];
                break;
            }
        }
    }
    updateIndex(oplog) {
        if(!this.loaded) {
            oplog.values.forEach((item) => {
                this.handleEntry(item)
            })
        }
        this.loaded = true;
    }
}
module.exports = StoreIndex;
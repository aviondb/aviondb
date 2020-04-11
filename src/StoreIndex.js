class StoreIndex {
    constructor(store) {
        this._index = {};
        this.store = store;
       
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
            oplog.values.reduce((handled, item) => {
                this.handleEntry(item)
            })
        }
        this.loaded = true;
    }
}
module.exports = StoreIndex;
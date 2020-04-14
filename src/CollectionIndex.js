const parseAndUpdate = require('./operators/UpdateOperators')
const parseAndFind = require('./operators/QueryOperators')

class CollectionIndex {
    constructor() {
        this._index = {}
        this.loaded = false;
    }

    get(key) {
        return this._index[key]
    }
    async find(query) {
        let res = parseAndFind(query, this._index, false)
        return res
    }

    async findOne(query) {
        let res = parseAndFind(query, this._index, true)
        return res
    }

    async findById(_id) {
        return this._index[_id]
    }

    async distinct(key, query) {
        if (!key) {
            throw "Key must not be undefined"
        }
        var index;
        if (query) {
            index = await this.find(query);
        } else {
            index = this._index;
        }
        var out = {};
        for (var entry of Object.values(index)) {
            if (entry[key]) {
                out[entry[key]] = null;
            }
        }
        return Object.keys(out);
    }
    handleEntry(item) {
        var { payload } = item;
        switch (payload.op) {
            case "INSERT": {
                this.handleInsert(payload);
                break;
            }
            case "UPDATE": {
                this.handleUpdate(payload);
                break;
            }
            case "DELETE": {
                this.handleDelete(payload);
                break;
            }
        }
    }
    async handleInsert(payload) {
        var { value } = payload;
        for (var doc of value) {
            var _id = doc._id;
            this._index[_id] = doc;
        }
    }
    handleUpdate(payload) {
        var { value, modification, options } = payload;
        for (var _id of value) {
            parseAndUpdate(this._index[_id], modification, options)
        }
    }
    handleDelete(payload) {
        var { value } = payload;
        for(var _id of value) {
            delete this._index[_id];
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

module.exports = CollectionIndex;
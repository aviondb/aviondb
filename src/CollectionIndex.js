const parseAndUpdate = require('./operators/UpdateOperators')

class CollectionIndex {
    constructor() {
        this._index = {}
    }

    get(key) {
        return this._index[key]
    }
    async find(query) {
        var results = [];
        var index = this._index;
        for (var id in index) {
            var doc = index[id];
            var match = true;

            for (var key in query) {
                if (!doc[key]) {
                    match = false;
                    break;
                }
                if (doc[key] !== query[key]) {
                    match = false;
                    break;
                }
            }

            if (match) {
                results.push(doc);
            }
        }
        return results;
    }

    async findOne(query) {
        var index = this._index;
        for (var id in index) {
            var doc = index[id];
            var match = true;

            for (var key in query) {
                if (!doc[key]) {
                    match = false;
                    break;
                }
                if (doc[key] !== query[key]) {
                    match = false;
                    break;
                }
            }

            if (match) {
                return doc;
            }
        }
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
        //Left over to prevent errors from being thrown.
    }
}

module.exports = CollectionIndex;
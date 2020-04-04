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
    updateIndex(oplog) {
        oplog.values
            .slice()
            .reverse()
            .reduce((handled, item) => {
                var { payload } = item;
                var { value } = payload;
                switch (payload.op) {
                    case "INSERT": {
                        for (var doc of value) {
                            var _id = doc._id;
                            this._index[_id] = doc;
                        }
                        break;
                    }
                    
                }
                return handled
            }, [])
    }
}

module.exports = CollectionIndex;
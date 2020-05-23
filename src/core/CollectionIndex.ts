import { parseAndUpdate } from "./operators/UpdateOperators";
import { parseAndFind } from "./operators/QueryOperators";

class CollectionIndex {
  _index: {};
  loaded: boolean;
  constructor() {
    this._index = {};
    this.loaded = false;
  }
  async find(query?, projection?, options: any = {}, callback?) {
    const res = parseAndFind(query, options, this._index, false);
    return res;
  }

  async findOne(query, projection, options: any = {}, callback) {
    const res = parseAndFind(query, options, this._index, true);
    return res;
  }

  async findById(_id, projection, options: any = {}, callback) {
    return this._index[_id];
  }

  async distinct(key, query) {
    if (!key) {
      throw "Key must not be undefined";
    }
    let index;
    if (query) {
      index = await this.find(query);
    } else {
      index = this._index;
    }
    const out = {};
    for (const entry of Object.values(index)) {
      //TODO: Allow for sub object keys. I.e key.subkey
      if (entry[key]) {
        out[entry[key]] = null;
      }
    }
    return Object.keys(out);
  }
  handleEntry(item) {
    const { payload } = item;
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
      case "SC_INSERT": {
        this.handleSchemaInsert(payload);
        break;
      }
      case "SC_UPDATE": {
        this.handleSchemaUpdate(payload);
        break;
      }
      case "SC_DELETE": {
        this.handleSchemaDelete(payload);
        break;
      }
    }
  }
  async handleInsert(payload) {
    const { value } = payload;
    for (const doc of value) {
      const _id = doc._id;
      this._index[_id] = doc;
    }
  }
  handleUpdate(payload) {
    const { value, modification, options } = payload;
    for (const _id of value) {
      parseAndUpdate(this._index[_id], modification, options);
    }
  }
  handleDelete(payload) {
    const { value } = payload;
    for (const _id of value) {
      delete this._index[_id];
    }
  }
  async handleSchemaInsert(payload) {}
  handleSchemaUpdate(payload) {}
  handleSchemaDelete(payload) {}
  updateIndex(oplog) {
    if (!this.loaded) {
      oplog.values.forEach((item) => {
        this.handleEntry(item);
      });
    }
    this.loaded = true;
  }
}

module.exports = CollectionIndex;

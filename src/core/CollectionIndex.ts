import { parseAndUpdate } from "./operators/UpdateOperators";
import { parseAndFind } from "./operators/QueryOperators";
import { FindOptionsInterface, Payload } from "./interfaces";

class CollectionIndex {
  _index: any = {};
  loaded: boolean;
  constructor() {
    this._index = {};
    this.loaded = false;
  }
  async find(
    query: object,
    projection?: object | string,
    options: FindOptionsInterface = {},
    callback?: Function
  ) {
    const res = parseAndFind(query, options, this._index, false);
    return res;
  }

  async findOne(
    query: object,
    projection: object | string,
    options: object = {},
    callback?: Function
  ) {
    const res = parseAndFind(query, options, this._index, true);
    return res;
  }

  async findById(
    _id: string | number,
    projection?: object | string,
    options: object = {},
    callback?: Function
  ) {
    return this._index[_id];
  }

  async distinct(key: string | number, query: object) {
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
  handleEntry(item: any) {
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
    }
  }
  async handleInsert(payload: any) {
    const { value } = payload;
    for (const doc of value) {
      const _id = doc._id;
      this._index[_id] = doc;
    }
  }
  handleUpdate(payload: any) {
    const { value, modification, options } = payload;
    for (const _id of value) {
      parseAndUpdate(this._index[_id], modification, options);
    }
  }
  handleDelete(payload: any) {
    const { value } = payload;
    for (const _id of value) {
      delete this._index[_id];
    }
  }
  updateIndex(oplog: any) {
    if (!this.loaded) {
      oplog.values.forEach((item: any) => {
        this.handleEntry(item);
      });
    }
    this.loaded = true;
  }
}

module.exports = CollectionIndex;

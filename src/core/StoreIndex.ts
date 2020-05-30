class StoreIndex {
  _index: any = {};
  store: any;
  loaded: boolean = false;

  constructor() {
    this._index = {};
    this.store = null;
  }

  get(name: string) {
    return this._index[name];
  }
  handleEntry(entry: any) {
    const { payload } = entry;
    switch (payload.op) {
      case "collection.create": {
        const { name, address } = payload;
        if (this.loaded) {
          this.store.events.emit("db.createCollection", name, address);
        }
        this._index[name] = {
          address,
        };
        break;
      }
      case "collection.drop": {
        const { name, address } = payload;
        if (this.loaded) {
          this.store.events.emit("db.dropCollection", name, address);
        }
        delete this._index[name];
        break;
      }
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
module.exports = StoreIndex;

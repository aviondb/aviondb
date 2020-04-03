class CollectionIndex {
    constructor() {
      this._index = {}
    }
  
    get(key) {
      return this._index[key]
    }
  
    updateIndex(oplog) {
      oplog.values
        .slice()
        .reverse()
        .reduce((handled, item) => {
          
          return handled
        }, [])
    }
  }
  
  module.exports = CollectionIndex;
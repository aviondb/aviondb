var isBrowser=new Function("try {return this===window;}catch(e){ return false;}");
const LevelDb = require('datastore-level');
const DatastoreFs = require('datastore-fs');
const Path = require('path');
const os = require('os');


module.exports = {
    repoPath: function(path) {
        if(isBrowser()) {
            return path || "aviondb"
        } else {
            return path || Path.join(os.homedir(), '.aviondb')
        }
    },
    datastore: function(path) {
        if(isBrowser()) {
           return new LevelDb(path)
        } else {
            return new DatastoreFs(path, {
                extension: ""
            })
        }
    }
}
const isBrowser = new Function(
  "try {return this===window;}catch(e){ return false;}"
);
const LevelDb = require("datastore-level");
const DatastoreFs = require("datastore-fs");
const Path = require("path");
const os = require("os");

export default {
  repoPath: function (path?: string) {
    if (isBrowser()) {
      return path || "aviondb";
    } else {
      return path || Path.join(os.homedir(), ".aviondb");
    }
  },
  datastore: function (path?: string) {
    if (isBrowser()) {
      return new LevelDb(Path.join(path, "db"));
    } else {
      return new DatastoreFs(Path.join(path, "db"));
    }
  },
};

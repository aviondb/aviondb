const debug = require('debug')('aviondb:daemon')
const Server = require('../server/index.js'); //Aviondb server.
//const Components = require('../core/Components')
const IPFSApiClient = require('ipfs-http-client')
//const endpoints = require('./apiEndpoints')
const Path = require('path')
const fs = require('fs')

class Daemon {
  constructor(options) {
    this._options = options || {};
    this.repoPath = options.repoPath;
    this.config = new Components.Config(this.repoPath)
  }
  _apiEndpoints(iteratorCallback) {
    this.apiEndpoints._apiEndpoints(iteratorCallback) 
  }
  async start() {
    await this.config.open()
    if(this._options.internalDaemon === true | this.config.get("ipfs.internalDaemon") === true) {
      //Create ipfs daemon here...
      throw "Internal daemon is now supported yet"
    } else {
      //Use ipfs HTTP api
      this._ipfs = new IPFSApiClient(this.config.get("ipfs.apiAddr"))
    }

    debug("starting")
    this.client = new Pinza(this._ipfs);
    await this.client.start();
    this.apiEndpoints = new endpoints(this.client)
    await this.apiEndpoints.start();
    //this._apiEndpoints((endpointAddress, endpointName) => {
    //  fs.writeFileSync(Path.join(this.repoPath, "apiAddr"), endpointAddress.toString())
    //})
  }
  async stop() {
    await this.apiEndpoints.stop();
    await this.client.stop();
    fs.unlinkSync(Path.join(this.repoPath, "apiAddr"))
  }
}
module.exports = Daemon
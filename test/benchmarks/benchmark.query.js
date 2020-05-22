'use strict'

const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')
const Crypto = require('crypto')
const rimraf = require('rimraf')
const { config } = require('orbit-db-test-utils');

//Remove the orbitdb folder, if present
rimraf.sync("./orbitdb");

// Metrics
let totalQueries = 0
let seconds = 0
let queriesPerSecond = 0
let lastTenSeconds = 0
let numberOfEntries = 5000;

// Main loop
const queryLoop = async (db) => {
  await db.find({ _id: "5e8cf7e1b9b93a4c7dc2d69e" })
  totalQueries++
  lastTenSeconds ++
  queriesPerSecond ++
  setImmediate(() => queryLoop(db))
}

// Start
console.log("Starting IPFS daemon...")

const ipfsConfig = Object.assign({}, config.defaultIpfsConfig, {
    repo: config.defaultIpfsConfig.repo + '-entry' + new Date().getTime()
})

IPFS.create(ipfsConfig).then(async ipfs => { 
  const run = async () => {
    try {
      OrbitDB.addDatabaseType("aviondb.collection", require('../../src/core/Collection'))
      const orbit = await OrbitDB.createInstance(ipfs,{ directory: './orbitdb/benchmarks' })

      const db = await orbit.create('orbit-db.benchmark', "aviondb.collection", {
        replicate: false,
        overwrite: true
      })

      console.log(`Creating ${numberOfEntries} documents for querying. Stand by! `)
      for (var x = 0; x < numberOfEntries; x++) {
        if (x === 4500) {
          await db.insertOne({
          _id: "5e8cf7e1b9b93a4c7dc2d69e",
          id: Crypto.randomBytes(6).toString("base64"),
          fname: "vasa",
          lname: "develop",
          age: 22,
          bal: 1000
        })
        }
        else {
          await db.insertOne({
            _id:Crypto.randomBytes(24).toString("base64"), 
            id: Crypto.randomBytes(6).toString("base64"),
            fname: "vasa",
            lname: "develop",
            age: 22,
            bal: 1000
          })
        }
      }
      // Metrics output
      setInterval(() => {
        seconds ++
        if(seconds % 10 === 0) {
          console.log(`--> Average of ${lastTenSeconds/10} q/s in the last 10 seconds`)
          if(lastTenSeconds === 0)
            throw new Error("Problems!")
          lastTenSeconds = 0
        }
        console.log(`${queriesPerSecond} queries per second, ${totalQueries} queries in ${seconds} seconds (Oplog: ${db._oplog.length})`)
        queriesPerSecond = 0
      }, 1000)
      // Start the main loop
      queryLoop(db)
    } catch (e) {
      console.log(e)
      process.exit(1)
    }
  }

  run()
}).catch(error => { 
  console.error(error)
})
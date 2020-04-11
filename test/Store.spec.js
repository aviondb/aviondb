const Store = require('../src/Store')
const Cache = require('orbit-db-cache')
const Keystore = require('orbit-db-keystore')
const IdentityProvider = require('orbit-db-identity-provider')
const assert = require('assert')
const IPFS = require('ipfs')
//TODO: proper fix for using ipfs in tests requiring node to be online

var DefaultOptions = {};
// Test utils
const {
    config,
    testAPIs,
    startIpfs,
    stopIpfs,
    implementations
} = require('orbit-db-test-utils');

const properLevelModule = implementations.filter(i => i.key.indexOf('memdown') > -1).map(i => i.module)[0]
const storage = require('orbit-db-storage-adapter')(properLevelModule)

describe("DB", function () {
    let ipfs, testIdentity, identityStore, store, cacheStore

    this.timeout(config.timeout)
    const ipfsConfig = Object.assign({}, {
        repo: config.defaultIpfsConfig.repo + '-entry' + new Date().getTime(),
        start: true,
        config: {
            Addresses: {
                API: '/ip4/127.0.0.1/tcp/0',
                "Swarm":["/ip4/0.0.0.0/tcp/0"],
                Gateway: '/ip4/0.0.0.0/tcp/0'
            },
            Bootstrap: [],
            Discovery: { "MDNS":{"Enabled":true,"Interval":0},"webRTCStar":{"Enabled":false}} 
        },
        EXPERIMENTAL: {
            pubsub: true
        }
    })

    before(async () => {
        identityStore = await storage.createStore('identity')
        const keystore = new Keystore(identityStore)

        cacheStore = await storage.createStore('cache')
        await cacheStore.open()
        const cache = new Cache(cacheStore)

        testIdentity = await IdentityProvider.createIdentity({ id: 'userA', keystore })
        //ipfs = await startIpfs("js-ipfs", ipfsConfig)
        ipfs = new IPFS(ipfsConfig)
        await ipfs.ready
        const address = 'test-address'
        const options = Object.assign({}, DefaultOptions, { cache })
        store = await Store.create(ipfs, testIdentity, address, options)
        store.load()
    })
    after(async () => {
        await store.close()
        //await stopIpfs(ipfs)
        await ipfs.stop()
        await identityStore.close()
        await cacheStore.close()
    })
    afterEach(async () => {
        await store.drop()
        await cacheStore.open()
        await identityStore.open()
    })
    it("Create Collection", async () => {
        await ipfs.ready
        var collection = await store.createCollection("Accounts")
        await collection.insertOne({
            name: "vasa"
        })
        assert.strict(collection.address instanceof require("orbit-db/src/orbit-db-address"), true)
        assert.strictEqual(collection instanceof require('../src/Collection'), true)
    })
    it("Drop Collection", async () => {
        //TODO: Create test here
    })
})
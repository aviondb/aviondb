const Store = require('../src/Collection')
const Cache = require('orbit-db-cache')
const Keystore = require('orbit-db-keystore')
const IdentityProvider = require('orbit-db-identity-provider')
const assert = require('assert')

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

describe("Collection", function () {
    let ipfs, testIdentity, identityStore, store, cacheStore

    this.timeout(config.timeout)

    const ipfsConfig = Object.assign({}, config.defaultIpfsConfig, {
        repo: config.defaultIpfsConfig.repo + '-entry' + new Date().getTime()
    })

    before(async () => {
        identityStore = await storage.createStore('identity')
        const keystore = new Keystore(identityStore)

        cacheStore = await storage.createStore('cache')
        await cacheStore.open()
        const cache = new Cache(cacheStore)

        testIdentity = await IdentityProvider.createIdentity({ id: 'userA', keystore })
        ipfs = await startIpfs("js-ipfs", ipfsConfig)

        const address = 'test-address'
        const options = Object.assign({}, DefaultOptions, { cache })
        store = new Store(ipfs, testIdentity, address, options)
    })
    after(async () => {
        await store.close()
        await stopIpfs(ipfs)
        await identityStore.close()
        await cacheStore.close()
    })
    afterEach(async () => {
        await store.drop()
        await cacheStore.open()
        await identityStore.open()
    })
    //TODO: Add tests 
    it("InsertOne", async () => {
        await store.insertOne({ name: "kim", age: 35 })
        var result = await store.findOne({name:"kim"})
        assert.strictEqual(typeof result, "object")
        assert.strictEqual(result.age, 35);
        assert.strictEqual(result.name, "kim");
    })
})
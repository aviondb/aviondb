const Store = require('../src/Collection')
const Cache = require('orbit-db-cache')
const Keystore = require('orbit-db-keystore')
const IdentityProvider = require('orbit-db-identity-provider')
const assert = require('assert')
const ObjectId = require("bson-objectid")

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
        const address = 'test-address'
        const cache = new Cache(cacheStore)
        const options = Object.assign({}, DefaultOptions, { cache })
        store = new Store(ipfs, testIdentity, address, options)
        await cacheStore.open()
        await identityStore.open()
    })
    //TODO: Add tests 
    it("Insert", async () => {
        await store.insert([{ name: "kim", age: 35 }])
        var result = await store.findOne({ name: "kim" })
        assert.strictEqual(typeof result, "object")
        assert.strictEqual(result.age, 35);
        assert.strictEqual(result.name, "kim");
    })
    it("InsertOne", async () => {
        await store.insertOne({ name: "kim", age: 35 })
        var result = await store.findOne({ name: "kim" })
        assert.strictEqual(typeof result, "object")
        assert.strictEqual(result.age, 35);
        assert.strictEqual(result.name, "kim");
    })
    it("Find", async () => {
        await store.insertOne({ name: "kim", age: 35 })
        var result = await store.find({ name: "kim" })
        assert.strictEqual(typeof result, "object")
        assert.strictEqual(result[0].age, 35);
        assert.strictEqual(result[0].name, "kim");
    })
    it("FindOne", async () => {
        await store.insertOne({ name: "kim", age: 35 })
        var result = await store.findOne({ name: "kim" })
        assert.strictEqual(typeof result, "object")
        assert.strictEqual(result.age, 35);
        assert.strictEqual(result.name, "kim");
    })
    it("FindOneAndUpdate", async () => {
        await store.insertOne({ name: "kim", age: 35 })
        var result = await store.findOneAndUpdate({ name: "kim" }, { $set: { name: "vasa", age: 22 } })
        assert.strictEqual(typeof result, "object")
        assert.strictEqual(result.age, 22);
        assert.strictEqual(result.name, "vasa");
    })
    it("FindOneAndDelete", async () => {
        await store.insertOne({ name: "kim", age: 35 })
        var result = await store.findOneAndDelete({ name: "kim" })
        assert.strictEqual(typeof result, "object")
        assert.strictEqual(result.age, 35);
        assert.strictEqual(result.name, "kim");
    })
    it("FindById", async () => {
        await store.insertOne({ _id: "54495ad94c934721ede76d90" ,name: "kim", age: 35 })
        var result = await store.findById("54495ad94c934721ede76d90")
        assert.strictEqual(typeof result, "object")
        assert.strictEqual(result.age, 35);
        assert.strictEqual(result.name, "kim");
    })
    it("FindByIdAndDelete", async () => {
        await store.insertOne({ _id: "54495ad94c934721ede76d90" ,name: "kim", age: 35 })
        var result = await store.findByIdAndDelete("54495ad94c934721ede76d90")
        assert.strictEqual(typeof result, "object")
        assert.strictEqual(result.age, 35);
        assert.strictEqual(result.name, "kim");
    })
    it("FindByIdAndUpdate", async () => {
        await store.insertOne({ _id: "54495ad94c934721ede76d90" ,name: "kim", age: 35 })
        var result = await store.findByIdAndUpdate("54495ad94c934721ede76d90", { $set: { name: "vasa", age: 22 } })
        assert.strictEqual(typeof result, "object")
        assert.strictEqual(result.age, 22);
        assert.strictEqual(result.name, "vasa");
    })
    it("Update", async () => {
        await store.insertOne({ name: "kim", age: 35 })
        var result = await store.update({ name: "kim" }, { $set: { name: "vasa", age: 22 } })
        assert.strictEqual(typeof result, "object")
        assert.strictEqual(result[0].age, 22);
        assert.strictEqual(result[0].name, "vasa");
    })
    it("UpdateOne", async () => {
        await store.insertOne({ name: "kim", age: 35 })
        var result = await store.updateOne({ name: "kim" }, { $set: { name: "vasa", age: 22 } })
        assert.strictEqual(typeof result, "object")
        assert.strictEqual(result.age, 22);
        assert.strictEqual(result.name, "vasa");
    })
    it("UpdateMany", async () => {
        await store.insert([{ name: "kim", age: 35 }, { name: "vasa", age: 22 }])
        var result = await store.updateMany({ age: { $gt: 20 } }, { $set: { age: 16 } })
        assert.strictEqual(typeof result, "object")
        assert.strictEqual(result[0].age, 16);
        assert.strictEqual(result[0].name, "kim");
        assert.strictEqual(result[1].age, 16);
        assert.strictEqual(result[1].name, "vasa");
    })
    it("DeleteOne", async () => {
        await store.insertOne({ name: "kim", age: 35 })
        var result = await store.deleteOne({ name: "kim" })
        assert.strictEqual(typeof result, "object")
        assert.strictEqual(result.age, 35);
        assert.strictEqual(result.name, "kim");
    })
    it("DeleteMany", async () => {
        await store.insertOne({ name: "kim", age: 35 })
        var result = await store.deleteMany({ name: "kim" })
        assert.strictEqual(typeof result, "object")
        assert.strictEqual(result[0].age, 35);
        assert.strictEqual(result[0].name, "kim");
    })
    it("Distinct", async () => {
        await store.insertOne({ name: "kim", age: 35 })
        await store.insertOne({ name: "vasa", age: 22 })
        var result = await store.distinct("name")
        assert.strictEqual(typeof result, "object")
        assert.strictEqual(result[0], "kim");
        assert.strictEqual(result[1], "vasa");
    })
    it("Head syncing", async () => {
        //NOTE: notice how there is two inserts. That is because entries aren't immediately added to the oplog. store.getHeadHash() will return null if there is no oplog entries. 
        await store.insertOne({ name: "kim", age: 35 })
        await store.insertOne({ name: "john", age: 40 })
        var headHash = await store.getHeadHash();
        assert.notStrictEqual(headHash, null)
        await store.syncFromHeadHash(headHash)
        //Expects no errors to be thrown.
    })
})
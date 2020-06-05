import Collection from "../src/core/Collection";
const dagCBOR = require("ipld-dag-cbor");
const Cache = require("orbit-db-cache");
const Keystore = require("orbit-db-keystore");
const IdentityProvider = require("orbit-db-identity-provider");
const assert = require("assert");
const ObjectId = require("bson-objectid");
const IPFS = require("ipfs");

const DefaultOptions = {};
// Test utils
const {
  config,
  testAPIs,
  startIpfs,
  stopIpfs,
  implementations,
} = require("orbit-db-test-utils");

const properLevelModule = implementations
  .filter((i) => i.key.indexOf("memdown") > -1)
  .map((i) => i.module)[0];
const storage = require("orbit-db-storage-adapter")(properLevelModule);

describe("Collection", function () {
  let ipfs, testIdentity, identityStore, store, cacheStore;

  this.timeout(config.timeout);

  const ipfsConfig = Object.assign({}, config.defaultIpfsConfig, {
    repo: config.defaultIpfsConfig.repo + "-entry" + new Date().getTime(),
  });

  before(async () => {
    identityStore = await storage.createStore("identity");
    const keystore = new Keystore(identityStore);

    cacheStore = await storage.createStore("cache");
    await cacheStore.open();
    const cache = new Cache(cacheStore);

    testIdentity = await IdentityProvider.createIdentity({
      id: "userA",
      keystore,
    });
    //ipfs = await startIpfs("js-ipfs", ipfsConfig)
    ipfs = await IPFS.create(ipfsConfig);
    const address = "test-address";
    const options = Object.assign({}, DefaultOptions, { cache });
    store = new Collection(ipfs, testIdentity, address, options);
  });
  after(async () => {
    await store.close();
    await ipfs.stop();
    await identityStore.close();
    //await cacheStore.close();
  });
  afterEach(async () => {
    await store.drop();
    const address = "test-address";
    const cache = new Cache(cacheStore);
    const options = Object.assign({}, DefaultOptions, { cache });
    store = new Collection(ipfs, testIdentity, address, options);
    await cacheStore.open();
    await identityStore.open();
  });
  //TODO: Add tests
  it("Insert", async () => {
    await store.insert([{ name: "kim", age: 35 }]);
    const result = await store.findOne({ name: "kim" });
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result.age, 35);
    assert.strictEqual(result.name, "kim");
  });
  it("InsertOne", async () => {
    await store.insertOne({ name: "kim", age: 35 });
    const result = await store.findOne({ name: "kim" });
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result.age, 35);
    assert.strictEqual(result.name, "kim");
  });
  it("Find", async () => {
    await store.insertOne({ name: "kim", age: 35 });
    const result1 = await store.find({ name: "kim" });
    const result2 = await store.find({});
    assert.strictEqual(typeof result1, "object");
    assert.strictEqual(typeof result2, "object");
    assert.strictEqual(result1[0].age, 35);
    assert.strictEqual(result1[0].name, "kim");
    assert.strictEqual(result2[0].age, 35);
    assert.strictEqual(result2[0].name, "kim");
  });
  it("Find: Negetive", async () => {
    await store.insertOne({ name: "kim", age: 35 });
    const result = await store.find({ name: "vasa" });
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result[0], undefined);
  });
  it("Find: Limit", async () => {
    await store.insert([
      { name: "kim", age: 35 },
      { name: "vasa", age: 22 },
    ]);
    const result = await store.find({ age: { $gt: 10 } }, null, { limit: 1 });
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result.length, 1);
  });
  it("Find: Skip", async () => {
    await store.insert([
      { name: "kim", age: 35 },
      { name: "vasa", age: 22 },
    ]);
    const result = await store.find({ age: { $gt: 10 } }, null, { skip: 1 });
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result.length, 1);
  });
  it("Find: Sort: Ascending", async () => {
    await store.insert([
      { name: "kim", age: 35 },
      { name: "vasa", age: 22 },
    ]);
    const result = await store.find({ age: { $gt: 10 } }, null, {
      sort: { age: 1 },
    });
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result[0].name, "vasa");
    assert.strictEqual(result[1].name, "kim");
  });
  it("Find: Sort: Descending", async () => {
    await store.insert([
      { name: "kim", age: 35 },
      { name: "vasa", age: 22 },
    ]);
    const result = await store.find({ age: { $gt: 10 } }, null, {
      sort: { age: -1 },
    });
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result[0].name, "kim");
    assert.strictEqual(result[1].name, "vasa");
  });
  it("Find: Sort: Nested Fields: Ascending", async () => {
    await store.insert([
      { name: { firstname: "elon", lastname: "musk" }, age: 35 },
      { name: { firstname: "vasa", lastname: "develop" }, age: 22 },
    ]);
    const result = await store.find({}, null, {
      sort: { "name.firstname": 1 },
    });
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result[0].name.firstname, "elon");
    assert.strictEqual(result[1].name.firstname, "vasa");
  });
  it("Find: Sort: Nested Fields: Descending", async () => {
    await store.insert([
      { name: { firstname: "elon", lastname: "musk" }, age: 35 },
      { name: { firstname: "vasa", lastname: "develop" }, age: 22 },
    ]);
    const result = await store.find({}, null, {
      sort: { "name.firstname": -1 },
    });
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result[0].name.firstname, "vasa");
    assert.strictEqual(result[1].name.firstname, "elon");
  });
  it("Find: Query with Limit & Skip & Sort", async () => {
    await store.insert([
      { name: "kim", age: 35 },
      { name: "vasa", age: 22 },
    ]);
    const result = await store.find({ age: { $gt: 10 } }, null, {
      sort: { age: 1 },
      limit: 1,
      skip: 1,
    });
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].name, "kim");
  });
  it("Find: No Query with Limit & Skip & Sort", async () => {
    await store.insert([
      { name: "kim", age: 35 },
      { name: "vasa", age: 22 },
    ]);
    const result = await store.find({}, null, {
      sort: { age: 1 },
      limit: 1,
      skip: 1,
    });
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].name, "kim");
  });
  it("FindOne", async () => {
    await store.insertOne({ name: "kim", age: 35 });
    const result1 = await store.findOne({ name: "kim" });
    const result2 = await store.findOne({});
    assert.strictEqual(typeof result1, "object");
    assert.strictEqual(typeof result2, "object");
    assert.strictEqual(result1.age, 35);
    assert.strictEqual(result1.name, "kim");
    assert.strictEqual(result2.age, 35);
    assert.strictEqual(result2.name, "kim");
  });
  it("FindOne: Negetive", async () => {
    await store.insertOne({ name: "kim", age: 35 });
    const result = await store.findOne({ name: "vasa" });
    assert.strictEqual(result, null);
  });
  it("FindOneAndUpdate", async () => {
    await store.insertOne({ name: "kim", age: 35 });
    const result = await store.findOneAndUpdate(
      { name: "kim" },
      { $set: { name: "vasa", age: 22 } }
    );
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result.age, 22);
    assert.strictEqual(result.name, "vasa");
  });
  it("FindOneAndUpdate: Negetive", async () => {
    await store.insertOne({ name: "kim", age: 35 });
    const result = await store.findOneAndUpdate(
      { name: "vasa" },
      { $set: { name: "elon", age: 48 } }
    );
    assert.strictEqual(result, null);
  });
  it("FindOneAndDelete", async () => {
    await store.insertOne({ name: "kim", age: 35 });
    const result = await store.findOneAndDelete({ name: "kim" });
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result.age, 35);
    assert.strictEqual(result.name, "kim");
  });
  it("FindOneAndDelete: Negetive", async () => {
    await store.insertOne({ name: "kim", age: 35 });
    const result = await store.findOneAndDelete({ name: "vasa" });
    assert.strictEqual(result, null);
  });
  it("FindById", async () => {
    await store.insertOne({
      _id: "54495ad94c934721ede76d90",
      name: "kim",
      age: 35,
    });
    const result = await store.findById("54495ad94c934721ede76d90");
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result.age, 35);
    assert.strictEqual(result.name, "kim");
  });
  it("FindById: Negetive", async () => {
    await store.insertOne({
      _id: "54495ad94c934721ede76d90",
      name: "kim",
      age: 35,
    });
    const result = await store.findById("54495ad94c934721ede76d89");
    assert.strictEqual(result, undefined);
  });
  it("FindByIdAndDelete", async () => {
    await store.insertOne({
      _id: "54495ad94c934721ede76d90",
      name: "kim",
      age: 35,
    });
    const result = await store.findByIdAndDelete("54495ad94c934721ede76d90");
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result.age, 35);
    assert.strictEqual(result.name, "kim");
  });
  it("FindByIdAndDelete: Negetive", async () => {
    await store.insertOne({
      _id: "54495ad94c934721ede76d90",
      name: "kim",
      age: 35,
    });
    const result = await store.findByIdAndDelete("54495ad94c934721ede76d89");
    assert.strictEqual(result, undefined);
  });
  it("FindByIdAndUpdate", async () => {
    await store.insertOne({
      _id: "54495ad94c934721ede76d90",
      name: "kim",
      age: 35,
    });
    const result = await store.findByIdAndUpdate("54495ad94c934721ede76d90", {
      $set: { name: "vasa", age: 22 },
    });
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result.age, 22);
    assert.strictEqual(result.name, "vasa");
  });
  it("FindByIdAndUpdate: Negetive", async () => {
    await store.insertOne({
      _id: "54495ad94c934721ede76d90",
      name: "kim",
      age: 35,
    });
    const result = await store.findByIdAndUpdate("54495ad94c934721ede76d89", {
      $set: { name: "vasa", age: 22 },
    });
    assert.strictEqual(result, undefined);
  });
  it("Update", async () => {
    await store.insertOne({ name: "kim", age: 35 });
    const result = await store.update(
      { name: "kim" },
      { $set: { name: "vasa", age: 22 } }
    );
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result[0].age, 22);
    assert.strictEqual(result[0].name, "vasa");
  });
  it("Update: with multi:true", async () => {
    await store.insert([
      { name: "kim", age: 35 },
      { name: "vasa", age: 22 },
    ]);
    const result = await store.update(
      { age: { $gt: 20 } },
      { $set: { age: 20 } },
      { multi: true }
    );
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result[0].age, 20);
    assert.strictEqual(result[0].name, "kim");
    assert.strictEqual(result[1].age, 20);
    assert.strictEqual(result[1].name, "vasa");
  });
  it("Update: Negetive", async () => {
    await store.insertOne({ name: "kim", age: 35 });
    const result = await store.update(
      { name: "vasa" },
      { $set: { name: "elon", age: 48 } }
    );
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result[0], undefined);
  });
  it("UpdateOne", async () => {
    await store.insertOne({ name: "kim", age: 35 });
    const result = await store.updateOne(
      { name: "kim" },
      { $set: { name: "vasa", age: 22 } }
    );
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result.age, 22);
    assert.strictEqual(result.name, "vasa");
  });
  it("UpdateOne: Negetive", async () => {
    await store.insertOne({ name: "kim", age: 35 });
    const result = await store.updateOne(
      { name: "vasa" },
      { $set: { name: "elon", age: 48 } }
    );
    assert.strictEqual(result, null);
  });
  it("UpdateMany", async () => {
    await store.insert([
      { name: "kim", age: 35 },
      { name: "vasa", age: 22 },
    ]);
    const result = await store.updateMany(
      { age: { $gt: 20 } },
      { $set: { age: 16 } }
    );
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result[0].age, 16);
    assert.strictEqual(result[0].name, "kim");
    assert.strictEqual(result[1].age, 16);
    assert.strictEqual(result[1].name, "vasa");
  });
  it("UpdateMany", async () => {
    await store.insert([
      { name: "kim", age: 35 },
      { name: "vasa", age: 22 },
    ]);
    const result = await store.updateMany(
      { age: { $lt: 20 } },
      { $set: { age: 16 } }
    );
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result[0], undefined);
  });
  it("DeleteOne", async () => {
    await store.insertOne({ name: "kim", age: 35 });
    const result = await store.deleteOne({ name: "kim" });
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result.age, 35);
    assert.strictEqual(result.name, "kim");
  });
  it("DeleteOne: Negetive", async () => {
    await store.insertOne({ name: "kim", age: 35 });
    const result = await store.deleteOne({ name: "vasa" });
    assert.strictEqual(result, null);
  });
  it("DeleteMany", async () => {
    await store.insertOne({ name: "kim", age: 35 });
    const result = await store.deleteMany({ name: "kim" });
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result[0].age, 35);
    assert.strictEqual(result[0].name, "kim");
  });
  it("DeleteMany", async () => {
    await store.insertOne([
      { name: "kim", age: 35 },
      { name: "vasa", age: 22 },
    ]);
    const result = await store.deleteMany({ age: { $lt: 20 } });
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result[0], undefined);
  });
  it("Distinct", async () => {
    await store.insertOne({ name: "kim", age: 35 });
    await store.insertOne({ name: "vasa", age: 22 });
    await store.insertOne({ name: "vasa", age: 20 });
    const result = await store.distinct("name");
    assert.strictEqual(typeof result, "object");
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0], "kim");
    assert.strictEqual(result[1], "vasa");
  });
  it("Head syncing", async () => {
    //NOTE: notice how there is two inserts. That is because entries aren't immediately added to the oplog. store.getHeadHash() will return null if there is no oplog entries.
    await store.insertOne({ name: "kim", age: 35 });
    await store.insertOne({ name: "john", age: 40 });
    const headHash = await store.getHeadHash();
    assert.notStrictEqual(headHash, null);
    await store.syncFromHeadHash(headHash);
    //Expects no errors to be thrown.
  });
  it("Import: json_mongo", async () => {
    await store.import(
      JSON.stringify([
        {
          name: "jessie",
          age: 35,
          userId: 971349,
          _id: "5e8cf7e1b9b93a4c7dc2d69e",
        },
        {
          name: "vasa",
          age: 22,
          userId: 971350,
          _id: "5e8cf7e1b9b93a4c7dc2d68d",
        },
      ]),
      { type: "json_mongo" },
      (currentLength, totalLength, progressPercent) => {
        //console.log("currentLength: ", currentLength);
        //console.log("totalLength: ", totalLength);
        //console.log("progressPercent: ", progressPercent);
      }
    );
  });
  it("Import: cbor", async () => {
    const documents = [
      {
        name: "jessie",
        age: 35,
        userId: 971349,
        _id: "5e8cf7e1b9b93a4c7dc2d69e",
      },
      {
        name: "vasa",
        age: 22,
        userId: 971350,
        _id: "5e8cf7e1b9b93a4c7dc2d68d",
      },
    ];
    const serialized = dagCBOR.util.serialize(documents);
    await store.import(
      serialized,
      { type: "cbor" },
      (currentLength, totalLength, progressPercent) => {
        //console.log("currentLength: ", currentLength);
        //console.log("totalLength: ", totalLength);
        //console.log("progressPercent: ", progressPercent);
      }
    );
  });
  it("Import: raw", async () => {
    await store.import(
      [
        {
          name: "jessie",
          age: 35,
          userId: 971349,
          _id: "5e8cf7e1b9b93a4c7dc2d69e",
        },
        {
          name: "vasa",
          age: 22,
          userId: 971350,
          _id: "5e8cf7e1b9b93a4c7dc2d68d",
        },
      ],
      { type: "raw" },
      (currentLength, totalLength, progressPercent) => {
        //console.log("currentLength: ", currentLength);
        //console.log("totalLength: ", totalLength);
        //console.log("progressPercent: ", progressPercent);
      }
    );
  });
  it("Export: json_mongo", async () => {
    await store.import(
      JSON.stringify([
        {
          name: "jessie",
          age: 35,
          userId: 971349,
          _id: "5e8cf7e1b9b93a4c7dc2d69e",
        },
        {
          name: "vasa",
          age: 22,
          userId: 971350,
          _id: "5e8cf7e1b9b93a4c7dc2d68d",
        },
      ]),
      { type: "json_mongo" },
      (currentLength, totalLength, progressPercent) => {}
    );
    const exportedData = await store.export({
      type: "json_mongo",
      query: {},
      cursor: {
        sort: { age: 1 },
        limit: 1,
        skip: 1,
      },
    });
    assert.strictEqual(JSON.parse(exportedData).length, 1);
    assert.strictEqual(JSON.parse(exportedData)[0].name, "jessie");
  });
  it("Export: cbor", async () => {
    await store.import(
      JSON.stringify([
        {
          name: "jessie",
          age: 35,
          userId: 971349,
          _id: "5e8cf7e1b9b93a4c7dc2d69e",
        },
        {
          name: "vasa",
          age: 22,
          userId: 971350,
          _id: "5e8cf7e1b9b93a4c7dc2d68d",
        },
      ]),
      { type: "json_mongo" },
      (currentLength, totalLength, progressPercent) => {}
    );
    const exportedData = await store.export({
      type: "cbor",
      query: {},
      cursor: {
        sort: { age: 1 },
        limit: 1,
        skip: 1,
      },
    });
    assert.strictEqual(dagCBOR.util.deserialize(exportedData).length, 1);
    assert.strictEqual(
      dagCBOR.util.deserialize(exportedData)[0].name,
      "jessie"
    );
  });
  it("Export: raw", async () => {
    await store.import(
      JSON.stringify([
        {
          name: "jessie",
          age: 35,
          userId: 971349,
          _id: "5e8cf7e1b9b93a4c7dc2d69e",
        },
        {
          name: "vasa",
          age: 22,
          userId: 971350,
          _id: "5e8cf7e1b9b93a4c7dc2d68d",
        },
      ]),
      { type: "json_mongo" },
      (currentLength, totalLength, progressPercent) => {}
    );
    const exportedData = await store.export({
      type: "raw",
      query: {},
      cursor: {
        sort: { age: 1 },
        limit: 1,
        skip: 1,
      },
    });
    assert.strictEqual(exportedData.length, 1);
    assert.strictEqual(exportedData[0].name, "jessie");
  });
});

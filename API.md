# IpfsDB API Documentation
The following APIs documented are in a usable state. More APIs are available, however they are not officially supported or complete.

## Table of Contents

<!-- toc -->

- [Public Instance Methods](#public-instance-methods)
    * createCollection(name, [options])
    * dropCollection(name, [options])
    * listCollections([filter], [options])
    * collection(name)
    * [Collection Instance](#Collection-Instance)
        + insert(docs)
        + insertOne(doc)
        + find(query)
        + findOne(query)
        + findOneAndUpdate(filter, modification)
        + findOneAndDelete(filter)
        + update(filter, modification)
        + updateMany(filter, modification)
        + distinct(key, [query])
        + getHeadHash()
        + syncFromHeadHash(hash, [stopWrites])


## Public Instance Methods

### ipfsdb.createCollection(name, [options])
> Creates and opens a database collection.

Returns a `Promise` that resolves to a [Collection Instance](#Collection-Instance).

```javascript
var collection = await ipfsdb.createCollection("Accounts");
```


### ipfsdb.dropCollection(name, [options])
> Deletes collection removing all stored data

Returns a `Promise` that resolves on completeion.

Note: this is a network wide operation. Meaning all nodes will remove the collection and all attached data.

```javascript
await ipfsdb.dropCollection("Accounts");
```

### ipfsdb.listCollections([filter], [options])
> Lists collections in database.

Returns a `Promise` that resolves to an array of collection manifests.

```javascript
var collectionList = await ipfsdb.listCollection({});
//TODO: Example collectionList.
```

### ipfsdb.collection(name)
> Returns collection instance. Throws error if collection is not open.

Returns a [Collection Instance](#Collection-Instance)

```javascript
var collection = ipfsdb.collection("Accounts");
```

## Collection Instance

### collection.insert(docs)
> Inserts a list of document into the collection.

Returns a `Promise` that resolves on completeion.

If _id is not specified in each document a randomly generated id will be assigned.

```javascript
await collection.insert([{
    name: "jessie",
    age: 35,
    userId: 971349
}]);
```
### insertOne(doc)
> Inserts a single document into the collection.

Returns a `Promise` that resolves on completeion.

If _id is not specified in document a randomly generated id will be assigned.

```javascript
await collection.insertOne({
    name: "jessie",
    age: 35,
    userId: 971349
});
```
### find(query)
> Queries the collection returning all results that match query.

Returns a `Promise` that resolves to a list of documents


```javascript
var results = await collection.find({
    age: 35
});
console.log(results);
```
```JSON
[
    {
        "name": "jessie",
        "age": 35,
        "userId": 971349,
        "_id": "5e8cf7e1b9b93a4c7dc2d69e"
    },
    {
        "name": "ali",
        "age": 35,
        "userId": 85623,
        "_id": "5e880642b9b93a4c7dc2d68d"
    }
]
```
### findOne(query)
> Queries the collection returning first result matching query.

Returns a `Promise` that resolves to a single document

```javascript
var results = await collection.findOne({
    age: 35
});
console.log(results);
```
```JSON
[
    {
        "name": "jessie",
        "age": 35,
        "userId": 971349,
        "_id": "5e8cf7e1b9b93a4c7dc2d69e" 
    }
]
```

### findOneAndUpdate(filter, modification)
> Finds first document matching query and modifies it according to specified modification.

Returns a `Promise` that resolves to the modified document

```javascript
await collection.findOne({
    age: 35
}, {
    $set: {
        age: 40
    }
});
```

### findOneAndDelete(filter)
> Finds first document to match query and deletes it from collection.

Returns a `Promise` that resolves to the original document.

```javascript
await collection.findOne({
    age: 35
}, {
    $set: {
        age: 40
    }
});
```
### update(filter, modification, [options])
> Modifies an existing document or documents in a collection.
    
Returns a `Promise` that resolves on completeion
The method can modify specific fields of an existing document or documents or replace an existing document entirely, dependingon the update parameter.
     By default, the collection.update() method updates a single document.
     Include the options multi: true to update all documents that match the query criteria.

TODO: Add updateOne, updateMany;

### distinct(key, [query])
> Retrieves all unique values for the specified key, and query.

Returns a `Promise` that resolves to an array of values

```javascript
var results = await collection.distinct("name");
console.log(results); // ["jessie", "ali"]
```
### getHeadHash()
> Retrieves CID/multihash representing oplog heads.

Returns a `Promise` that resolves to head CID as a base32 encoded string

Rational is to provide a verifiable way that ensures the collection is synced.

```javascript
var results = await collection.getHeadHash()
console.log(results); //zdpuAtmXUPRPueZocCXRaHwh8Hn6AnByMqupdE3iMboNWa1c1
```
### syncFromHeadHash(hash, [stopWrites])
> Syncs oplog to head hash.

Returns a `Promise` that resolves on completion

If optional stopWrites is set to true; All write operations will be paused until sync has been completed. Rational is to provide a verifiable way that ensures the collection is synced.

```javascript
await collection.syncFromHeadHash("zdpuAtmXUPRPueZocCXRaHwh8Hn6AnByMqupdE3iMboNWa1c1");
```
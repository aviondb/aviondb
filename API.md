# IpfsDB API Documentation
The following APIs documented are in a usable state. More APIs are available, however they are not officially supported or complete.

## Table of Contents

<!-- toc -->

- [Public Instance Methods](#public-instance-methods)
    * [createCollection(name, [options])](#ipfsdbcreateCollection)
    * [dropCollection(name, [options])](#ipfsdbdropCollection)
    * [listCollections([filter], [options])](#ipfsdblistCollections)
    * [collection(name)](#ipfsdbcollection)
    * [Collection Instance](#Collection-Instance)
        + [insert(docs)](#collectioninsert)
        + [insertOne(doc)](#collectioninsertOne)
        + [find(query)](#collectionfind)
        + [findOne(query)](#collectionfindOne)
        + [findOneAndUpdate(filter, modification)](#collectionfindOneAndUpdate)
        + [findOneAndDelete(filter)](#collectionfindOneAndDelete)
        + [findById(_id)](#collectionfindById)
        + [findByIdAndDelete(_id)](#collectionfindByIdAndDelete)
        + [findByIdAndUpdate(_id, modification, [options])](#collectionfindByIdAndUpdate)
        + [update(filter, modification)](#collectionupdate)
        + [updateMany(filter, modification)](#collectionupdateMany)
        + [deleteOne(filter)](#collectiondeleteOne)
        + [deleteMany(filter)](#collectiondeleteMany)
        + [distinct(key, [query])](#collectiondistinct)
        + [getHeadHash()](#collectiongetHeadHash)
        + [syncFromHeadHash(hash, [stopWrites])](#collectionsyncFromHeadHash)


## Public Instance Methods

### ipfsdb.createCollection
> Creates and opens a database collection.

Syntax: `ipfsdb.createCollection(name, [options])`

Returns a `Promise` that resolves to a [Collection Instance](#Collection-Instance).

```javascript
var collection = await ipfsdb.createCollection("Accounts");
```


### ipfsdb.dropCollection
> Deletes collection removing all stored data

Syntax: `ipfsdb.dropCollection(name, [options])`

Returns a `Promise` that resolves on completeion.

**Note**: this is a network wide operation. Meaning all nodes will remove the collection and all attached data.

#### Example

```javascript
await ipfsdb.dropCollection("Accounts");
```

### ipfsdb.listCollections
> Lists collections in database.

Syntax: `ipfsdb.listCollections([filter], [options])`

Returns a `Promise` that resolves to an array of collection manifests.

#### Example

```javascript
var collectionList = await ipfsdb.listCollection();
console.log(collectionList)
// [ 'Users', 'Products' ]
```

### ipfsdb.collection
> Returns collection instance. Throws error if collection is not open.

Syntax: `ipfsdb.collection(name)`

Returns a [Collection Instance](#Collection-Instance)

#### Example

```javascript
var collection = ipfsdb.collection("Accounts");
```

## Collection Instance

### collection.insert
> Inserts a list of document into the collection.

Syntax: `collection.insert(docs)`

Returns a `Promise` that resolves on completeion.

If `_id` is not specified in each document a randomly generated id will be assigned.

#### Example

```javascript
await collection.insert([{
    name: "jessie",
    age: 35,
    userId: 971349
}]);
```
### collection.insertOne
> Inserts a single document into the collection.

Syntax: `collection.insertOne(doc)`

Returns a `Promise` that resolves on completeion.

If `_id` is not specified in document a randomly generated id will be assigned.

#### Example

```javascript
await collection.insertOne({
    name: "jessie",
    age: 35,
    userId: 971349
});
```
### collection.find
> Queries the collection returning all results that match query.

Syntax: `collection.find(query)`

Returns a `Promise` that resolves to a list of documents

#### Example

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

#### Supported Comparison Operators

- **`$lt`**

    Syntax: `{field: {$lt: value} }`

    `$lt` selects the documents where the value of the `field` is less than (i.e. <) the specified `value`.

    Consider the following example:

    ```js
    await collection.find( { age: { $lt: 40 } } )
    ```

    This query will select all documents in the `collection` where the `age` field value is less than `40`.


- **`$lte`**

    Syntax: `{field: {$lte: value} }`

    `$lte` selects the documents where the value of the `field` is less than or equal to (i.e. <=) the specified `value`.

    Consider the following example:

    ```js
    await collection.find( { age: { $lte: 40 } } )
    ```

    This query will select all documents in the `collection` where the `age` field value is less than or equal to `40`.


- **`$gt`** 

    Syntax: `{field: {$gt: value} }`

    `$gt` selects those documents where the value of the `field` is greater than (i.e. >) the specified `value`.

    Consider the following example:

    ```js
    await collection.find( { age: { $gt: 40 } } )
    ```

    This query will select all documents in the `collection` where the `age` field value is greater than `40`.


- **`$gte`**

    Syntax: `{field: {$gte: value} }`

    `$gte` selects the documents where the value of the `field` is greater than or equal to (i.e. >=) a specified `value` (e.g. `age`.).

    Consider the following example:

    ```js
    await collection.find( { age: { $gte: 40 } } )
    ```

    This query will select all documents in the `collection` where the `age` field value is greater than or equal to `40`.


#### Supported Logical Operators

- **`$and`**

    Syntax: `{ $and: [ { <expression1> }, { <expression2> } , ... , { <expressionN> } ] }`

    `$and` performs a logical AND operation on an array of _one_ or _more_ expressions (e.g. `<expression1>`, `<expression2>`, etc.) and selects the documents that satisfy _all_ the expressions in the array. The `$and` operator uses _short-circuit evaluation_. If the first expression (e.g. `<expression1>`) evaluates to `false`, IpfsDB will not evaluate the remaining expressions.

    #### Examples

    Consider the following example:

    ```js
    await collection.find( { $and: [ { age: { $lt: 30, $gt: 10 } }, { balance: { $gte: 1000 } } ] } )
    ```

    This query will select all documents in the `collection` where:

    - the `age` field value is less than `30` & greater than `10` and
    - the `balance` field is greater than or equal to `1000`.
    
    This query can be also be constructed with an implicit `AND` operation as follows:

    ```js
    await collection.find( { age: { $lt: 30, $gt: 10 }, balance: { $gte: 1000 } } )
    ```

- **`$or`**

    Syntax: `{ $or: [ { <expression1> }, { <expression2> }, ... , { <expressionN> } ] }`

    The `$or` operator performs a logical `OR` operation on an array of _two_ or _more_ `<expressions>` and selects the documents that satisfy _at least one_ of the `<expressions>`.

    #### Examples

    Consider the following example:

    ```js
    await collection.find( { $or: [ { age: { $lt: 30, $gt: 10 } }, { balance: { $gte: 1000 } } ] } )
    ```

    This query will select all documents in the `collection` where either of the conditions are met:
    
    - the `age` field value is less than `30` and greater than `10` 
    - the `balance` field value is greater than or equal to `1000`


### collection.findOne
> Queries the collection returning first result matching record.

Syntax: `collection.findOne(query)`

Returns a `Promise` that resolves to a single document

#### Example

```javascript
var results = await collection.findOne({
    age: 35
});
console.log(results);
```
```JSON
{
    "name": "jessie",
    "age": 35,
    "userId": 971349,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e" 
}
```

#### Supported Comparison Operators for findOne

[See Here](#supported-comparison-operators)

#### Supported Logical Operators for findOne

[See Here](#supported-logical-operators)


### collection.findOneAndUpdate
> Finds first document matching query and modifies it according to specified modification.

Syntax: `collection.findOneAndUpdate(filter, modification)`

Returns a `Promise` that resolves to the modified document. Returns an empty document if no document matches the `filter`

#### Example

```javascript
await collection.findOneAndUpdate({
    age: 35
}, {
    $set: {
        age: 40
    }
});
```

### collection.findOneAndDelete
> Finds first document to match query and deletes it from collection.

Syntax: `collection.findOneAndDelete(filter)`

Returns a `Promise` that resolves to the original document. Returns an empty document if no document matches the `filter`

#### Example

```javascript
var result = await collection.findOneAndDelete({ age: 35 });

console.log(result);
```
```JSON
{
    "name": "jessie",
    "age": 35,
    "userId": 971349,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e" 
}
```


### collection.findById
> Queries the collection returning the record with matching BSON ObjectID.

Syntax: `collection.findById(_id)`

Returns a `Promise` that resolves to a document with a matching [`BSON ObjectID`](https://www.npmjs.com/package/bson-objectid).

#### Example

```javascript
var ObjectID = require("bson-objectid");

var results = await collection.findById({
    _id: ObjectID("5e8cf7e1b9b93a4c7dc2d69e")
});

console.log(results);
```
```JSON
{
    "name": "jessie",
    "age": 35,
    "userId": 971349,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e" 
}
```

### collection.findByIdAndDelete
> Queries the collection deleting the record with matching BSON ObjectID.

Syntax: `collection.findByIdAndDelete(_id)`

Returns a `Promise` that resolves to the original document.

#### Example

```javascript
var ObjectID = require("bson-objectid");

var results = await collection.findByIdAndDelete({
    _id: ObjectID("5e8cf7e1b9b93a4c7dc2d69e")
});

console.log(results);
```
```JSON
{
    "name": "jessie",
    "age": 35,
    "userId": 971349,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e" 
}
```

### collection.findByIdAndUpdate
> Queries the collection updating the record with matching BSON ObjectID.

Syntax: `collection.findByIdAndUpdate(_id, modification, [options])`

Returns a `Promise` resolves to the modified document.

#### Example

```javascript
var ObjectID = require("bson-objectid");

var results = await collection.findByIdAndUpdate(
    _id: ObjectID("5e8cf7e1b9b93a4c7dc2d69e"),
    modification: { $set: { "age": 35 } }
);

console.log(results);
```
```JSON
{
    "name": "jessie",
    "age": 35,
    "userId": 971349,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e" 
}
```


### collection.update
> Modifies an existing document or documents in a collection.
    
Syntax: `collection.update(filter, modification, [options])`

Returns a `Promise` that resolves on completion
The method can modify specific fields of an existing document or documents or replace an existing document entirely, depending on the update parameter.
     By default, the `collection.update()` method updates a single document.
     
#### Options

- `multi` (default: `false`): Include the options `multi: true` to update all documents that match the query criteria.

#### Example

```javascript
var results = await collection.update(
    { age: { $lt: 40, $gt: 5 } },
    { $set: { "age": 10 } },
    { multi: true }
);

console.log(results);
```
```JSON
[
    {
        "name": "jessie",
        "age": 10,
        "userId": 971349,
        "_id": "5e8cf7e1b9b93a4c7dc2d69e" 
    },
    {
        "name": "vasa",
        "age": 10,
        "userId": 971350,
        "_id": "5e8cf7e1b9b93a4c7dc2d68d" 
    }
]
```

### collection.updateOne
> Modifies an existing document or documents in a collection.
    
Syntax: `collection.updateOne(filter, modification, [options])`

Returns a `Promise` that resolves on completion
The method can modify specific fields of an existing document or replace an existing document entirely, depending on the update parameter.

#### Example

```javascript
var results = await collection.updateOne(
    { age: { $lt: 40, $gt: 30 } },
    { $set: { "age": 10 } }
);

console.log(results);
```
```JSON
{
    "name": "jessie",
    "age": 10,
    "userId": 971349,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e" 
}
```

### collection.updateMany
> Modifies an existing document or documents in a collection.
    
Syntax: `collection.updateMany(filter, modification, [options])`

Returns a `Promise` that resolves on completion
The method can modify specific fields of an existing documents or replace existing documents entirely, depending on the update parameter.

#### Example

```javascript
var results = await collection.updateMany(
    { age: { $gt: 10 } },
    { $set: { "age": 20 } }
);

console.log(results);
```
```JSON
[
    {
        "name": "jessie",
        "age": 20,
        "userId": 971349,
        "_id": "5e8cf7e1b9b93a4c7dc2d69e" 
    },
    {
        "name": "vasa",
        "age": 20,
        "userId": 971350,
        "_id": "5e8cf7e1b9b93a4c7dc2d68d" 
    }
]
```


### collection.deleteOne
> Finds first document to match query and deletes it from collection.

Syntax: `collection.deleteOne(filter)`

Returns a `Promise` that resolves to the original document. Returns an empty document if no document matches the `filter`

#### Example

```javascript
var result = await collection.deleteOne({ age: 35 });

console.log(result);
```
```JSON
{
    "name": "jessie",
    "age": 35,
    "userId": 971349,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e" 
}
```

### collection.deleteMany
> Finds all the documents to match query and deletes them from collection.

Syntax: `collection.deleteMany(filter)`

Returns a `Promise` that resolves to the original documents. Returns an empty document if no document matches the `filter`

#### Example

```javascript
var result = await collection.deleteMany({ age: { $gt: 10 }});

console.log(result);
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
        "name": "vasa",
        "age": 22,
        "userId": 971350,
        "_id": "5e8cf7e1b9b93a4c7dc2d68d" 
    }
]
```


### collection.distinct
> Retrieves all unique values for the specified key, and query.

Syntax: `collection.distinct(key, [query])`

Returns a `Promise` that resolves to an array of values

#### Example

```javascript
var results = await collection.distinct("name");
console.log(results); // ["jessie", "ali"]
```


### collection.getHeadHash
> Retrieves CID/multihash representing oplog heads.

Syntax: `collection.getHeadHash()`

Returns a `Promise` that resolves to head [CID](https://simpleaswater.com/ipfs-cids/) as a `base32` encoded string

Rational is to provide a verifiable way that ensures the collection is synced.

#### Example

```javascript
var results = await collection.getHeadHash()
console.log(results); //zdpuAtmXUPRPueZocCXRaHwh8Hn6AnByMqupdE3iMboNWa1c1
```


### collection.syncFromHeadHash
> Syncs oplog to head hash.

Syntax: `collection.syncFromHeadHash(hash, [stopWrites])`

Returns a `Promise` that resolves on completion

If optional `stopWrites` is set to `true`; All write operations will be paused until sync has been completed. Rational is to provide a verifiable way that ensures the collection is synced.

#### Example

```javascript
await collection.syncFromHeadHash("zdpuAtmXUPRPueZocCXRaHwh8Hn6AnByMqupdE3iMboNWa1c1");
```
# AvionDB API Documentation

The following APIs documented are in a usable state. More APIs are available, however they are not officially supported or complete.

## Table of Contents

<!-- toc -->

- [Public Instance Methods](#public-instance-methods)
  - [initCollection(name, [options], [orbitDbOptions])](#aviondbinitCollection)
  - [createCollection(name, [options], [orbitDbOptions])](#aviondbcreateCollection)
  - [openCollection(name, [options], [orbitDbOptions])](#aviondbopenCollection)
  - [dropCollection(name, [options])](#aviondbdropCollection)
  - [listCollections([filter], [options])](#aviondblistCollections)
  - [closeCollection(name)](#aviondbcloseCollection)
  - [collection(name)](#aviondbcollection)
  - [Collection Instance](#Collection-Instance)
    - [insert(docs)](#collectioninsert)
    - [insertOne(doc)](#collectioninsertOne)
    - [find(query)](#collectionfind)
    - [findOne(query)](#collectionfindOne)
    - [findOneAndUpdate(filter, modification)](#collectionfindOneAndUpdate)
    - [findOneAndDelete(filter)](#collectionfindOneAndDelete)
    - [findById(\_id)](#collectionfindById)
    - [findByIdAndDelete(\_id)](#collectionfindByIdAndDelete)
    - [findByIdAndUpdate(\_id, modification, [options])](#collectionfindByIdAndUpdate)
    - [update(filter, modification)](#collectionupdate)
    - [updateMany(filter, modification)](#collectionupdateMany)
    - [deleteOne(filter)](#collectiondeleteOne)
    - [deleteMany(filter)](#collectiondeleteMany)
    - [distinct(key, [query])](#collectiondistinct)
    - [getHeadHash()](#collectiongetHeadHash)
    - [syncFromHeadHash(hash, [stopWrites])](#collectionsyncFromHeadHash)
    - [import(data_in, [options], [progressCallback])](#collectionimport)
    - [export([options])](#collectionexport)
- [Static Methods](#static-methods)
  - [init(name, ipfs, [options], [orbitDbOptions])](#init)
  - [create(name, ipfs, [options], [orbitDbOptions])](#create)
  - [open(address, ipfs, [options], [orbitDbOptions])](#open)
  - [listDatabases()](#listDatabases)
  - [setDatabaseConfig([options])](#setDatabaseConfig)
  - [getDatabaseConfig()](#getDatabaseConfig)

## Public Instance Methods

### aviondb.initCollection

> Creates if the collection does not exist, or opens an existing database collection.

Syntax: `aviondb.initCollection(name, [options], [orbitDbOptions])`

Returns a `Promise` that resolves to a [Collection Instance](#Collection-Instance).

**NOTE: It is recommended to use `initCollection` instead of `createCollection` and `openCollection` for better developer experience.**

```javascript
var collection = await aviondb.createCollection("CollectionName");
```

### aviondb.createCollection

> Creates and opens a database collection.

Syntax: `aviondb.createCollection(name, [options], [orbitDbOptions])`

Returns a `Promise` that resolves to a [Collection Instance](#Collection-Instance). Throws error if a collection with `name` is already exists.

```javascript
var collection = await aviondb.createCollection("CollectionName");
```

### aviondb.openCollection

> Opens an existing database collection.

Syntax: `aviondb.openCollection(name, [options], [orbitDbOptions])`

Returns a `Promise` that resolves to a [Collection Instance](#Collection-Instance). Throws error if a collection with `name` does not exist.

```javascript
var collection = await aviondb.openCollection("CollectionName");
```

### aviondb.dropCollection

> Deletes collection removing all stored data

Syntax: `aviondb.dropCollection(name, [options])`

Returns a `Promise` that resolves on completeion.

**Note**: this is a network wide operation. Meaning all nodes will remove the collection and all attached data.

#### Example

```javascript
await aviondb.dropCollection("Accounts");
```

### aviondb.listCollections

> Lists collections in database.

Syntax: `aviondb.listCollections([filter], [options])`

Returns a `Promise` that resolves to an array of collection manifests.

#### Example

```javascript
var collectionList = await aviondb.listCollection();
console.log(collectionList);
// [ 'Users', 'Products' ]
```

### aviondb.closeCollection

> Closes an open collection.

Syntax: `aviondb.closeCollection(name)`

This closes the collection. You can open the collection again by [`openCollection()`](#aviondbopenCollection)

#### Example

```javascript
await aviondb.closeCollection("Products");
```

### aviondb.collection

> Returns collection instance. Throws error if collection is not open.

Syntax: `aviondb.collection(name)`

Returns a [Collection Instance](#Collection-Instance)

#### Example

```javascript
var collection = aviondb.collection("Accounts");
```

## Collection Instance

### collection.insert

> Inserts a list of document into the collection.

Syntax: `collection.insert(docs)`

Returns a `Promise` that resolves on completeion.

If `_id` is not specified in each document a randomly generated id will be assigned.

#### Example

```javascript
await collection.insert([
  {
    name: "jessie",
    age: 35,
    userId: 971349,
  },
]);
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
  userId: 971349,
});
```

### collection.find

> Queries the collection returning all results that match query.

Syntax: `collection.find(query)`

Returns a `Promise` that resolves to a list of documents

#### Example

```javascript
var results = await collection.find({
  age: 35,
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
  await collection.find({ age: { $lt: 40 } });
  ```

  This query will select all documents in the `collection` where the `age` field value is less than `40`.

* **`$lte`**

  Syntax: `{field: {$lte: value} }`

  `$lte` selects the documents where the value of the `field` is less than or equal to (i.e. <=) the specified `value`.

  Consider the following example:

  ```js
  await collection.find({ age: { $lte: 40 } });
  ```

  This query will select all documents in the `collection` where the `age` field value is less than or equal to `40`.

- **`$gt`**

  Syntax: `{field: {$gt: value} }`

  `$gt` selects those documents where the value of the `field` is greater than (i.e. >) the specified `value`.

  Consider the following example:

  ```js
  await collection.find({ age: { $gt: 40 } });
  ```

  This query will select all documents in the `collection` where the `age` field value is greater than `40`.

* **`$gte`**

  Syntax: `{field: {$gte: value} }`

  `$gte` selects the documents where the value of the `field` is greater than or equal to (i.e. >=) a specified `value` (e.g. `age`.).

  Consider the following example:

  ```js
  await collection.find({ age: { $gte: 40 } });
  ```

  This query will select all documents in the `collection` where the `age` field value is greater than or equal to `40`.

#### Supported Logical Operators

- **`$and`**

  Syntax: `{ $and: [ { <expression1> }, { <expression2> } , ... , { <expressionN> } ] }`

  `$and` performs a logical AND operation on an array of _one_ or _more_ expressions (e.g. `<expression1>`, `<expression2>`, etc.) and selects the documents that satisfy _all_ the expressions in the array. The `$and` operator uses _short-circuit evaluation_. If the first expression (e.g. `<expression1>`) evaluates to `false`, AvionDB will not evaluate the remaining expressions.

  #### Examples

  Consider the following example:

  ```js
  await collection.find({
    $and: [{ age: { $lt: 30, $gt: 10 } }, { balance: { $gte: 1000 } }],
  });
  ```

  This query will select all documents in the `collection` where:

  - the `age` field value is less than `30` & greater than `10` and
  - the `balance` field is greater than or equal to `1000`.

  This query can be also be constructed with an implicit `AND` operation as follows:

  ```js
  await collection.find({ age: { $lt: 30, $gt: 10 }, balance: { $gte: 1000 } });
  ```

- **`$or`**

  Syntax: `{ $or: [ { <expression1> }, { <expression2> }, ... , { <expressionN> } ] }`

  The `$or` operator performs a logical `OR` operation on an array of _two_ or _more_ `<expressions>` and selects the documents that satisfy _at least one_ of the `<expressions>`.

  #### Examples

  Consider the following example:

  ```js
  await collection.find({
    $or: [{ age: { $lt: 30, $gt: 10 } }, { balance: { $gte: 1000 } }],
  });
  ```

  This query will select all documents in the `collection` where either of the conditions are met:

  - the `age` field value is less than `30` and greater than `10`
  - the `balance` field value is greater than or equal to `1000`

#### Supported Cursor Methods

- **`limit`**

  Syntax: `{ limit: <number> }`

  The `limit` specifies the maximum _number_ of matching records that should be returned from a query.

  #### Examples

  Consider the following example:

  ```js
  await collection.insert([
    { name: "kim", age: 35 },
    { name: "vasa", age: 22 },
  ]);
  var result = await collection.find({ age: { $gt: 10 } }, null, { limit: 1 });
  // result will only have the 1st matching record
  ```

  This query will only return first `1` matching record as specified by the `limit` method.

- **`skip`**

  Syntax: `{ skip: <number> }`

  The `skip` specifies the _number_ of matching records that should be skipped from a query.

  #### Examples

  Consider the following example:

  ```js
  await collection.insert([
    { name: "kim", age: 35 },
    { name: "vasa", age: 22 },
  ]);
  var result = await collection.find({ age: { $gt: 10 } }, null, { skip: 1 });
  // result will have the 2nd matching record
  ```

  This query will skip the first matching record (as specified by the `skip`) & return all the matching records thereafter.

- **`sort`**

  Syntax: `{ sort: { field: value } }`

  `sort` specifies the order in which the query returns matching documents.

  #### Ascending/Descending Sort

  Specify in the `sort` parameter the field or fields to sort by and a value of `1` or `-1` to specify an ascending or descending sort respectively.

  The following sample document specifies a descending sort by the `age` field and then an ascending sort by the `posts` field:

  ```json
  { "age": -1, "posts": 1 }
  ```

  You can also sort by nested field(s) in a document. Following shows an example of sorting documents with respect of a field named `date` in an object named `locals`:

  ```js
  // posts = [
  //   { title: 'post 1', locals: { date: '2020-01-09' } },
  //   { title: 'post 2', locals: { date: '2020-01-02' } },
  //   { title: 'post 3', locals: { date: '2019-05-06' } },
  // ];

  var result = await collection.find({}, null, { sort: { "locals.date": 1 })
  ```

  #### Examples

  Consider the following example:

  ```js
  await collection.insert([{ name: "kim", age: 35 },{ name: "vasa", age: 22 }])
  var result = await collection.find({}, null, { sort: { age: 1 })
  // result will only have the 1st matching record
  ```

  This query will only return first `1` matching record as specified by the `limit` method.

### collection.findOne

> Queries the collection returning first result matching record.

Syntax: `collection.findOne(query)`

Returns a `Promise` that resolves to a single document

#### Example

```javascript
var results = await collection.findOne({
  age: 35,
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
await collection.findOneAndUpdate(
  {
    age: 35,
  },
  {
    $set: {
      age: 40,
    },
  }
);
```

#### Supported Update Operators for findOneAndUpdate

[See Here](#supported-update-operators)

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
  _id: ObjectID("5e8cf7e1b9b93a4c7dc2d69e"),
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
  _id: ObjectID("5e8cf7e1b9b93a4c7dc2d69e"),
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
  { $set: { age: 10 } },
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

#### Supported Update Operators

- **`$inc`**

  > The `$inc` operator increments a field by a specified value.

  Syntax: `{ $inc: { <field1>: <amount1>, <field2>: <amount2>, ... } }`

  **Behavior**

  The `$inc` operator accepts positive and negative values.

  If the field does not exist, `$inc` creates the field and sets the field to the specified value.

  Use of the `$inc` operator on a field with a null value will generate an error.

  `$inc` is an atomic operation within a single document.

  **Example**

  Consider a collection `users` with the following document:

  ```json
  {
    "name": "jessie",
    "age": 10,
    "balance": 1000,
    "userId": 971349,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e"
  }
  ```

  The following `update()` operation uses the `$inc` operator to decrease the `age` field by 2 (i.e. increase by -2) and increase the `balance` field by 100:

  ```js
  await collection.update(
    { name: "jessie" },
    { $inc: { age: -2, balance: 100 } }
  );
  ```

  The updated document would resemble:

  ```json
  {
    "name": "jessie",
    "age": 8,
    "balance": 1100,
    "userId": 971349,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e"
  }
  ```

- **`$min`**

  > The `$min` updates the value of the field to a specified value if the specified value is less than the current value of the field.

  Syntax: `{ $min: { <field1>: <value1>, ... } }`

  **Behavior**

  If the field does not exists, the `$min` operator sets the field to the specified value.

  **Example**

  Consider a collection `users` with the following document:

  ```json
  {
    "name": "jessie",
    "age": 10,
    "balance": 1000,
    "userId": 971349,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e"
  }
  ```

  The `balance` for the document currently has the value `1000`. The following operation uses `$min` to compare `1000` to the specified value `900` and updates the value of `balance` to `900` since `900` is less than `1000`:

  ```js
  await collection.update({ name: "jessie" }, { $min: { balance: 900 } });
  ```

  The `users` collection now contains the following modified document:

  ```json
  {
    "name": "jessie",
    "age": 10,
    "balance": 900,
    "userId": 971349,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e"
  }
  ```

  The next operation has no effect since the current value of the field `balance`, i.e `900`, is less than `2000`.

  ```js
  await collection.update({ name: "jessie" }, { $min: { balance: 2000 } });
  ```

  The document remains unchanged in the `users` collection.

  ```json
  {
    "name": "jessie",
    "age": 10,
    "balance": 900,
    "userId": 971349,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e"
  }
  ```

* **`$max`**

  > The `$max` operator updates the value of the field to a specified value if the specified value is greater than the current value of the field.

  Syntax: `{ $max: { <field1>: <value1>, ... } }`

  **Behavior**

  If the field does not exists, the `$max` operator sets the field to the specified value.

  **Example**

  Consider the following document in the collection `users`:

  ```json
  {
    "name": "jessie",
    "age": 10,
    "balance": 1000,
    "userId": 971349,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e"
  }
  ```

  The `balance` for the document currently has the value `1000`. The following operation uses `$max` to compare the `1000` and the specified value `2000` and updates the value of highScore to `2000` since `2000` is greater than `1000`:

  ```js
  await collection.update({ name: "jessie" }, { $max: { balance: 2000 } });
  ```

  The `users` collection now contains the following modified document:

  ```json
  {
    "name": "jessie",
    "age": 10,
    "balance": 2000,
    "userId": 971349,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e"
  }
  ```

  The next operation has no effect since the current value of the field `balance`, i.e. `2000`, is greater than `1500`:

  ```js
  await collection.update({ name: "jessie" }, { $max: { balance: 1500 } });
  ```

  The document remains unchanged in the `scores` collection:

  ```json
  {
    "name": "jessie",
    "age": 10,
    "balance": 2000,
    "userId": 971349,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e"
  }
  ```

* **`$mul`**

  > The `$mul` multiplies the value of a field by a number.

  Syntax: `{ $mul: { <field1>: <number1>, ... } }`

  **Behavior**

  If the field does not exist in a document, `$mul` creates the field and sets the value to zero of the same numeric type as the multiplier.

  **Example**

  **Multiply the Value of an existing Field**

  Consider a collection `users` with the following document:

  ```json
  {
    "name": "jessie",
    "age": 10,
    "balance": 1000,
    "userId": 971349,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e"
  }
  ```

  The following `collection.update()` operation updates the document, using the `$mul` operator to multiply the `balance` by `2` and the `age` field by `1.5`:

  ```js
  await collection.update(
    { name: "jessie" },
    { $mul: { balance: 2, age: 1.25 } }
  );
  ```

  The operation results in the following document, where the new value of `balance` reflects the original value `1000` multiplied by `2` and the new value of `age` reflects the original value of `10` multipled by `1.5`:

  ```json
  {
    "name": "jessie",
    "age": 12.5,
    "balance": 2000,
    "userId": 971349,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e"
  }
  ```

  **Multiply the Value of an non-existing Field**

  Consider a collection `users` with the following document:

  ```json
  {
    "name": "jessie",
    "age": 10,
    "userId": 971349,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e"
  }
  ```

  The following `collection.update()` operation updates the document, applying the `$mul` operator to the field `balance` that does not exist in the document:

  ```js
  await collection.update({ name: "jessie" }, { $mul: { balance: 2 } });
  ```

  The operation results in the following document with a `balance` field set to value `0`:

  ```json
  {
    "name": "jessie",
    "age": 10,
    "balance": 0,
    "userId": 971349,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e"
  }
  ```

* **`$set`**

  > The `$set` operator replaces the value of a field with the specified value.

  Syntax: `{ $set: { <field1>: <value1>, ... } }`

  **Behavior**

  If the field does not exist, `$set` will add a new field with the specified value, provided that the new field does not violate a type constraint.

  If you specify multiple field-value pairs, `$set` will update or create each field.

  **Example**

  Consider a collection `users` with the following document:

  ```json
  {
    "name": "jessie",
    "age": 10,
    "balance": 1000,
    "userId": 971349,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e"
  }
  ```

  For the document matching the criteria `_id` equal to `5e8cf7e1b9b93a4c7dc2d69e`, the following operation uses the `$set` operator to update the value of the `age` field, `name` field, and create & set values for a non-existing `companies` field.

  ```js
  await collection.update(
    { _id: "5e8cf7e1b9b93a4c7dc2d69e" },
    {
      $set: {
        age: 48,
        name: "elon",
        companies: ["tesla", "spacex", "neuralink"],
      },
    }
  );
  ```

  The operation replaces the value of: `age` to `48`, `name` to `elon` & creates a new field `companies` with value `["tesla", "spacex", "neuralink"]`.

  ```json
  {
    "name": "elon",
    "age": 48,
    "balance": 1000,
    "userId": 971349,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e",
    "companies": ["tesla", "spacex", "neuralink"]
  }
  ```

- **`$unset`**

  > The `$unset` operator deletes a particular field.

  Syntax: `{ $unset: { <field1>: "", ... } }`

  **Behavior**

  If the field does not exist, then `$unset` does nothing (i.e. no operation).

  **Example**

  Consider a collection `users` with the following document:

  ```json
  {
    "name": "jessie",
    "age": 10,
    "balance": 1000,
    "userId": 971349,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e"
  }
  ```

  The following `collection.update()` operation uses the `$unset` operator to remove the fields `balance` and `age` from the first document in the `users` collection where the field `name` has a value of `jessie`.

  ```js
  await collection.update(
    { name: "jessie" },
    { $unset: { balance: "", age: "" } }
  );
  ```

  The resulting document will look something like this:

  ```json
  {
    "name": "jessie",
    "userId": 971349,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e"
  }
  ```

* **`$rename`**

  > The `$rename` operator updates the name of a field.

  Syntax: `{$rename: { <field1>: <newName1>, <field2>: <newName2>, ... } }`

  **Behavior**

  The `$rename` operator logically performs an `$unset` of both the old name and the new name, and then performs a `$set` operation with the new name. As such, the operation may not preserve the order of the fields in the document; i.e. the renamed field may move within the document.

  If the document already has a field with the `<newName>`, the `$rename` operator removes that field and renames the specified `<field>` to `<newName>`.

  If the field to rename does not exist in a document, `$rename` does nothing (i.e. no operation).

  For fields in embedded documents, the `$rename` operator can rename these fields as well as move the fields in and out of embedded documents. `$rename` does not work if these fields are in array elements.

  **Example**

  A collection `users` contains the following documents where a field `nmae` appears misspelled, i.e. should be `name`:

  ```JSON
  [
      {
          "nmae": "jessie",
          "age": 10,
          "userId": 971349,
          "_id": "5e8cf7e1b9b93a4c7dc2d69e"
      },
      {
          "nmae": "vasa",
          "age": 22,
          "userId": 971350,
          "_id": "5e8cf7e1b9b93a4c7dc2d68d"
      }
  ]
  ```

  To rename a field, call the `$rename` operator with the current name of the field and the new name:

  ```js
  await collection.update({}, { $rename: { nmae: "name" } });
  ```

  This operation renames the field `nmae` to `name` for all documents in the collection:

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
          "age": 22,
          "userId": 971350,
          "_id": "5e8cf7e1b9b93a4c7dc2d68d"
      }
  ]
  ```

* **`$addToSet`**

  > The `$addToSet` operator adds a value to an array unless the value is already present, in which case `$addToSet` does nothing to that array.

  Syntax: `{ $addToSet: { <field1>: <value1>, ... } }`

  **Behavior**

  `$addToSet` only ensures that there are no duplicate items added to the set and does not affect existing duplicate elements. `$addToSet` does not guarantee a particular ordering of elements in the modified set.

  **Missing Field**

  If you use `$addToSet` on a field that is absent in the document to update, `$addToSet` creates the array field with the specified value as its element.

  **Field is Not an Array**

  If you use `$addToSet` on a field that is not an array, the operation will fail. For example, consider a document in a collection foo that contains a non-array field colors.

  ```json
  {
    "name": "elon",
    "userId": 971349,
    "companies": "tesla,spacex",
    "_id": "5e8cf7e1b9b93a4c7dc2d69e"
  }
  ```

  The following `$addToSet` operation on the non-array field colors fails:

  ```js
  await collection.update(
    { name: "elon" },
    { $addToSet: { companies: "neuralink" } }
  );
  ```

  **Value to Add is An Array**

  If the value is an array, `$addToSet` appends the whole array as a single element.

  Consider a document in a collection `users` containing an array field `companies`:

  ```json
  {
    "name": "elon",
    "userId": 971349,
    "companies": ["tesla", "spacex"],
    "_id": "5e8cf7e1b9b93a4c7dc2d69e"
  }
  ```

  The following operation appends the array `["neuralink", "openai"]` to the `companies` field:

  ```js
  await collection.update(
    { name: "elon" },
    { $addToSet: { companies: ["neuralink", "openai"] } }
  );
  ```

  The `companies` array now includes the `["neuralink", "openai"]` array as an element:

  ```json
  {
    "name": "elon",
    "userId": 971349,
    "companies": ["tesla", "spacex", ["neuralink", "openai"]],
    "_id": "5e8cf7e1b9b93a4c7dc2d69e"
  }
  ```

  > NOTE: To add each element of the value separately, we will support the use of `$each` modifier with `$addToSet` in the future releases.


    **Example**

    Consider a collection `users` with the following document:

    ```json
    {
        "name": "elon",
        "userId": 971349,
        "companies": ["tesla" ,"spacex"],
        "_id": "5e8cf7e1b9b93a4c7dc2d69e"
    }
    ```

    **Add to Array**

    The following operation adds the element `"neuralink"` to the `companies` array since `"neuralink"` does not exist in the array:

    ```js
    await collection.update(
        { name: "elon" },
        { $addToSet: { "companies": "neuralink" } }
    );
    ```

    This will result in the following document:

    ```json
    {
        "name": "elon",
        "userId": 971349,
        "companies": ["tesla" ,"spacex", "neuralink"],
        "_id": "5e8cf7e1b9b93a4c7dc2d69e"
    }
    ```

    **Value Already Exists**

    The following `$addToSet` operation has no effect as `"spacex"` is already an element of the `companies` array:

    ```js
    await collection.update(
        { name: "elon" },
        { $addToSet: { "companies": "spacex" } }
    );
    ```

- **`$pop`**

  > The `$pop` operator removes the first or last element of an array. Pass `$pop` a value of `-1` to remove the first element of an array and `1` to remove the last element in an array.

  Syntax: `{ $pop: { <field>: <-1 | 1>, ... } }`

  **Behavior**

  The `$pop` operation fails if the `<field>` is not an array.

  If the `$pop` operator removes the last item in the `<field>`, the `<field>` will then hold an empty array.

  **Example**

  **Remove the First Item of an Array**

  Given the following document in a collection `users`:

  ```json
  {
    "name": "elon",
    "age": 48,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e",
    "companies": ["tesla", "spacex", "neuralink"]
  }
  ```

  The following example removes the first element (`"tesla"`) in the `companies` array:

  ```js
  await collection.update({ name: "elon" }, { $pop: { companies: -1 } });
  ```

  After the operation, the updated document has the first item `"tesla"` removed from its `companies` array:

  ```json
  {
    "name": "elon",
    "age": 48,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e",
    "companies": ["spacex", "neuralink"]
  }
  ```

  **Remove the Last Item of an Array**

  Given the following document in a collection `users`:

  ```json
  {
    "name": "elon",
    "age": 48,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e",
    "companies": ["spacex", "neuralink"]
  }
  ```

  The following example removes the last element (`"neuralink"`) in the `companies` array by specifying `1` in the `$pop` expression:

  ```js
  await collection.update({ name: "elon" }, { $pop: { companies: 1 } });
  ```

  After the operation, the updated document has the last item `"neuralink"` removed from its `companies` array:

  ```json
  {
    "name": "elon",
    "age": 48,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e",
    "companies": ["spacex"]
  }
  ```

- **`$pullAll`**

  > The `$pullAll` operator removes all instances of the specified values from an existing array. Unlike the `$pull` operator that removes elements by specifying a query, `$pullAll` removes elements that match the listed values.

  Syntax: `{ $pullAll: { <field1>: [ <value1>, <value2> ... ], ... } }`

  **Behavior**

  If a `<value>` to remove is a document or an array, `$pullAll` removes only the elements in the array that match the specified `<value>` exactly, including order.

  **Example**

  Given the following document in the `users` collection:

  ```json
  {
    "name": "elon",
    "age": 48,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e",
    "hours_worked": [12, 13, 13, 14, 15, 10, 12]
  }
  ```

  The following operation removes all instances of the value `13` and `12` from the `hours_worked` array:

  ```js
  await collection.update(
    { name: "elon" },
    { $pullAll: { hours_worked: [13, 12] } }
  );
  ```

  After the operation, the updated document has all instances of `13` and `12` removed from the `hours_worked` field:

  ```json
  {
    "name": "elon",
    "age": 48,
    "_id": "5e8cf7e1b9b93a4c7dc2d69e",
    "hours_worked": [14, 15, 10]
  }
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
  { $set: { age: 10 } }
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

#### Supported Update Operators for updateOne

[See Here](#supported-update-operators)

### collection.updateMany

> Modifies an existing document or documents in a collection.

Syntax: `collection.updateMany(filter, modification, [options])`

Returns a `Promise` that resolves on completion
The method can modify specific fields of an existing documents or replace existing documents entirely, depending on the update parameter.

#### Example

```javascript
var results = await collection.updateMany(
  { age: { $gt: 10 } },
  { $set: { age: 20 } }
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

#### Supported Update Operators for updateMany

[See Here](#supported-update-operators)

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
var result = await collection.deleteMany({ age: { $gt: 10 } });

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
var results = await collection.getHeadHash();
console.log(results); //zdpuAtmXUPRPueZocCXRaHwh8Hn6AnByMqupdE3iMboNWa1c1
```

### collection.syncFromHeadHash

> Syncs oplog to head hash.

Syntax: `collection.syncFromHeadHash(hash, [stopWrites])`

Returns a `Promise` that resolves on completion

If optional `stopWrites` is set to `true`; All write operations will be paused until sync has been completed. Rational is to provide a verifiable way that ensures the collection is synced.

#### Example

```javascript
await collection.syncFromHeadHash(
  "zdpuAtmXUPRPueZocCXRaHwh8Hn6AnByMqupdE3iMboNWa1c1"
);
```

### collection.import

> Import data into AvionDB

Syntax: `collection.import(data_in, [options], [progressCallback])`

Following parameters are supported by `options`:

- `type` (string): defines the data format of the data to be imported. Allowed values are:
  - `cbor`: Documents in cbor format
  - `json_mongo`: Documents in JSON format
  - `raw` : Documents in `raw` format (as if they were exported from AvionDB in `raw` format)

If no `type` is passed, it defaults to `json_mongo`.

`progressCallback` is an optional callback function for checking progress of import process.

It takes 3 parameters `currentLength`, `totalLength`, and `progressPercent`.

- `currentLength`: Length of total data stream imported out of `totalLength`.
- `totalLength`: Total length of the import data stream.
- `progressPercent`: (`currentLength` / `totalLength`) \* `100`

Here is an example `progressCallback` function.

```javascript
function progressCallback(currentLength, totalLength, progressPercent) {
  console.log(currentLength);
  console.log(totalLength);
  console.log(progressPercent);
}
```

#### Example

```javascript
await collection.import(
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
  { type: "json_mongo" },
  (currentLength, totalLength, progressPercent) => {
    console.log(currentLength);
    console.log(totalLength);
    console.log(progressPercent);
  }
);
```

### collection.export

> Syncs oplog to head hash.

Syntax: `collection.export([options])`

Returns a `Promise` that resolves to Documents to be exported.

Following parameters are supported by `options`:

- `query` (object): A `find()` query to filter the documents to be exported. By default, there is no query, hence all the documents are exported.

- `type` (string): defines the data format of the data to be exported. Allowed values are:
  - `cbor`: Documents in cbor format
  - `json_mongo`: Documents in JSON format
  - `raw` : Documents resulting from [`find()`](#collectionfind) query.

If no `type` is passed, it defaults to `json_mongo`.

- `limit` (number): The `limit` specifies the maximum _number_ of matching records that should be returned from a query. Useful in case if you want export only first X number of documents.

#### Example

```javascript
await collection.export({
  type: "json_mongo",
  limit: 100,
  query: {
    age: { $gt: 20 },
  },
});
```

## Static methods

### init

> Creates a new instance of AvionDB if not present already. If an instance with `name` is exists, then opens and returns the instance.

Syntax: `AvionDB.init(name, ipfs, options, orbitDbOptions)`

Returns a `Promise` that resolves to a database instance.

**NOTE: It is recommended to use `init` instead of `create` & `open` for better developer experience.**

`options` supports the following parameters:

- `path`: (string): path to be used to store aviondb files. By default it's `$HOME/.aviondb` for Linux based systems & `C:/Users/Username/.aviondb` for Windows based systems.

`orbitDbOptions` supports the following options

- `directory` (string): path to be used for the database files. By default it uses `'./orbitdb'`.

- `peerId` (string): By default it uses the base58 string of the ipfs peer id.

- `keystore` (Keystore Instance) : By default creates an instance of [Keystore](https://github.com/orbitdb/orbit-db-keystore). A custom keystore instance can be used, see [this](https://github.com/orbitdb/orbit-db/blob/master/test/utils/custom-test-keystore.js) for an example.

- `cache` (Cache Instance) : By default creates an instance of [Cache](https://github.com/orbitdb/orbit-db-cache). A custom cache instance can also be used.

- `identity` (Identity Instance): By default it creates an instance of [Identity](https://github.com/orbitdb/orbit-db-identity-provider/blob/master/src/identity.js)

- `offline` (boolean): Start the OrbitDB instance in offline mode. Databases are not be replicated when the instance is started in offline mode. If the OrbitDB instance was started offline mode and you want to start replicating databases, the OrbitDB instance needs to be re-created. Default: `false`.

Alternatively aviondb can be created from an orbitdb instance.
TODO: add docs on proper process.

#### Example

```javascript
import AvionDB from "aviondb";
var db = await AvionDB.init("DatabaseName", ipfs, options, orbitDbOptions);
```

### create

> Creates a new instance of AvionDB.

Syntax: `AvionDB.create(name, ipfs, options, orbitDbOptions)`

Returns a `Promise` that resolves to a database instance. Throws error if a database with `name` exists already.

`orbitDbOptions` supports the following options

- `directory` (string): path to be used for the database files. By default it uses `'./orbitdb'`.

- `peerId` (string): By default it uses the base58 string of the ipfs peer id.

- `keystore` (Keystore Instance) : By default creates an instance of [Keystore](https://github.com/orbitdb/orbit-db-keystore). A custom keystore instance can be used, see [this](https://github.com/orbitdb/orbit-db/blob/master/test/utils/custom-test-keystore.js) for an example.

- `cache` (Cache Instance) : By default creates an instance of [Cache](https://github.com/orbitdb/orbit-db-cache). A custom cache instance can also be used.

- `identity` (Identity Instance): By default it creates an instance of [Identity](https://github.com/orbitdb/orbit-db-identity-provider/blob/master/src/identity.js)

- `offline` (boolean): Start the OrbitDB instance in offline mode. Databases are not be replicated when the instance is started in offline mode. If the OrbitDB instance was started offline mode and you want to start replicating databases, the OrbitDB instance needs to be re-created. Default: `false`.

Alternatively aviondb can be created from an orbitdb instance.
TODO: add docs on proper process.

#### Example

```javascript
import AvionDB from "aviondb";
var db = await AvionDB.create("DatabaseName", ipfs, options, orbitDbOptions);
```

### open

> Opens an existing instance of AvionDB.

Syntax: `AvionDB.open(address, ipfs, options, orbitDbOptions)`

Returns a `Promise` that resolves to a database instance. Throws error if a database with `address` does not exist already.

`orbitDbOptions` supports the following options

- `directory` (string): path to be used for the database files. By default it uses `'./orbitdb'`.

- `peerId` (string): By default it uses the base58 string of the ipfs peer id.

- `keystore` (Keystore Instance) : By default creates an instance of [Keystore](https://github.com/orbitdb/orbit-db-keystore). A custom keystore instance can be used, see [this](https://github.com/orbitdb/orbit-db/blob/master/test/utils/custom-test-keystore.js) for an example.

- `cache` (Cache Instance) : By default creates an instance of [Cache](https://github.com/orbitdb/orbit-db-cache). A custom cache instance can also be used.

- `identity` (Identity Instance): By default it creates an instance of [Identity](https://github.com/orbitdb/orbit-db-identity-provider/blob/master/src/identity.js)

- `offline` (boolean): Start the OrbitDB instance in offline mode. Databases are not be replicated when the instance is started in offline mode. If the OrbitDB instance was started offline mode and you want to start replicating databases, the OrbitDB instance needs to be re-created. Default: `false`.

Alternatively aviondb can be created from an orbitdb instance.
TODO: add docs on proper process.

#### Example

```javascript
import AvionDB from "aviondb";
var db = await AvionDB.open(
  "/orbitdb/Qmd8TmZrWASypEp4Er9tgWP4kCNQnW4ncSnvjvyHQ3EVSU/DatabaseName",
  ipfs,
  options,
  orbitDbOptions
);
```

### listDatabases

> Lists the existing databases.

Syntax: `AvionDB.listDatabases()`

Returns a `Promise` that resolves to an Array of existing database names.

#### Example

```javascript
import AvionDB from "aviondb";
var db = await AvionDB.init("DatabaseName", ipfs, options, orbitDbOptions);
await AvionDB.listDatabases();
// prints ['DatabaseName']
```

### setDatabaseConfig

> Sets configuration for AvionDB.

Syntax: `AvionDB.setDatabaseConfig(options)`

#### Example

```javascript
import AvionDB from "aviondb";

// Sets a custom path for aviondb database list
AvionDB.setDatabaseConfig({ path: "./custom/database/path" });
```

### getDatabaseConfig

> Get configuration for AvionDB.

Syntax: `AvionDB.getDatabaseConfig()`

#### Example

```javascript
import AvionDB from "aviondb";

// Get database configuration
AvionDB.getDatabaseConfig();
```

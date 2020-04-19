# Changelog

Note: OrbitDB follows [semver](https://semver.org/). We are currently in alpha: backwards-incompatible changes may occur in minor releases.

## v0.1.0

### Supported APIs

This is the first "test" release of AvionDB 🎉 You can find all the supported [APIs here](API.md).

## v0.1.1

- Minor fixes in update operators.
- Update README.md
- Update API.md

## v0.2.0

### Bug Fixes
- Fixed [#9](https://github.com/dappkit/aviondb/issues/9). We are now able to list the collections using `db.listCollections()`.
- Fixed [#11](https://github.com/dappkit/aviondb/issues/11). 
    - Empty query operators `find({})` return all the documents in the collection.
    - If none of the documents match the query criteria, then `findOne` returns `null`.
    - If none of the documents match the query criteria, then `find` returns `[]`.

### Breaking Changes
- The signatures of the following functions have changed:
    - [`createCollection`](https://github.com/dappkit/aviondb/blob/master/API.md#aviondbcreateCollection)
    - [`openCollection`](https://github.com/dappkit/aviondb/blob/master/API.md#aviondbopenCollection)
    - [`create`](https://github.com/dappkit/aviondb/blob/master/API.md#create)
    - [`open`](https://github.com/dappkit/aviondb/blob/master/API.md#open)


### Features
- [Collection - binding db namespacing](https://github.com/dappkit/aviondb/commit/f792b5fefbbebddce5de72ac4402a5f34b039998)
- Following new functions have been added:
    - [`init`](https://github.com/dappkit/aviondb/blob/master/API.md#init)
    - [`initCollection`](https://github.com/dappkit/aviondb/blob/master/API.md#aviondbinitCollection)
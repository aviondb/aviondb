## AvionDB

![npm version](https://badge.fury.io/js/aviondb.svg)
<img src="https://img.shields.io/badge/Node.js-%3E%3D8.0.0-orange.svg?style=flat-square" /></a>
[![Build Status](https://travis-ci.com/dappkit/aviondb.svg?branch=master)](https://travis-ci.com/dappkit/aviondb)
<a href="https://david-dm.org/dappkit/aviondb"><img src="https://david-dm.org/dappkit/aviondb.svg?style=flat-square"/></a>
<a href="https://bundlephobia.com/result?p=aviondb"><img src="https://flat.badgen.net/bundlephobia/minzip/aviondb"></a>
[![Discord](https://img.shields.io/discord/616677539812868097?color=blueviolet&label=discord)](https://discord.gg/88YpNuQ)


> AvionDB aims to bring MongoDB-like developer interface to Web 3.0.

### We are working on the initial Specs. See [AvionDB Specs doc](https://github.com/dappkit/aviondb-specs/blob/master/README.md)

### Architecture

// TODO: Add Diagram & Description

### Project status & support

Status: **in active development**

***NOTE!*** *AvionDB is **alpha-stage** software. It means AvionDB hasn't been security audited and programming APIs and data formats can still change. We encourage you to [reach out to the maintainers](https://discord.gg/88YpNuQ) if you plan to use AvionDB in mission critical systems.*

This is the Javascript implementation and it works both in **Browsers** and **Node.js** with support for Linux, OS X, and windows . The minimum required version of Node.js is now 8.6.0 due to the usage of `...` spread syntax. LTS versions (even numbered versions 8, 10, etc) are preferred.

[//]: <> (To use with older versions of Node.js, we provide an ES5-compatible build through the npm package, located in `dist/es5/` when installed through npm.)

## Table of Contents

<!-- toc -->
- [Install](#install)
  - [Using NodeJS](#using-nodejs)
  - [In a web browser](#in-a-web-browser)
	- [In a web browser through Browserify](#through-browserify)
	- [In a web browser through Webpack](#through-webpack)
	- [In a web browser through CDN](#from-cdn)
- [Usage](#usage)
- [API](#api)
- [Development](#development)
  * [Run Tests](#run-tests)
  * [Benchmarks](#benchmarks)
- [Frequently Asked Questions](#frequently-asked-questions)
  * [Are there implementations in other languages?](#are-there-implementations-in-other-languages)
- [Contributing](#contributing)
- [Sponsors](#sponsors)
- [License](#license)

<!-- tocstop -->

## Install

This module uses node.js, and can be installed through npm:

### Using NodeJS

```
// Using npm
npm install --save aviondb

// Using Gtihub
npm install git+https://github.com/dappkit/aviondb.git
```

We support both the Current and Active LTS versions of Node.js. Please see [nodejs.org](https://nodejs.org/) for what these currently are. The minimum required version of Node.js is now 8.6.0 due to the usage of `...` spread syntax. LTS versions (even numbered versions 8, 10, etc) are preferred.

### In a web browser

#### **through Browserify**
Same as in Node.js, you just have to [browserify](http://browserify.org/) to bundle the code before serving it.
 > Note: The code uses `es6`, so you have to use [babel](https://babeljs.io/) to convert the code into `es5` before using `browserify`. 

#### **through webpack**
Same as in Node.js, you just have to [webpack](https://webpack.js.org/) to bundle the the code before serving it.
 > Note: The code uses `es6`, so you have to use [babel](https://babeljs.io/) to convert the code into `es5` before using `webpack`.

#### **from CDN**

Instead of a local installation (and browserification) you may request a remote copy of IPFS API from unpkg CDN.

To always request the latest version, use the following:
```html
<!-- loading the minified version -->
<script src="https://unpkg.com/aviondb/dist/src/Store.min.js"></script>
```

CDN-based AvionDB provides the `AvionDB` constructor as a method of the global `window` object. Example:

```javascript
// create an AvionDB instance
const aviondb = await AvionDB.create(ipfs) 
```


## Usage


### Example
```javascript
const AvionDB = require("aviondb");
const IPFS = require("ipfs");
const ipfs = new IPFS();

const runExample = async () => {
  // Initialize AvionDB Instance
  await ipfs.ready;
  const aviondb = await AvionDB.create(ipfs);
  
  aviondb.load(); // Loads the existing collections

  var collection = await aviondb.createCollection("employees"); // Collection interface

  // Hypothetical employee profile
  await collection.insertOne({
    hourly_pay: 15,
    name: "Elon",
    ssn: "562-48-5384",
    weekly_hours: 40,
  });

  var result = await collection.findOne({
    ssn: "562-48-5384", // Search by a single field Or many!
  });

  console.log(result); // Returns the matching document

  await collection.close(); // Collection will be closed.
  await aviondb.drop(); // Drops the database 
  await aviondb.close(); // Closes all collections and binding database.
  await ipfs.stop();
};

runExample();
```


## API
See [API.md](https://github.com/dappkit/aviondb/blob/master/API.md) for the full documentation.

## Development

### Run Tests
```
npm test
```

### Benchmarks

Run Write Benchmark
```
npm run benchmarks:write
```

Run Query Benchmark
```
npm run benchmarks:query
```

Run Update Benchmark
```
npm run benchmarks:update
```

See [benchmarks/](https://github.com/dappkit/aviondb/tree/master/test/benchmarks) for more info on benchmarks.


## Frequently Asked Questions

// TODO: Add FAQ Page

### Are there implementations in other languages?

We are working to implement AvionDB for following languages:

- NodeJS & Browser JS
- Typescript
- Golang
- Python

The best place to find out what is out there and what is being actively worked on is likely by asking in the [Discord](https://discord.gg/88YpNuQ). 

If you want or are planning to create an implementation in a language that is not listed here, then feel free to reach us out and discuss about it in the [Discord](https://discord.gg/88YpNuQ).

## Contributing

**Take a look at our organization-wide [Contributing Guide](https://github.com/dappkit/aviondb/blob/master/CONTRIBUTING.md).**

As far as code goes, we would be happy to accept PRs! If you want to work on something, it'd be good to talk beforehand to make sure nobody else is working on it. You can reach us [on Discord](https://discord.gg/88YpNuQ), or in the [issues section](https://github.com/dappkit/aviondb/issues).

If you want to code but don't know where to start, check out the issues labelled ["help wanted"](https://github.com/dappkit/aviondb/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22+sort%3Areactions-%2B1-desc).

Please note that we have a [Code of Conduct](CODE_OF_CONDUCT.md), and that all activity in the [@dappkit](https://github.com/dappkit) organization falls under it. Read it when you get the chance, as being part of this community means that you agree to abide by it. Thanks.

## Sponsors

The development of AvionDB has been sponsored by:

* [Dappkit](https://dappkit.io)

If you want to sponsor developers to work on AvionDB, please consider sponsoring using the "Sponsor" button on the top of the [AvionDB Github Page](https://github.com/dappkit/aviondb).

## License
[MIT](https://github.com/dappkit/aviondb/blob/master/LICENSE)

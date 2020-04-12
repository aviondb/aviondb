## IpfsDB

<img src="https://img.shields.io/badge/Node.js-%3E%3D8.0.0-orange.svg?style=flat-square" /></a>
[![Build Status](https://travis-ci.com/dappkit/ipfsdb.svg?branch=master)](https://travis-ci.com/dappkit/ipfsdb)
<a href="https://david-dm.org/dappkit/ipfsdb"><img src="https://david-dm.org/dappkit/ipfsdb.svg?style=flat-square"/></a>
[![Discord](https://img.shields.io/discord/616677539812868097?color=blueviolet&label=discord)](https://discord.gg/88YpNuQ)


> IpfsDB aims to bring MongoDB-like developer interface to Web 3.0.

### We are working on the initial Specs. See [IpfsSB Specs doc](https://github.com/dappkit/ipfsdb-specs/blob/master/README.md)

### Architecture

// TODO: Add Diagram & Description

### Project status & support

Status: **in active development**

***NOTE!*** *IpfsDB is **alpha-stage** software. It means IpfsDB hasn't been security audited and programming APIs and data formats can still change. We encourage you to [reach out to the maintainers](https://discord.gg/88YpNuQ) if you plan to use OrbitDB in mission critical systems.*

This is the Javascript implementation and it works both in **Browsers** and **Node.js** with support for Linux and OS X (Windows is not supported yet). The minimum required version of Node.js is now 8.6.0 due to the usage of `...` spread syntax. LTS versions (even numbered versions 8, 10, etc) are preferred.

[//]: <> (To use with older versions of Node.js, we provide an ES5-compatible build through the npm package, located in `dist/es5/` when installed through npm.)

## Table of Contents

<!-- toc -->

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

## Usage

### Install

```
npm install git+https://github.com/dappkit/ipfsdb.git
```

// TODO: Add usage example

## API
See [API.md](https://github.com/dappkit/ipfsdb/blob/master/API.md) for the full documentation.

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

See [benchmarks/](https://github.com/dappkit/ipfsdb/tree/master/test/benchmarks) for more info on benchmarks.


## Frequently Asked Questions

// TODO: Add FAQ Page

### Are there implementations in other languages?

We are working to implement IpfsDB for following languages:

- NodeJS & Browser JS
- Typescript
- Golang
- Python

The best place to find out what is out there and what is being actively worked on is likely by asking in the [Discord](https://discord.gg/88YpNuQ). 

If you want or are planning to create an implementation in a language that is not listed here, then feel free to reach us out and discuss about it in the [Discord](https://discord.gg/88YpNuQ).

## Contributing

**Take a look at our organization-wide [Contributing Guide](https://github.com/dappkit/ipfsdb/blob/master/CONTRIBUTING.md).**

As far as code goes, we would be happy to accept PRs! If you want to work on something, it'd be good to talk beforehand to make sure nobody else is working on it. You can reach us [on Discord](https://discord.gg/88YpNuQ), or in the [issues section](https://github.com/dappkit/ipfsdb/issues).

If you want to code but don't know where to start, check out the issues labelled ["help wanted"](https://github.com/dappkit/ipfsdb/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22+sort%3Areactions-%2B1-desc).

Please note that we have a [Code of Conduct](CODE_OF_CONDUCT.md), and that all activity in the [@dappkit](https://github.com/dappkit) organization falls under it. Read it when you get the chance, as being part of this community means that you agree to abide by it. Thanks.

## Sponsors

The development of IpfsDB has been sponsored by:

* [Dappkit](https://dappkit.io)

If you want to sponsor developers to work on IpfsDB, please consider sponsoring using the "Sponsor" button on the top of the [IpfsDB Github Page](https://github.com/dappkit/ipfsdb).

## License
[MIT](https://github.com/dappkit/ipfsdb/blob/master/LICENSE)

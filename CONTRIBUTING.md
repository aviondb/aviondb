# Contributing

Want to hack on IpfsDB? Awesome! Here are instructions to get you started.
They are not perfect yet. Please let us know what feels wrong or incomplete.

IpfsDB is an Open Source project and we welcome contributions of all sorts.
There are many ways to help, from reporting issues, contributing code, and
helping us improve our community.

### Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Security Issues](#security-issues)
- [Community Guidelines](#community-guidelines)
  - [Moderation](#moderation)
- [Reporting Issues](#reporting-issues)
- [Protocol Design](#protocol-design)
- [Implementation Design](#implementation-design)
- [Community Improvement](#community-improvement)
- [A small note on licensing year](#a-small-note-on-licensing-year)
- [Translations](#translations)
- [Creating new modules](#creating-new-modules)
  - [Linting](#linting)
- [Submitting a PR](#submitting-a-pr)
- [Email List](#email-list)
- [Helping in other ways](#helping-in-other-ways)
- [Becoming a maintainer](#becoming-a-maintainer)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

### Security Issues

The IpfsDB protocols and their implementations are still in heavy development. This means that there may be problems in our protocols, or there may be mistakes in our implementations. We take security vulnerabilities very seriously. If you discover a security issue, please bring it to our attention right away!

If you find a vulnerability that may affect live deployments -- please send your report privately to [vasa@dappkit.io](mailto:vasa@dappkit.io). Please DO NOT file a public issue.

If the issue is a protocol weakness or something not yet deployed, just discuss it openly.

### Community Guidelines

We want to keep the IpfsDB community awesome, growing and collaborative. We need your help to keep it that way. To help with this we've come up with some general guidelines for the community as a whole:

- Be nice: Be courteous, respectful and polite to fellow community members: no regional, racial, gender, or other abuse will be tolerated. We like nice people way better than mean ones!

- Encourage diversity and participation: Make everyone in our community feel welcome, regardless of their background and the extent of their contributions, and do everything possible to encourage participation in our community.

- Keep it legal: Basically, don't get anybody in trouble. Share only content that you own, do not share private or sensitive information, and don't break laws.

- Stay on topic: Make sure that you are posting to the correct channel and avoid off-topic discussions. Remember when you update an issue or respond to an email you are potentially sending to a large number of people. Please consider this before you update. Also remember that nobody likes spam.

There is also a more extensive [Code of conduct](CODE_OF_CONDUCT.md) which we follow.

#### Moderation

In cases where community members transgress against the values above or in the Code, members of the IpfsDB Community Moderation team will use a three-strike warning system, where the aggressor will be warned twice before they are permanently excluded from IpfsDB community spaces. This code applies to Gitter, IRC, and GitHub, and any other future space that the IpfsDB community uses for communication. For interactions between IpfsDB community members outside of this space, the code also applies if the interactions are reported and deemed to be interfering with community members safely working on IpfsDB together. Moderation conversations, where more serious than simple warnings, will occur in private repositories or by email to ensure anonymity for reporters, and to ensure the safety of the moderators. To report an instance, please see the emails in the [Code of Conduct](CODE_OF_CONDUCT.md).

### Reporting Issues

If you find bugs, mistakes, inconsistencies in the IpfsDB specs, code or
documents, please let us know by filing an issue at the appropriate issue
tracker. No issue is too small.

### Protocol Design

When considering protocol design proposals, we are looking for:

- A description of the problem this design proposal solves
- Discussion of the tradeoffs involved
- Review of other existing solutions
- Links to relevant literature (RFCs, papers, etc)
- Discussion of the proposed solution

Please note that protocol design is hard, and meticulous work. You may need to review existing literature and think through generalized use cases.

### Implementation Design

When considering design proposals for implementations, we are looking for:

- A description of the problem this design proposal solves
- Discussion of the tradeoffs involved
- Discussion of the proposed solution

### Community Improvement

The IpfsDB community requires maintenance of various "public infrastructure" resources. These include documentation, GitHub repositories, CI build bots, and more. There is also helping new users with questions, spreading the word about IpfsDB, and so on. Soon, we will be planning and running conferences. Please get in touch (in particular, send  [@vasa-develop](mailto:vasa@dappkit.io) an email) if you would like to help out.

### A small note on licensing year

Please don't update the year in the license files. Our policy is:

- Don't remove dates already in notices.
- Don't bother adding dates in new notices.
- Don't bother updating years in notices.

Thanks.

### Translations

This community moves very fast, and documentation swiftly gets out of date. If you would like to add a translation, please open an issue and ask the project captain for a given repository before filing a pull request, so that we do not waste efforts.

If anyone has any issues understanding the English documentation, please let us know! If you would like to do so privately, please email [@vasa-develop](mailto:vasa@dappkit.io). We are very sensitive to language issues, and do not want to turn anyone away from hacking because of their language.

#### Linting

When contributing code, please "lint first and ask questions later." We use https://standardjs.com to lint our code.

1. Install [`standard`](https://standardjs.com/):

```sh
$ npm i -D standard # npm install --save-dev standard
```

2. Add the `lint` script to `package.json`.

```json
{
  "scripts": {
    "lint": "standard --env=mocha"
  }
}
```

3. Run `standard --fix` to fix current issues.

```sh
$ npx standard --fix
```

4. Run the linter.

```
$ npm run lint
```


***Note:*** If you'd rather have the environment set permanently (for instance, so that your editor can notice it), add this to the `package.json`:

 ```json
{
  "standard": {
    "env": [
      "mocha"
    ]
  }
}
```

You can also exclude files:

```json
{
 "standard": {
   "ignore": "lib/es5/**/*.js"
 }
}
```

For extra credit, install [`jq`](https://stedolan.github.io/jq/) and `sponge` from GNU's `moreutils` and do it in one line:

```sh
$ jq '.scripts.lint="standard --env=mocha"' package.json | sponge package.json
```

### Submitting a PR

When submitting a PR, keep these things in mind:

* **This is open source.** We're working on it! We try to get to PRs as often as we can, but if we don't respond for a few days, feel free to politely ping.
* **Add tests!** The more, the better. We aim for 100% code coverage for testing.
* **Lint first, ask questions later.** When submitting a PR (or creating a new repository), please adhere to the [`standard`](https://standardjs.com/) style. This helps us cut down on bike shedding immensely.
* **Open an issue to discuss big PRs _before_ making them.** We don't want your work to be undercut by a simple workaround we could have implemented before! Discussion is the best way to ensure you're on the right track.

### Email List

You can join our emailing list [here](https://simpleaswater.com/#subscribe).

### Helping in other ways

Dappkit occasionally is able to hire developers for part time or full time positions, to work on IpfsDB. If you are interested, check our hiring status at [Dappkit's website](https://dappkit.io/). If you'd like to help in other ways, send an email to [vasa@dappkit.io](mailto:vasa@dappkit.io).

### Becoming a maintainer

If you want to help us with triaging issues, merging PRs, writing code, and maintaining repositories, we would be overjoyed. Maintenance is hard work, and all of the help that we can get from contributors is appreciated. Becoming a maintainer is currently an informal process - stick around for a while, help out where you can, and show the core team that you're interested in more than just having the Dappkit logo on your GitHub profile. Once you think you're ready, reach out to [@vasa-develop](mailto:vasa@dappkit.io) on [Discord](https://discord.gg/88YpNuQ) or by his linked email: he'll talk to to team, and we'll let you know what we think at that stage.

Occasionally, we'll give people access rights straight out of the gate because they have proved themselves before, or because they're the most logical choice for maintainership for certain repositories. For instance, if you wrote a Groovy implementation of IpfsDB, and you want to move it into the IpfsDB organization, you'll retain your maintainer rights for that repository.

If you ever feel that someone should not have maintainer rights, send an email to the community team. Let's talk about it together.

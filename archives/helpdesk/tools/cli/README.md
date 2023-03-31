Table of Content
---
<!-- TOC START min:1 max:4 link:true asterisk:false update:true -->
- [Overview](#overview)
  - [Install](#install)
    - [Install with NPM](#install-with-npm)
    - [Build Yourself](#build-yourself)
    - [Update](#update)
    - [Both](#both)
  - [Getting Started](#getting-started)
<!-- TOC END -->

# Overview

The CLI tool is currently quite rough, and its main function is to let the Storage Provider Lead perform their duties in a more user-friendly manner than the [extrinsics](https://testnet.joystream.org/#/extrinsics) tab. For this reason, the guide will focus primarily on this side of the tool's functionality.


## Install

There are two ways of installing the CLI.

If you are, or are planning to, run a `storage-node`, build your own node/runtime, or host your own instance of `Pioneer` the CLI is bundled in the [joystream-monorepo](https://github.com/Joystream/joystream). In that case, go [here](#build-yourself). If not, you may have an easier time using the [NPM-package](#install-with-npm).


### Install with NPM
If you have [NPM](https://www.npmjs.com/get-npm) installed:

```
$ npm install -g @joystream/cli
```
Depending on your `npm` source, this might return some errors.

This can be resolved in by:

1. Try without -g:
```
$ npm install @joystream/cli
```
2. Configure npm:
```
$ nano ~/.npmrc
# Append the line below
prefix = ${HOME}/.npm-packages
# save and exit
```
And then (again without -g):
```
npm install @joystream/cli
```
3. If none of the above works, you are in a rush, you don't want to try another `npm` source, you're the only one using this computer - you still shouldn't do it, but:
```
$ npm install -g @joystream/cli --unsafe-perm
```

### Build Yourself

To get the CLI up and running, on a Mac or Linux based system, you need `yarn`. On Debian based Linux, you will not have much success using `apt`, but you can check out [this guide](/roles/storage-providers/README.md#install-yarn-and-node-on-linux) for help.

```
$ cd ~/
$ git clone https://github.com/Joystream/joystream.git
$ cd joystream
$ ./setup.sh
# this requires you to start a new session. if you are using a vps:
$ exit
$ ssh user@ipOrURL
# on your local machine, just close the terminal and open a new one
$ yarn build:packages
$ cd cli
$ yarn link
```

### Update
```
$ cd joystream
$ cd cli
$ yarn unlink
$ cd bin
$ yarn unlink
$ cd ~/joystream
$ rm -rf node modules
$ yarn cache clean
$ ./setup.sh
# this requires you to start a new session. if you are using a vps:
$ exit
$ ssh user@ipOrURL
# on your local machine, just close the terminal and open a new one
$ yarn build:packages
$ cd cli
$ yarn link
```

### Both
```
# Test that it's working:
$ joystream-cli help
```
Which should return the output below:

```
Command Line Interface for Joystream community and governance activities

VERSION
  @joystream/cli/0.5.0 linux-x64 node-v14.16.1

USAGE
  $ joystream-cli [COMMAND]

TOPICS
  account         Accounts management - create, import or switch currently used account
  api             Inspect the substrate node api, perform lower-level api calls or change the current api provider uri
  content         Interactions with content directory module - managing vidoes, channels, assets, categories and curator groups
  council         Council-related information and activities like voting, becoming part of the council etc.
  working-groups  Working group lead and worker actions

COMMANDS
autocomplete display autocomplete installation instructions
  help          display help for joystream-cli
```

## Getting Started

The first time you run a command, you will be prompted to set your API-endpoint. This will determine which node you are talking to. If you are running a node locally, you can choose `localhost`. If not, you can connect to the public node, or select a custom endpoint. You can also go the [api](#api) section to do it manually.

The first time you want to perform an action that requires a key, you will be asked to import one. You can also go the [account](#account) section to do it manually.

Note that your imports and setting are stored locally at:
- `/home/<Username>/.local/share/joystream-cli` (Linux)
- `c:\Users\<Username>\AppData\Roaming\joystream-cli` (Windows)
- `/Users/<Username>/Library/Application Support/joystream-cli` (Mac OS)

For each command, try `--help` for info on `args` and `options`. For an overview of all `help` outputs, and more info on the CLI, go [here](https://github.com/Joystream/joystream/tree/master/cli).

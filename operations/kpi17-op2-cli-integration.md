# KPI 17.OP-2 - CLI Integration in Pioneer

## Scope

This paper summarizes the research done in scope of [*KPI 17.OP-2 - CLI Integration in Pioneer*](https://blog.joystream.org/sumer-kpis/#17.OP-2). The purpose of this research was to define the extent to which integrating [Joystream CLI](https://github.com/Joystream/joystream/tree/master/cli) into Pioneer seems technically feasible. 

## Motivation
JSG assumes that the Joystream members have issues when using CLI from command line. 

## Research Notes
The Joystream CLI is fundamentally a single-user toolkit by design. Once installed on users' laptop, it allows a user to import their private keys into some form of local storage (on Mac, it's inside `~/Library/Application\ Support/joystream-cli/accounts`) and then, after at least one key was imported successfully, the CLI functionality can be used. However, scenarios where more than one user would share the same (global) Joystream CLI installation to do their routines, while technically possible, require creating separate accounts on the host machine for every new user. Such scenarios are insecure and cannot be recommended, because Joystream CLI physically stores user private keys on filesystem thus exposing them to potential theft. 

Technically speaking, Joystream CLI is a stateful command line tool, which only works when its internal state has at least one valid key. 

The challenge to integrate Joystream CLI with either Pioneer governance app, or community-managed Joystreamstats app has to first address the above design peculiarities. Specifically, the key management in Pioneer is done via the browsers' local storage. Meaning, user adds a new account or imports an existent one through a UI component which then saves and keeps this data in the browser storage. All subsequent on-chain actions taken by the user inside the app, are asked to be signed prior to executing them. While this pattern seems to be adopted by [Polkadot Apps] (https://polkadot.js.org/apps/), other alternatives exist using Polkadot JS extension or even custom-build wallet applications https://polkaswap.io/#/wallet


## Options considered

### 1. Integrating off-the-shelf Joystream CLI

Integrating off-the-shelf Joystream CLI doesn't seem to be feasible. Joystream CLI by its nature has to be installed on some backend system, but since the keys are managed by the browser, there would not be a possibility to invoke CLI commands from the browser without passing ones' keys over the wire to the backend. This approach doesn't follow basic private key management security considerations. 


### 2. Porting the Joystream CLI into a client app

Second option is to port the Joystream CLI into a client app. If this option is concerned, the costs of ownership become the main problem. Essentially, almost every command from the toolkit must be ported. As a result, two versions of CLI will co-exist: the original cmd-line one and the new one working client-side. Needless to say, supporting two versions of CLI and keeping their functionality in parity doesn't seem like a pleasant job to do. 

This option is a big investment, too. Again, due to the fact that the number of CLI commands is quite big. 

On a technical level this option seems possible if [react-signer](https://git.joystreamstats.live/Operations/joystream/src/helios/pioneer/packages/react-signer) is used to sign all transactions. 


### 3. Deprecate the Joystream CLI in favor of a React app 

Option 2 implies a very minimalistic UI similar to https://pioneer.joystreamstats.live/#/js or https://testnet.joystream.org/#/extrinsics that can be embedded retalively easy into either Pioneer or Joystreamstats, but it's possible to go for a more radical solution and invest into the feature-rich app (be it a fork of Pioneer or the standalone app) that would bring working with CLI to a whole new level. The polkadot js extension supports integration with dapps, see https://polkadot.js.org/docs/extension/usage. 

This may result in the existing CLI being deprecated and its support stopped at some point. 
Still, from all three options listed here, this one is the most pricey. 

## Additional steps taken as part of this research. 

While command line tools indeed often seem hard-to-use for non-technical users, I went ahead and created a [poll](https://2heaeebeemy.typeform.com/to/pEDj90Ph) to find out how its actual users rate its complexity. 







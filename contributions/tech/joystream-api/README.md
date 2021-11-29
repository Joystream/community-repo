# Joystream API Examples

Repo with examples on how to use the @joystream/types package along with @polkadot/api to communicate with a joystream full node.


## Building the code

```
yarn && yarn build
```

In case you have a compilation error saying:

```
node_modules/@joystream/types/content-working-group/index.d.ts:3:22 - error TS2614: Module '"../common"' has no exported member 'Credential'. Did you mean to use 'import Credential from "../common"' instead?

3 import { OptionText, Credential, SlashingTerms } from '../common';
                       ~~~~~~~~~~
Found 1 error.
```

Open the file ```node_modules/@joystream/types/content-working-group/index.d.ts``` in a text editor and remove the failing import, so that the line looks as follows: ``` import { OptionText, SlashingTerms } from '../common'; ```

Save the changes and re-run ```yarn && yarn build``` again, the build should work fine. 


## Example Scripts

### [general.js](src/examples/general.ts)

Ideal for newcomers. Contains the very basic APIs usage examples: get the last blockchain finalized block, get total coin issuance. 
Also shows how to iterate the events inside a given block.

```
node lib/examples/general.js
```

### [status.js](src/general/status.ts)

Another good starting point for newcomers to understand how APIs are called.

```
node lib/general/status.js
```

### [get-media-change.js](src/curators/get-media-change.ts)

Shows how to work with Substrate events and Extrinsics to get the information about Joystream media uploads. 

```
node lib/curators/get-media-change.js
```

### [council.js](src/examples/council.ts)

Shows how to use ```councilElection```, ```minting```, ```council``` APIs. 

```
node lib/examples/council.js
```

### [get-events-and-extrinsics.js](src/examples/get-events-and-extrinsics.ts)

Shows the variety of Substrate event Extrinsic types within a given range of blocks. 

```
node lib/examples/get-events-and-extrinsics.js
```

### [working-groups.js](src/examples/working-groups.ts)

Shows how to use a set of APIs related to Joystream working groups: ```storageWorkingGroup```, ```recurringRewards```, ```contentDirectoryWorkingGroup```. 

```
node lib/examples/working-groups.js
```

### [proposals.js](src/examples/proposals.ts)

Shows how to use a APIs related to Joystream DAO proposals ```proposalsEngine```, ```staking```, ```members```. 

```
node lib/examples/proposals.js
```

### Javascript scripts

There are some untyped Javascript scripts available for working with the data directory. You can run them using yarn: 

```
//shows the available scripts
yarn script index

yarn script exportDataDirectory
yarn script listDataDirectory

```

or execute them in [Pioneer JS Toolbox](https://testnet.joystream.org/#/js) 
# KPI 27.II-3 - Minting and Burning

Warn report is `unknownSources.log` which contains all the `WARN` blocks, where we cannot calculate what affected the issuance (e.g. a bug with burned stake for Working Groups)

Full report is `mintingAndBurning.log` which contains all the blocks, where minting and/or burning affected the total issuance

**Full minting and burning log** is uploaded as a github gist as per request, and can be accessed [here](https://gist.github.com/oleksanderkorn/d8fef9e023737645ac0bb971978e389b)
## Minting Sources:
### Event-based
* `balances.BalanceSet` - when sudo account sets new balance, amount is taken from event data
* `proposalsEngine.ProposalStatusUpdated` - when proposal with type **Spending** (`isSpending`) is approved and executed, amount is taken from proposal params
* `staking.Reward` - when validators and nominators are getting staking reward, amount is taken from event data
### Non-event-based
* `Working groups workers recurring rewards` - to understand when reward increase issuance we check `next_payment_at_block` at the previous block hash, assuming next block worker will be paid out
## Burning Sources
### Event-based
* `proposalsEngine.ProposalStatusUpdated` - when proposal is rejected or expired, fee is burned (hardcoded value of 5000 JOY)
### Extrinsic-based
* `balances.transfer` - transfer to burn address leads to burning, amount taken from extrinsics tip
* `members.buyMembership` - when new member is registered, fee amount is taken from `members.paidMembershipTermsById`
* `proposalsEngine.cancelProposal` - when proposal is cancelled, cancellation fee is burned (hardcoded value of 10000 JOY)
* `utility.batch` - burned amount taken from extrinsics tip
* `staking.bond` - burned amount taken from extrinsics tip
* `session.setKeys` - burned amount taken from extrinsics tip
* `staking.nominate` - burned amount taken from extrinsics tip
* `members.buyMembership` - burned amount taken from extrinsics tip
* `operationsWorkingGroup.updateRewardAmount` - when storage worker reward amount is updated, amount is added to `amount_per_payout` property of specific worker rewardRelationship
* `contentDirectoryWorkingGroup.updateRewardAmount` - when storage worker reward amount is updated, amount is added to `amount_per_payout` property of specific worker rewardRelationship
* `storageWorkingGroup.updateRewardAmount` - when storage worker reward amount is updated, amount is added to `amount_per_payout` property of specific worker rewardRelationship

### Unknown Sources
All the minting and burning changes which are not calculated by the script are listed in `unknownSources.log`. 
One is [`balances.BalanceSet`](https://pioneer.joystreamstats.live/#/explorer/query/1609074) to the wrong address, which lead to the burning of `4909336 JOY` by `sudo.sudo` extrinsics.
All the other warnings (22 of 23 warnings) are burning events caused by the runtime bug, when working groups workers application stake was burned.

## Running script
`yarn ` - load project dependencies

`yarn start <startBlock> <endBlock>` - Generates some files in `report` folder:
 - `mintingAndBurning.log`: every line is a block where totalIssuance has been changed, showing new issuance, previous issuance, tokens minted and burned. Every line is prefixed with `INFO` if minting and burning source is calculated, `WARN` if the source is unknown

 - `unknownSources.log`: every line is a block where totalIssuance has been changed, showing new issuance, previous issuance, tokens minted and burnedbut the source is **unknown**, meaning we only add `WARN` lines here

 - `mintingAndBurning.json`: detailed report of what exactly changed the issuance in a specific block (e.g. Staking Reward, Cancelled Proposal, Spending Proposal, Set Sudo Balance, Recurring Rewards, Membership Creation, Transfer to Burn Address, Proposal Rejection, Proposal Expiration)
# KPI 25.II-3 - Minting and Burning Part 1
## Minting Sources:
### Event-based
* `staking.Reward` - reward for staking to validators/nominators
* `proposalsEngine.ProposalStatusUpdated` - spending proposal execution increase issuance
* `balances.BalanceSet` - when sudo account sets new balance
### Non-event-based
* `recurring rewards` - to understand when reward increase issuance we check `next_payment_at_block` at the previous block hash, assuming next block worker will be paid
## Burning Sources
### Event-based
* `balances.Transfer` - transfer to burn address
* `members.MemberRegistered` - member registration fee
* `proposalsEngine.cancelProposal` - cancellation fee
* `utility.batch` - tip is burned
* `staking.bond` - tip is burned
* `session.setKeys` - tip is burned
* `staking.nominate` - tip is burned
* `members.buyMembership` - tip is burnedc

## Running script
`yarn start <startBlock> <endBlock>` - Generates two files in `report` folder: s
 - `mintingAndBurning.log`: every line is a block where totalIssuance has been changed, showing new issuance, previous issuance, tokens minted and burned. Every line is prefixed with `INFO` if minting and burning source is calculated, `WARN` if the source is unknown

 - `mintingAndBurning.json`: detailed report of what exactly changed the issuance in a specific block (e.g. Staking Reward, Cancelled Proposal, Spending Proposal, Set Sudo Balance, Recurring Rewards, Membership Creation, Transfer to Burn Address)
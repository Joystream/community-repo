# KPI 25.II-3 - Minting and Burning Part 1

- Minting Events:
    "staking.Reward" - reward for staking to validators/nominators
    "proposalsEngine.ProposalStatusUpdated" - spending proposal execution increase issuance
    "balances.BalanceSet" - sudo set balance 
- Burning Events:
    "balances.Transfer" - transfer to burn address
    "members.MemberRegistered" - member registration fee
    "proposalsEngine.cancelProposal" - cancellation fee
    "utility.batch" - tip is burned
    "staking.bond" - tip is burned
    "session.setKeys" - tip is burned
    "staking.nominate" - tip is burned
    "members.buyMembership" - tip is burned

## Running script
`yarn start <startBlock> <endBlock>` - Generates two files in `report` folder: s
 - `mintingAndBurning.log`: every line is a block where totalIssuance has been changed, showing new issuance, previous issuance, tokens minted and burned. Every line is prefixed with `INFO` if minting and burning source is calculated, `WARN` if the source is unknown

 - `mintingAndBurning.json`: detailed report of what exactly changed the issuance in a specific block (e.g. Staking Reward, Cancelled Proposal, Spending Proposal, Set Sudo Balance, Recurring Rewards, Membership Creation, Transfer to Burn Address)
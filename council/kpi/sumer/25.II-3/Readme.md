# KPI 25.II-3 - Minting and Burning Part 1

## Running script
`yarn start <startBlock> <endBlock>` - Generates two files in `report` folder: s
 - `mintingAndBurning.log`: every line is a block where totalIssuance has been changed, showing new issuance, previous issuance, tokens minted and burned. Every line is prefixed with `INFO` if minting and burning source is calculated, `WARN` if the source is unknown

 - `mintingAndBurning.json`: detailed report of what exactly changed the issuance in a specific block (e.g. Staking Reward, Cancelled Proposal, Spending Proposal, Set Sudo Balance, Recurring Rewards, Membership Creation, Transfer to Burn Address)
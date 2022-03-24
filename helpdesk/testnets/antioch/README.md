# Launch of Antioch

Antioch was launched as a new chain on the 7th of April 2021, after a chain split bug resulted in the "fall" of [Babylon](/testnets/babylon) (broken link).

## Migration
A lot of the state and "history" was migrated from Babylon:
- All memberships (as of block #2718912)
- Most balances`*` (as of block #2528244):
  - all those associated with a membership `root` or `controller`
  - all tokens staked for [Council Members](/roles/council-members) and their voters, but as "free" balance
  - all tokens staked for (as "free" balance), and the balance of the "role" key of, active [Content Curators](/roles/content-curators) and [Storage Providers](/roles/storage-provider)
  - all tokens staked in [Proposals](/proposals)
  - all tokens staked for [Validators and Nominators](/roles/validators), although slashed tokens was deducted
  - all accounts that had been used for balance transfers (sent or received) after block #1292266
- The [Forum](/README.md#on-chain-forum) (as of block #2718912)
- Old [Proposals](/proposals) history and discussions, although only in "viewable" in [Pioneer](https://testnet.joystream.org/#/proposals/historical)
- The [Fiat Pool](/tokenomics/README.md#fiat-pool)


`*`
- The `Total Issuance` at the snapshot was: 442442844 tJOY
- The `Total Exported Issuance` was: 440615492 tJOY
- "Lost" tokens: 1827352 tJOY ~ 0.41%

If some of your tokens were "lost" in the transfer, you can "claim" these until the end of April 2021.

## Changes
After the upgrade, all roles, e.g. `Validators`, `Storage Providers` and `Curators` were fired from their position. The Council that was elected prior to the chain split was set by `sudo` for the first term.

Some parameter changes were made, mostly related to the Council Election.

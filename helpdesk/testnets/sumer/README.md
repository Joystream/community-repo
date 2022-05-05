# Launch of Sumer

Sumer was launched via a runtime upgrade on the 27th of May 2021, replacing the previous testnet, [Antioch](/testnets/antioch).

## Migration
Most of the state and "history" was migrated from Constantinople as part of the runtime upgrade:
- All memberships
- All balances
- The [Forum](/README.md#on-chain-forum)
- [Proposals](/proposals) history and discussions, although only in "viewable" in [Pioneer](https://testnet.joystream.org/#/proposals/historical)
- The [Fiat Pool](/tokenomics/README.md#fiat-pool)
- Roles were preserved (i.e. people with roles retained these, even though some software upgrades may have been required, depending on the role)

Channels and media content were not migrated due to the new content directory not supporting these.

## Changes

Content uploads are now possible through the Joystream Studio interface rather than through the clunky CLI-dependent flow.
The main "structural" change was the introduction of the builder/operations working group.
Storage Providers needed to update their software, and the CLI tool also needed to be updated to work properly.

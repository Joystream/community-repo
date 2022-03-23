# Runtime Parameters - ([Bounty 23](https://pioneer.joystreamstats.live/#/proposals/249), #289)

This lists and briefly describes chain constants that are changed via [runtime](https://github.com/Joystream/joystream/tree/master/runtime) upgrades for Joystream [substrate](https://github.com/paritytech/substrate) based testnets.
With the [Olympia release](https://github.com/Joystream/joystream/issues/2855) parameter [profiles](https://github.com/Joystream/joystream/pull/3462) are introduced.

Changing [constants](https://github.com/Joystream/joystream/blob/master/runtime/src/constants.rs) requires [test deployments](./Network-deployment) for verification and extensive testing to catch bugs.
- `MILLISECS_PER_BLOCK`: defines target duration per block. Actual average duration varies depending on [network performance](https://github.com/Joystream/community-repo/blob/master/contributions/research/validators/Babylon/11.4_Research_Max_Validator_Change_report.md).
- `BONDING_DURATION`: days user has to wait when unbonding tokens staked for [validation](https://github.com/Joystream/helpdesk/tree/master/roles/validators#rewards).
- `EPOCH_DURATION_IN_BLOCKS`: number of minutes per epoch

More constants are defined in [lib.rs](https://github.com/Joystream/joystream/blob/master/runtime/src/lib.rs):
- VERSION: it is [good practice](https://github.com/Joystream/joystream/tree/master/runtime#versioning-the-runtime) to increment spec on code updates.
- block parameters, discussed in [#2124](https://github.com/Joystream/joystream/issues/2124)
  - BlockHashCount
  - MaximumBlockWeight
  - AvailableBlockRatio
  - MaximumBlockLength
- `ExistentialDeposit`: minimal balance under which an account is removed from active balances to save chain space, [should be >0](https://github.com/paritytech/substrate/issues/10117).
- `TransferFee` and `CreationFee` are obsolete ([#2187](https://github.com/Joystream/joystream/pull/2187))
- `MaxLocks` neither changed nor discussed in Joystream, see [description](https://github.com/paritytech/substrate/pull/7103)
- `InitialMembersBalance`: [obsolete](https://github.com/Joystream/joystream/pull/1855)
- `REWARD_CURVE`: fixed [staking parameters](https://github.com/Joystream/helpdesk/tree/master/roles/validators#fixed-parameters) defining mining rewards, see [#507](https://github.com/Joystream/community-repo/issues/507)
  - min_inflation: minimal inflation for 0 stake
  - max_inflation: maximum inflation per year
  - ideal_stake: percent staked for maximum rewards
  - falloff: reward reduction for higher than ideal stake
  - max_piece_count: validator count limit
  - test_precision: internal, used in tests, [details](https://github.com/paritytech/substrate/blob/ded44948e2d5a398abcb4e342b0513cb690961bb/frame/staking/reward-curve/src/lib.rs#L54)
- working groups
  - MaxNumberOfCuratorsPerGroup: unused
  - ChannelOwnershipPaymentEscrowId: Channel Transfer Payments Escrow Account seed for ModuleId to compute deterministic AccountId
  - VideosMigrationsEachBlock: Video migrated in each block during migration
  - ChannelsMigrationsEachBlock: Channel migrated in each block during migration
  - MaxWorkerNumberLimit: max workers per WG
- proposals, see [#210](https://github.com/Joystream/joystream/issues/210)
  - ProposalCancellationFee
  - ProposalRejectionFee
  - ProposalTitleMaxLength
  - ProposalDescriptionMaxLength
  - ProposalMaxActiveProposalLimit
  - ProposalMaxPostEditionNumber: disabled
  - ProposalMaxThreadInARowNumber: unused
  - ProposalThreadTitleLengthLimit: 
  - ProposalPostLengthLimit
  - TextProposalMaxLength
  - `RuntimeUpgradeWasmProposalMaxLength`: code file size limit, last [increased for Alexandria](https://github.com/Joystream/joystream/issues/1216)
- [contracts pallet](https://paritytech.github.io/substrate/master/pallet_contracts/pallet/trait.Config.html), [likely obsolete](https://github.com/paritytech/substrate/issues/4268)
  - TombstoneDeposit: unused
  - RentByteFee: unused
  - RentDepositOffset: unused
  - SurchargeReward: unused
- storage constants, see [#2722](https://github.com/Joystream/joystream/issues/2722)
  - MaxDistributionBucketFamilyNumber
  - DataObjectDeletionPrize
  - BlacklistSizeLimit
  - MaxRandomIterationNumber
  - MaxNumberOfPendingInvitationsPerDistributionBucket
  - StorageModuleId
  - StorageBucketsPerBagValueConstraint
  - DefaultMemberDynamicBagNumberOfStorageBuckets
  - DefaultChannelDynamicBagNumberOfStorageBuckets
  - DistributionBucketsPerBagValueConstraint
  - MaxDataObjectSize

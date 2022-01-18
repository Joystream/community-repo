# Runtime Upgrade Verification

[KPI 18-25.OP-1](https://blog.joystream.org/sumer-kpis/#25.OP-1) ask to verify the [previous test](https://github.com/Joystream/community-repo/pull/294) on the staging network (`wss://staging-3.joystream.app/rpc`). To approach this task it is worth to recap the issues that needed to be tested and determine if the performed test was sufficient and executed correctly.

## Payload

1. Fix [bug #2505](https://github.com/Joystream/joystream/issues/2505) in the operations pallet that would burn stakes for crowded out applicants ([discord thread](https://discord.com/channels/811216481340751934/812344874099277824/858285144749768705)).

The way to test this is to check after the runtime update if
- the issuance decreases by the staked amount when an opening is filled.
- the stake for not hired workers is being unstaked.

2. Increase maximum mint capacity from 5M to 50M.

Here the task is simply to create a `SetWorkingGroupMintCapacity` proposal between 5 and 50M after the runtime update and check if it executes without errors.

## Test

### 1. Stake Withdrawal Bug

As per the [BlockEvents.md](BlockEvents.md) these accounts and memberships were created:
- #1854539: member 1998 (`5DLevi4g5aeTtZQ2oxnyP7vUMXN8tXK8dWaYHDBeJ1NeHzvk`, #1854445)
- #1854543: member 1999 (`5CLeviijADayNZQyosuCCRaQArpBV9a3mEoZxz8tMq3wx7PD`, #1854447)
- #1885770: member 2004 (`5HgVNNrfvo5sabBs9ofw7n4Ac2PBBc8z69W6jntdRq2DD7br`, #1885763)
- #1930815: member 2005 `w1111` (`5DJ7B5qdxpRTBiWNqr9MX5oYgYyb6aqcGTBE5RqWyZcYE3FQ`)
- #1930817: member 2006 `w2222` (`5Fe1QGWCsrctNsSRzzGhmmB9f9SPLY7hZgESiC5qd4cpTnrw`)

Following Openings for the OWG were filled (see [openings.md](openings.md) for all parameters):

| ID| Added | Filled | ApplicationIdToWorkerIdMap |
|---|---|---|---|
| 3 | #1883589 | #1887725 | {"5":1} |
| 4 | #1883620 | #1884268 | {} |
|   | #1884067 | code update  |
| 5 | #1887798 | #1887943 | {"10":2} |
| 6 | #1930574 | #1930902 | {} |
| 7 | #1930946 | #1931079 | { 13: 3, 14: 4 } |

All openings were filled after the update and for none the issuance decreased. This can be verified at https://staging-3.joystream.app/#/js with
```
[1883589, 1883620, 1887725, 1884268, 1887943, 1930902, 1931079].forEach(async block => {
  const before = await api.rpc.chain.getBlockHash(block-1)
  const after = await api.rpc.chain.getBlockHash(block+1)
  const issuanceBefore = await api.query.balances.totalIssuance.at(before)
  const issuanceAfter = await api.query.balances.totalIssuance.at(after)
  console.log(block, issuanceAfter - issuanceBefore)
})

1883620 0
1883589 0
1887725 0
1884268 0
1887943 0
1930902 0
1931079 5000
```

#### Conclusion

The issuance did not decrease for any opening even if no one was hired. Hence the bug can be considered fixed.


### 2. Mint Capacity Increase

The new runtime was applied at #1884067. At #1927154 the mint capacity was successfully set to 49999998.

| Block | Section | Method | Data |
|---|---|---|---|
| 1884067 | system | CodeUpdated |  |
| 1927135 | proposalsEngine | ProposalCreated | 1999<br>54 |
| 1927146 | proposalsEngine | Voted | 1999<br>54<br>"Approve" |
| 1927154 | proposalsEngine | Voted | 1998<br>54<br>"Approve" |
| 1927154 | proposalsEngine | ProposalStatusUpdated | 54<br>{"finalized":{"proposalStatus":{"approved":{"pendingExecution":null}},"finalizedAt":1927154,"encodedUnstakingErrorDueToBrokenRuntime":null,"stakeDataAfterUnstakingError":null}} |
| 1927154 | operationsWorkingGroup | MintCapacityChanged | 4<br>49999998 |
| 1927154 | proposalsEngine | ProposalStatusUpdated | 54<br>{"finalized":{"proposalStatus":{"approved":{"executed":null}},"finalizedAt":1927154,"encodedUnstakingErrorDueToBrokenRuntime":null,"stakeDataAfterUnstakingError":null}} |
| 1927344 | proposalsEngine | ProposalStatusUpdated | 52<br>{"finalized":{"proposalStatus":{"expired":null},"finalizedAt":1927344,"encodedUnstakingErrorDueToBrokenRuntime":null,"stakeDataAfterUnstakingError":null}} |

### Proposal 54

```
{
  parameters: {
    votingPeriod: 43,200,
    gracePeriod: 0,
    approvalQuorumPercentage: 60,
    approvalThresholdPercentage: 75,
    slashingQuorumPercentage: 60,
    slashingThresholdPercentage: 80,
    requiredStake: 50,000
  },
  proposerId: 1,999,
  title: Add 49999998 tJoy,
  description: Add 49999998 tJoy,
  createdAt: 1,927,135,
  status: {
    Finalized: {
      proposalStatus: {
        Approved: {
          Executed: null
        }
      },
      finalizedAt: 1,927,154,
      encodedUnstakingErrorDueToBrokenRuntime: null,
      stakeDataAfterUnstakingError: null
    }
  },
  votingResults: {
    abstensions: 0,
    approvals: 2,
    rejections: 0,
    slashes: 0
  }
}
```
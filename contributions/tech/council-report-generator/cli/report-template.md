# Sumer - Council Election Round #{electionRound}  - Performance Review and Minutes
## 1 - Basic Information
### 1.1 - Introduction
The council is expected to produce reports during each round and provide feedback in the form of workflow, challenges, thinking and performance as well as minutes covering important events during the council session.

Usernames referenced are Joystream usernames.
All times are calculated based on {averageBlockProductionTime} second blocktimes and not actual blocktimes.
The Council Round number is taken from the chain, the KPI rounds have an offset number.

### 1.2 - Council Round Overview
* Council Election Round: #{electionRound}
* Council Term: {councilTerm}
* Start Block: #{startBlockHeight}
* End Block: #{endBlockHeight}
* Forum thread for round feedback: N/A

### 1.3 - Council members & vote participation
* All usernames are listed in the order given by `activeCouncil` from chain state.
* Votes cast includes all types of vote (Approve, Reject, Abstain & Slash)
* In the event a proposal is not finalized within the current council, it will be indicated and current council votes will not be recorded due to system limitations

{councilTable}

### 1.4 - Council Roles
* Council Secretary
    * {councilSecretary}
* Council Deputy Secretary
    * {councilDeputySecretary}

### 1.5 - Council Mint & Budget Status
* Start minted: {startMinted}
* End minted: {endMinted}
* Total minted during council round: {totalNewMinted} tokens (+{percNewMinted}% from start)

* Budget proposal link: https://testnet.joystream.org/#/proposals/254
* Budget forum link: https://testnet.joystream.org/#/forum/threads/488

(Note: The council budget is now based on the rewards for roles, council payments and validator payments. Jsgenesis decides how much to set the mint to.)

## 2 - Minutes
### 2.1 - Proposal Overview
Proposal Types
- {proposalsCreated} Proposals Created
    - {textProposals} Text Proposals
    - {spendingProposals} Spending Proposals
    - {setWorkingGroupLeaderRewardProposals} SetWorkingGroupLeaderReward Proposals
    - {setWorkingGroupMintCapacityProposals} SetWorkingGroupMintCapacity Proposals
    - {beginReviewWorkingGroupLeaderApplicationProposals} BeginReviewWorkingGroupLeaderApplication Proposals
    - {terminateWorkingGroupLeaderRoleProposals} TerminateWorkingGroupLeaderRole
    - {fillWorkingGroupLeaderOpeningProposals} FillWorkingGroupLeaderOpening
    - {setValidatorCountProposals} SetValidatorCount
    - {addWorkingGroupLeaderOpeningProposals} AddWorkingGroupLeaderOpening
    - {setElectionParametersProposals} SetElectionParameters
    - {runtimeUpgradeProposals} RuntimeUpgrade

Proposal States
- {approvedExecutedProposals} Approved & executed proposals
- {canceledProposals} Canceled proposals
- {rejectedProposals} Rejected proposals
- {slashedProposals} Slashed proposals
- {expiredProposals} Expired proposals
- {activeProposals} proposals passed to next council
    - These proposals didn't gather enough quorum in the current council term, so the votes are reset and passed to the next council.

Failed Proposals
- {proposalsFailedForNotEnoughCapacity} NotEnoughCapacity failures
- {proposalsFailedForExecutionFailed} ExecutionFailed

- Total time for proposals to finalize: {totalProposalsFinalizeTime} hours
- Average time for proposals to finalize: {averageTimeForProposalsToFinalize} hours
    - This average is calculated from all proposals, including expired proposals but excluding canceled proposals.

### 2.2 - Proposal Breakdown

{proposalBreakdown}

### 2.4 - Select threads & events
N/A

### 2.5 - Working Group Spotchecks
- Storage Role Spot Check: N/A
- Curator Role Spot Check: N/A
- Operations Role Spot Check: N/A

## 3 - Review
### 3.1 - Workflow, Performance, Challenged & Thinking
* N/A

## 4 - Obligations
Council obligations are payments or items that carry through council sessions. These are noted so that future councils can easily see what items they should be aware of. Items can be removed from here once they have been resolved or become outdated.

### 4.1 Current Documents / Processes
- Council Report
    - Each council should produce a report which highlights important events, council participation, mint spending and other important facts surrounding the council term
- Council Budget
    - This is a proposal which tries to guide how many tokens the current council may have available to it during a term. This is a non binding proposal, so is mainly used as a guide for now.

### 4.2 Regular Payments / Proposals
- Council Mint
    - The council mint needs to be checked on a regular basis and in the event it is near depletion, a council member should notify a member of Jsgenesis in order for it to be refilled.
    - The council mint is set at a value decided by Jsgenesis.
- Council Roles
    - Council Secretary
        - This role was introduced in Council Round #18 and the payments are now managed by KPI rewards.
- Content Curator Mint
    - The Content Curator Mint currently has a maximum value of 5 million tokens.
    - The Content Curator Mint has to be filled periodically and the agreed amount was discussed earlier. The amount may change in the future, but the rewards for this role are dependent on the council passing these proposals in a timely fashion.
    - The Content Curator Lead role is expected to keep track of their mint level and any member of the Joystream platform can create a proposal to refill this mint.
- Storage Mint
    - The Storage Mint currently has a maximum value of 5 million tokens.
    - This mint has be refilled periodically
    - The Storage Lead role is expected to keep track of their mint level and any member of the Joystream platform can create a proposal to refill this mint.

### 4.2 Bounties
- Bounties are shown on the forum Bounties section: https://testnet.joystream.org/#/forum/categories/10

## 5 - Report changelog
- 04.11.2020
    - added working group review section

- 22.10.2020
    - updated budget section to reflect nature of new budget system
    - updated events to be threads & events

- 14.09.2020
    - removed member addresses and replaced with member IDs since they take less space
    - added realized and unrealized spending\
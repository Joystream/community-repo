# Tokenomics + Network Report

This is a report which explains the current state of the Joystream network in numbers. It pulls figures from the chain and tries to provide a basic level of information about the network, tokens and more. 

## 1.0 Basic Information

* Block range: {startBlock} - {endBlock}
* Date Range: {dateStart} - {dateEnd}
* Council session #: {councilRound}

## 2.0 Tokenomics

### 2.1 Token generation breakdown

| Property            | Start Block | End Block | % Change |
|---------------------|--------------|--------------|----------|
| Total Tokens Minted |  {startIssuance} | {endIssuance} | {percNewIssuance} |
| USD Pool |  {fiatStart} | {fiatEnd} | {fiatChange} |

| Role                | Value        |
|---------------------|--------------|
| Total Tokens Burned | {newTokensBurn} |
| Spending Proposals (Executed) | {spendingProposalsTotal} |
| Bounties paid       | {bountiesTotalPaid} |
| Validator Role      | {newValidatorRewards} |
{tokenomics}

### 2.2 Fiat Pool

| Property            | Start Block, USD | End Block, USD | % Change |
|---------------------|--------------|--------------|----------|
| USD Pool |  {fiatStart} | {fiatEnd} | {fiatChange} |

{dollarPoolRefills}

### 2.3 Mints

| Minted per Role             | Start Block           | End Block | Difference | % Change |
|-----------------------------|-----------------------|-----------|------------|----------|
{mintStats}

### 2.4 tJOY Inflation

* Start Block Exchange Rate, USD/1M tJOY: {priceStart}
* End Block Exchange Rate, USD/1M tJOY: {priceEnd}
* Inflation, %: {priceChange}

Negative value indicates deflation

## 3.0 Council

* Council session #: {councilRound}
* Number of council members: {councilMembers}
* Total number of proposals: {newProposals}
* Total number of Approved proposals: {newApprovedProposals}

### 3.1 Elections

| Property                    | Start Block  |
|-----------------------------|--------------|
| Total Applicants            | {electionApplicants} |
| Total Applicant Stake       | {electionApplicantsStakes} |
| Total Votes                 | {electionVotes} |

## 4 Roles

### 4.1 Validator Information

* Block generation time (average): {avgBlockProduction}

| Property                   | Start Block | End Block | % Change |
|----------------------------|--------------|--------------|----------|
| Number of Validators       | {startValidators} | {endValidators} | {percValidators} |
| Validator Total Stake      | {startValidatorsStake} | {endValidatorsStake} | {percNewValidatorsStake} |

{workingGroups}

## 5.0 User Generated Content
### 5.1 Membership Information
| Property          | Start Block | End Block | % Change |
|-------------------|--------------|--------------|----------|
| Number of members | {startMembers}|  {endMembers} | {percNewMembers} |

### 5.2 Media & Uploads
| Property                | Start Block | End Block | % Change |
|-------------------------|--------------|--------------|----------|
| Number of uploads       | {startMedia} | {endMedia}  |  {percNewMedia} |
| Size of content (MB)    |  {startUsedSpace} |  {endUsedSpace} | {percNewUsedSpace} |
| Number of channels      |  {startChannels} | {endChannels} | {percNewChannels} |

### 5.3 Forum Activity
| Property          | Start Block | End Block | % Change |
|-------------------|--------------|--------------|----------|
| Number of categories | {startCategories} | {endCategories} | {perNewCategories} |
| Number of threads    | {startThreads} | {endThreads} | {percNewThreads} |
| Number of posts      | {startPosts} | {endPosts} | {percNewPosts} |

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

| Property            | Value        |
|---------------------|--------------|
| Total Tokens Burned | {newTokensBurn} |
| Spending Proposals (Executed) | {spendingProposalsTotal} |
| Bounties paid       | {bountiesTotalPaid} |
| Validator Role      | {newValidatorRewards} |
| Storage Role        | {newStorageProviderReward} |
| Curator Role        | {newCuratorRewards} |
| Operations Role     | {newOperationsReward} |


### 2.3 Mints 
| Property                    | Start Block           | End Block | % Change |
|-----------------------------|-----------------------|--------------|----------|
| Council Mint Total Minted   | {startCouncilMinted}  | {endCouncilMinted} |{percNewCouncilMinted} |
| Curator Mint Total Minted   | {startCuratorMinted} | {endCuratorMinted} | {percCuratorMinted} |
| Storage Mint Total Minted   | {startStorageMinted} | {endStorageMinted} | {percStorageMinted} |
| Operations Mint Total Minted | {startOperationsMinted} | {endOperationsMinted} | {percOperationsMinted} |

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

| Property                    | Start Block | End Block | % Change |
|-----------------------------|--------------|--------------|----------|
| Number of Validators       |  {startValidators} | {endValidators} | {percValidators} |
| Validator Total Stake       | {startValidatorsStake} | {endValidatorsStake} | {percNewValidatorsStake} |


### 4.2 Storage Role
| Property                | Start Block | End Block | % Change |
|-------------------------|--------------|--------------|----------|
| Number of Storage Workers | {startStorageProviders} | {endStorageProviders} | {percNewStorageProviders} |
| Total Storage Stake (workers + lead) | {startStorageProvidersStake} | {endStorageProvidersStake} | {percNewStorageProviderStake} |

{storageProviders}

### 4.3 Curator Role
| Property                | Start Block | End Block | % Change |
|-------------------------|--------------|--------------|----------|
| Number of Curators      | {startCurators} | {endCurators} | {percNewCurators} |

{curators}

### 4.4 Operations Role
| Property                | Start Block | End Block | % Change |
|-------------------------|--------------|--------------|----------|
| Number of Operations Workers      | {startOperationsWorkers} | {endOperationsWorkers} | {percNewOperationsWorkers} |
| Total Operations Stake (workers + lead)  | {startOperationsStake} |  {endOperationsStake} | {percNewOperationstake} |

{operations}

## 5.0 User Generated Content
### 5.1 Membership Information
| Property          | Start Block | End Block | % Change |
|-------------------|--------------|--------------|----------|
| Number of members | {startMembers}|  {endMembers} | {percNewMembers} |

### 5.2 Media & Uploads
| Property                | Start Block | End Block | % Change |
|-------------------------|--------------|--------------|----------|
| Number of uploads       | {startMedia} | {endMedia}  |  {percNewMedia} |
| Size of content (MB)        |  {startUsedSpace} |  {endUsedSpace} | {percNewUsedSpace} |
| Number of channels      |  {startChannels} | {endChannels} | {percNewChannels} |

### 5.3 Forum Activity
| Property          | Start Block | End Block | % Change |
|-------------------|--------------|--------------|----------|
| Number of categories | {startCategories} | {endCategories} | {perNewCategories} |
| Number of threads    | {startThreads} | {endThreads} | {percNewThreads} |
| Number of posts      | {startPosts} | {endPosts} | {percNewPosts} |

# Tasks for 1st term

WIP

## Storage WG 

#### 1. Setup storage system 
Get the system operational as soon as possible which meaning:
- Sufficient buckets (as required by the runtime) operational
- System and bucket level configurations are "good"
- Non-operational buckets are turned off, to avoid failed requests
- Bags quickly "moved" as new buckets are online, and others fail
- Expected replication rate should be no less than 5

#### 2. Maintain storage system 
Storage system should performs well in the following terms
- Low latency and reliable uploading.
- Very low probability of permanent data loss
- High upload speed.
- High upload volume capacity: many simultaneous parallel uploads.
- A high upload speed to distributors.
- A low replication latency for a new data objects to all providers for the given bag.
- A low synchronization time of new storage providers.
- Basic level of denial of service resistance at the public upload API.

Council will be conducting experiments to put load on the system, including denial of service attacks, spamming, and also posing as malicious workers. Expect Council to rent botnet services or other denial of service infrastructure to simulate at scale attacks.

#### 3. Logging 
Each transaction `tx:n` performed by the Lead role key, successful or not, must be logged.

This is not about the Council catching mistakes, but ensuring that the deployment is reproducible. 
Helpful for reviewing improvements, and lessons learned.

#### 4. Errors  
You must avoid the following   

##### 4.1 Permanent Data Object Loss
A confirmed data object can no longer be recovered from storage nodes, despite not being deleted on chain.

##### 4.2 Incorrect Reporting
Whereas a failure to provide the storage specific report, or omission of certain values will simply cause a bad score, incorrect data will, if discovered, count as a catastrophic error.

#### 5. Describe Processes and Procedures 
Create and get approval from the Council (via proposal) for all significant Processes/Procedures/Standards your working group needs to function effectively.

#### 6. Update Documentation
Review all sources of documentation related to the Working Group (such as Notion, Github, Handbook, etc.) and update any outdated information. 

#### 7. Maintain Storage system in public testnet. 
Provide any assistance needed if JSG/BWG reach you for the help in public testnet. You can assign the same worker to hold nodes both for testnet and mainnet. 

#### 7. Provide reports  
Submit your plan for the next term no later than 14400 blocks before the end of the current term. Please follow the specified [format](https://joystream.notion.site/Working-Group-Summary-976c881decb744b08c8f375a06807fa3). 

#### 8. Develop startegic plan 
Create an initial outline for your Working Group's strategic plan that covers more than one year period. Please be as detailed as possible.

#### Links to old scores (FYI)
- [Storage Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/storage-providers-score.md)
- [Storage Carthage Scores](https://gist.github.com/bwhm/2a8733fe35974d4cb90a34ab1916d2ca#storage-and-distribution)
- [General WG scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/general-working-group-score.md)

## Distribution WG 

TBD
#### Links to old scores (FYI)
- [Distribution Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/distributors-score.md)
- [Distribution Carthage Scores](https://gist.github.com/bwhm/2a8733fe35974d4cb90a34ab1916d2ca#storage-and-distribution)
- [General WG scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/general-working-group-score.md)

## Builders WG 

TBD
#### Links to old scores (FYI)
- [Builders Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/builders-score.md)
- [Builders Carthage Scores](https://gist.github.com/bwhm/2a8733fe35974d4cb90a34ab1916d2ca#storage-and-distribution)
- [General WG scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/general-working-group-score.md)

## HR Working Group 

TBD
#### Links to old scores (FYI)
- [HR Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/human-resources-score.md)
- [HR Carthage Scores](https://gist.github.com/bwhm/2a8733fe35974d4cb90a34ab1916d2ca#storage-and-distribution)
- [General WG scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/general-working-group-score.md)

## Forum WG 

TBD
#### Links to old scores (FYI)
- [Forum Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/forum-score.md)
- [Forum Carthage Scores](https://gist.github.com/bwhm/2a8733fe35974d4cb90a34ab1916d2ca#storage-and-distribution)
- [General WG scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/general-working-group-score.md)


## Marketing WG 

TBD
#### Links to old scores (FYI)
- [Marketing Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/marketers-score.md)
- [Marketing Carthage Scores](https://gist.github.com/bwhm/2a8733fe35974d4cb90a34ab1916d2ca#storage-and-distribution)
- [General WG scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/general-working-group-score.md)

## Content Curator WG 

TBD
#### Links to old scores (FYI)
- [Content Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/content-directory-score.md)
- [Content Carthage Scores](https://gist.github.com/bwhm/2a8733fe35974d4cb90a34ab1916d2ca#storage-and-distribution)
- [General WG scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/general-working-group-score.md)

## Gateways

TBD


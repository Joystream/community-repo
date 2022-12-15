# Tasks for 1st term

WIP

Below you can find tasks for every Working Group to accomplish.
There are no assessment criteria provided and no scoring points.
In the first term, the Council will assess the tasks based on their own discretion. 
A scoring system will be put into place in next terms.

## Storage WG 

#### 1. Setup storage system 
Get the system operational as soon as possible which means:
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

#### 5. Formally introduce Processes and Procedures 
Create and get approval from the Council (via proposal) for all significant Processes/Procedures/Standards your working group needs to function effectively.

#### 6. Update Documentation
Review all sources of documentation related to the Working Group (such as Notion, Github, Handbook, etc.) and update any outdated information. 

#### 7. Maintain Storage system in public testnet 
Provide any assistance needed if JSG/BWG reach you for the help in public testnet. You can assign the same worker to hold nodes both for testnet and mainnet. 

#### 7. Provide reports  
Submit your plan for the next term no later than 14400 blocks before the end of the current term. Please follow the specified [format](https://joystream.notion.site/Working-Group-Summary-976c881decb744b08c8f375a06807fa3). 

#### 8. Develop startegic plan 
Create an initial outline for storage WG's strategic plan that covers more than one year period. Please be as detailed as possible.

#### 9. Intellectual property

Let's find out which intellectual property and digital assets will stay with JSG and which will be transferred to storage WG. Prepare the list of such assets with their name, description and URLs.

Some more questions on this:

- Usage: How will we use these new assets?
- Payments: Who will pay for the services? What's the procedure?
- Asset protection: How will DAO protect their assets? Each time new members join the Joystream DAO council, it is important to ensure that they do not misuse its resources. These individuals will possess privileged information, which could cause harm to the DAO if it is not managed responsibly.


#### Links to old scores (FYI)
- [Storage Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/storage-providers-score.md)
- [Storage Carthage Scores](https://gist.github.com/bwhm/2a8733fe35974d4cb90a34ab1916d2ca#storage-and-distribution)
- [General WG scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/general-working-group-score.md)

## Distribution WG 

#### 1. Setup  distribution system  
Get the system operational as soon as possible which means:
- Sufficient buckets (as required by the runtime) operational
- System and bucket level configurations are "good"
- Non-operational buckets are turned off, to avoid failed requests
- Bags quickly "moved" as new buckets are online, and others fail
 
#### 2. Maintain distribution system 
Storage system should performs well in the following terms
- Low latency and reliable downloading.
- High download speed.
- High download volume capacity: many simultaneous parallel downloads.
- A high download speed from storage providers.
- A low replication latency for a new data objects to all distributors for the given bag.
- A low synchronization time of new distributors.

Council will be conducting experiments to put load on the system, including denial of service attacks, spamming, and also posing as malicious workers. Expect Council to rent botnet services or other denial of service infrastructure to simulate at scale attacks.

#### 3. Logging 
Each transaction `tx:n` performed by the Lead role key, successful or not, must be logged.

This is not about the Council catching mistakes, but ensuring that the deployment is reproducible. 
Helpful for reviewing improvements, and lessons learned.

#### 4. Errors   
You must avoid the following   

##### 4.1 No available sources to fetch a data object from
A data object is not available from any distributor, despite being held be an available storage node

##### 4.2 Old version
A node is operating (set as serving content) while being on an older version 4h after an upgrade has been published.

#### 5. Formally introduce Processes and Procedures  
Create and get approval from the Council (via proposal) for all significant Processes/Procedures/Standards your working group needs to function effectively.

#### 6. Update Documentation
Review all sources of documentation related to the distribution WG (such as Notion, Github, Handbook, etc.) and update any outdated information. 

#### 7. Maintain Storage system in public testnet 
Provide any assistance needed if JSG/BWG reach you for the help in public testnet. You can assign the same worker to hold nodes both for testnet and mainnet. 

#### 7. Provide reports
Submit your plan for the next term no later than 14400 blocks before the end of the current term. Please follow the specified [format](https://joystream.notion.site/Working-Group-Summary-976c881decb744b08c8f375a06807fa3). 

#### 8. Develop startegic plan
Create an initial outline for your distribution WG's strategic plan that covers more than one year period. Please be as detailed as possible.

#### 9. Intellectual property

Let's find out which intellectual property and digital assets will stay with JSG and which will be transferred to distribution WG. Prepare the list of such assets with their name, description and URLs.

Some more questions on this:

- Usage: How will we use these new assets?
- Payments: Who will pay for the services? What's the procedure?
- Asset protection: How will DAO protect their assets? Each time new members join the Joystream DAO council, it is important to ensure that they do not misuse its resources. These individuals will possess privileged information, which could cause harm to the DAO if it is not managed responsibly.

#### Links to old scores (FYI)
- [Distribution Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/distributors-score.md)
- [Distribution Carthage Scores](https://gist.github.com/bwhm/2a8733fe35974d4cb90a34ab1916d2ca#storage-and-distribution)
- [General WG scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/general-working-group-score.md)

## Builders WG 

The operations working group is unlike other working groups, in that they are only really being measured based on the quality of their output, as judged by Council.

The working group will generally focus on developing tools and enhancing existing applications (Pioneer, Atlas, CLI etc.) and the runtime which come together to make the Joystream platform as a whole. 

Their contributions to these tools and the creation of new ones are represented as a development score, which attempts to measure the volume and quality of development based on the resources available to the working group.

It should be kept in mind that this development activity is not purely restricted to Council tools and projects, but can also apply to community projects such as JoystreamStats.


#### 1. Testing Issues

A [github project](https://github.com/orgs/Joystream/projects/55) has been created for the Builder group. Go ahead and take a look at the testing issues and give it a try.

There is an open question whether Council has access to the dashboard or not. If not, a new link will be provided asap. 
 
#### 2. Pioneer Development

The Pioneer Development issues you can find in the sage GitHub spot as for [testing issues](https://github.com/orgs/Joystream/projects/55). 

There is an open question whether Council has access to the dashboard or not. If not, a new link will be provided asap. 

#### 3. General development 

The General Development issues pretty similar to Pioneer Development, though they are not about Pioneer. 
Check here for the [tickets](https://github.com/orgs/Joystream/projects/56). 

There is an open question whether Council has access to the dashboard or not. If not, a new link will be provided asap. 

#### 4. Formally introduce Processes and Procedures 
Create and get approval from the Council (via proposal) for all significant Processes/Procedures/Standards your working group needs to function effectively.

#### 5. Update Documentation 
Review all sources of documentation related to the Working Group (such as Notion, Github, Handbook, etc.) and update any outdated information. 

#### 6. Maintain Pioneer in public testnet
Provide any assistance needed if JSG/BWG reach you for the help in public testnet. You can assign the same worker to hold nodes both for testnet and mainnet. 

#### 7. Provide reports  
Submit your plan for the next term no later than 14400 blocks before the end of the current term. Please follow the specified [format](https://joystream.notion.site/Working-Group-Summary-976c881decb744b08c8f375a06807fa3). 

#### 8. Develop startegic plan 
Create an initial outline for builders working group's strategic plan that covers more than one year period. Please be as detailed as possible.

#### 9. Intellectual property 

Let's find out which intellectual property and digital assets will stay with JSG and which will be transferred to builders WG. Prepare the list of such assets with their name, description and URLs.

Some more questions on this:

- Usage: How will we use these new assets?
- Payments: Who will pay for the services? What's the procedure?
- Asset protection: How will DAO protect their assets? Each time new members join the Joystream DAO council, it is important to ensure that they do not misuse its resources. These individuals will possess privileged information, which could cause harm to the DAO if it is not managed responsibly.


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


#### 1. Setup storage system  - XXXXXXXXXXXXX
Get the system operational as soon as possible which means:
- Sufficient buckets (as required by the runtime) operational
- System and bucket level configurations are "good"
- Non-operational buckets are turned off, to avoid failed requests
- Bags quickly "moved" as new buckets are online, and others fail
- Expected replication rate should be no less than 5
 
#### 2. Maintain storage system  - XXXXXXXXXXXXX
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

#### 3. Logging  - XXXXXXXXXXXXX
Each transaction `tx:n` performed by the Lead role key, successful or not, must be logged.

This is not about the Council catching mistakes, but ensuring that the deployment is reproducible. 
Helpful for reviewing improvements, and lessons learned.

#### 4. Errors   - XXXXXXXXXXXXX
You must avoid the following   

##### 4.1 Permanent Data Object Loss - XXXXXXXXXXXXX
A confirmed data object can no longer be recovered from storage nodes, despite not being deleted on chain.

##### 4.2 Incorrect Reporting - XXXXXXXXXXXXX
Whereas a failure to provide the storage specific report, or omission of certain values will simply cause a bad score, incorrect data will, if discovered, count as a catastrophic error.

#### 5. Formally introduce Processes and Procedures  - XXXXXXXXXXXXX
Create and get approval from the Council (via proposal) for all significant Processes/Procedures/Standards your working group needs to function effectively.

#### 6. Update Documentation - XXXXXXXXXXXXX
Review all sources of documentation related to the Working Group (such as Notion, Github, Handbook, etc.) and update any outdated information. 

#### 7. Maintain Storage system in public testnet  - XXXXXXXXXXXXX
Provide any assistance needed if JSG/BWG reach you for the help in public testnet. You can assign the same worker to hold nodes both for testnet and mainnet. 

#### 7. Provide reports   - XXXXXXXXXXXXX
Submit your plan for the next term no later than 14400 blocks before the end of the current term. Please follow the specified [format](https://joystream.notion.site/Working-Group-Summary-976c881decb744b08c8f375a06807fa3). 

#### 8. Develop startegic plan  - XXXXXXXXXXXXX
Create an initial outline for your Working Group's strategic plan that covers more than one year period. Please be as detailed as possible.

#### 9. Intellectual property - XXXXXXXXXXXXX

Let's find out which intellectual property and digital assets will stay with JSG and which will be transferred to your WG. Prepare the list of such assets with their name, description and URLs.

Some more questions on this:

- Usage: How will we use these new assets?
- Payments: Who will pay for the services? What's the procedure?
- Asset protection: How will DAO protect their assets? Each time new members join the Joystream DAO council, it is important to ensure that they do not misuse its resources. These individuals will possess privileged information, which could cause harm to the DAO if it is not managed responsibly.


#### Links to old scores (FYI)
- [Forum Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/forum-score.md)
- [Forum Carthage Scores](https://gist.github.com/bwhm/2a8733fe35974d4cb90a34ab1916d2ca#storage-and-distribution)
- [General WG scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/general-working-group-score.md)


## Marketing WG 


#### 1. Setup storage system  - XXXXXXXXXXXXX
Get the system operational as soon as possible which means:
- Sufficient buckets (as required by the runtime) operational
- System and bucket level configurations are "good"
- Non-operational buckets are turned off, to avoid failed requests
- Bags quickly "moved" as new buckets are online, and others fail
- Expected replication rate should be no less than 5
 
#### 2. Maintain storage system  - XXXXXXXXXXXXX
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

#### 3. Logging  - XXXXXXXXXXXXX
Each transaction `tx:n` performed by the Lead role key, successful or not, must be logged.

This is not about the Council catching mistakes, but ensuring that the deployment is reproducible. 
Helpful for reviewing improvements, and lessons learned.

#### 4. Errors   - XXXXXXXXXXXXX
You must avoid the following   

##### 4.1 Permanent Data Object Loss - XXXXXXXXXXXXX
A confirmed data object can no longer be recovered from storage nodes, despite not being deleted on chain.

##### 4.2 Incorrect Reporting - XXXXXXXXXXXXX
Whereas a failure to provide the storage specific report, or omission of certain values will simply cause a bad score, incorrect data will, if discovered, count as a catastrophic error.

#### 5. Formally introduce Processes and Procedures  - XXXXXXXXXXXXX
Create and get approval from the Council (via proposal) for all significant Processes/Procedures/Standards your working group needs to function effectively.

#### 6. Update Documentation - XXXXXXXXXXXXX
Review all sources of documentation related to the Working Group (such as Notion, Github, Handbook, etc.) and update any outdated information. 

#### 7. Maintain Storage system in public testnet  - XXXXXXXXXXXXX
Provide any assistance needed if JSG/BWG reach you for the help in public testnet. You can assign the same worker to hold nodes both for testnet and mainnet. 

#### 7. Provide reports   - XXXXXXXXXXXXX
Submit your plan for the next term no later than 14400 blocks before the end of the current term. Please follow the specified [format](https://joystream.notion.site/Working-Group-Summary-976c881decb744b08c8f375a06807fa3). 

#### 8. Develop startegic plan  - XXXXXXXXXXXXX
Create an initial outline for your Working Group's strategic plan that covers more than one year period. Please be as detailed as possible.

#### 9. Intellectual property - XXXXXXXXXXXXX

Let's find out which intellectual property and digital assets will stay with JSG and which will be transferred to your WG. Prepare the list of such assets with their name, description and URLs.

Some more questions on this:

- Usage: How will we use these new assets?
- Payments: Who will pay for the services? What's the procedure?
- Asset protection: How will DAO protect their assets? Each time new members join the Joystream DAO council, it is important to ensure that they do not misuse its resources. These individuals will possess privileged information, which could cause harm to the DAO if it is not managed responsibly.


#### Links to old scores (FYI)
- [Marketing Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/marketers-score.md)
- [Marketing Carthage Scores](https://gist.github.com/bwhm/2a8733fe35974d4cb90a34ab1916d2ca#storage-and-distribution)
- [General WG scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/general-working-group-score.md)

## Content Curator WG 


#### 1. Setup storage system  - XXXXXXXXXXXXX
Get the system operational as soon as possible which means:
- Sufficient buckets (as required by the runtime) operational
- System and bucket level configurations are "good"
- Non-operational buckets are turned off, to avoid failed requests
- Bags quickly "moved" as new buckets are online, and others fail
- Expected replication rate should be no less than 5
 
#### 2. Maintain storage system  - XXXXXXXXXXXXX
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

#### 3. Logging  - XXXXXXXXXXXXX
Each transaction `tx:n` performed by the Lead role key, successful or not, must be logged.

This is not about the Council catching mistakes, but ensuring that the deployment is reproducible. 
Helpful for reviewing improvements, and lessons learned.

#### 4. Errors   - XXXXXXXXXXXXX
You must avoid the following   

##### 4.1 Permanent Data Object Loss - XXXXXXXXXXXXX
A confirmed data object can no longer be recovered from storage nodes, despite not being deleted on chain.

##### 4.2 Incorrect Reporting - XXXXXXXXXXXXX
Whereas a failure to provide the storage specific report, or omission of certain values will simply cause a bad score, incorrect data will, if discovered, count as a catastrophic error.

#### 5. Formally introduce Processes and Procedures  - XXXXXXXXXXXXX
Create and get approval from the Council (via proposal) for all significant Processes/Procedures/Standards your working group needs to function effectively.

#### 6. Update Documentation - XXXXXXXXXXXXX
Review all sources of documentation related to the Working Group (such as Notion, Github, Handbook, etc.) and update any outdated information. 

#### 7. Maintain Storage system in public testnet  - XXXXXXXXXXXXX
Provide any assistance needed if JSG/BWG reach you for the help in public testnet. You can assign the same worker to hold nodes both for testnet and mainnet. 

#### 7. Provide reports   - XXXXXXXXXXXXX
Submit your plan for the next term no later than 14400 blocks before the end of the current term. Please follow the specified [format](https://joystream.notion.site/Working-Group-Summary-976c881decb744b08c8f375a06807fa3). 

#### 8. Develop startegic plan  - XXXXXXXXXXXXX
Create an initial outline for your Working Group's strategic plan that covers more than one year period. Please be as detailed as possible.

#### 9. Intellectual property - XXXXXXXXXXXXX

Let's find out which intellectual property and digital assets will stay with JSG and which will be transferred to your WG. Prepare the list of such assets with their name, description and URLs.

Some more questions on this:

- Usage: How will we use these new assets?
- Payments: Who will pay for the services? What's the procedure?
- Asset protection: How will DAO protect their assets? Each time new members join the Joystream DAO council, it is important to ensure that they do not misuse its resources. These individuals will possess privileged information, which could cause harm to the DAO if it is not managed responsibly.


#### Links to old scores (FYI)
- [Content Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/content-directory-score.md)
- [Content Carthage Scores](https://gist.github.com/bwhm/2a8733fe35974d4cb90a34ab1916d2ca#storage-and-distribution)
- [General WG scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/general-working-group-score.md)

## Gateways

TBD


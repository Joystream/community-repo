# Tasks for 1st term

This page contains a list of tasks for every Working Group to accomplish in the mainnet 1st term.

In the first term, the Council will assess the tasks based on their own discretion. 
A scoring system will be put into place in next terms.

## All WGs 

#### 1. Formally introduce processes/procedures/standards 
Create and get approval from the Council (via proposal) for all significant processes/procedures/standards a working group needs to function effectively.

#### 2. Update Documentation
Review all sources of documentation related to a working group (such as Notion, Github, Handbook, etc.) and update any outdated information. 

#### 3. Provide reports  
Submit your plan for the next term no later than 14400 blocks before the end of the current term. Please follow the specified [format](https://joystream.notion.site/Working-Group-Summary-976c881decb744b08c8f375a06807fa3). 

#### 4. Develop startegic plan 
Create an initial outline for a working group's strategic plan that covers more than one year period. Please be as detailed as possible.

#### 5. Intellectual property

Let's find out which intellectual property and digital assets will stay with JSG and which will be transferred to a working group. Prepare the list of such assets with their name, description and URLs.

Some more questions on this:

- Usage: How will we use these new assets?
- Payments: Who will pay for the services? What's the procedure?
- Asset protection: How will DAO protect their assets? Each time new members join the Joystream DAO council, it is important to ensure that they do not misuse its resources. These individuals will possess privileged information, which could cause harm to the DAO if it is not managed responsibly.

#### 6. Errors
This section provides prguidance on what to avoid when doing tasks.

##### 6.1  Inadequate Report
An inadequate report made aboit the work peformed, for example by missing or incorrect information.

##### 6.2 Workflow Violation
Any deviance from the workflows is not accepted.

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
This section provides prguidance on what to avoid when doing tasks.

##### 4.1 Permanent Data Object Loss
A confirmed data object can no longer be recovered from storage nodes, despite not being deleted on chain.

##### 4.2 Incorrect Reporting
Whereas a failure to provide the storage specific report, or omission of certain values will simply cause a bad score, incorrect data will, if discovered, count as a catastrophic error.

#### 5. Maintain Storage system in public testnet 
Provide any assistance needed if JSG/BWG reach you for the help in public testnet. You can assign the same worker to hold nodes both for testnet and mainnet. 

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
This section provides prguidance on what to avoid when doing tasks.

##### 4.1 No available sources to fetch a data object from
A data object is not available from any distributor, despite being held be an available storage node

##### 4.2 Old version
A node is operating (set as serving content) while being on an older version 4h after an upgrade has been published.

#### 5. Maintain Storage system in public testnet 
Provide any assistance needed if JSG/BWG reach you for the help in public testnet. You can assign the same worker to hold nodes both for testnet and mainnet. 

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

#### 4. Maintain Pioneer in public testnet
Provide any assistance needed if JSG reach you for the help in public testnet. 


## HR Working Group 

#### 1. Recruitment

Work hand-in-hand with Council and WG Leads on recruiting the most capable individuals according to the demands of the DAO.

#### 2. HR market data 

Prepare salary benchmark for all roles in the DAO

#### 3. Bounty management

Encourage both new and existing members of the DAO to take on small to medium-sized one-time tasks in order to accomplish work that requires certain skills which are not present within the DAO or when the existing DAO members are overwhelmed with their routine work.

Bounties are created as per request of other WG or Council.

## Forum WG 

The forum working group activities relevant to scoring will, generally, fall into one of the following categories

Maintain a reasonable set of categories, allowing users to easily navigate the forum
- Moderate the forum: ideally, this means moving threads that were placed inappropriately, but also includes censoring anything that violates the content policy
- Forum (tech) support, including maintaining guides for how the forum works from a user point of view

Council may in some cases create posts or threads that the working group should deal with in one way or another.

#### 1. Categories set up

- Create a set of initial categories for the Forum, and ensure it works
- Request feedback from the Community
- With the below in mind, create a proposal to the Council outlining the categories and hierarchy within
- If approved, implement the changes. If not, revise and repeat 4
 
#### 2. Usage

Not (just) the Forum Lead to decide, but there a plethora of ways the community CAN communicate. Discord is probably the fastest, the proposal system is probably best for "big" things, and DMs are probably better for non-public communication or smalltalk.

However, the forum has it's benefit given that it's easy for all to know who you're talking with, and the messages are (somewhat) permanent.

Draft a proposal outlining this.

#### 4. Errors  
This section provides prguidance on what to avoid when doing tasks.

##### 4.1 Violation of Content Policy
Although not strictly the same, the concepts in the content policy applies to the forum as well. Any post or thread fitting the above, left unmoderated for 12h.

##### 4.1 Unwarrented deletion of a post or thread
Any thread or post that gets deleted, for any reason, must be justified in the report. If the grounds are found unwarranted (ie. not in line with any policy), or simply not mentioned in any report, it counts as a catastrophic error.

## Marketing WG 

The marketing working group activities will generally fall into one of the following categories:

- Research: Collecting information on the current state of the project and its base of participants, as well as researching other projects in the space as directed by the Council, or to facilitate current or future marketing campaigns.
- Content Creation: Creating blog posts, videos, graphics and other content to promote the project, and remixing content which may already exist (e.g. community calls) to be used in marketing campaigns.
- Partnerships: The field of work ranges from interacting with exchanges to collaborating with potential project applicants for Gateways.

#### 1. Update our external records 
- Develop (revise) the standard description of the Joystream project for use on other websites. 
- Reach out to other websites that feature information about Joystream, such as Coinmarketcap and Coingecko, and update the project information to ensure that details about the mainnet are accurate and current

#### 2. Assisst JSG
If JSG requests assistance, help them in promoting their Gleev platform and performing other minor jobs related to it.

## Content Curator WG 

Make sure you read and understand [Moderation, Featuring, Metadata Integrity rules.](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/content-directory-score.md)

#### 1. Moderation
Content moderation is applied swiftly and appropriately in accordance with the [Content Policy](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/content-policy.md).

#### 2. Errors
This section provides prguidance on what to avoid when doing tasks.

##### 2.1 Failure to apply moderation rules
Any item which violates the content guidelines is unmoderated more than 36 hours after being uploaded

##### 2.2 Video censored unjustly

Any video that shouldn't have been censored, gets censored without being reverted by the end of the period. Same applies if a video is censored without justification in the report (from REPORT_SCORE).

##### 2.3 Logging does not occur

No logs are kept.

##### 2.4 Featured Content Unplayable
If the hero video, or the hero of any category, is not playable and is not dealt within within 1 hour after the change

## Gateways WG

More clarity on the tasks for will appear upon roll out of the Gleev/ Atlas

# Appendix 

#### Outdated scoring guides 

- [Marketing Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/marketers-score.md)
- [Content Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/content-directory-score.md)
- [Distribution Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/distributors-score.md)
- [Forum Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/forum-score.md)
- [HR Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/human-resources-score.md)
- [Builders Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/builders-score.md)
- [Storage Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/storage-providers-score.md)

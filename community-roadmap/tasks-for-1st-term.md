# Tasks for 1st term

This page outlines the tasks that the Council and each Working Group should strive to complete during the first term of the Mainnet.

Be aware that comprehensive scoring system will be implemented in subsequent terms when it has been completely examined and is ready for use. This term Council will evaluate the assignments at their own discretion.

## All WGs 

#### 1. Governance setup 

Submit a proposal to the Council for approval of all major processes, procedures, and standards that are essential to the functioning of the working group.

#### 2. Documentation
Review all sources of documentation related to a working group (such as Notion, Github, Handbook, etc.) and update any outdated information. 

#### 3. Plans  
Submit your plan for the next term no later than 14400 blocks before the end of the current term. Please follow the specified [format](https://github.com/0x2bc/community-repo/blob/master/community-roadmap/tasks-for-1st-term.md#working-group-summary-template). 

#### 4. Startegic plan 
Create an initial outline for a working group's strategic plan that covers more than one year period. Please be as detailed as possible.

#### 5. Intellectual property

Let's find out which intellectual property and digital assets will stay with JSG and which will be transferred to a working group. Prepare the list of such assets with their name, description and URLs.

Some more questions on this:

- Usage: How will WG use these new assets?
- Payments: Who will pay for the services? What's the procedure?
- Asset protection: How will WG protect their assets? It is essential to make sure that whenever new members join the WG or Council, they are not abusing the resources available to them. As these individuals will have access to sensitive information, it is necessary to ensure that it is managed in a way that prevents any potential damage to the DAO.

#### 6. Openings

Maintain at least one opening for a role in the group at any point during a term.
The opening must be relevant, created in the current or last council period, and
- be well written and outlining any requirements, conditions, nice to haves, that is needed to get the job
- include a set of question that allows the applicant to distinguish themselves
- include a link to a forum thread, where any interested parties or applicants can ask questions, and the discord handle of the Lead
- include the latest bounty created by the group, to act as a skill test
Anyone applies or asks questions in the forum must be followed up within 48h

#### 7. Errors
This section provides guidance on what to avoid when doing tasks.

##### 7.1  Inadequate Report
An inadequate report made about the work peformed, for example by missing or incorrect information.

##### 7.2 Workflow Violation
Any deviance from the workflows is not accepted.

##### 7.3  Late plan
The plan is late by >14400 or blocks.

##### 7.4  No openings
No openings existed during the term.

## Storage WG 

#### 1. Setup storage system 
Get the system operational as soon as possible which means:
- Sufficient buckets (as required by the runtime) operational
- System and bucket level configurations are "good"
- Non-operational buckets are turned off, to avoid failed requests
- Bags quickly "moved" as new buckets are online, and others fail

#### 2. Maintain storage system 
Storage system should have:
- Low latency and reliable uploading.
- Very low probability of permanent data loss
- High upload speed.
- High upload volume capacity: many simultaneous parallel uploads.
- A high upload speed to distributors.
- A low replication latency for a new data objects to all providers for the given bag.
- A low synchronization time of new storage providers.
- Basic level of denial of service resistance at the public upload API.

Parameters
- Replication rate = 5
- System capacity >= 10 TB

Council will be conducting experiments to put load on the system, including denial of service attacks, spamming, and also posing as malicious workers. Expect Council to rent botnet services or other denial of service infrastructure to simulate at scale attacks.

#### 3. Logging 
Each transaction `tx:n` performed by the Lead role key, successful or not, must be logged.

This is not about the Council catching mistakes, but ensuring that the deployment is reproducible. 
Helpful for reviewing improvements, and lessons learned.

#### 4. Maintain Storage system in public testnet 
Provide any assistance needed if JSG/BWG reach you for the help in public testnet. You can assign the same worker to hold nodes both for testnet and mainnet. 

#### 5. Errors  
This section provides guidance on what to avoid when doing tasks.

##### 5.1 Permanent Data Object Loss
A confirmed data object can no longer be recovered from storage nodes, despite not being deleted on chain.

##### 5.2 Old version
A node is operating while being on an older version 24 after an upgrade has been published.

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

#### 4. Maintain Storage system in public testnet 
Provide any assistance needed if JSG/BWG reach you for the help in public testnet. You can assign the same worker to hold nodes both for testnet and mainnet. 

#### 5. Errors   
This section provides guidance on what to avoid when doing tasks.

##### 5.1 No available sources to fetch a data object from
A data object is not available from any distributor, despite being held be an available storage node

##### 5.2 Old version
A node is operating (set as serving content) while being on an older version 24h after an upgrade has been published.

## Builders WG 

#### 1. Testing and Development Issues

Continue to make progress as you have been doing in the past. Pick up testing or development issues and attempt to resolve them
- [https://github.com/orgs/Joystream/projects/55](https://github.com/orgs/Joystream/projects/55) 
- [https://github.com/orgs/Joystream/projects/56](https://github.com/orgs/Joystream/projects/56) 
 
 #### 2. Prioritize work

Work hand-in-hand with Council and WG Leads on Prioritizing the work  
- Pioneer (UI fixes)
- Security (runtime tests, fixes)
- WG Tools: curation interface, CDN performance monitoring
- Block Explorer
- Status Page
- Community GW (hosted atlas or alternative)

Hint how to do that (optional). You can use a management method where you paint a picture how the system is supposed to work in full swing in a year or two, then trying to retrace steps to get there. Ask @l1dev for more information if you would like to know more about this. This approach can help to gain a clearer understanding of what should be done first.

#### 3. Maintain Pioneer in public testnet
Provide any assistance needed if JSG reach you out for the help in public testnet. 

## HR Working Group 

#### 1. Talent pool 

Create a reserve of potential employees (in a format of spreadsheet) who are not currently part of any working groups, but who can be tapped into if these working groups has a vacancy. This spreadsheet will give us an opportunity to quickly reach out these workers in case of need. We will start off with a small number of individuals in the WGs across the DAO and should remain in contact with the rest of high potential users of the Joystream tesnet. Also this will help us identify where our greatest staffing needs may arise if we should to quickly increase our workforce.

#### 2. Recruitment

Work hand-in-hand with Council and WG Leads on recruiting the most capable individuals according to the demands of the DAO.
Recruitment must be initiated only by request of WG Leads or Council.

#### 3. Bounty management

Encourage both new and existing members of the DAO to take on small to medium-sized one-time tasks in order to accomplish work that requires certain skills which are not present within the DAO or when the existing DAO members are overwhelmed with their routine work.

Bounties must be created by request Leads or Council.

[Items to includ in the bounty description.](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/general-working-group-score.md#bounty-score)

## Forum WG 

The forum working group activities will, generally, fall into one of the following categories
- Maintain a reasonable set of categories, allowing users to easily navigate the forum
- Moderate the forum: ideally, this means moving threads that were placed inappropriately, but also includes censoring anything that violates the content policy
- Forum (tech) support, including maintaining guides for how the forum works from a user point of view

Council may in some cases create posts or threads that the working group should deal with in one way or another.

#### 1. Categories set up

- Create a set of initial categories for the Forum, and ensure it works
- Request feedback from the Community
- With the below in mind, create a proposal to the Council outlining the categories and hierarchy within
- If approved, implement the changes. If not, revise and repeat 4
 
#### 2. Usage

Not (just) the Forum Lead to decide, but there are different ways how the community CAN communicate. Discord is probably the fastest, the proposal system is probably best for "big" things, and DMs are probably better for non-public communication or smalltalk.

However, the forum has it's benefit given that it's easy for all to know who you're talking with, and the messages are (somewhat) permanent.

Draft a proposal outlining this.

#### 3. Errors  
This section provides guidance on what to avoid when doing tasks.

##### 3.1 Violation of [Content Policy](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/content-policy.md).
Although not strictly the same, the concepts in the content policy applies to the forum as well. Any post or thread fitting the above, left unmoderated for 12h.

##### 3.1 Unwarrented deletion of a post or thread
Any thread or post that gets deleted, for any reason, must be justified in the report. If the grounds are found unwarranted (ie. not in line with any policy), or simply not mentioned in any report, it counts as an error.

## Marketing WG 

The marketing working group activities will generally fall into one of the following categories:
- Research: Collecting information on the current state of the project and its base of participants, as well as researching other projects in the space as directed by the Council, or to facilitate current or future marketing campaigns.
- Content Creation: Creating blog posts, videos, graphics and other content to promote the project, and remixing content which may already exist (e.g. community calls) to be used in marketing campaigns.
- Partnerships: The field of work ranges from interacting with exchanges to collaborating with potential project applicants for Gateways.

#### 1. Update information
- Develop (revise) the standard description of the Joystream project for use on other websites. 
- Reach out to other websites that feature information about Joystream, such as Coinmarketcap and Coingecko, and update the project information to ensure that details about the mainnet are accurate and current

#### 2. Assisst JSG
If JSG requests assistance, help them in promoting their Gleev platform and performing other minor tasks related to it.

## Content Curator WG 

Make sure you read and understand [Moderation, Featuring, Metadata Integrity rules.](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/content-directory-score.md)

#### 1. Moderation
Content moderation is applied swiftly and appropriately in accordance with the [Content Policy](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/content-policy.md).

#### 2. Errors
This section provides guidance on what to avoid when doing tasks.

##### 2.1 Failure to apply moderation rules
Any item which violates the content guidelines is unmoderated more than 36 hours after being uploaded

##### 2.2 Video censored unjustly

Any video that shouldn't have been censored, gets censored without being reverted by the end of the period. Same applies if a video is censored without justification in the report.

##### 2.3 Logging does not occur

No logs are kept.

##### 2.4 Featured Content Unplayable
If the hero video, or the hero of any category, is not playable and is not dealt within within 1 hour after the change

## Gateways WG

More clarity on tasks for Gateways will appear upon roll out of the Gleev/ Atlas

# Council

#### 1. Set up DAO 
- Have the working groups deployed and operational asap
- Get the storage and distribution system up and running
- Get the forum working
- Set budgets for the groups, and if required, the council budget size and replenishment rate
- Establish workflows, tasks and reporting requirements with Leads and other CMs

Some more insights on how to make setup process smooth you can [find here.](https://docs.google.com/document/d/1KC8TgIDAnxRViRP5PIOvNQOvM4DbgXHQ8xitq5ZSqt4/edit#heading=h.k7v1a9t94nlw) 

#### 2. Errors
This section provides guidance on what to avoid when doing tasks.

##### 2.1 Block time too low
The average time between blocks was greater than 10s for more than a 2 hour interval.

##### 2.2 Member faucet empty
The membership faucet requires both that the Membership working group budget has sufficient JOY to pay the membershipPrice and that the Lead has sufficient invitations. If at any point during the council term, the faucet capacity is less than 5 new members, that counts as effectively empty.

# Appendix 

### Carthage scoring guides 

- [Marketing Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/marketers-score.md)
- [Content Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/content-directory-score.md)
- [Distribution Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/distributors-score.md)
- [Forum Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/forum-score.md)
- [HR Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/human-resources-score.md)
- [Builders Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/builders-score.md)
- [Storage Handbook Scores](https://github.com/Joystream/handbook/blob/92697066f2bf2d09752bfda5fba5da378fa812f4/testnet/council-period-scoring/storage-providers-score.md)


### Working Group Summary (Template) 

#### 1. 💵 Accounting

- **Budget at the start of the term:** X MtJOY 
- **Budget refilled during the term:** X MtJOY
- **Discretionary spendings**: X MtJOY
- **Lead rewards:** X MtJOY
- **Worker rewards:** X MtJOY
- **Budget at the end of the term:** X MtJOY

#### 2. Group Changes

##### Hires
##### Slashes
##### Firings

#### 3. Timesheet

|  | Work Hours |
| --- | --- |
| Lead |  |
| Worker 1 |  |
| <...> |  |

Lead Extra Hours:

the Timesheet is not relevant for Storage and Distribution WGs.

#### 4. List of completed tasks

#### 5. Ideas to improve your Working Group

_Optional item._
Write an Idea and a plan describing the implementation plan in detail to improve your WG.


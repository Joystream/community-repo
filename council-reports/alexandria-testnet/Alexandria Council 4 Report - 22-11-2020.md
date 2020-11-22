# Council Election Round #4 - Performance Review and Minutes
## 1 - Basic Information
### 1.1 - Introduction
The council is expected to produce reports during each round and provide feedback in the form of workflow, challenges, thinking and performance as well as minutes covering important events during the council session.

Usernames referenced are Joystream usernames.
All times are calculated based on 6 second blocktimes and not actual blocktimes.
The Council Round number is taken from the chain, the KPI rounds have an offset number.

This report was compiled by @tomato with assistance from @freakstatic

### 1.2 - Council Round Overview
* Council Election Round: #4
* Start Block: #662401
* End Block: #864001
* Forum thread for round feedback: https://testnet.joystream.org/#/forum/threads/149

### 1.3 - Council members & vote participation
* All usernames are listed in the order given by `activeCouncil` from chain state.
* Votes cast includes all types of vote (Approve, Reject, Abstain & Slash)
* In the event a proposal is not finalized within the current council, it will be indicated and current council votes will not be recorded due to system limitations

| Username             | Member ID | Prop. Votes Cast | CM Own Stake | CM Voter Stake |
|----------------------|-----------|------------------|--------------|----------------|
| @blackmass           | 361       |         6        | 2300000      | 2550000        |
| @anthony             | 129       |         5        | 3300000      | 2015000        |
| @supunssw            | 318       |         3        | 10000        | 4070000        |
| @freakstatic_council | 321       |         5        | 7000000      | 15000          |
| @fierydev            | 439       |         6        | 4432000      | 15000          |
| @sparky              | 319       |         1        | 6000000      | 0              |
|                      |           |                  |              |                |
| Total Stake          |           |                  |              | 31707000       |

### 1.4 - Council Roles
* Council Secretary
	* @freakstatic_council

### 1.5 - Council Mint & Budget Status
* Start minted: 27083000 tokens
* End minted: 32908500 tokens
* Total minted during council round: 5825500 tokens (+21.50% from start)
	* Minted from Spending proposals:  tokens
	* Minted for CM payments: tokens

* Budget proposal link: (No budget was submitted during this council session)
* Budget forum link: (No budget was submitted during this council session)

(Note: The council budget is now based on the rewards for roles, council payments and validator payments. Jsgenesis decides how much to set the mint to.)

## 2 - Minutes
### 2.1 - Proposal Overview
- 6 Proposals Created
	- 0 Text Proposals
	- 4 Spending Proposals
	- 0 SetWorkingGroupLeaderReward Proposals
	- 1 SetWorkingGroupMintCapacity Proposals
	- 1 SetContentWorkingGroupMintCapacity Proposals

- 5 Approved & executed proposals
	- Token value of spending proposals: 1885000 tokens
- 0 Canceled proposals
- 0 Rejected proposals
- 0 Slashed proposals
- 0 Expired proposals
	- Token value: N/A tokens
- 1 NotEnoughCapacity failures
	- Token value: 385000 tokens

- Total time for proposals to finalize: 113.92 hours
- Average time for proposals to finalize: 18.98 hours
	- This average is calculated from all proposals, including canceled and expired proposals.
	- Proposals which are not successfully voted by the current council are considered finalized at the final blockheight of the current council. So if the current council has 50 hours to vote on proposal, but does not fully vote and the proposal is passed onto the next council, this 50 hours is included in the average time to finalize.

### 2.2 - Proposal Breakdown
#### Proposal 42 - Refill Storage Working Group mint
- Proposal Link: https://testnet.joystream.org/#/proposals/42
- Proposal Type: SetWorkingGroupMintCapacity
	- Amount: 5000000
- Status: Executed
	- Time to finalize: 7334 blocks (12.22 hours)
- Created by: @rajcprem
- Participants: @anthony, @freakstatic_council, @blackmass, @fierydev

#### Proposal 43 - Council Report 3
- Proposal Link: https://testnet.joystream.org/#/proposals/43
- Proposal Type: Spending
	- Amount: 500000
- Status: Executed
	- Time to finalize: 7707 blocks (12.84 hours)
- Created by: @tomato
- Participants: @anthony, @freakstatic_council, @blackmass, @fierydev

#### Proposal 44 - Council 03 - Tokenomics Report
- Proposal Link: https://testnet.joystream.org/#/proposals/44
- Proposal Type: Spending
	- Amount: 385000
- Status: ExecutionFailed
	- Time to finalize: 24460 blocks (40.76 hours)
- Created by: @freakstatic_council
- Participants: @anthony, @supunssw, @freakstatic_council, @blackmass, @fierydev

#### Proposal 45 - Council 03 - Tokenomics Report
- Proposal Link: https://testnet.joystream.org/#/proposals/45
- Proposal Type: Spending
	- Amount: 385000
- Status: Executed
	- Time to finalize: 4911 blocks (8.18 hours)
- Created by: @freakstatic_council
- Participants: @supunssw, @sparky, @blackmass, @fierydev

#### Proposal 46 - Replenishing the mint for ContentCurator
- Proposal Link: https://testnet.joystream.org/#/proposals/46
- Proposal Type: SetContentWorkingGroupMintCapacity
	- Amount: 1000000
- Status: Executed
	- Time to finalize: 12714 blocks (21.19 hours)
- Created by: @maks_malensek
- Participants: @anthony, @freakstatic_council, @blackmass, @fierydev

#### Proposal 47 - KPI 4.3 - Appoint New Council Secretary
- Proposal Link: https://testnet.joystream.org/#/proposals/47
- Proposal Type: Spending
	- Amount: 1000000
- Status: Executed
	- Time to finalize: 11242 blocks (18.73 hours)
- Created by: @freakstatic_council
- Participants: @anthony, @supunssw, @freakstatic_council, @blackmass, @fierydev

### 2.4 - Select threads & events
- N/A

### 2.5 - Working Group Spotchecks
- No spot checks were performed by the council

## 3 - Review
### 3.1 - Workflow, Performance, Challenged & Thinking
* @freakstatic_council
	* Nothing much happened this council round....
	* The council secretary was hired in the middle of the round (we probably should avoid this) I had to step in and apply myself to fill this role. Without @tomato on the council all the others members were probably afraid of step in. I think this is normal since this job as some responsibilities and good knowledge of the platform/community is required. @tomato has previous created some docs about this role which helps a lot and he also reminder me of some important things during the council round. Thanks! :)
	* By looking at the Storage Status Reporting I notice that one storage providers seems to be down some days now. This is his URL: https://joystreamnode1.cloudstorey.in/storage
	* I'm checking this situation now... The next council should probably make sure that this situation has been resolved.
	* The Community Bounty #3 is assigned to @l1dev, his made some improvements in the Telegram bot code but still hasn't submitted any "Success events" until now.

## 4 - Obligations
Council obligations are payments or items that carry through council sessions. These are noted so that future councils can easily see what items they should be aware of. Items can be removed from here once they have been resolved or become outdated.

### 4.1 Current Documents / Processes
- Council Report
	- Each council should produce a report which highlights important events, council participation, mint spending and other important facts surrounding the council term
- Council Budget
	- This is a proposal which tries to guide how many tokens the current council may have available to it during a term. This is a non binding proposal, so is mainly used as a guide for now.

### 4.2 Documents WIP
- Tokenomics Reports
	- This is a periodic report which should be produced after each council round has concluded. It should serve as a tool to see the overall economics of the platform.
- Working Group Evaluations
	- This was introduced in KPI 15.5 and should serve as a way of evaluting the working groups, so far it hasn't been produced fully.

### 4.2 Regular Payments / Proposals
- Council Mint
	- The council mint needs to be checked on a regular basis and in the event it is near depletion, a council member should notify a member of Jsgenesis in order for it to be refilled.
	- The council mint is set at a value decided by Jsgenesis.
- Council Roles
	- Council Secretary
		- This role was introduced in Council Round #18 and the current payment is 2 million tokens per council round
- Content Curator Mint
	- The Content Curator Mint currently has a maximum value of 1 million tokens.
	- The Content Curator Mint has to be filled periodically and the agreed amount was discussed earlier. The amount may change in the future, but the rewards for this role are dependent on the council passing these proposals in a timely fashion.
	- The Content Curator Lead role is expected to keep track of their mint level and any member of the Joystream platform can create a proposal to refill this mint.
- Storage Mint
	- The Storage Mint currently has a maximum value of 1 million tokens.
	- This mint has be refilled periodically
	- The Storage Lead role is expected to keep track of their mint level and any member of the Joystream platform can create a proposal to refill this mint.
 
### 4.2 Bounties
- There are no outstanding bounties at this time.

## 5 - Report changelog
- 04.11.2020
	- added working group review section

- 22.10.2020
	- updated budget section to reflect nature of new budget system
	- updated events to be threads & events

- 14.09.2020
	- removed member addresses and replaced with member IDs since they take less space
	- added realized and unrealized spending
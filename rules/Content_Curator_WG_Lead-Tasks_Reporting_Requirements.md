# Content Curator WG Lead - Tasks + Reporting Requirements

*Pre-proposal Discussion https://testnet.joystream.org/#/forum/threads/371*

*Based on the KPIs https://blog.joystream.org/sumer-kpis/#11.8*

*Previous approved proposal https://testnet.joystream.org/#/proposals/79*

## Content Curator WG Lead requested to report once a week 
### This report should include:
1. A few notes from the Curator Lead regarding how they think things are going. This can include whether the tools they have are sufficient or any improvements that might need to be considered. This can be presented as a single paragraph or synospis.
2. A breakdown table of workers, along with any notes and an estimation of how the workers performance is. With required columns: ``Worker ID``,	``Name Worker``,	``Region / Time Zone``,	``Language``,	``Performance``,	``Notes``.
 - *Example https://testnet.joystream.org/#/forum/threads/335?replyIdx=12&page=2*
3. A breakdown of work. General idea of how many videos have been verified, how many videos are unmoderated, how many videos have had issues, what the most common issues faced are (missing thumbnails, license issues).
4. Video Statistic Overview for this week. Required columns: ``number of uploads``, ``video duration``, ``average duration``, ``median duration``, ``video file size (Mb)``, ``number of videos in each category``.
- *Example https://testnet.joystream.org/#/forum/threads/472?replyIdx=1*

### How to submit a report

- Content Curator Lead should create a PR on https://github.com/Joystream/community-repo/tree/master/workinggroup-reports/curator_group
- Create text proposal for approve by the council, including link to the PR
- Once the proposal is approved and PR merged - put a message on the forum https://testnet.joystream.org/#/forum/threads/335, including links to the PR and proposal

### WARN/SLASH/FIRE
if Lead misses the weekly report, he can be [WARN/SLASH/FIRE](https://github.com/Joystream/community-repo/blob/master/rules/Warn-Slash-Fire_rules_for_leads.md)

## Tasks

- The Lead must hire new Content Curators
- The Lead must adjust the workers rewards if required due to rate changes.
- The Lead should fire and/or slash non-performing workers.
- Lead (and/or other CWs) must be available and helpful in Discord and the forum.
- Provide summary of the weekly reports in the end of term
- Assign one/some of content curators (or hisself) to act as Bounty Managers for content bounties. List of current bounty can be checked in current council KPI https://blog.joystream.org/sumer-kpis/
- To check the details of the current Content Working Group Mint:
  - use the following chain state query to determine the current mint ID: `contentDirectoryWorkingGroup -> mint`
  - check the details of the mint using the following query: `minting -> mints.`
  - create a ``SetWorkingGroupMintCapacity`` proposal to refill WG mint

## Content Curator WG Lead Term Limits
For Leads the soft term limit is 1 month.
In the event the current lead is fired, they can stay on as:
- a guide
- a content curator
- be re-elected for a new term

Details [here](https://github.com/Joystream/community-repo/blob/master/rules/WG_Lead_Term_Limits.md)

*Most statistics can be found using the [Query Node Playground](https://hydra.joystream.org/graphql), and the examples [here](https://github.com/Joystream/helpdesk/tree/master/roles/content-curators/query-node-examples).*



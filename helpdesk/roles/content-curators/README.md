<p align="center"><img src="img/content-curators.svg"></p>

<div align="center">
  <h4>This is a guide for applying, and working as a Content Curator on the latest
  <a href="https://testnet.joystream.org/">Joystream Testnet</a>.<h4>
  <h4>If you are interested in the Content Curator Lead role, please instead visit this
    <a href="../content-curator-lead">dedicated guide</a>.<h4>
</div>



Table of Contents
==
<!-- TOC START min:1 max:4 link:true asterisk:false update:true -->
- [Overview](#overview)
- [Hiring Process](#hiring-process)
  - [Applying for a Role](#applying-for-a-role)
    - [Accepting applications](#accepting-applications)
      - [Track the status of your application](#track-the-status-of-your-application)
      - [Withdraw or change your application](#withdraw-or-change-your-application)
    - [Applications in review](#applications-in-review)
      - [Track the status of your application](#track-the-status-of-your-application-1)
  - [Hiring complete](#hiring-complete)
- [Working as a curator](#working-as-a-curator)
  - [Curation Policy](#curation-policy)
    - [Regular Checks](#regular-checks)
      - [Example](#example)
    - [Council Reports](#council-reports)
      - [Example](#example-1)
    - [Tools](#tools)
      - [Joystream Player](#joystream-player)
      - [CLI](#cli)
      - [Hydra Playground](#hydra-playground)
    - [Policy](#policy)
      - [Videos](#videos)
      - [Channels](#channels)
    - [Discretion](#discretion)
  - [Curation Tools](#curation-tools)
    - [Censoring](#censoring)
    - [Category Management](#category-management)
      - [Create Category](#create-category)
      - [Update Category](#update-category)
      - [Delete Category](#delete-category)
  - [Content Directory](#content-directory)
    - [Categories](#categories)
    - [Licenses](#licenses)
- [Content Restrictions](#content-restrictions)
<!-- TOC END -->

# Overview

This page will contain all information on how to apply for the role of `Content Curator`, and how to perform the various tasks required for the job.

# Hiring Process

First, open [Pioneer](https://testnet.joystream.org/), and navigate to the `Working groups` sidebar. Here you will find an overview of the current `Content Curators`, and the `Content Lead`. In the `Opportunities` tab, you can get an overview of future, current and previous openings, along with terms, settings, status, and history (if applicable). The terms and settings include the following parameters to consider:

- `Max active applicants` - The maximum number of active applicants for an opening
- `Max review period length` - The maximum length (in blocks) of the review period
- `Application staking policy` - This stake applies for the application only
  - A fixed or minimum stake for the application
  - The length (in blocks) from an application has been resolved until the stake is returned
- `Role staking policy` - This stake applies for the role itself, and successful applicants will have these funds locked while being in the role
  - A fixed or minimum stake for the role
  - The length (in blocks) from an unsuccessful application has been resolved, or a successful applicant has quit or gotten fired, until the stake is returned
- `Reward policy` - The rewards (in `X [JOY]/N [blocks]`) for successful applicants


## Applying for a Role

In order to be able to successfully apply for a role as a `Content Curator`, you have to register a membership, which requires tokens. It should also be expected that there will be staking requirements, which will require more tokens. The exact terms should be clear from the listing.

You will be able to complete the application process as long as you have generated a keypair, but your application transaction will be discarded by the runtime for a variety of reasons:
- If you are not a member.
- If you attempt to apply twice with the same `MemberId`.
- If you attempt to apply with insufficient stake.
- If you try to stake more tokens than you can (note the application transaction costs 1 JOY)
- If you apply for a role with a maximum number of slots, with fixed or no stake requirements, and the maximum application slots have been reached.
- If you try to apply manually through the `Extrinsics` sidebar, you can fail for a variety of other reasons.

### Accepting applications

Only openings in the "Accepting applications" stage can be applied for. Assuming there is one or more openings in this stage that is of interest (and you have sufficient tokens) you can apply for the role. Click the green `APPLY NOW` button inside the Opening box, and follow the staking instructions and write the requested information.

After you have completed this, you will be sent to a confirmation page, where you can submit the application. Once you click `Make transaction and submit application`, a new key will be generated for you. This will be the `controller` key for the role, which you will need to use for all curation transactions if you are hired. It will by default not have a password, and be named `<TITLE OF JOB OPENING> ROLE KEY`. You can rename, set a password, and download a backup .json file of this key in the `My Keys` sidebar.

#### Track the status of your application
Once your application is submitted, you can check the status of your application by selecting this key, and navigate to the `My roles` tab under the `Working groups` sidebar.

#### Withdraw or change your application
While the opening is in the "Accepting applications", you can withdraw your application. As you can not apply twice with the same membership key, the only way to change your application, either to add more stake or update the application text, you need to withdraw your application first. This can be done by selecting the generated role key, navigate to the `My roles` tab under the `Working groups` sidebar, and clicking the `Cancel and withdraw stake` button.

### Applications in review

Once the `Content Curator Lead` is satisfied with the quality/quantity of the applications, the `Applications in review` stage will begin. In this stage, applicants can no longer withdraw their application. The `Content Curator Lead` can do a final review of the applicants, and will make a decision on how many and whom, if any, to hire for the role. As there is a `Max review period length`, inaction will default to no hires, and both the "Role stake" and "Application stake" will be returned in due time.

#### Track the status of your application
As in the [Accepting applications](#accepting-applications) stage, you can track the status of your application by selecting the role key, and navigate to the `My roles` tab under the `Working groups` sidebar.

## Hiring complete

Assuming the `Content Curator Lead` decides to hire one or more applicants, a transaction that hires a set of applicants and sets the `Reward policy` will be made. Successful applicants will appear in the `Workings groups` tab with their membership handle, their "Role stake" and, as time goes, the tokens earned for the job.

Once either the above happens, the lead chooses to terminate the opening without hiring anyone, or the `Max review period length` expires, the opening will go to the `Hiring complete` stage.

As in the previous stages, regardless if your application was successful or not, you can check the status of your application by selecting the role key, and navigate to the `My roles` tab under the `Working groups` sidebar.

If your application was successful, you will now be able to curate content on the Joystream platform.

# Working as a curator

The main job for curators is to regularly check the content directory and channels, and checking that rules and guidelines are being followed.

## Curation Policy
Due to the large influx of users, and incentives for video curation, we need a formal workflow for the `Content Curators`, and a curation policy. We now have a [Curation Policy](https://github.com/Joystream/community-repo/blob/master/governance/Curation_Policy.md), approved by the Council. 

The exact intervals and delegation procedure should be agreed upon by the Council and the Lead, and the Lead and the Curators respectively.

The "Regular Checks", in lack of a better term, are critical. Although discussions can be had around the exact format, something very close to this is required.

The "Council Reports" are a lot more comprehensive and challenging. Unlike the "Regular Checks", these are primarily meant for the Council, and the format and scope here may be reduced somewhat.

### Regular Checks
At some defined (minimum) frequency, the Curator reviews all new videos and channels uploaded.

To avoid everyone stepping on each other’s toes, the Lead should consider splitting the workload between the team, e.g. by day/time and if required, also by language, category, etc.

Each review of this kind should be reported in a designated thread on the Forum, for both the Council and Channel Owners on the Forum.

#### Example
- *Date:* `<dd.mm.yy>`
- *Snapshot:* `block #number`
- *Last report:* `<link.to.previous.post>`
- *Author:* `<ID/Handle/WorkerId>`
- *Overall Statistics:*
  - *Total channels:* `149`
  - *Total videos:* `535`
  - *Total assets:* `1401`
- *Since Last Report:*
  - *Total new channels:* `2`
  - *Total new videos:* `3`
  - *Total new assets:* `13`

##### New Videos and Channels Since Last Report

|Channel ID/Title    |Owner [memberId/Handle]|Curator Status                                  |Reference        |
|:------------------:|:---------------------:|:----------------------------------------------:|:---------------:|
|`<ID>`/<title>      |`<ID>/<handle>`        |Censored - spam - `1`                           |`#<number>`      |
|`<ID>`/<title>      |`<ID>/<handle>`        |Approved                                        |NA               |


|Video ID/Title      |Owner [memberId/Handle]|Channel ID/Title               |Curator Status                                  |Reference        |
|:------------------:|:---------------------:|:-----------------------------:|:----------------------------------------------:|:---------------:|
|`<ID>`/<title>      |`<ID>/<handle>`        |`<ID>`/<title>                 |Censored - requires attribution -`2`            |`#<number>`      |
|`<ID>`/<title>      |`<ID>/<handle>`        |`<ID>`/<title>                 |Approved                                        |NA               |
|`<ID>`/<title>      |`<ID>/<handle>`        |`<ID>`/<title>                 |Poor thumbnail, improve by `#<number>` - `3`    |NA               |

1. This is pure spam, and the owner was warned.
2. All licenses of this kind require attribution.
3. The thumbnail is misleading, and in low resolution.

---

The "owner" and "title" are also included, to make it easier for the uploader to find out what the status of their channel is.

The "curator status" should indicate either `Approved`, or what action, if any, was taken. In that case, a reference to the block height where the transaction change occurred.

The Curator team should also monitor this thread, as it would be where the channel owner reports back to them if they made change(s) requested, disagrees with some action taken, or simply has any questions.

### Council Reports
At some agreed interval, assumed to be at least once for each Council Term, _all_ videos and channels must be "checked in" on. There could be many reasons why to verify that they are still acceptable. In some cases, some details may have been overlooked in previous "check-ups", but there is also the chance that a Channel owner or a (rogue) Curator makes a change that requires an action.

To avoid having to go through thousands of videos/channels every time, the Lead, or some other curator could perhaps deploy a script that checks for certain types of transaction that make changes to the content directory.

To avoid everyone stepping on each other’s toes, the Lead should consider splitting the workload between the team, e.g., by language, category, etc.

The results from this check in should be reported to the Council and the Channel Owners on the Forum.

#### Example

##### Introduction
- *Report ID:* `<ID>`
- *Date:* `<dd.mm.yy>`
- *Snapshot:* `block #number`
- *Last report:* `<link.to.previous.post>`
- *Author:* `<ID/Handle/WorkerId>`
- *Overall Statistics:*
  - *Total channels:* `149`
  - *Total videos:* `535`
  - *Total assets:* `1401`
- *Changes Since Last Report:*
  - *Total new channels:* `10`
  - *Total new videos:* `38`
  - *Total new assets:* `117`

##### Changes Made Since Last Report - Owner
|Channel ID/Title    |Owner [memberId/Handle]|Changed                 |Consequence            |Reference (block/post)    |
|:------------------:|:---------------------:|:----------------------:|----------------------:|:------------------------:|
|`<ID>`/<title>      |`<ID>/<handle>`        |Updated banner          |NA                     |`#<number>`               |


|Video ID/Title      |Owner [memberId/Handle]|Channel ID/Title               |Changed                 |Consequence            |Reference (block/post)    |
|:------------------:|:---------------------:|:-----------------------------:|:----------------------:|----------------------:|:------------------------:|
|`<ID>`/<title>      |`<ID>/<handle>`        |`<ID>`/<title>                 |Changed thumbnail       |No longer censored     |`#<number>/<postId>`      |
|`<ID>`/<title>      |`<ID>/<handle>`        |`<ID>`/<title>                 |Added thumbnail         |No longer hidden       |`#<number>/<postId>`      |


##### Changes Made Since Last Report - Curators
|Channel ID/Title    |Owner [memberId/Handle]|Curator Status                                  |Reference (block/post)    |
|:------------------:|:---------------------:|:----------------------------------------------:|:------------------------:|
|`<ID>`/<title>      |`<ID>/<handle>`        |Censored - spam - `1`                           |`#<number>/<postId>`      |

|Video ID/Title      |Owner [memberId/Handle]|Channel ID/Title               |Curator Status                                  |Reference (block/post)    |
|:------------------:|:---------------------:|:-----------------------------:|:----------------------------------------------:|:------------------------:|
|`<ID>`/<title>      |`<ID>/<handle>`        |`<ID>`/<title>                 |Attribution added, no longer censored           |`#<number>/<postId>`      |
|`<ID>`/<title>      |`<ID>/<handle>`        |`<ID>`/<title>                 |Censored - requires attribution                 |`#<number>/<postId>`      |
|`<ID>`/<title>      |`<ID>/<handle>`        |`<ID>`/<title>                 |Changed thumbnail, no longer censored           |`#<number>/<postId>`      |

##### All Non-Visible Channels
|Channel ID/Title    |Owner [memberId/Handle]|Reason                                          |Reference (block/post)    |
|:------------------:|:---------------------:|:----------------------------------------------:|:------------------------:|
|`<ID>`/<title>      |`<ID>/<handle>`        |Title too long at creation                      |`#<number>/<postId>`      |

##### All Non-Playable Videos
|Video ID/Title      |Owner [memberId/Handle]|Channel ID/Title               |Reason                                          |Reference (block/post)    |
|:------------------:|:---------------------:|:-----------------------------:|:----------------------------------------------:|:------------------------:|
|`<ID>`/<title>      |`<ID>/<handle>`        |`<ID>`/<title>                 |Video deleted by owner                          |`#<number>/<postId>`      |
|`<ID>`/<title>      |`<ID>/<handle>`        |`<ID>`/<title>                 |Set as not public by owner                      |`#<number>/<postId>`      |
|`<ID>`/<title>      |`<ID>/<handle>`        |`<ID>`/<title>                 |Censored - requires attribution                 |`#<number>/<postId>`      |


##### Notes
Some notes from the curator.

---

This will be quite a lot of work, but all the data needed can be found using a script that checks all blocks from `n` to `m`, and looks at all events with `event.section == content`, and returns these blocks (or the full data). A basic version of this will be made available in the [community repo](https://github.com/Joystream/community-repo).

### Tools
For every job, good tools are needed.

#### Joystream Player
Going through each video and channel one by one can be quite arduous, but to verify that the assets work, and are displayed properly, [Regular Checks](#regular-checks) are required. The URL of each video and channel will match their respective IDs, which should help with the processing.

#### CLI
With the release of the Sumer network, in a transitional phase, the CLI will not display a lot of context for each video and channel.
- for channels: `ID   Owner       IsCensored   RewardAccount`
- for vidoes:   `ID   InChannel   InSeries     IsCensored   `
- Where `InSeries` and `RewardAccount` can be ignored.

#### Hydra Playground
To effectively get information about videos in bulk, the [playground](https://hydra.joystream.org/graphql) will need to be used. We are adding helpers to assist the Curators here.

### Policy

`warning`
Means posting a note in the forum, as part of the [Regular Checks](#regular-checks), that something has to be corrected within a certain time period.

`censor`
Means updating the status (`isCensored`) for a video from `false` to `true`. This cannot be changed back by anyone but another curator in an active group.

#### Videos
**When to (only) issue a `warning`:**
- Missing artwork
  - If the thumbnail is missing, or just really poor, the video can be issued a `warning`
- Suspicious license
  - If the Curator suspects, but is not able to verify that a video is incorrectly licensed, a `warning` can be issued, leaving the channel owner some defined deadline to respond and provide more information or evidence.
- Content not as "advertised"
  - If the title, description, category and thumbnail imply a baking video, the video should not be a documentary about Bitcoin
- Poor quality
  - If the video quality is "unreasonably" low
- Duplicates
  - If the same video has been uploaded several times

**When to `censor` a video:**
- License requires attribution
  - If the selected license requires attribution, but none is given or attribution is incorrect
- Breach of license
  - If the license has specific requirements with it (e.g. "no derivatives" if [CC_BY_NC_ND](https://creativecommons.org/licenses/by-nc-nd/4.0/))
- Suspected copyright violation
  - If it's not clear that the video is in violation, but this is strongly suspected by the Curator
- Terms of Service violation
  - If the video is in violation of other parts of the [ToS](https://play.joystream.org/legal/tos)

#### Channels
**When to (only) issue a `warning`:**
- Multiple warnings for videos

**When to `censor` a channel:**
- Multiple or recurring *serious* infractions
  - If multiple videos are currently `censored` and the owner has made no efforts to fix this


### Discretion
These rules are not clearly defined in all cases, so it's important that curators are able to use discretion. In many cases, it's preferable to try and get in touch with the channel owner first, rather than immediately pull the trigger. If in doubt, contact the `Lead` first. In other cases, immediate action may be required.

"Speak softly, and carry a big stick"
- Theodore Roosevelt

## Curation Tools

The two main on chain tasks for curators are [censoring](#censoring) and [category management](#category-management).

### Censoring
```
# Censor channel:
$ joystream-cli content:updateChannelCensorshipStatus --help

Update Channel censorship status (Censored / Not censored).

USAGE
  $ joystream-cli content:updateChannelCensorshipStatus ID [STATUS]

ARGUMENTS
  ID      ID of the Channel
  STATUS  New censorship status of the channel (1 - censored, 0 - not censored)

OPTIONS
  --rationale=rationale

# Censor video:
$ joystream-cli content:updateVideoCensorshipStatus --help

Update Video censorship status (Censored / Not censored).

USAGE
  $ joystream-cli content:updateVideoCensorshipStatus ID [STATUS]

ARGUMENTS
  ID      ID of the Video
  STATUS  New video censorship status (1 - censored, 0 - not censored)

OPTIONS
  --rationale=rationale
```

### Category Management
Curators can create, update and delete categories. Instructions below are for videos only, as channel categories are not (yet) visible in the player.

#### Create Category
Say a curator wants to add a category called "Joystream Videos":
1. Create an input file in json format like so:
```json
{
  "name": "Joystream Videos"
}
```
2. As a curator, with your role key, use the following command:
```
$ joystream-cli content:createVideoCategory --help

Create video category inside content directory.

USAGE
  $ joystream-cli content:createVideoCategory

OPTIONS
  -i, --input=input         (required) Path to JSON file to use as input
  --context=(Lead|Curator)  Actor context to execute the command in (Lead/Curator)
```
3. Set the correct options, and submit!

#### Update Category
Same as above, but:
```
$ joystream-cli content:updateVideoCategory --help

Update video category inside content directory.

USAGE
  $ joystream-cli content:updateVideoCategory VIDEOCATEGORYID

ARGUMENTS
  VIDEOCATEGORYID  ID of the Video Category

OPTIONS
  -i, --input=input         (required) Path to JSON file to use as input
  --context=(Lead|Curator)  Actor context to execute the command in (Lead/Curator)
```

#### Delete Category
```
$ joystream-cli content:deleteVideoCategory --help

Delete video category.

USAGE
  $ joystream-cli content:deleteVideoCategory VIDEOCATEGORYID

ARGUMENTS
  VIDEOCATEGORYID  ID of the Video Category

OPTIONS
  --context=(Lead|Curator)  Actor context to execute the command in (Lead/Curator)
```

## Content Directory
The new content directory is partially using [metaprotocols](https://github.com/Joystream/joystream/issues/1990). That means a lot of the information in a transaction is not actually available on chain, but has to be looked up in our query-node "playground" [here](https://hydra.joystream.org/graphql).

A basic example of how to find the first 100 videos sorted by the block height created:
```
query {
  videos (limit:100, orderBy:createdInBlock_ASC){
    id
    title
    isCensored
    isPublic
    category {
      id
      name
    }
    channelId
    channel {
      id
      createdAt
      createdInBlock
      ownerMember {
        id
        handle
      }
    }
    createdAt
    createdInBlock
  }
}
```
More examples can be found [here](/roles/content-curators/query-node-examples).

Note that the clicking "docs" (and/or "schema") is likely to be very helpful, once you get a grasp of the general syntax!

### Categories
At the time of writing, the only way to find the current set of categories is to go to the query-node playground and query:
```
query {
  videoCategories {
    id
    name
  }
}
```
If you are looking for the channel categories, replace `videoCategories` with `channelCategories`.

Note that the categories below only include what was set at launch, and may have changed since then.
```json
{
    "categories":
    [
        {"id":"1","name":"Film & Animation"},
        {"id":"2","name":"Autos & Vehicles"},
        {"id":"3","name":"Music"},
        {"id":"4","name":"Pets & Animals"},
        {"id":"5","name":"Sports"},
        {"id":"6","name":"Travel & Events"},
        {"id":"7","name":"Gaming"},
        {"id":"8","name":"People & Blogs"},
        {"id":"9","name":"Comedy"},
        {"id":"10","name":"Entertainment"},
        {"id":"11","name":"News & Politics"},
        {"id":"12","name":"Howto & Style"},
        {"id":"13","name":"Education"},
        {"id":"14","name":"Science & Technology"},
        {"id":"15","name":"Nonprofits & Activism"}
    ]
}
```

### Licenses
At launch, the available licenses are:
```
1000   Custom
1001   PDM           Public Domain                                                   https://creativecommons.org/share-your-work/public-domain/pdm
1002   CC0           Public Domain Dedication                                        https://creativecommons.org/share-your-work/public-domain/cc0
1003   CC_BY         Creative Commons Attribution License                            https://creativecommons.org/licenses/by/4.0                  
1004   CC_BY_SA      Creative Commons Attribution-ShareAlike License                 https://creativecommons.org/licenses/by-sa/4.0               
1005   CC_BY_ND      Creative Commons Attribution-NoDerivs License                   https://creativecommons.org/licenses/by-nd/4.0               
1006   CC_BY_NC      Creative Commons Attribution-NonCommercial License              https://creativecommons.org/licenses/by-nc/4.0               
1007   CC_BY_NC_SA   Creative Commons Attribution-NonCommercial-ShareAlike License   https://creativecommons.org/licenses/by-nc-sa/4.0            
1008   CC_BY_NC_ND   Creative Commons Attribution-NonCommercial-NoDerivs License     https://creativecommons.org/licenses/by-nc-nd/4.0            
```

# Content Restrictions
It is very important that you do not upload illegal or copyrighted content on our testnets. Firstly, this will result in a disqualification from payouts. It will also result in the takedown of content, potentially slashing of funds, and the deletion of your channel. Multiple spam uploads which represent a burden to moderate for the `Content Curators` may also be penalized and result in deductions on payouts due for qualifying content uploads on your content creator profile.

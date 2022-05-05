<p align="center"><img src="img/content-creators.svg"></p>

<div align="center">
  <h4>This is a guide for prospective Content Creators on the latest
  <a href="https://testnet.joystream.org/">Joystream Testnet</a>.<h4>
</div>


Table of Contents
==
<!-- TOC START min:1 max:3 link:true asterisk:false update:true -->
- [Overview](#overview)
- [Get Started](#get-started)
  - [Using the Joystream Player](#using-the-joystream-player)
    - [Import Your Membership Key](#import-your-membership-key)
    - [Sign Up](#sign-up)
    - [Create a Channel](#create-a-channel)
    - [Upload a Video](#upload-a-video)
    - [Troubleshooting](#troubleshooting)
  - [Using the CLI](#using-the-cli)
    - [Create a Channel](#create-a-channel-1)
    - [Upload a Video](#upload-a-video-1)
    - [Updating Channels or Videos](#updating-channels-or-videos)
    - [Troubleshooting](#troubleshooting-1)
  - [Content Directory](#content-directory)
    - [Categories](#categories)
    - [Licenses](#licenses)
- [Content Restrictions](#content-restrictions)
<!-- TOC END -->

# Overview
This page will contain all information on how to act as a `Content Creator`, and how to create a channel, upload videos, and managing your content.

Starting with the Sumer release, content is now consumed, created, and managed in the [Joystream Player](https://play.joystream.org/). You can still use the [Joystream-CLI](https://www.npmjs.com/package/@joystream/cli) to create channels and upload videos, but using the [Joystream Studio](https://play.joystream.org/studio/) will provide a far better experience for most purposes.

You must always keep in mind our Terms of Service when uploading content. Further details can be found [here](#content-restrictions).

# Get Started
Before you can upload your first video, you need to create a membership (if you don't already have one) and then a channel. Instructions for using the Joystream Player can be found below, but if you prefer to use the CLI, go [here](#using-the-cli).

## Using the Joystream Player
In order to use the [Joystream Studio](https://play.joystream.org/studio/) interface, you need to install the [Polkadot browser extension](https://polkadot.js.org/extension/) in order to sign transactions.

If you already have a membership, follow the instructions below.

If you are new to the platform, you can create a new membership through the onboarding system. Skip to [here](#sign-up).

### Import Your Membership Key
1. Download the Polkadot browser extension[here](https://polkadot.js.org/extension/).
2. Go directly to [Joystream Studio](https://play.joystream.org/studio/), or select the menu -> then "Joystream Studio" in the [Player](https://play.joystream.org/).
3. Click "Sign In", allow the extension access, and follow the instructions.
4. Open the extension, click the "+" button, and import/restore your account from json/seed.
5. If you have more than one account, confirm your account selection, and continue.
6. Select your membership profile, and you will be redirected to a page to [create your channel](#create-channel).

### Sign Up
Note that you can also register in our (less polished - but we're working on a new one) governance app - [Pioneer](https://testnet.joystream.org/#/accounts), but then you'll need to get tokens first. Using the onboarding flow below is recommended for new participants.

1. Download the Polkadot browser extension[here](https://polkadot.js.org/extension/).
2. Go directly to [Joystream Studio](https://play.joystream.org/studio/), or select the menu -> then "Joystream Studio" in the [Player](https://play.joystream.org/).
3. Click "Sign In", allow the extension access, and follow the instructions.
4. Open the extension, and click the large circle to create an account. Confirm your account selection, and continue to create a membership.
5. You need to choose a unique handle, consisting of only lowercase characters, numbers and underscores. Optionally (and preferably), also add a link to your membership avatar, and some information about yourself. Create the membership and wait ~15 seconds for the transaction to confirm.
6. Select your membership profile, and you will be redirected to a page to [create your channel](#create-channel)

### Create a Channel

Once you have signed in, it's time to create a Channel.

1. Give your channel a good title and description.

Although neither cover nor avatar are required, we strongly recommend your to add these as well. Unlike previous versions, where you had to provide a URL, these will also be uploaded to our storage system.

2. Click on the empty profile avatar just left of the title to select your avatar from your computer. Then, crop and adjust your image to fit.
4. Hower over the background and click to add your banner/background. Crop and adjust your image to fit.
3. Once you are satisfied, click "Create channel", sign your transaction, and wait for it to confirm. Your assets will now upload in the background.
4. To see how it looks in the [Player](https://play.joystream.org/channels), note that you have to wait for the uploads to complete, plus another ~15sec delay, before it will appear. If you're not happy with the appearance, you can go back to the Studio to edit it.

If you are seeking rewards for your content, please be aware that the channel metadata matters. Make it appropriate and descriptive, and use high resolution, well cropped images. If you are planning to upload videos across multiple categories/genres/themes, *consider* making multiple channels! This can be done by clicking your profile in the top right corner. Here, you can also log out if you want to use a different membership or key.

### Upload a Video

Now that we have created a channel, we can upload a video.

1. Click the blue button next to your profile in the top right corner, or "Videos" in the sidebar.
2. Drag and drop your video file, or click the blue "Select a file" button to add your video file.
3. Once completed, repeat the above step to add a thumbnail image. Crop and adjust your image to fit.
4. The title will default to the name of the video file, but this will probably need changing.
5. Fill out the rest of the fields.
6. Once you are satisfied, click "Start publishing", sign your transaction, and wait for it to confirm. Your assets will now upload in the background.
7. To see how it looks in the [Player](https://play.joystream.org/videos), note that you have to wait for the uploads to complete, plus another ~15sec delay, before it will appear. Note that unlike channels, videos will never appear in the videos list unless you have successfully uploaded both the video and the thumbnail.

If you've made a mistake, or simply want to make an improvement, you can edit the video metadata. This is not possible for the video file itself, which can't be changed. If this is incorrect, you will have to delete the video, and start again.

### Troubleshooting
If you have any issues - the first step is to ask in our [Discord server](https://discord.gg/mzv7DeNq)!

## Using the CLI

Although the CLI is not the recommended of uploading, it can be beneficial in some situations. Especially if you want to create/upload multiple channels/videos at the time, and have already ensured your (image) assets are in the correct aspect ratios.

To get, install and configure (ie. importing your membership key to) the CLI, go [here](/tools/cli/README.md).

### Create a Channel
First, create an input .json file based on the example [here](https://github.com/Joystream/joystream/blob/master/cli/examples/content/CreateChannel.json).

Notes:
- `rewardAccount` currently doesn't do anything, as the reward system hasn't been implemented on the runtime side. Unless you want to deal with it later however, it may be worth setting it now.
- `category` (for channels) are currently not displayed in the Player. You can set still them now, by passing it as an integer. At launch, the available categories will be the same as for videos, and listed [here](#categories).

Then, with your `membershipController` key selected:
```
$ yarn joystream-cli content:createChannel -i /path/to/channel-input.json --context Member
```

#### Bulk Creation
To bulk create, prepare multiple input files, and use a bash script:
```bash
#!/bin/sh
export AUTO_CONFIRM=true

yarn joystream-cli content:createChannel -i /path/to/channel-input1.json --context Member
yarn joystream-cli content:createChannel -i /path/to/channel-input2.json --context Member
```
If you want to change the account in between creations, add:
```bash
yarn joystream-cli account:choose -a <5ctrlAccountOfMyMembership>
```

### Upload a Video
First, create an input .json file based on the example [here](https://github.com/Joystream/joystream/blob/master/cli/examples/content/CreateVideo.json).

Notes:
- `personsList` currently doesn't do anything, and can just omitted.
- `category` is passed as an integer. At launch, the available categories will be the same as for channels, and listed [here](#categories).
- `license` is passed as an integer. At launch, the available license can be found [here](#licenses). Note that depending on the license you choose, the json looks slightly different:
```json
// Custom License:
  "license": {
    "code": 1000,
    "customText": "Some custom text of your choosing!"
  },
// Public Domain:
  "license": {
    "code": 1001
  },
// All Creative Commons, ie. 1002-1008 (although not strictly required by 1002)
  "license": {
    "code": 1002,
    "Attribution": "Attribution to the original creator as per the license rules."
  },
```
Then, with your `channelOwner` key selected:
```
$ yarn joystream-cli content:createVideo -i /path/to/video-input.json -c <channelId>
```

#### Bulk Uploads
To bulk create, prepare multiple input files, and use a bash script:
```bash
#!/bin/sh
export AUTO_CONFIRM=true

yarn joystream-cli content:createVideo -i /path/to/video-input1.json -c <channelId>

```
If you want to change the account in between creations, add:
```bash
yarn joystream-cli account:choose -a <5ctrlAccountOfMyMembership>
```

### Updating Channels or Videos
If you want to update your channel or video, with `<*Id>`, update your input .json, and, with your `channelOwner` key selected:

```
$ yarn joystream-cli content:updateChannel <channelId> -i /path/to/video-input.json
$ yarn joystream-cli content:updateVideo <videoId> -i /path/to/video-input.json
```
If you only want to change the title of your channel or video, the .json example below is sufficient:

```
{
  "title": "Your new video or channel title."
}
```

### Troubleshooting
If you have any issues - the first step is to ask in our [Discord server](https://discord.gg/mzv7DeNq)!

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
Note that the clicking "docs" (and/or "schema") is very be helpful, once you get the general syntaxt!

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
If you are looking for the channel categories, replace `videoCategories` with `channelCategories`

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
At launch, the available license are:
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

# Curation Policy

*Sumer network*

The main task of the `Curator Workers` and `Curator Lead` is curating the content on [Joystream Player](https://play.joystream.org)

Only Content Working Group can `warn` or `censor` videos

> To effectively get information about videos in bulk, the [Hydra playground](https://hydra.joystream.org/graphql) will need to be used. Examples can be found [here](https://github.com/Joystream/helpdesk/tree/master/roles/content-curators/query-node-examples)

## 1. `Warn` video

### Which video can be `warned`

1.1 Missing thumbnail

- If the thumbnail is missing, or just really poor, or have low quality, the video can be issued a `warning`

1.2 Wrong license

- If the Curator suspects, but is not able to verify that a video is incorrectly licensed, a `warning` can be issued, leaving the channel owner some defined deadline to respond and provide more information or evidence.

1.3 Content not as "advertised"

- If the title, description, category and thumbnail imply a baking video, the video should not be a documentary about Bitcoin

1.4 Poor quality

- If the video quality is "unreasonably" low

1.5 Dublicates

- If the same video has been uploaded several times

### How to `warn` a video

> `warning` Means to make a note that something has to be corrected within a certain time period

- Post a warning to the author on the [forum](https://testnet.joystream.org/#/forum/threads/329).

- Try to find the author in Discord or Telegram and notify him

## 2. `Censor` video

### When to `censor` a video

> **License**

2.1 License requires attribution

- If the selected license requires attribution, but none is given the, or attribution is incorrect

2.2 Breach of license

- If the license has specific requirements with it (e.g. "no derivatives" if [CC_BY_NC_ND](https://creativecommons.org/licenses/by-nc-nd/4.0/))

2.3 Suspected copyright violation

- If it's not clear that the video is in violation, but this is strongly suspected by the Curator

2.4 Terms of Service violation

- If the video is in violation of other parts of the [Terms of Service](https://play.joystream.org/legal/tos) and [Digital Millennium Copyright Act (DMCA)](https://en.wikipedia.org/wiki/Digital_Millennium_Copyright_Act)

> **Content Restrictions**

2.5 Sexually explicit

- Prostitution
- Escort services
- Other erotic services (including live sex shows, fetish fulfillment, etc.)
- Pornographic content

2.6 Harassment, bullying and abuse

- content that seeks to threaten, intimidate, insult, shame or hurt an individual or group, regardless of their private or public status. Threats, doxxing, revenge porn, trolling, cyber-bullying, and other forms of abuse

2.7 Contains hateful or discriminatory speech

- Race, color, national origin, and ethnicity
- Gender identity
- Sexual orientation
- Religion
- Disability
- Age

2.8 Promotes or supports terror or hate groups

- Content from hate or terror groups that aims to spread propaganda designed to radicalise and recruit people or aid and abet attacks

2.9 Provides instructions on how to assemble explosive/incendiary devices or homemade/improvised firearms 

2.10 Exploits or endangers minors

2.11 Depicts or encourages self-harm or suicide

2.12 Unlawful real-world acts of extreme violence

- Vivid, realistic, or particularly graphic acts of violence and brutality
- Sexualized violence, including rape, torture, abuse, and humiliation
- Animal cruelty or extreme violence towards animals
- Show people being murdered, tortured, or physically or sexually abused
- Show animals being tortured or killed
- Display shocking, disgusting, or gruesome images

### How to `censor` a video

> `censor` Means updating the status (isCensored) for a video from `true` to `false`. It cannot be changed by anyone. Except for another curator in the active group.

```

# Censor video:
  $ joystream-cli content:updateVideoCensorshipStatus --help

Update Video censorship status (Censored / Not censored).

USAGE
  $ joystream-cli content:updateVideoCensorshipStatus ID [STATUS]

ARGUMENTS
  ID      ID of the Video
  STATUS  New video censorship status (1 - censored, 0 - not censored)

OPTIONS
  --rationale=rationale  rationale
  
  ```

## 3. `Warn` channel

### Which channel can be `warned`

3.1 Multiple warnings for videos

3.2 Content not as "advertised"

- If the title, description, category and Avatar imply a baking video, the video should not be a documentary about Bitcoin

3.3 Missing Avatar

- If the Avatar is missing, or just really poor, or have low quality

### How to `warn` a video

- Post a warning to the author on the [forum](https://testnet.joystream.org/#/forum/threads/329).

- Try to find the author in Discord or Telegram and notify him

## 4. `Censor` channel

### When to `censor` a channel

4.1 Multiple or recurring serious infractions

- If multiple videos are currently `censored` and the owner has made no efforts to fix this

### How to `censor` a channel

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
  
  ```
  
## Licenses

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

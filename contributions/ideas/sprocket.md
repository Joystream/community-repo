# Sprocket
Sprocket is a concept that has two aspects--advertising space and community rewards. It is an idea first and foremost and doesn't delve too deep into technical aspects. It may be achievable directly on the Joystream platform or may have to utilize external smart contracts to achieve what is described.

This idea is based around video content, but could work for text, audio, images, GIFs and various other types of media.

* Adspace Sprockets are a purely commercial space, where a user or company can purchase advertising using a mechanism on a specific hashtag. This hashtag can be used in a variety of creative ways that expand beyond what is possible on a typical video platform and there are use cases that exist outside of Joystream itself and could possibly work in the field of physical displays.
* Community Sprockets are a hashtag where users can participate in informal communities centered around categories of content that they enjoy. In general, users pay some tokens to get their video into a pool of videos and the userbase then votes on a "winner"--the winner is rewarded with tokens and also with possible prominent placement of their video. This "winner" is also added to the feed of content, meaning that new "winners" are helping to build a highly curated list of interesting content. This idea is similar to a TCR (Token Curated Registry).

## 1.1 - What does Sprocket mean?
A Sprocket is a component that is integral to all manner of machinery, be it a bicycle, car, lathe, printing press or camera. Sprockets are what allow machines to be consistent and to abide by the laws of time.

In the world of film & photography, a Sprocket hole (https://en.wikipedia.org/wiki/Film_perforations) is the name given to the perforations that run alongside a strip of film. A projector uses these Sprockets to push through film at a constant pace, allowing the still images to form a consistent optical illusion that forms one of the most widely available forms of media today: movies.

On a rangefinder camera, a photographer has to use a film advance lever to manually pull new film into place before clicking the shutter and taking a photograph. With Sprocket, we take the same idea of advancing film and try to build a social and/or commercial (advertising) mechanism for this action to take place.

A YouTube video showing various film advance levers: https://youtu.be/NPTRfMUeXQU?t=91 (Title: `Leica Camera Study 1: The Film Advance` Channel: 
https://www.youtube.com/channel/UCi-NmFLJaEsJF29T2No02uw)

Sprocket would use the traditional idea of hashtags and categories seen on most social media websites and add a set of functions to allow for advertising, community rewards and hopefully a very effective mechanism for producing highly curated and interesting collections of content.

Specifically when it comes to community rewards for creating content, Sprocket would ideally offer a means for tokens to be distributed to a far larger range of users compared to using the proposal system.

 ## 1.2 - The growth of self-advertising
Generally on video platforms, there is no concept of groups. Users typically upload on their own channels and build engagement with other channels via commenting or through other platforms like Twitter. Uploading videos helps a channel to build a library of videos, but this doesn't usually help to build communal spaces as anyone is free to use tags when listing their videos. There is little disincentive for parties to not spam tags and there is no concept of these tags being curated by the users of the platform.

This also results in it sometimes being difficult to find content worth watching, if a user is interested in cooking videos there are simply far too many channels creating this type of content and search results are personalized and also influenced by an algorithm that means smaller, perhaps better channels find surfacing their content to a wide audience to be almost insurmountable task.

If we look at the methods available to video creators generally these are tied to metrics such as view counts which is a very limited perspective when trying to attract and reward a diverse range of content. Critically, content that may be of high quality and have a passionate userbase may not be financially sustainable which pushes many creators towards other means of income such as crowdfunding platforms and sponsorship deals. Major YouTube channels have also taken on an increasingly corporate nature and can be seen taking over large parts of the platform, this leaves less incentive for new and novel creators to participate as the chance of gaining significant viewership is largely diminished.

On platforms such as YouTube, advertising seems dominated by major companies and depending on the user's region there may be very few instances of self-advertising (meaning a regular user paying for their videos to be placed as pre-roll advertisements). Instagram and Twitter have had far more success in allowing users to self-advertise their content, these advertisements seen in a users personalized feed are marked as "Sponsored" but importantly this self-advertising content is not distinguished in any way from commercial users of advertising. Thus we can see that there is demand for users to be able to access features typically only available to large corporations for the purpose of self-advertising.

TikTok, which is now one of the leading video platforms has a creator fund (https://newsroom.tiktok.com/en-gb/tiktok-creator-fund-your-questions-answered) but the method of distributing this large pool of money to creators is very limited and requires a creator to have more than 10,000 followers to apply for funding. These kind of arbitrary restrictions on distributing rewards to a userbase mean that novel users are disincentivized from participating.

Simultaneous to this transformation in advertising, there are now examples of large corporations using features intended for users for the purpose of advertising: https://www.bbc.com/news/newsbeat-53862091

In public spaces, there has been a significant rise in digital billboards, which are LED screens that are internet-connected and controlled by a company. Companies seeking to advertise on these billboards are required to contact the company which controls the billboard and ask for a quote and there are no public prices available nor any direct mechanism for submitting and paying for content (an example: https://www.outfrontmedia.com/).

In these ways, the line between corporate advertising and self-advertising has become increasingly blurred and the key method of retaining users (by rewarding users who create the novel content that attracts advertisers in the first place) has not seen any substantial changes. This is the reason why Sprocket seeks to provide functionality for both rewarding the community and also allow for advertising--these two aspects increasing share a lot of common ground and rather than make a system that caters solely to one side of the equation it is probably more beneficial to try and cater to both.

By adding a group concept to Joystream where likeminded users can gather and work together to curate content and reward its creators, it would hopefully spur a significant number of new users who contribute novel content and work to build Joystream into a sizable platform that is attractive to advertisers.

## 2.1 - Adspace Sprocket
An Adspace sprocket is a purely commercially intended place, where a user or company can pay tokens to purchase adspace for a period of time. There is no distinction in how a user or company would interact with this system so it can be used for corporate advertising (for example, to advertise a product) or for self advertising (for example, to advertise a users latest video)

### 2.2 - Adspace Sprocket components
* `sprocket_adspace` = This is the name of the Adspace Sprocket a user can select from. There may be several of these. It may cost users tokens to create or maintain them. This adspace could be shown in a variety of places, including preroll ads, embedded (such as on a section of the forum or a video creator's profile page), physical displays (such as an LED screen positioned in a place with high foottraffic).
* `type`
	* `billboard` = This type is linear and has a single layer, it is similar to a billboard or single TV channel in that there can only be one piece of content at one time.
	* `registry` = This type allows for simultaneous pieces of content to be registered at the same time. The user client would then randomly select one or more pieces of content to show in succession.
* `rate` = This is the rate at which advertising is charged to be shown. It may be a figure which is quoted in hourly terms. It may be set by a council or user group. It may be a minimum figure and users then bid higher amounts to actually win placement.
* `burn_percentage` = In order to have the concept be profitable for the network, there may be a percentage of tokens spent that are burned.
* `minimum_duration` & `maximum_duration` = These are the min/max durations that an advertisement can occupy adspace for. For example the minimum value might be `24 hours` meaning a user paying for advertising cannot buy adspace for any period shorter than this number.
* `start_blockheight` & `end_blockheight` = The blockheight range a user would like their advertisement or content to be shown.

### 2.3 - Personas / Use Cases
* Michael owns a cafe and has a lot of foot traffic, in order to try and capitalize on this feature, he purchases and installs two LED displays which are connected to the Joystream network. He creates the hashtags `#cafe_display_1` and `#cafe_display_2` and lists the ideal formatting.
* Jimmy is a livestreamer, he has a decent viewership and wants to experiment with advertising. He buys a physical display which he features prominently in the background of his livestream and creates a hashtag for it. He also creates another hashtag which is embedded on his livestream output and livestream homepage. Users and companies pay to list advertisements and he recieves rewards from these advertisements.
* Alice runs a cooking channel on Joystream, she isn't happy with the terms of regular advertising, so she makes it so her channel runs ads from the `#cooking_ads` Sprocket as she feels the advertising is more relevant to her viewers.

### 2.4 - Adspace Sprocket limitations
* There is currently no concept of moderation, in order to prevent abuse, it may be beneficial to only allow content which has been approved by a working group to be allowed as advertising.
* There is currently no concept of ownership. It may be that a user can create an Adspace Sprocket and recieve rewards from users listing ads, how ownership would work would have to be decided.

## 3 - Community Sprocket
A Community Sprocket is a an area where users can submit content, have it voted upon by other users and potentially recieve a reward in the form of having their content highlighted or some amount of tokens.

Community Sprockets can be considered as social barometers, for each community that has a presence in this space, the most recent content would highlight the current state of the community and the historic content would act as a rich history of the community.

Some diagrams to visually explain the idea:
![A diagram showing the basic idea of a Community Sprocket](https://i.imgur.com/Hnfjyhd.png)
![](https://i.imgur.com/EimmBfz.png)


### 3.1 - Community Sprocket components
* `community_sprocket` = This is the name of the community Sprocket a user wants to participate in. There may be several of these. It may cost users tokens to create or maintain them. This Sprocket could be displayed in a variety of places but is not a commercial space.
* `submission_deposit` = This is the amount of tokens a user has to pay to submit their content. This may be in the form of stake, or it may burn tokens or a percentage of the tokens could be used to fund the Community Sprocket.
* `submission_cycle` = This is the length of time each "competition" takes place over. So if it is 24 hours, that means a winner is decided once every 24 hours.
* `winner_payout` = This would be the amount a winner recieves. This amount could be tied to the number of submissions and the amount of tokens used when submitting. In general, the amount a winner recieves would be not be a huge amount with the expectation that users recieve more rewards from having preferential placement of their content.

### 3.2 - Personas / Use Cases
* Tareq enjoys making videos for his gaming channel. He has a small, dedicated viewership and he has heard through a friend on the platform that `#videogames` would be worth trying to submit a video too. He pays some tokens to list his video. A few hours later, if enough users vote for his content it will be shown on a section of the Atlas homepage. and he will recieve a bonus amount of tokens. Due to the incraesed viwership he recieves some new viewers on his video.
* Matteo has been a longtime fan of another user's cooking channel on Joystream. He really enjoys the latest video and decides to spend some of his own tokens as stake to get the video on `#cooking`. He uses the comments and forums to let other fans of the cooking channel know about this, and the video ends up winning on `cooking` for the next 24 hours.
* A group of ~50 users on Joystream make an informal community and they post videos using public domain and popular content that is repurposed and remixed. Although this content does not usually have high viewership, this community occassionally produces videos that become virally popular. They are a highly discerning group and they run their Sprocket as a tight ship, only approving of videos that they find to be funny.
* A video game developer who creates small games and sells them on various stores wants to try and experiment with his latest game. In order to try and get people posting more content of his game, he funds a `Community Sprocket` with tokens. In time once the funding dries up, footage of the game remains popular and the people posting videos end up funding it further.
* Layla has never used Joystream before, she accesses the Community Sprockets interface and finds a diverse range of new content that has been curated.

### 3.3 - Social Gambling
`Community Sprocket's` revolve around Social Gambling. This is the act of a user submitting content and taking the risk that a niche community may love, hate or be indifferent to what they've created. There may be a financial payoff, or it may just be a case that the reward of having content highlighted is enough to satisfy.

### 3.4 - Community Sprocket thoughts & limitations
* Picking an initial category of content for this idea would be challenging, I think a perfect category would be public domain content which is free, easy to find and will also be altruistic in nature.
* The concept of ownership and how rewards are handled has to be figured out. This includes whether there are fees to create a Community Sprocket or whether the attributes, such as payouts and minimum stake requirements are flexible and can be changed after the initial creation.
* It may be that an Oracle role is needed for management of Community Sprockets and in order to prevent abuse, or it may be necessary to have some mechanism for disqualifying off topic content.
* A lot of this idea relies on the userbase being authentic, therefore it is assumed that the onboarding of members will be honest and that actors on the platform would not easily be able to perform a sybil attack. In general, it should cost more to vote for content than the reward is so that manipulating the system for profit is not worthwhile.
* Once there are a sufficient number of Community Sprockets, it may be possible to have some mechanism where interested users can invest in a Sprocket and somehow capture a percentage of rewards from winners. This has not been explored yet.

### 4 - Other potential Sprocket types
* Threshold based Sprocket - This type of Sprocket would be similar to a `Community Sprocket` but would have some threshold of votes after which a "winner" is decided rather than being on a fixed cycle of time. This would be a less regimented, more creative type as the timing of new content would be less predictable. This type of Sprocket could work well for categories of content where there are several submissions on an hourly basis, possibly for something like video games.

### 5 - Other ideas
* A `Community Sprocket` for the Joystream logo could be an interesting idea similar to Google Doodle.
* A component of both `Community Sprockets` and `Adspace Sprockets` is that they can be connected to physical displays (like OLED or ePaper displays). It could be worth investigating making a competition for this to spur innovation.

### Acknowledgements
Thank you to both Martin and Bedeho for helping to guide this idea.

### Changelog
Sprocket has been in closed development since approximately May 2019. In that time it has moved wildly between a competition for ASCII art displayed on node startup to postage stamps, fixed dimension content, novel display technology, typography, audio hardware concepts, musical patterns, physical rewards, virtual (NFT) rewards and just about everything inbetween. During that time several informal interviews have been conducted and the concept has been explored with great depth to decide how to best approach the idea.

* v0.1 - May 2019 - Initial idea with hardware node attached to ePaper display. The primary focus of this was distributing hardware to competition winners (the best public domain content) that they could use to run a node, this would include a display that features content "live" from the JS network and is also incorporated in the JS interface.
* v0.2 - May 2019 - Idea of user proof in form of an ASCII competition, the ASCII art would be uploaded to JS and also feature in node bootups. Proved to be technical infeasible.
* v0.3 - November 2019 - Idea changed to be about the idea of a central social barometer rather than public domain.
* v0.4 - November 2019 - Idea expanded to focus on user, group and community owned sprockets. Also included an element of physical rewards (like merchandise or hardware). Focused greatly on the idea of hashtags.
* v0.5 - January 2020 - Added initial Sprocket concepts beyond public domain, added concept of visualizing content via weighted vote data.
* v0.6 - June 2020 - Idea split up into phases. Mainly based on concept of UGC + rewards. Initial phase would just be the public domain Sprocket. Added element of council controlling overall control of sprockets.
* v0.7 - July 2020 - Idea begins to incorporate the idea of TCRs, hardware concept now expanded to be more broadly relate to hardware and software integrations. Added emphasis on user vote vs council voting. Added basic diagrams to explain aspects. Idea now will be backed by user voting on forums and out of scope section added to reflect what isn't technically possible on forums.
* v0.8 - August 2020 - Major rewrite and settled on 3 main elements (RAI = rewards, adspace, integrations). Expanded advertising element to be user accessible.
* v0.9 - November 2020 - Removed integrations
* v1.0 - December 2020 - Rewrote entirely and simplified the concept.

### TCRs
These links cover TCRs and some of the ideas surrounding them:
* https://medium.com/paratii/token-curated-playlists-1-thoughts-on-staking-and-consumer-applications-2a50bc837a94
* https://relevant.community/
* https://github.com/Paratii-Video/tcr - Token Curated Registry
* https://medium.com/@ilovebagels/token-curated-registries-1-0-61a232f8dac7 - Token Curated Registry
* https://hackernoon.com/what-are-token-curated-registries-and-decentralized-lists-d33fa42ba167 - Token Curated Registry
* https://kauri.io/incentivizing-highquality-curation-with-a-tokencur/5d256b3a16c3430080718f29d6758366/a - Token Curated Registry
* https://github.com/miguelmota/awesome-token-curated-registries
* https://dogesontrial.dog/how-it-works - TCR of doge images, pays out remaining fees to "winner"
* https://github.com/gautamdhameja/substrate-tcr - Substrate - Token Curated Registry
* https://github.com/gautamdhameja/substrate-tcr-ui - Substrate - Token Curated Registry
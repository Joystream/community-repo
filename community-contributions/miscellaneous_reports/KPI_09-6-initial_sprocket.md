## Initial Sprocket
The initial Sprocket will be:
- Still images (JPEG/PNG)
- Public Domain by date (as described by US copyright law)--https://en.wikipedia.org/wiki/Public_domain_in_the_United_States. To avoid complexity, this is 95 years. This means that in 2021, works published before January 1, 1925 are eligible to be submitted. There is plenty of material available that was published before 1925 and this means users have a very wide range of content to choose from. There are millions upon millions of artworks, books and so on that predate this time.
- Use the forum system. The process is described later on.
- Use a 24/48/72h time cycle for each iteration of the competition. I'm not sure what this duration should be and largely depends on the amount of submissions, ideally we could eventually target a 24h cycle, as a once per day update is not overbearing for users. We could start with 72h to begin with though.
- A reward of $10 per winner is allocated from the council mint and paid into an account.

Reasoning:
- Joystream is primarily a video platform, but at the moment, still images are a much easier way of getting more contributions.
- "Public Domain by date" has been chosen as it is largely apolitical, non-commercial, easy to find and easy to judge. These 3 qualities will hopefully mean the initial Sprocket will be very easy for participants, judges and viewers.
- Still images are very easy to consume, this means this Sprocket could be displayed on a variety of places and doesn't require a viewer to watch a long video to appreciate the artistic, historic or general-interest merits of each image. Each of these places can generate traffic towards Joystream and increase interest in the project and the community:
	- Atlas
	- Pioneer
	- Telegram Bot posts
	- Twitter posts
- Still images can be displayed and consumed easily on hardware like ePaper, which means a Raspberry Pi with ePaper node that displays each selected piece can become extremely easy to create. This is a very unique concept, it is cheap to make and can become a significant interest point for Joystream and it's community.

In short, the combination of the above properties allow the following:
- One initial Sprocket, which can be displayed on Joystream, Atlas, Social Media channels, chatrooms and hardware display devices. This amount of potential means the intial Sprocket can become an interesting community building tool for the project and allows the idea to have a significant amount of leverage in generating traffic.
	- Each of these can also become their own bounties, this would contribute to making a wider range of bounties available.
- It uses the forums, which will help to generate more forum activity and use of the `react` function
- It will hopefully generate more uploads on Joystream, making the curator role require more work.
- It distributes tokens to winning users (there aren't many methods of distributing tokens so far, so this is a good thing)

Users would be expected to vote on whatever submission they find the most interesting, they do not need to explain their reasoning.

## Process
- A category on Joystream is created called `Sprocket`
- A playlist is created on Joystream called `Sprocket`
- A member on Joystream is created called `Sprocket`; this account would contain the funds that the bot can access to send to winning recipients.
- A moderator is selected to manage this process and ensure that "bad" content is removed and to try and remedy any situation in which the bot crashes or a sybil attack is performed. It would be hoped this is a trusted community member who can use their best judgement to manage this process.
- A bot uses the CLI to generate a thread every cycle (which also posts text explaining the competition/rules/timeframe and which iteration of Sprocket this is)
- The bot takes images posted in the `Sprocket` category and posts them on the forum
- Users use the `reaction` function on the forums to signify if they like an image
- At the end of the 48h period, the bot counts up the reactions to each submission, and selects the submission with the highest number of reactions and adds the winning submission to the `Sprocket` playlist
	- The winner is also paid some amount of tokens from the `Sprocket` member account.

It may also be possible to look at a system where users manually post their submissions on the forum, but this requires a lot more work, but has the benefit of not being so dependent on a bot which might crash at any time.


## Rule changes
It would be expected that if the time cycle needed to be adjusted for each iteration, or a reward adjustment was necessary the council could create text proposals for this purpose.


## Technical Asks
There are several technical asks for making the first Sprocket possible, I do not know how achievable all of these are, but do belive most of them are either already being worked on or are completed and awaiting deployment.

* Enabling the upload of still images on the platform
* Enabling the display of still images on Atlas (this is not vital, but as long as the images could be accessed somehow that would still work)
	* If this is not feasible for Atlas itself, but storage of still images is possible, it might be possible to create a bounty for a separate site that has some very simple way of displaying still images)
* Enabling playlists
* Enabling the forum reaction functionality as described here (https://github.com/Joystream/joystream/issues/948)
* Enabling the CLI to create threads
	* This appears to be possible via extrinsic submission, so isn't essential.
* Enabling the CLI to be able to read reactions from posts
	* This is unknown since I don't know how reactions are implemented or accessed.

## Bounty ideas
* Creation of the scripts necessary for all of this 
* Adding a Telegram/Twitter bot function which posts the latest playlist addition from the `Sprocket` playlist
  * This bounty has the added benefit of being able to be reused and repurposed by the community for crossposting content from Joystream for their own purposes outside of Sprocket.
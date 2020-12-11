## How to create a Telegram sticker
Telegram Stickers are explained on the official Telegram blog, they can either be static or animated and are contained in `Sticker Packs`. Packs can either be for animated stickers or static stickers but not both.
https://telegram.org/blog/stickers

Telegram Sticker packs are free to create and free to use. Some very old versions of Telegram may not support Stickers.

Examples of Telegram Stickers:
* https://tlgrm.eu/stickers
* https://telegramchannels.me/stickers
* https://combot.org/telegram/stickers

How to make a static Sticker
1. Design the Sticker! You can use programs like GIMP or Photoshop for this
2. The file should be 512x512 pixels, PNG format with a transparent background

How to make an animated Sticker
1. Design the Sticker! You can use any vector graphics program for this, but it must allow exporting the Sticker to Adobe After Effects
2. Follow the official instructions from Telegram: https://core.telegram.org/animated_stickers
3. The end file must be 512x512 pixels, must not exceed 3 seconds, must be looped and must not exceed 64 KB. A specific plugin (https://github.com/TelegramMessenger/bodymovin-extension) is required to be used with Adobe After Effects and there are some restrictions on what tools can be used with this plugin.

### Static Stickers + Sticker Pack submissions
How to create the intial `static` Sticker Pack:
1. Contact the Telegram Stickers Bot: https://telegram.me/stickers
2. Type `/newpack`
3. Name the sticker pack
4. `Now send me the sticker. The image file should be in PNG format with a transparent layer and must fit into a 512x512 square (one of the sides must be 512px and the other 512px or less).` Submit at least one sticker in appropriate file format. Make sure to untick `compressed image` within Telegram when doing this.
5. List out the emoji(s) that correspond to the sticker. They recommend no more than two emojis per sticker.
6. Add another sticker if you want (follow steps 4,5 again)
7. When finished type `/publish`
8. If desired, you can send a 100x100 image in PNG format with a transparent layer for the sticker pack icon
9. Provide a short name for the Sticker pack and a custom URL will be generated like this: https://telegram.me/addstickers/Animals

How to add Stickers to an existing `static` Sticker Pack:
1. Contact the Telegram Stickers Bot: https://telegram.me/stickers
2. Type `/addsticker`
3. Choose the Sticker pack
4. Send the PNG file and follow the instructions.

### Animated Stickers + Sticker Pack submissions
How to create the intial `animated` Sticker pack:
1. Contact the Telegram Stickers Bot: https://telegram.me/stickers
2. Type `/newanimated`
3. Name the sticker pack
4. Send the .TGS file to the bot
5. List out the emoji(s) that correspond to the sticker. They recommend no more than two emojis per sticker.
6. Add another sticker if you want (follow steps 4,5 again)
7. When finished type `/publish`
8. If desired, you can send a 100x100 animated TGS file for the sticker pack icon.
9. Provide a short name for the Sticker pack and a custom URL will be generated like this: https://telegram.me/addstickers/Animals

How to add Stickers to an existing `animated` Sticker Pack:
1. Contact the Telegram Stickers Bot: https://telegram.me/stickers
2. Type `/addsticker`
3. Choose the Sticker pack
4. Send the PNG file and follow the instructions.


## How to organize the bounty
Bounty distribution:
* $250 - spread among 10 stickers
* $50 - a "grand prize". Once all 10 stickers have been submitted, a forum thread will be created and users can vote for the stickers in order of how much they like them (1-10 ranked). This will have a deadline for 30 days after the start of the competition.

1. A user creates a Telegram sticker
2. A single spending proposal including the media is submitted (if users need help understanding how to submit `spending proposals` they can ask in the Joystream Telegram Chat (https://t.me/JoyStreamOfficial) Note that the media can be hosted on a site like imgur.com as Proposals do not allow uploading media.
3. The council votes on whether to accept the sticker and at the same time pay for it (keeping in mind the Community Bounty Success Events: https://testnet.joystream.org/#/forum/threads/157) 
4. The user submits a PR to the community repo with the content (if the user doesn't know how to use Github then someone from the council can submit on their behalf if they are ok with that)

Additionally, if a user wants to "reserve" the right to submit a sticker, they can submit a text proposal announcing their intention to submit a sticker. A user can only reserve one spot for a period of 7 days.

Example:
`user493` submits a text proposal that is approved, they then have 7 days to submit a spending proposal to fulfill their part of the bounty. Once the 7 days are over, if they have not submitted a spending proposal, then they forfeit the place.

Rules:
1. The content must be original or use media with acceptable licenses and be compatible with the licenses used in the community repo
2. Users can submit as many stickers as they want, but they must each be submitted in individual spending proposals
3. The $50 "grand prize" will take place no later than 30 days after the competition has started. Whichever stickers are submitted in this timeframe will be added to the "grand prize" thread.
4. The rules, requirements and deadlines can be amended by approved `text proposals`
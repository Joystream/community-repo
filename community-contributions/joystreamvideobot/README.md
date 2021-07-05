# Joystream Discord Video Bot ####

This Discord bot announces new video uploads. 

## Installation

```
git clone https://github.com/Joystream/community-repo
cd community-repo/community-contributions/joystreamvideobot 
yarn && yarn run build
```

## Configuration

### Get the channelid

You should use the channnel id instead of it's name.
How to get the channel id of a channel:
1- Open up your Discord Settings
2- Go to Appearance
3- Tick Developer Mode (And close the Discord settings)
4- Right click on your desired channel
5- Now there's an option Copy ID to copy the channel id

Open `config.ts` and set `channelId`.
Run `yarn && yarn run build` to apply your changes. 

### Get the Discord Token

Follow the [procedure](https://github.com/Joystream/community-repo/tree/master/community-contributions/discordbot)


### Running the bot

`TOKEN=<YOUR DISCORD TOOKEN HERE> node lib/src/bot.js`


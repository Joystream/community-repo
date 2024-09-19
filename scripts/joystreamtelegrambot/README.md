# Joystream Forum Post Notification Tool

This bot notifies a Telegram chat about events on the Joystream chain.

Demo: https://t.me/JoyStreamOfficial

Many thanks to [imOnlineMonitor](https://github.com/fkbenjamin/imOnlineMonitor) for providing example with polkadot chain (Kusama).

## Installation

[Joystream Node](https://github.com/Joystream/helpdesk/tree/master/roles/validators#instructions)\
[npm/Nodejs](https://github.com/Joystream/helpdesk/tree/master/roles/storage-providers#install-yarn-and-node-on-linux)

```
git clone https://github.com/joystream/community-repo
cd community-repo/community-contributions/joystreamtelegrambot
yarn
```

## Configuration

Open `config.ts` and fill in the variables:

- `token`: To get a bot token talk to @botfather on Telegram.
- `chatid`: See below to find id of your group.

Then run `npm run start` or `yarn run start`.
Alternatively you can manually build with `npm run build` and run for example `node dist/src/bot.js --verbose --channel --council --forum --proposals`.
For other options see below.

To test status of storage providers, add their domains to to `storageProviders.ts`.

### Get chatid

Full explanation: [How to get chatid](https://stackoverflow.com/questions/32423837/telegram-bot-how-to-get-a-group-chat-id)

```
1- Add the bot to the group.
Go to the group, click on group name, click on Add members, in the searchbox search for your bot like this: @my_bot, select your bot and click add.

2- Send a message to the group.

3- Go to `https://api.telegram.org/botXXX:YYYY/getUpdates` (replace XXX:YYYY with your bot token)

4- Look for "chat":{"id":-zzzzzzzzzz,
-zzzzzzzzzz is your chat id (including the negative sign).
```

Run `npm run start` (for example inside screen/tmux window or systemd).

## Running

| Command                    | Description                                        |
| :------------------------- | :------------------------------------------------- |
| `npm run start`            | run without parameters.                            |
| `npm run all`              | like `--channel --council --forum --proposals`     |
| `npm run verbose`          | like 'all', log information on every block         |
| `npm run quiet`            | like 'all' without output                          |
| `npm run channel`          | only channel info                                  |
| `npm run forum`            | only forum info                                    |
| `npm run council`          | only council info                                  |
| `npm run proposals`        | only proposal info                                 |
| `npm run [module]-verbose` | run [module] and log every block                   |
| `npm run dev`              | run all modules verbosely, respawn on file changes |
| `npm run [module]-dev`     | run [module] verbosely, respawn on file changes    |

If you need other combinations, add them to `package.json`


# Storage size notification bot for discord

Sends actual volume for Joystream Storage Providers to a channel every X hours or via PM with `/storagesize`.

## Development

- Take a copy of .env.example and add token of the bot and rename to .env
- `npm install`
- `nodemon`

## Deployment

- Take a copy of .env.example and add token of the bot and rename to .env
- `npm install`
- Use pm2 or any process managers to deploy
  - `npm install pm2@latest -g`
    or
    `yarn global add pm2`
  - `pm2 start --name storagesize node index.js`


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


## Development

To test api queries open `https://testnet.joystream.org/` -> Settings -> change interface operation mode to `Fully featured` and got to `https://testnet.joystream.org/#/chainstate`.

## License

[GPLv3](https://github.com/bitoven-dev/joystreamtelegrambot/blob/master/LICENSE)

### Contributions

- bitoven created the first version written in javascript.

- Oct 2020: migration to typescript (l1dev)

- 2021: maintenance and more functions (l1dev)

- Feb 2022: merged `storagesizebot` (nexusfallout) and `joystreamvideobot` (isonar)


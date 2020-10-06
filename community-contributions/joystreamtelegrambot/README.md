# Joystream Forum Post Notification Tool

This bot notifies a Telegram chat about events on the Joystream chain.

Demo: https://t.me/jsforumnotification

Many thanks to [imOnlineMonitor](https://github.com/fkbenjamin/imOnlineMonitor) for providing example with polkadot chain (Kusama).

## Installation

[Joystream Node](https://github.com/Joystream/helpdesk/tree/master/roles/validators#instructions)\
[npm/Nodejs](https://github.com/Joystream/helpdesk/tree/master/roles/storage-providers#install-yarn-and-node-on-linux)

```
git clone https://github.com/bitoven-dev/joystreamtelegrambot
cd joystreamtelegrambot
npm install
```

## Configuration

Open `config.ts` and set `token` and `chatid`. To get a bot token talk to @botfather on Telegram.

Run `npm run build` to apply changes. After building \*.js files are available in `dist/` and you can run for example `node dist/bot.js --verbose --channel --council --forum --proposals`. For other options see below.

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

## Development

To test api queries open `https://testnet.joystream.org/` -> Settings -> change interface operation mode to `Fully featured` and got to `https://testnet.joystream.org/#/chainstate`.

## License

[GPLv3](https://github.com/bitoven-dev/joystreamtelegrambot/blob/master/LICENSE)

### Notes

- bitoven created the first version written in javascript.

- traumschule migrated and refactored it to typescript.

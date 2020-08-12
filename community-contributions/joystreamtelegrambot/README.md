# Joystream Forum Post Notification Tool

Many thanks to [imOnlineMonitor](https://github.com/fkbenjamin/imOnlineMonitor) for providing example with polkadot chain (Kusama).\
This script will notify several events on Joystream chain to Telegram group/channel/chat of your choice.\
Current demo is https://t.me/jsforumnotification

## Getting Started
### Requirements

[Joystream Node](https://github.com/Joystream/helpdesk/tree/master/roles/validators#instructions)\
[Yarn and Nodejs](https://github.com/Joystream/helpdesk/tree/master/roles/storage-providers#install-yarn-and-node-on-linux)

### Run
   ```
   git clone https://github.com/bitoven-dev/joystreamtelegrambot
   cd joystreamtelegrambot
   yarn install
   ```
Replace `yourowntoken` on `const token = 'yourtoken';` with your Telgram bot token. You can get it by talking to @botfather 

Replace `yourownchat` on `const chatid = 'yourchatid';` with your group/channel the bot will notify into. Bot needs to be added as admin, but it only needs to post message permission. [How to get chatid](https://stackoverflow.com/questions/32423837/telegram-bot-how-to-get-a-group-chat-id)

```
1- Add the bot to the group.
Go to the group, click on group name, click on Add members, in the searchbox search for your bot like this: @my_bot, select your bot and click add.

2- Send a dummy message to the bot.
You can use this example: /my_id @my_bot
(I tried a few messages, not all the messages work. The example above works fine. Maybe the message should start with /)

3- Go to following url: https://api.telegram.org/botXXX:YYYY/getUpdates
replace XXX:YYYY with your bot token

4- Look for "chat":{"id":-zzzzzzzzzz,
-zzzzzzzzzz is your chat id (with the negative sign). 
```

Run `node yourchoiceofscript.js` preferably inside screen/tmux window or systemd

## License
[GPLv3](https://github.com/bitoven-dev/joystreamtelegrambot/blob/master/LICENSE)

### Notes

I've just started to learn programming (JS), so any suggestions or PR is greatly appreciated 😁

# How to create and deploy a discord bot

There is a good [intro by Gabriel Romualdo](https://xtrp.io/blog/2020/07/31/build-and-deploy-a-discord-bot-with-node-and-discordjs-in-5-minutes/) outlining all steps.

For a deeper look, check the [developer reference](https://discord.js.org/#/docs/main/stable/general/welcome).

## Create bot account

- Go to https://discord.com/developers/applications
- Click `New Application`
- Click on the `Bot` tab and `Add Bot`
- Create an authorization link that allows server owners to add your bot by clicking on `OAuth2`
- Select the `scopes` like `bot` and permissions like `Send Messages` and copy the displayed URL. It contains your client ID and looks like this:
  `https://discord.com/api/oauth2/authorize?client_id=813108209128701952&permissions=35904&scope=bot`

## Add this bot to your server

If you want to add this bot to your server, click above link, login and authorize it.

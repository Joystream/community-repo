# Joystream Send Notification with scoring period deadlines.

Send Notification with the scoring period date.

## Configuration

Can be updated using `.env` file.

`TG_API_KEY_RU` - api token of the telegram bot for the Russion Version
`TG_API_KEY_EN` - api token of the telegram bot for the English Version
`DISCORD_TOKEN_RU` - api token of the Discord bot for the Russion Version
`DISCORD_TOKEN_EN` - api token of the Discord bot for the English Version

## Commands

`yarn` install dependencies

Start the bots with the following commands:
`yarn pm2en`
`yarn pm2ru`

Check status:
`pm2 status`

Stop the bots with the following commands:
`pm2 stop bot-en` 
`pm2 stop bot-ru` 
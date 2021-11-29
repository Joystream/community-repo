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

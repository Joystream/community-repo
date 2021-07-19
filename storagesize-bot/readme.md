# Storage size notification bot for discord

## Running the bot locally

- Take a copy of .env.example and add token of the bot and rename to .env
- `npm install`
- `nodemon`

## Deploying it

- Take a copy of .env.example and add token of the bot and rename to .env
- `npm install`
- Use pm2 or any process managers to deploy
  - `npm install pm2@latest -g`
    or
    `yarn global add pm2`
  - pm2 start ./index.js

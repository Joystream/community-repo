# Joystream Working Groups Bot

Discord Bot which informs Joystream DAO about the important events related to working groups: new openings, review periods, hires, fires, applications etc. Built in Node.js.

Supports new Working Groups [introduced in Giza network](https://github.com/Joystream/helpdesk/tree/master/roles). 


# Configuration

The main configuration file is `src/config.ts`. Here, the mapping between the Working Groups and Discord channels is kept. You may map several Working Groups to a single channnel, or have each Working Group notifications sent to a dedicated channel, depending on your needs. Make sure your bot has appropriate permissions to channels you configured in `src/config.ts`. 

# Installation

Build with `yarn`

Run using `TOKEN=<BOT TOKEN> RPC_ENDPOINT=wss://rome-rpc-endpoint.joystream.org:9944 ts-node src/index.ts`

# Troubleshooting
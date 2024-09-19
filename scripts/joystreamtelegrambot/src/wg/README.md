# Joystream Working Groups Bot

Discord Bot which informs Joystream DAO about the important events related to working groups: new openings, review periods, hires, fires, applications etc. Built in Node.js.

Supports new Working Groups [introduced in Giza network](https://github.com/Joystream/helpdesk/tree/master/roles). 

# Roadmap

How would this product evolve depends chiefly on the demand from the DAO. However, it seems reasonable to add the following features:

1. Interactive slash commands (`/salary` to see my salary, `/earnings` to get earnings for last X days, etc.) ONLY YOUR IMAGINATION IS THE LIMIT HERE :) 
2. Show "before/after" state for Salary and Stake events
3. Add a clickable link to apply on an opening
4. [Support for new events](https://discord.com/channels/811216481340751934/933726271832227911/938414244876136478)

# Issues

1. [Missed some events](https://discord.com/channels/811216481340751934/933726271832227911/938506091510243340)
2. [Title needed instead of headline](https://discord.com/channels/811216481340751934/933726271832227911/938456356682346566)



# Configuration

The main configuration file is `src/config.ts`. Here, the mapping between the Working Groups and Discord channels is kept. You may map several Working Groups to a single channnel, or have each Working Group notifications sent to a dedicated channel, depending on your needs. Make sure your bot has appropriate permissions to channels you configured in `src/config.ts`. 

# Installation

Build with `yarn`

Run using `TOKEN=<BOT TOKEN> RPC_ENDPOINT=wss://rome-rpc-endpoint.joystream.org:9944 ts-node src/index.ts`

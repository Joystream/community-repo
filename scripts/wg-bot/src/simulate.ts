import { connectUpstream } from './joystream/ws'
import { ApiPromise } from '@polkadot/api'
import Discord, { Intents } from 'discord.js'
import {processBlock} from './joystream/discord'
import { workingGroups } from './config'

const eventsMapping = {
    'MintCapacityChanged': 4211575,
    'OpeningFilled': 4206250,
    'OpeningAdded': 4224720,
    'WorkerRewardAmountUpdated': 4222426,
    'AppliedOnOpening': 4264168,
}



const discordBotToken = process.env.TOKEN || undefined // environment variable TOKEN must be set

;(async () => {
  
    const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS] });

    client.once("ready", async () => {
      console.log('Discord.js client ready');
      Object.values(workingGroups).forEach( async (mappedChannel: string) => {
        await client.channels.fetch(mappedChannel);
      })
    });
    
    await client.login(discordBotToken); 
    console.log('Bot logged in successfully');    
    
    connectUpstream().then( async (api: ApiPromise) => {
        Object.values(eventsMapping).forEach(async (block: number) => {
            await processBlock(api, client, block)
        })
      })
})()

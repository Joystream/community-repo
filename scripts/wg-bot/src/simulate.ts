import { connectUpstream } from './joystream/ws'
import { ApiPromise } from '@polkadot/api'
import Discord, { Intents } from 'discord.js'
import {processBlock} from './joystream/discord'
import { workingGroups } from './config'

const eventsMapping = {
    'MintCapacityChanged': 4211575,
    'OpeningFilled': 4206250,
    'OpeningAdded': 4224720,
    'OpeningAdded2': 4392577,
    'WorkerRewardAmountUpdated': 4389286,
    'WorkerRewardAmountUpdated2': 4222426,
    'AppliedOnOpening': 4264168,
    'AppliedOnOpening2': 4393863,
    'StakeIncreased': 4264798,
    'StakeDecreased': 4264862,
    'BeganApplicationReview': 4276739,
    'TerminatedLeader': 4282370,
    'LeaderUnset': 4282370
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

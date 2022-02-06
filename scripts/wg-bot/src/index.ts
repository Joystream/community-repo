import { connectUpstream } from './joystream/ws'
import { ApiPromise } from '@polkadot/api'
import { Header } from '@polkadot/types/interfaces'
import Discord, { Intents } from 'discord.js'
import {processBlock} from './joystream/discord'
import { workingGroups } from './config'


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
        api.rpc.chain.subscribeNewHeads(async (header: Header) => {
          const id = +header.number;
          await processBlock(api, client, id);
        })  
      })
})()

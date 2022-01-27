import { connectUpstream } from './joystream/ws'
import { ApiPromise } from '@polkadot/api'
import { BlockHash, EventRecord, Header } from '@polkadot/types/interfaces'
import { wgEvents, workingGroups } from './config'
import Discord, { Intents } from 'discord.js';

const TYPES_AVAILABLE = [] as const
type ApiType = typeof TYPES_AVAILABLE[number]

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
    
    connectUpstream().then( async (api: any) => {
        api.rpc.chain.subscribeNewHeads(async (header: Header) => {
          const id = +header.number
          const hash = await getBlockHash(api, id)
          const blockEvents = await api.query.system.events.at(hash)
          blockEvents.forEach(async ({ event }: EventRecord) => {
            let { section, method, data } = event
            if (wgEvents.includes(method) && Object.keys(workingGroups).includes(section)) {
                console.log(section);
                console.log(method);
                console.log(data.toJSON());

                const channel: Discord.TextChannel = client.channels.cache.get(workingGroups[section]) as Discord.TextChannel;
                if(channel) {
                    const exampleEmbed = new Discord.MessageEmbed()
                    .setColor('#4038FF') // official joystream blue, see https://www.joystream.org/brand/guides/
                    .setTitle('Working Group Update')
                    .setDescription('//TODO') 
                    .addFields(
                      { name: 'Data', value: data.toString(), inline: true },
                    )
                    .setTimestamp();
                    channel.send({ embeds: [exampleEmbed] });    
                } else {
                    console.log(`Channel not configured for ${section}`);
                }
            }
          });
        })  
      })
})()

const getBlockHash = (api: ApiPromise, blockId: number) =>
  api.rpc.chain.getBlockHash(blockId).then((hash: BlockHash) => hash.toString())

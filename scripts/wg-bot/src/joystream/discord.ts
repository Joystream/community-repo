import { EventRecord} from '@polkadot/types/interfaces'
import { getWorker, getMember, getEvents, getBlockHash } from '../lib/api';
import { wgEvents, workingGroups } from '../config'
import Discord from 'discord.js';
import { ApiPromise } from '@polkadot/api';

export const processBlock = async (api: ApiPromise, client: Discord.Client, blockNumber: number) => {
    const hash = await getBlockHash(api, blockNumber);
    const blockEvents = await getEvents(api, hash);
    blockEvents.forEach(async (value: EventRecord, index: number, array: EventRecord[]) => {
      let { section, method, data } = value.event;
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
}
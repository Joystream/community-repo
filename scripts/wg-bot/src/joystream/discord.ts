import { EventRecord} from '@polkadot/types/interfaces'
import { getWorker, getMember, getMint, getEvents, getBlockHash } from '../lib/api';
import { wgEvents, workingGroups, joystreamBlue } from '../config'
import Discord from 'discord.js';
import { ApiPromise } from '@polkadot/api';
import { u32 } from '@polkadot/types';
import { formatBalance } from '@polkadot/util';

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

            if(method === 'MintCapacityChanged') {
                const mintId = (data[0] as u32).toNumber()
                const minted = (data[1] as u32).toNumber()
                const mint = await getMint(api, undefined, mintId)

                const exampleEmbed = new Discord.MessageEmbed()
                .setColor(joystreamBlue) 
                .setTitle(`💰 💵 💸 💴 💶 ${formatBalance(minted, {withUnit: 'JOY'})} minted to the Treasury 💰 💵 💸 💴 💶 `)
                .addFields(
                  { name: 'Balance', value: mint.capacity + "", inline: true },
                  { name: 'Block', value: blockNumber + "", inline: true },
                  { name: 'Tx', value: value.hash.toString(), inline: true },
                )
                .setTimestamp();
                channel.send({ embeds: [exampleEmbed] });    
              }
          } else {
              console.log(`Channel not configured for ${section}`);
          }
      }
    });
}
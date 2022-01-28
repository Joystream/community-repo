import { EventRecord} from '@polkadot/types/interfaces'
import { getWorker, getMember, getMint, getEvents, getBlockHash } from '../lib/api';
import { getOpening } from './api_extension';

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
                const mint = (await getMint(api, hash, mintId)).capacity

                const exampleEmbed = new Discord.MessageEmbed()
                .setColor(joystreamBlue) 
                .setTitle(`💰 💵 💸 💴 💶 ${formatBalance(minted, {withUnit: 'JOY'})} minted to the Treasury 💰 💵 💸 💴 💶 `)
                .addFields(
                  { name: 'Balance', value: formatBalance(mint, {withUnit: 'JOY'}), inline: true },
                  { name: 'Block', value: blockNumber + "", inline: true },
                  { name: 'Tx', value: value.hash.toString(), inline: true },
                )
                .setTimestamp();
                channel.send({ embeds: [exampleEmbed] });
            } else if (method === 'OpeningAdded') {
                const openingId = (data[0] as u32).toNumber()
                const opening = (await getOpening(api, hash, openingId)).human_readable_text.toJSON()
                const exampleEmbed = new Discord.MessageEmbed()
                .setColor(joystreamBlue) 
                .setTitle(`Apply for new Opening!`)
                .setDescription(opening)
                .addFields(
                //   { name: 'Opening', value: , inline: true },
                  { name: 'Block', value: blockNumber + "", inline: true },
                  { name: 'Tx', value: value.hash.toString(), inline: true },
                )
                .setTimestamp();
                channel.send({ embeds: [exampleEmbed] });    
            } else if (method === 'OpeningFilled') {
                const openingId = (data[0] as u32).toNumber()
                const opening = (await getOpening(api, hash, openingId)).human_readable_text.toJSON()
                console.log(opening);
                const exampleEmbed = new Discord.MessageEmbed()
                .setColor(joystreamBlue) 
                .setTitle(`XXXX was hired as ${JSON.parse(opening).job.title} 🎉 🥳 👏🏻`)
                .setDescription(opening)
                .addFields(
                    { name: 'Block', value: blockNumber + "", inline: true },
                    { name: 'Tx', value: value.hash.toString(), inline: true },
                )
                .setTimestamp();
                channel.send({ embeds: [exampleEmbed] });
            } else if (method === 'WorkerRewardAmountUpdated') {
                const workerId = (data[0] as u32).toNumber()
                const worker = (await getWorker(api, section, hash, workerId)) 
                const member = (await getMember(api, worker.member_id))
                const exampleEmbed = new Discord.MessageEmbed()
                .setColor(joystreamBlue) 
                .setTitle(`💰💰💰 Salary of ${member.handle} updated`)
                .addFields(
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
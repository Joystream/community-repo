import { EventRecord } from '@polkadot/types/interfaces'
import { getWorker, getMember, getMint, getEvents, getBlockHash } from '../lib/api';
import { getHiringOpening, getOpening } from './api_extension';

import { wgEvents, workingGroups, joystreamBlue } from '../config'
import Discord from 'discord.js';
import { ApiPromise } from '@polkadot/api';
import { u32 } from '@polkadot/types';
import { formatBalance } from '@polkadot/util';
import { ApplicationIdToWorkerIdMap } from '@joystream/types/working-group';

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
            if (channel) {

                if (method === 'MintCapacityChanged') {
                    const mintId = (data[0] as u32).toNumber()
                    const minted = (data[1] as u32).toNumber()
                    const mint = (await getMint(api, hash, mintId)).capacity

                    const exampleEmbed = new Discord.MessageEmbed()
                        .setColor(joystreamBlue)
                        .setTitle(`💰 💵 💸 💴 💶 ${formatBalance(minted, { withUnit: 'JOY' })} minted to the Treasury 💰 💵 💸 💴 💶 `)
                        .addFields(
                            { name: 'Balance', value: formatBalance(mint, { withUnit: 'JOY' }), inline: true },
                            { name: 'Block', value: blockNumber + "", inline: true },
                            { name: 'Tx', value: value.hash.toString(), inline: true },
                        )
                        .setTimestamp();
                    channel.send({ embeds: [exampleEmbed] });
                } else if (method === 'OpeningAdded') {
                    const openingId = (data[0] as u32).toNumber()
                    const openingObject = await getOpening(api, section, hash, openingId)
                    const hiringOpening = await getHiringOpening(api, hash, openingObject.hiring_opening_id)
                    const opening = JSON.parse(hiringOpening.human_readable_text.toString())
                    const exampleEmbed = new Discord.MessageEmbed()
                        .setColor(joystreamBlue)
                        .setTitle(`⛩ ${opening.headline} ⛩`)
                        .setDescription(opening.job.description)
                        .addFields(
                            { name: 'Reward', value: opening.reward, inline: true },
                            { name: 'Application Stake', value: openingObject.policy_commitment.application_staking_policy.unwrap().amount.toString() || 'Not Set', inline: true },
                            { name: 'Role Stake', value: openingObject.policy_commitment.role_staking_policy.unwrap().amount.toString() || 'Not Set', inline: true },
                            { name: 'Created By', value: opening.creator.membership.handle, inline: true },
                            { name: 'Block', value: blockNumber + "", inline: true },
                            { name: 'Tx', value: value.hash.toString(), inline: true },
                        )
                        .setTimestamp();
                    channel.send({ embeds: [exampleEmbed] });
                } else if (method === 'OpeningFilled') {
                    const openingId = (data[0] as u32).toNumber()
                    const workerId = Object.values(JSON.parse(data[1].toString()))[0] as number
                    const worker = (await getWorker(api, section, hash, workerId))
                    const member = (await getMember(api, worker.member_id))
                    const openingObject = await getOpening(api, section, hash, openingId)
                    const hiringOpening = await getHiringOpening(api, hash, openingObject.hiring_opening_id)
                    const opening = JSON.parse(hiringOpening.human_readable_text.toString())
                    const exampleEmbed = new Discord.MessageEmbed()
                        .setColor(joystreamBlue)
                        .setTitle(`🎉 🥳 👏🏻 ${member.handle} was hired as ${opening.job.title} 🎉 🥳 👏🏻`)
                        // .setTitle(`🎉 🥳 👏🏻 ${member.handle} was hired as !!!!!!!!!!!!!!!!!!!!!!!!!! 🎉 🥳 👏🏻`)
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
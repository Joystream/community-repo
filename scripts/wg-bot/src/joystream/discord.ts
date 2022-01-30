import { EventRecord } from '@polkadot/types/interfaces'
import { getWorker, getMember, getMint, getEvents, getBlockHash, getWorkerReward } from '../lib/api';
import { getHiringOpening, getOpening } from './api_extension';
import { getMintCapacityChangedEmbed, getOpeningAddedEmbed, getOpeningFilledEmbed, getWorkerRewardAmountUpdatedEmbed } from './embeds';

import { wgEvents, workingGroups, joystreamBlue } from '../config'
import Discord from 'discord.js';
import { ApiPromise } from '@polkadot/api';
import { u32 } from '@polkadot/types';

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
                    channel.send({ embeds: [getMintCapacityChangedEmbed(minted, mint, blockNumber, value)] });
                } else if (method === 'OpeningAdded') {
                    const openingId = (data[0] as u32).toNumber()
                    const openingObject = await getOpening(api, section, hash, openingId)
                    const hiringOpening = await getHiringOpening(api, hash, openingObject.hiring_opening_id)
                    const opening = JSON.parse(hiringOpening.human_readable_text.toString())
                    channel.send({ embeds: [getOpeningAddedEmbed(opening, openingObject, blockNumber, value)] });
                } else if (method === 'OpeningFilled') {
                    const openingId = (data[0] as u32).toNumber()
                    const workerId = Object.values(JSON.parse(data[1].toString()))[0] as number
                    const worker = (await getWorker(api, section, hash, workerId))
                    const member = (await getMember(api, worker.member_id))
                    const openingObject = await getOpening(api, section, hash, openingId)
                    const hiringOpening = await getHiringOpening(api, hash, openingObject.hiring_opening_id)
                    const opening = JSON.parse(hiringOpening.human_readable_text.toString())
                    channel.send({ embeds: [getOpeningFilledEmbed(opening, member, blockNumber, value)] });
                } else if (method === 'WorkerRewardAmountUpdated') {
                    const workerId = (data[0] as u32).toNumber()
                    const worker = await getWorker(api, section, hash, workerId)
                    const member = await getMember(api, worker.member_id)
                    const reward = await getWorkerReward(api, hash, worker.reward_relationship.unwrap())
                    channel.send({ embeds: [getWorkerRewardAmountUpdatedEmbed(reward, member, blockNumber, value)] });
                }
            } else {
                console.log(`Channel not configured for ${section}`);
            }
        }
    });
}
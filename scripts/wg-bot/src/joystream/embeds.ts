import { joystreamBlue } from '../config'
import { formatBalance } from '@polkadot/util';
import { u128 } from '@polkadot/types';
import { EventRecord } from '@polkadot/types/interfaces';
import Discord from 'discord.js';
import { Membership, OpeningOf, RewardRelationship } from '@joystream/types/augment-codec/all';


export const getMintCapacityChangedEmbed = (minted: number, mint: u128, blockNumber: number, event: EventRecord): Discord.MessageEmbed => {

    return new Discord.MessageEmbed()
        .setColor(joystreamBlue)
        .setTitle(`💰 💵 💸 💴 💶 ${formatBalance(minted, { withUnit: 'JOY' })} minted to the Treasury 💰 💵 💸 💴 💶 `)
        .addFields(
            { name: 'Balance', value: formatBalance(mint, { withUnit: 'JOY' }), inline: true },
            { name: 'Block', value: blockNumber + "", inline: true },
            { name: 'Tx', value: event.hash.toString(), inline: true },
        )
        .setTimestamp();
}

export const getOpeningAddedEmbed = (opening: any, openingObject: OpeningOf, blockNumber: number, event: EventRecord): Discord.MessageEmbed => {

    return new Discord.MessageEmbed()
        .setColor(joystreamBlue)
        .setTitle(`⛩ ${opening.headline} ⛩`)
        .setDescription(opening.job.description)
        .addFields(
            { name: 'Reward', value: opening.reward, inline: true },
            { name: 'Application Stake', value: openingObject.policy_commitment.application_staking_policy.unwrap().amount.toString() || 'Not Set', inline: true },
            { name: 'Role Stake', value: openingObject.policy_commitment.role_staking_policy.unwrap().amount.toString() || 'Not Set', inline: true },
            { name: 'Created By', value: opening.creator.membership.handle, inline: true },
            { name: 'Block', value: blockNumber + "", inline: true },
            { name: 'Tx', value: event.hash.toString(), inline: true },
        )
        .setTimestamp();
}

export const getOpeningFilledEmbed = (opening: any, member: Membership, blockNumber: number, event: EventRecord): Discord.MessageEmbed => {

    return new Discord.MessageEmbed()
        .setColor(joystreamBlue)
        .setTitle(`🎉 🥳 👏🏻 ${member.handle} was hired as ${opening.job.title} 🎉 🥳 👏🏻`)
        .addFields(
            { name: 'Block', value: blockNumber + "", inline: true },
            { name: 'Tx', value: event.hash.toString(), inline: true },
        )
        .setTimestamp();
}


export const getWorkerRewardAmountUpdatedEmbed = (reward: RewardRelationship, member: Membership, 
    blockNumber: number, event: EventRecord): Discord.MessageEmbed => {

    return new Discord.MessageEmbed()
        .setColor(joystreamBlue)
        .setTitle(`💰💰💰 Salary of ${member.handle} updated`)
        .addFields(
            { name: 'Salary', value: formatBalance(reward.amount_per_payout, { withUnit: 'JOY' }), inline: true },
            { name: 'Payout Frequency', value: reward.payout_interval + "", inline: true },
            { name: 'Block', value: blockNumber + "", inline: true },
            { name: 'Tx', value: event.hash.toString(), inline: true },
        )
        .setTimestamp();
}
import { joystreamBlue } from '../config'
import { formatBalance } from '@polkadot/util';
import { u128 } from '@polkadot/types';
import { EventRecord } from '@polkadot/types/interfaces';
import Discord from 'discord.js';
import { ApplicationId, ApplicationOf, Membership, OpeningOf, RewardRelationship } from '@joystream/types/augment-codec/all';


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
            { name: 'ID', value: openingObject.hiring_opening_id + "", inline: true },
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

export const getAppliedOnOpeningEmbed = (applicationId: ApplicationId, application: ApplicationOf, 
    openingText: any, hiringApplicationText: any, applicant: Membership, blockNumber: number, event: EventRecord): Discord.MessageEmbed => {

    return new Discord.MessageEmbed()
        .setColor(joystreamBlue)
        .setTitle(`🏛 ${applicant.handle} applied to opening ${openingText.job.title}`)
        .setDescription(hiringApplicationText['About you']['What makes you a good fit for the job?'])
        .addFields(
            { name: 'Application ID', value: applicationId.toString(), inline: true},
            { name: 'Opening', value:  openingText.headline, inline: true},
            { name: 'Applicant', value: `[${application.member_id}] ${hiringApplicationText['About you']['Your name']}`, inline: true},
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

export const getLeaderSetEmbed = (member: Membership, blockNumber: number, event: EventRecord): Discord.MessageEmbed => {

    return new Discord.MessageEmbed()
        .setColor(joystreamBlue)
        .setTitle(`🏛 ${member.handle} is a new Lead`)
        .addFields(
            { name: 'Block', value: blockNumber + "", inline: true },
            { name: 'Tx', value: event.hash.toString(), inline: true },
        )
        .setTimestamp();
}

export const getLeaderUnsetEmbed = (blockNumber: number, event: EventRecord): Discord.MessageEmbed => {

    return new Discord.MessageEmbed()
        .setColor(joystreamBlue)
        .setTitle(`🏛 Leader was unset`)
        .addFields(
            { name: 'Block', value: blockNumber + "", inline: true },
            { name: 'Tx', value: event.hash.toString(), inline: true },
        )
        .setTimestamp();
}

export const getWorkerTerminatedEmbed = (member: Membership, reason: string,
    blockNumber: number, event: EventRecord): Discord.MessageEmbed => {
    return getWorkerExitedOrTerminatedEmbed('been terminated', member, reason, blockNumber, event);
}

export const getWorkerExitedEmbed = (member: Membership, reason: string,
    blockNumber: number, event: EventRecord): Discord.MessageEmbed => {
    return getWorkerExitedOrTerminatedEmbed('exited', member, reason, blockNumber, event);
}

export const getWorkerExitedOrTerminatedEmbed = (action: string, member: Membership, reason: string,
    blockNumber: number, event: EventRecord): Discord.MessageEmbed => {

    return new Discord.MessageEmbed()
        .setColor(joystreamBlue)
        .setTitle(`🏛 Worker ${member.handle} has ${action}`)
        .addFields(
            { name: 'Reason', value: reason, inline: true },
            { name: 'Block', value: blockNumber + "", inline: true },
            { name: 'Tx', value: event.hash.toString(), inline: true },
        )
        .setTimestamp();
}

export const getApplicationTerminatedEmbed = (applicationId: ApplicationId, application: ApplicationOf, member: Membership,
    blockNumber: number, event: EventRecord): Discord.MessageEmbed => {

    return getApplicationTerminatedOrWithdrawEmbed("terminated", applicationId, application, member, blockNumber, event);
}

export const getApplicationWithdrawnEmbed = (applicationId: ApplicationId, application: ApplicationOf, member: Membership,
    blockNumber: number, event: EventRecord): Discord.MessageEmbed => {

    return getApplicationTerminatedOrWithdrawEmbed("withdrawn", applicationId, application, member, blockNumber, event);
}

export const getApplicationTerminatedOrWithdrawEmbed = (action: string, applicationId: ApplicationId, application: ApplicationOf, member: Membership,
    blockNumber: number, event: EventRecord): Discord.MessageEmbed => {

    return new Discord.MessageEmbed()
        .setColor(joystreamBlue)
        .setTitle(`🏛 Application of ${member.handle} ${action}`)
        .addFields(
            { name: 'Application ID', value: applicationId.toString(), inline: true },
            { name: 'Opening ID', value: application.opening_id.toString(), inline: true },
            { name: 'Block', value: blockNumber + "", inline: true },
            { name: 'Tx', value: event.hash.toString(), inline: true },
        )
        .setTimestamp();
}
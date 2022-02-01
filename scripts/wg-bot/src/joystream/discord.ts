import { EventRecord } from '@polkadot/types/interfaces'
import { getWorker, getMember, getMint, getEvents, getBlockHash, getWorkerReward, getStake } from '../lib/api';
import { getApplication, getHiringApplication, getHiringOpening, getOpening } from './api_extension';
import { 
    getApplicationTerminatedEmbed, 
    getApplicationWithdrawnEmbed, 
    getAppliedOnOpeningEmbed, 
    getBeganApplicationReviewEmbed, 
    getLeaderSetEmbed, 
    getLeaderUnsetEmbed, 
    getMintCapacityChangedEmbed, 
    getOpeningAddedEmbed, 
    getOpeningFilledEmbed, 
    getStakeUpdatedEmbed, 
    getWorkerExitedEmbed, 
    getWorkerRewardAmountUpdatedEmbed, 
    getWorkerTerminatedEmbed 
} from './embeds';

import { wgEvents, workingGroups } from '../config'
import Discord from 'discord.js';
import { ApiPromise } from '@polkadot/api';
import { MintBalanceOf, MintId } from '@joystream/types/mint';
import { ApplicationId, OpeningId } from '@joystream/types/hiring';
import { RationaleText, WorkerId } from '@joystream/types/working-group';

export const processBlock = async (api: ApiPromise, client: Discord.Client, blockNumber: number) => {
    const hash = await getBlockHash(api, blockNumber);
    const blockEvents = await getEvents(api, hash);
    blockEvents.forEach(async (value: EventRecord, index: number, array: EventRecord[]) => {
        let { section, method, data } = value.event;
        if (wgEvents.includes(method) && Object.keys(workingGroups).includes(section)) {
            console.log(`${blockNumber} ${section} ${method} ${data.toHuman()}`);

            const channel: Discord.TextChannel = client.channels.cache.get(workingGroups[section]) as Discord.TextChannel;
            if (channel) {
                switch(method) {
                    case "BeganApplicationReview":
                        const beganReviewId = data[0] as OpeningId
                        const beganReviewOpeningObject = await getOpening(api, section, hash, beganReviewId);
                        const beganReviewHiringOpening = await getHiringOpening(api, hash, beganReviewOpeningObject.hiring_opening_id);
                        const applicants = await Promise.all([...beganReviewOpeningObject.applications].map( async(appId: ApplicationId) => {
                            const application = await getApplication(api, section, hash, appId);
                            return await getMember(api, application.member_id);
                        }));
                        const beganReviewHiringOpeningText = JSON.parse(beganReviewHiringOpening.human_readable_text.toString());
                        channel.send({ embeds: [getBeganApplicationReviewEmbed(beganReviewHiringOpeningText, applicants, blockNumber, value)] });
                        break;
                    case "ApplicationTerminated":
                        const id = data[0] as ApplicationId
                        const terminatedApplication = await getApplication(api, section, hash, id);
                        const memberTerminatedApplication = await getMember(api, terminatedApplication.member_id);
                        channel.send({ embeds: [getApplicationTerminatedEmbed(id, terminatedApplication, memberTerminatedApplication, blockNumber, value)] });
                        break;
                    case "ApplicationWithdrawn":
                        const withdrawnId = data[0] as ApplicationId
                        const withdrawnApplication = await getApplication(api, section, hash, withdrawnId);
                        const memberWithdrawnApplication = await getMember(api, withdrawnApplication.member_id);
                        channel.send({ embeds: [getApplicationWithdrawnEmbed(id, withdrawnApplication, memberWithdrawnApplication, blockNumber, value)] });
                        break;
                    case "AppliedOnOpening":
                        const applicationOpeningId = data[0] as OpeningId;
                        const applicationId = data[1] as ApplicationId;
                        const application = await getApplication(api, section, hash, applicationId);
                        const hiringApplication = await getHiringApplication(api, section, hash, application.application_id);
                        const hiringApplicationText = JSON.parse(hiringApplication.human_readable_text.toString());
                        const openingObject = await getOpening(api, section, hash, applicationOpeningId);
                        const hiringOpening = await getHiringOpening(api, hash, openingObject.hiring_opening_id);
                        const openingText = JSON.parse(hiringOpening.human_readable_text.toString());
                        const applicant = await getMember(api, application.member_id);
                        channel.send({ embeds: [getAppliedOnOpeningEmbed(applicationId, application, openingText, hiringApplicationText, applicant, blockNumber, value)] });
                        break;
                    case "MintCapacityChanged":
                        const mintId = (data[0] as MintId).toNumber();
                        const minted = (data[1] as MintBalanceOf).toNumber();
                        const mint = (await getMint(api, hash, mintId)).capacity;
                        channel.send({ embeds: [getMintCapacityChangedEmbed(minted, mint, blockNumber, value)] });
                        break;
                    case "OpeningAdded": 
                        const addedOpeningId = data[0] as OpeningId;
                        const addedOpeningObject = await getOpening(api, section, hash, addedOpeningId);
                        const addedHiringOpening = await getHiringOpening(api, hash, addedOpeningObject.hiring_opening_id);
                        const addedOpeningText = JSON.parse(addedHiringOpening.human_readable_text.toString());
                        channel.send({ embeds: [getOpeningAddedEmbed(addedOpeningText, addedOpeningObject, blockNumber, value)] });
                        break;
                    case "OpeningFilled": 
                        const filledOpeningId = data[0] as OpeningId;
                        const hiredWorkerId = Object.values(JSON.parse(data[1].toString()))[0] as number;
                        const hiredWorker = await getWorker(api, section, hash, hiredWorkerId);
                        const hiredMember = await getMember(api, hiredWorker.member_id);
                        const filledOpeningObject = await getOpening(api, section, hash, filledOpeningId);
                        const filledHiringOpening = await getHiringOpening(api, hash, filledOpeningObject.hiring_opening_id);
                        const filledOpeningText = JSON.parse(filledHiringOpening.human_readable_text.toString());
                        channel.send({ embeds: [getOpeningFilledEmbed(filledOpeningText, hiredMember, blockNumber, value)] });
                        break;
                    case "WorkerRewardAmountUpdated": 
                        const workerId = data[0] as WorkerId;
                        const worker = await getWorker(api, section, hash, workerId.toNumber());
                        const member = await getMember(api, worker.member_id);
                        const reward = await getWorkerReward(api, hash, worker.reward_relationship.unwrap());
                        channel.send({ embeds: [getWorkerRewardAmountUpdatedEmbed(reward, member, blockNumber, value)] });
                        break;
                    case "TerminatedLeader":
                    case "TerminatedWorker":
                        const terminatedId = data[0] as WorkerId;
                        const terminatedReason = (data[1] as RationaleText).toString();
                        const terminatedIdWorker = await getWorker(api, section, hash, terminatedId.toNumber());
                        const terminatedMember = await getMember(api, terminatedIdWorker.member_id);
                        channel.send({ embeds: [getWorkerTerminatedEmbed(terminatedMember, terminatedReason, blockNumber, value)] });
                        break;
                    case "WorkerExited":
                        const exitedId = data[0] as WorkerId;
                        const exitedReason = (data[1] as RationaleText).toString();
                        const exitedIdWorker = await getWorker(api, section, hash, exitedId.toNumber());
                        const exitedMember = await getMember(api, exitedIdWorker.member_id);
                        channel.send({ embeds: [getWorkerExitedEmbed(exitedMember, exitedReason, blockNumber, value)] });
                        break;
                    case "LeaderSet": 
                        const leaderId = data[0] as WorkerId;
                        const leaderIdWorker = await getWorker(api, section, hash, leaderId.toNumber());
                        const leaderMember = await getMember(api, leaderIdWorker.member_id);
                        channel.send({ embeds: [getLeaderSetEmbed(leaderMember, blockNumber, value)] });
                        break;
                    case "LeaderUnset": 
                        channel.send({ embeds: [getLeaderUnsetEmbed(blockNumber, value)] });
                        break;
                    case "StakeDecreased":
                    case "StakeIncreased":
                    case "StakeSlashed":
                        const stakeWorkerId = data[0] as WorkerId;
                        const stakeWorker = await getWorker(api, section, hash, stakeWorkerId.toNumber());
                        const stakeMember = await getMember(api, stakeWorker.member_id);
                        const stake = await getStake(api, stakeWorker.role_stake_profile.unwrap().stake_id)
                        channel.send({ embeds: [getStakeUpdatedEmbed(stake, stakeMember, method.replace('Stake', ''), blockNumber, value)] });
                        break;
                }
            } else {
                console.log(`Channel not configured for ${section}`);
            }
        }
    });
}
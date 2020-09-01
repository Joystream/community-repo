export class StatisticsData {
    councilRound: number;
    councilMembers: number;

    electionApplicants: number;
    electionAvgApplicants: number = 0;
    perElectionApplicants: number;

    electionApplicantsStakes: number;
    electionVotes: number;
    avgVotePerApplicant: number;

    dateStart: string;
    dateEnd: string;

    startBlock: number;
    endBlock: number;
    percNewBlocks: number

    newIssuance: number;
    totalIssuance: number;
    percNewIssuance: number;

    newMembers: number;
    totalMembers: number;
    percNewMembers: number;

    newBlocks: number;
    avgBlockProduction: number;

    avgValidators: number;
    newValidatorReward: number;

    newStorageProviderReward: number;

    startThreads: number;
    endThreads: number;
    newThreads: number;
    totalThreads: number;
    percNewThreads: number;

    startPosts: number;
    endPosts: number;
    newPosts: number;
    totalPosts: number;
    percNewPosts: number;

    startCategories: number;
    endCategories: number;
    newCategories: number;
    perNewCategories: number;

    newProposals: number;

    newChannels: number;
    totalChannels: number;
    percNewChannels: number;

    newMedia: number;
    totalMedia: number;
    percNewMedia: number;

    deletedMedia: number;
    createdMints: number;
    totalMinted: number;
    totalMintCapacityIncrease: number;

    newCouncilMinted: number;
    newCuratorMinted: number;

    newTokensBurn: number;

    newUsedSpace: number;
    totalUsedSpace: number;
    percNewUsedSpace: number;

    avgNewSizePerContent: number;
    totalAvgSizePerContent: number;
    percAvgSizePerContent: number;

    newStakes: number;
    totalNewStakeValue: number;

    newTextProposals: number = 0;
    newRuntimeUpgradeProposal: number = 0;
    newSetElectionParametersProposal: number = 0;
    newSpendingProposal: number = 0;
    newSetLeadProposal:number = 0;
    newSetContentWorkingGroupMintCapacityProposal: number = 0;
    newEvictStorageProviderProposal: number = 0;
    newSetValidatorCountProposal: number = 0;
    newSetStorageRoleParametersProposal: number = 0;


    constructor() {
    }

}

export class ValidatorReward{
    sharedReward: number;
    remainingReward: number;
    validators: number;
    slotStake: number;
    blockNumber: number;
}

export class Exchange{
    sender: string;
    amount: number;
    fees: number;
    blockNumber: number;
}

export enum ProposalTypes {
    Text= "Text",
    RuntimeUpgrade = "RuntimeUpgrade",
    SetElectionParameters = "SetElectionParameters",
    Spending = "Spending",
    SetLead = "SetLead",
    SetContentWorkingGroupMintCapacity = "SetContentWorkingGroupMintCapacity",
    EvictStorageProvider = "EvictStorageProvider",
    SetValidatorCount = "SetValidatorCount",
    SetStorageRoleParameters = "SetStorageRoleParameters",
}

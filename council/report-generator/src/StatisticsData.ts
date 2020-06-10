export class StatisticsData {
    councilRound: number;
    councilMembers: number;

    councilApplicants: number;
    councilAvgApplicants: number;
    perCouncilApplicants: number;

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
    nrValidators: number;

    newThreads: number;
    totalThreads: number;
    percNewThreads: number;

    newPosts: number;
    totalPosts: number;
    percNewPosts: number;

    newCategories: number;

    newProposals: number;
    newMedia: number;
    deletedMedia: number;
    createdMints: number;
    totalMinted: number;
    totalMintCapacityIncrease: number;
    // totalBurned: number;
    totalNewUsedSpace: number;
    newStakes: number;
    totalNewStakeValue: number;

    constructor() {
    }

}
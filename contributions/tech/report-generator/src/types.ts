export interface Config {
  repoDir: string,
  reportsDir: string,
  spendingCategoriesFile: string,
  templateFile: string,
  providerUrl: string,
  statusUrl: string,
  burnAddress: string,
  cacheDir: string,
  councilRoundOffset: number,
  videoClassId: number,
  channelClassId: number,
}

export class Statistics {
  [key: string]: number | string;
  councilRound: number = 0;
  councilMembers: number = 0;

  electionApplicants: number = 0;
  electionAvgApplicants: number = 0;
  perElectionApplicants: number = 0;

  electionApplicantsStakes: number = 0;
  electionVotes: number = 0;
  avgVotePerApplicant: number = 0;

  dateStart: string = "";
  dateEnd: string = "";

  startBlock: number = 0;
  endBlock: number = 0;
  percNewBlocks: number = 0;

  startMembers: number = 0;
  endMembers: number = 0;
  newMembers: number = 0;
  percNewMembers: number = 0;

  newBlocks: number = 0;
  avgBlockProduction: number = 0;

  startThreads: number = 0;
  endThreads: number = 0;
  newThreads: number = 0;
  totalThreads: number = 0;
  percNewThreads: number = 0;

  startPosts: number = 0;
  newPosts: number = 0;
  endPosts: number = 0;
  percNewPosts: number = 0;

  startCategories: number = 0;
  endCategories: number = 0;
  newCategories: number = 0;
  perNewCategories: number = 0;

  newProposals: number = 0;
  newApprovedProposals: number = 0;

  startChannels: number = 0;
  newChannels: number = 0;
  endChannels: number = 0;
  percNewChannels: number = 0;

  startMedia: number = 0;
  newMedia: number = 0;
  endMedia: number = 0;
  percNewMedia: number = 0;

  deletedMedia: number = 0;
  newMints: number = 0;

  startMinted: number = 0;
  totalMinted: number = 0;
  percMinted: number = 0;
  endMinted: number = 0;

  totalMintCapacityIncrease: number = 0;

  startCouncilMinted: number = 0;
  endCouncilMinted: number = 0;
  newCouncilMinted: number = 0;
  percNewCouncilMinted: number = 0;

  startCuratorMinted: number = 0;
  endCuratorMinted: number = 0;
  newCuratorMinted: number = 0;
  percCuratorMinted: number = 0;

  startStorageMinted: number = 0;
  endStorageMinted: number = 0;
  newStorageMinted: number = 0;
  percStorageMinted: number = 0;

  startOperationsMinted: number = 0;
  endOperationsMinted: number = 0;
  newOperationsMinted: number = 0;
  percOperationsMinted: number = 0;

  startIssuance: number = 0;
  endIssuance: number = 0;
  newIssuance: number = 0;
  percNewIssuance: number = 0;

  newTokensBurn: number = 0;
  newValidatorRewards: number = 0;
  avgValidators: number = 0;
  startValidators: string = "";
  endValidators: string = "";
  percValidators: number = 0;
  startValidatorsStake: number = 0;
  endValidatorsStake: number = 0;
  percNewValidatorsStake: number = 0;

  startStorageProviders: number = 0;
  endStorageProviders: number = 0;
  percNewStorageProviders: number = 0;
  newStorageProviderReward: number = 0;
  startStorageProvidersStake: number = 0;
  endStorageProvidersStake: number = 0;
  percNewStorageProviderStake: number = 0;

  startOperationsWorkers: number = 0;
  endOperationsWorkers: number = 0;
  percNewOperationsWorkers: number = 0;
  newOperationsReward: number = 0;
  startOperationsStake: number = 0;
  endOperationsStake: number = 0;
  percNewOperationstake: number = 0;

  newCouncilRewards: number = 0;

  startCurators: number = 0;
  endCurators: number = 0;
  percNewCurators: number = 0;
  newCuratorRewards: number = 0;

  startUsedSpace: number = 0;
  newUsedSpace: number = 0;
  endUsedSpace: number = 0;
  percNewUsedSpace: number = 0;

  avgNewSizePerContent: number = 0;
  totalAvgSizePerContent: number = 0;
  percAvgSizePerContent: number = 0;

  newStakes: number = 0;
  totalNewStakeValue: number = 0;

  newTextProposals: number = 0;
  newRuntimeUpgradeProposal: number = 0;
  newSetElectionParametersProposal: number = 0;

  spendingProposalsTotal: number = 0;
  bountiesTotalPaid: number = 0;

  newSetLeadProposal: number = 0;
  newSetContentWorkingGroupMintCapacityProposal: number = 0;
  newEvictStorageProviderProposal: number = 0;
  newSetValidatorCountProposal: number = 0;
  newSetStorageRoleParametersProposal: number = 0;

  storageProviders: string;
  curators: string;
  operations: string;

  constructor() {}
}

export class ValidatorReward {
  sharedReward: number = 0;
  remainingReward: number = 0;
  validators: number = 0;
  slotStake: number = 0;
  blockNumber: number = 0;
}

export class WorkersInfo {
  rewards: number = 0;
  startStake: number = 0;
  endStake: number = 0;
  startNrOfWorkers: number = 0;
  endNrOfWorkers: number = 0;
}

export class Exchange {
  sender: string = "";
  amount: number = 0;
  fees: number = 0;
  blockNumber: number = 0;
}

export enum ProposalTypes {
  Text = "Text",
  RuntimeUpgrade = "RuntimeUpgrade",
  SetElectionParameters = "SetElectionParameters",
  Spending = "Spending",
  SetLead = "SetLead",
  SetContentWorkingGroupMintCapacity = "SetContentWorkingGroupMintCapacity",
  EvictStorageProvider = "EvictStorageProvider",
  SetValidatorCount = "SetValidatorCount",
  SetStorageRoleParameters = "SetStorageRoleParameters",
}

export class MintStatistics {
  startMinted: number;
  endMinted: number;
  diffMinted: number;
  percMinted: number;

  constructor(
    startMinted: number = 0,
    endMinted: number = 0,
    diffMinted: number = 0,
    percMinted: number = 0
  ) {
    this.startMinted = startMinted;
    this.endMinted = endMinted;
    this.diffMinted = diffMinted;
    this.percMinted = percMinted;
  }
}

export class Media {
  constructor(public id: number, public title: string) {}
}

export class Channel {
  constructor(public id: number, public title: string) {}
}

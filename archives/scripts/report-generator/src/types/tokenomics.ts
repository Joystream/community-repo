export interface Config {
  repoDir: string;
  reportsDir: string;
  spendingCategoriesFile: string;
  councilTemplate: string;
  tokenomicsTemplate: string;
  providerUrl: string;
  proposalUrl: string;
  statusUrl: string;
  burnAddress: string;
  cacheDir: string;
  councilRoundOffset: number;
  videoClassId: number;
  channelClassId: number;
}

export class Statistics {
  [key: string]: number | string | { [key: string]: number | string };
  councilRound: number = 0;
  councilMembers: number = 0;

  tokenomics: string;
  mintStats: string;
  workingGroups: string;

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

  newCouncilRewards: number = 0;
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

export interface WorkersInfo {
  index: number;
  labels: string[];
  stakes: { start: number; end: number; change: number };
  workers: { start: number; end: number; change: number };
  workersTable: string;
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

export interface MintStats {
  start: string;
  end: string;
  diff: number;
  change: number;
}

export class Media {
  constructor(public id: number, public title: string) {}
}

export class Channel {
  constructor(public id: number, public title: string) {}
}

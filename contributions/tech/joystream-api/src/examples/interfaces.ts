export interface Participant {
  memberId: number | number[],
  handle: string | string[],
  accountId: string,
}

export interface VoterData {
  voterId: Participant,
  voterStake: number,
  stakeRatioExJSGvotes: number,
  kpiRewardRatio: number,
}

export interface CouncilMemberData {
  councilMemberId: Participant,
  totalStake: number,
  totalStakeExJSGvotes: number,
  ownStake: number,
  otherStake: number,
  otherStakeExJSGvotes: number,
  stakeRatioExJSGvotes: number,
  voters: VoterData[],
  kpiRewardRatio?: number,
}

export interface CouncilData {
  electionCycle: number,
  electedAtBlock: number,
  mintCapacityAtStart: number,
  mintCapacityAtEnd?: number,
  councilSpending?: number,
  rewardamountPerPayout: number,
  rewardInterval: number,
  termEnd: number,
  expectedIndividualRewards: number,
  newCouncilStartsAt: number,
  totalStakes: number,
  totalStakesExJSGvotes: number,
  ownStakes: number,
  otherStakes: number,
  otherStakesExJSGvotes: number,
  elected: Participant[],
  electionData: CouncilMemberData[],
}
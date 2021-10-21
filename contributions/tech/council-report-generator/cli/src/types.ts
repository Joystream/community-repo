import { Hash } from "@polkadot/types/interfaces/types";
import { ProposalDetailsOf } from "@joystream/types/augment/types";

export class CouncilMemberInfo {
  username: string = "";
  memberId: number = 0;
  ownStake: number = 0;
  backersStake: number = 0;
  votesInProposals: number = 0;

  constructor() {}
}

export class CouncilRoundInfo {
  members: CouncilMemberInfo[] = [];
  membersOwnStake: number = 0;
  backersTotalStake: number = 0;
  membersTotalStake: number = 0;
  startMinted: number = 0;
  endMinted: number = 0;
}

export class BlockRange {
  constructor(
    public startBlockHeight: number,
    public startBlockHash: Hash,
    public endBlockHeight: number,
    public endBlockHash: Hash
  ) {}
}

export enum ProposalStatus {
  Active,
  // Approved,
  Executed,
  ExecutionFailed,
  PendingExecution,
  Rejected,
  Cancelled,
  Expired,
  Slashed,
}

export enum ProposalFailedReason {
  NotEnoughCapacity,
  ExecutionFailed,
}

export enum ProposalType {
  Text,
  RuntimeUpgrade,
  SetElectionParameters,
  Spending,
  SetLead,
  SetContentWorkingGroupMintCapacity,
  EvictStorageProvider,
  SetValidatorCount,
  SetStorageRoleParameters,
  AddWorkingGroupLeaderOpening,
  BeginReviewWorkingGroupLeaderApplication,
  FillWorkingGroupLeaderOpening,
  SetWorkingGroupMintCapacity,
  DecreaseWorkingGroupLeaderStake,
  SlashWorkingGroupLeaderStake,
  SetWorkingGroupLeaderReward,
  TerminateWorkingGroupLeaderRole,
}

export class ProposalInfo {
  id: number = 0;
  name: string = "";
  creatorUsername: string = "";
  votersUsernames: string[] = [];
  status = ProposalStatus.Active;
  type = ProposalType.Text;
  blocksToFinalized: number = 0;
  failedReason?: ProposalFailedReason;
  paymentDestinationMemberUsername?: string;
  paymentAmount?: number;
}

export class ReportData {
  averageBlockProductionTime = "";
  electionRound = 0;
  startBlockHeight = 0;
  endBlockHeight = 0;

  startMinted = 0;
  endMinted = 0;
  totalNewMinted = 0;
  percNewMinted = 0;

  councilTable = "";
  councilSecretary = "";
  councilDeputySecretary = "";

  proposalsCreated = 0;
  textProposals = 0;
  spendingProposals = 0;
  setWorkingGroupLeaderRewardProposals = 0;
  setWorkingGroupMintCapacityProposals = 0;
  beginReviewWorkingGroupLeaderApplicationProposals = 0;
  terminateWorkingGroupLeaderRoleProposals = 0;
  fillWorkingGroupLeaderOpeningProposals = 0;
  setValidatorCountProposals = 0;
  addWorkingGroupLeaderOpeningProposals = 0;
  setElectionParametersProposals = 0;
  runtimeUpgradeProposals = 0;

  approvedExecutedProposals = 0;
  canceledProposals = 0;
  rejectedProposals = 0;
  slashedProposals = 0;
  expiredProposals = 0;
  activeProposals = 0;

  proposalsFailedForNotEnoughCapacity = 0;
  proposalsFailedForExecutionFailed = 0;

  totalProposalsFinalizeTime = "";
  averageTimeForProposalsToFinalize = "";
  proposalBreakdown = "";
}

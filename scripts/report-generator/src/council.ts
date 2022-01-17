import { ApiPromise } from "@polkadot/api";
import {
  BlockRange,
  CouncilMemberInfo,
  CouncilRoundInfo,
  ProposalFailedReason,
  ProposalInfo,
  ProposalStatus,
  ProposalType,
  ReportData,
} from "./types/council";
import { StorageKey, U32, u32, Vec } from "@polkadot/types";
import { Seats } from "@joystream/types/council";
import { MemberId, Membership } from "@joystream/types/members";
import { Mint, MintId } from "@joystream/types/mint";
import { ProposalDetailsOf, ProposalOf } from "@joystream/types/augment/types";
import { Moment } from "@polkadot/types/interfaces";

const PROPOSAL_URL = "https://testnet.joystream.org/#/proposals/";
const ELECTION_OFFSET = 2;

export async function generateReportData(
  api: ApiPromise,
  blockRange: BlockRange
) {
  const averageBlockProductionTime = await computeAverageBlockProductionTime(
    api,
    blockRange
  );

  const proposals = await getProposals(api, blockRange);
  const electionRound = (await api.query.councilElection.round.at(
    blockRange.startBlockHash
  )) as u32;

  const roundInfo = await getCouncilMembersInfo(api, blockRange, proposals);
  const { members, membersOwnStake, backersTotalStake } = roundInfo;
  const { startMinted, endMinted } = roundInfo;

  let councilTable =
    "| Username             | Member ID | Prop. Votes Cast | CM Own Stake | CM Voter Stake |\n" +
    "|----------------------|-----------|------------------|--------------|----------------|\n";

  for (const member of members) {
    const { username, memberId, votesInProposals, ownStake, backersStake } =
      member;
    councilTable += `| @${username} | ${memberId} | ${votesInProposals} | ${ownStake} | ${backersStake} |\n`;
  }
  councilTable += `| | | Subtotal: | ${membersOwnStake} | ${backersTotalStake} |\n`;
  const totalStake = membersOwnStake + backersTotalStake;
  councilTable += `| | | Total: | ${totalStake} |  |\n`;

  const councilSecretary = getCouncilSecretary(proposals);
  const councilSecretaryDeputy = getCouncilSecretaryDeputy(proposals);

  let proposalsBreakdownText = "";
  for (const proposal of proposals) {
    const { id, name, type, status, failedReason, paymentAmount } = proposal;
    const { creatorUsername, votersUsernames, blocksToFinalized } = proposal;

    let proposalStatusText = "";
    switch (status) {
      case ProposalStatus.Active:
        proposalStatusText = "Passed to next council";
        break;
      case ProposalStatus.Executed:
        proposalStatusText = "Approved & Executed";
        break;
      case ProposalStatus.ExecutionFailed:
        const reason =
          ProposalFailedReason[failedReason as ProposalFailedReason];
        proposalStatusText = `Execution failed (${reason})`;
        break;
      case ProposalStatus.PendingExecution:
        proposalStatusText = "Execution Pending";
        break;
      case ProposalStatus.Rejected:
        proposalStatusText = "Rejected";
        break;
      case ProposalStatus.Cancelled:
        proposalStatusText = "Canceled";
        break;
      case ProposalStatus.Expired:
        proposalStatusText = "Expired";
        break;
      case ProposalStatus.Slashed:
        proposalStatusText = "Slashed";
        break;
    }

    proposalsBreakdownText += `#### Proposal ${id} - ${name}\n`;
    proposalsBreakdownText += `- Proposal Link: ${PROPOSAL_URL}${id}\n`;
    proposalsBreakdownText += `- Proposal Type: ${ProposalType[type]}\n`;

    if (paymentAmount)
      proposalsBreakdownText += `\t- Amount: ${paymentAmount}\n`;

    if (proposal.paymentDestinationMemberUsername)
      proposalsBreakdownText += `\t- Destination member: ${proposal.paymentDestinationMemberUsername}\n`;

    proposalsBreakdownText += `- Status: ${proposalStatusText}\n`;
    if (blocksToFinalized > 0 && status != ProposalStatus.Cancelled) {
      const time = averageBlockProductionTime;
      const days = convertBlocksToHours(blocksToFinalized, time);
      proposalsBreakdownText += `\t- Time to finalize: ${blocksToFinalized} blocks (${days}h)\n`;
    }
    proposalsBreakdownText += `- Created by: @${creatorUsername}\n`;
    let participantsText = votersUsernames.map((vote) => `@${vote}`).join(", ");
    proposalsBreakdownText += `- Participants: ${participantsText}\n\n`;
  }
  proposalsBreakdownText = proposalsBreakdownText.substring(
    0,
    proposalsBreakdownText.length - 2
  ); //Remove last \n\n

  let reportData = new ReportData();
  reportData.averageBlockProductionTime = averageBlockProductionTime.toFixed(2);
  reportData.electionRound = Number(electionRound.toBigInt());
  reportData.councilTerm = reportData.electionRound - ELECTION_OFFSET;
  reportData.startBlockHeight = blockRange.startBlockHeight;
  reportData.endBlockHeight = blockRange.endBlockHeight;
  reportData.startMinted = startMinted;
  reportData.endMinted = endMinted;

  reportData.totalNewMinted = endMinted - startMinted;
  reportData.percNewMinted = convertToPercentage(startMinted, endMinted);

  reportData.councilTable = councilTable;
  reportData.councilSecretary =
    councilSecretary == "" ? "?" : "@" + councilSecretary;
  reportData.councilDeputySecretary =
    councilSecretaryDeputy == "" ? "?" : "@" + councilSecretaryDeputy;

  reportData.proposalsCreated = proposals.length;
  reportData.textProposals = proposals.filter(
    (proposal) => proposal.type == ProposalType.Text
  ).length;
  reportData.spendingProposals = proposals.filter(
    (proposal) => proposal.type == ProposalType.Spending
  ).length;
  reportData.setWorkingGroupLeaderRewardProposals = proposals.filter(
    (proposal) => proposal.type == ProposalType.SetWorkingGroupLeaderReward
  ).length;
  reportData.setWorkingGroupMintCapacityProposals = proposals.filter(
    (proposal) => proposal.type == ProposalType.SetWorkingGroupMintCapacity
  ).length;
  reportData.beginReviewWorkingGroupLeaderApplicationProposals =
    proposals.filter(
      (proposal) =>
        proposal.type == ProposalType.BeginReviewWorkingGroupLeaderApplication
    ).length;
  reportData.terminateWorkingGroupLeaderRoleProposals = proposals.filter(
    (proposal) => proposal.type == ProposalType.TerminateWorkingGroupLeaderRole
  ).length;
  reportData.fillWorkingGroupLeaderOpeningProposals = proposals.filter(
    (proposal) => proposal.type == ProposalType.FillWorkingGroupLeaderOpening
  ).length;
  reportData.setValidatorCountProposals = proposals.filter(
    (proposal) => proposal.type == ProposalType.SetValidatorCount
  ).length;
  reportData.addWorkingGroupLeaderOpeningProposals = proposals.filter(
    (proposal) => proposal.type == ProposalType.AddWorkingGroupLeaderOpening
  ).length;
  reportData.setElectionParametersProposals = proposals.filter(
    (proposal) => proposal.type == ProposalType.SetElectionParameters
  ).length;
  reportData.runtimeUpgradeProposals = proposals.filter(
    (proposal) => proposal.type == ProposalType.RuntimeUpgrade
  ).length;

  reportData.approvedExecutedProposals = proposals.filter(
    (proposal) => proposal.status == ProposalStatus.Executed
  ).length;
  reportData.canceledProposals = proposals.filter(
    (proposal) => proposal.status == ProposalStatus.Cancelled
  ).length;
  reportData.rejectedProposals = proposals.filter(
    (proposal) => proposal.status == ProposalStatus.Rejected
  ).length;
  reportData.slashedProposals = proposals.filter(
    (proposal) => proposal.status == ProposalStatus.Slashed
  ).length;
  reportData.expiredProposals = proposals.filter(
    (proposal) => proposal.status == ProposalStatus.Expired
  ).length;
  reportData.activeProposals = proposals.filter(
    (proposal) => proposal.status == ProposalStatus.Active
  ).length;

  let executedNonCancelledProposals = proposals.filter(
    ({ status, blocksToFinalized }) =>
      blocksToFinalized > 0 && status != ProposalStatus.Cancelled
  );
  let totalFinalizeTime = executedNonCancelledProposals.reduce(
    (accumulator, proposal) => accumulator + proposal.blocksToFinalized,
    0
  );
  let averageFinalizeTime =
    totalFinalizeTime / executedNonCancelledProposals.length;

  let failedProposals = proposals.filter(
    (proposal) => proposal.status == ProposalStatus.ExecutionFailed
  );

  reportData.proposalsFailedForNotEnoughCapacity = failedProposals.filter(
    ({ failedReason }) => failedReason == ProposalFailedReason.NotEnoughCapacity
  ).length;
  reportData.proposalsFailedForExecutionFailed = failedProposals.filter(
    ({ failedReason }) => failedReason == ProposalFailedReason.ExecutionFailed
  ).length;

  reportData.totalProposalsFinalizeTime = convertBlocksToHours(
    totalFinalizeTime,
    averageBlockProductionTime
  );
  reportData.averageTimeForProposalsToFinalize = convertBlocksToHours(
    averageFinalizeTime,
    averageBlockProductionTime
  );
  reportData.proposalBreakdown = proposalsBreakdownText;
  return reportData;
}

async function getCouncilMembersInfo(
  api: ApiPromise,
  range: BlockRange,
  proposals: Array<ProposalInfo>
) {
  const seats = (await api.query.council.activeCouncil.at(
    range.startBlockHash
  )) as Seats;

  let councilRoundInfo = new CouncilRoundInfo();
  councilRoundInfo.members = await Promise.all(
    seats.map(async (seat) => {
      let info = new CouncilMemberInfo();
      let memberKey = seat.member.toString();
      info.memberId = Number(
        (
          (await api.query.members.memberIdsByControllerAccountId(
            memberKey
          )) as Vec<MemberId>
        )[0].toBigInt()
      );
      const membership = (await api.query.members.membershipById(
        info.memberId
      )) as Membership;
      info.username = membership.handle.toString();
      info.ownStake = Number(seat.stake.toBigInt());
      const backersStakeArray = seat.backers.map((backer) =>
        Number(backer.stake.toBigInt())
      );
      info.backersStake = backersStakeArray.reduce((a, b) => a + b, 0);
      return info;
    })
  );

  councilRoundInfo.membersOwnStake = councilRoundInfo.members
    .map((councilMemberInfo) => councilMemberInfo.ownStake)
    .reduce((a, b) => a + b, 0);
  councilRoundInfo.backersTotalStake = councilRoundInfo.members
    .map((councilMemberInfo) => councilMemberInfo.backersStake)
    .reduce((a, b) => a + b, 0);

  for (let councilMemberInfo of councilRoundInfo.members) {
    councilMemberInfo.votesInProposals = proposals.filter((proposal) =>
      proposal.votersUsernames.includes(councilMemberInfo.username)
    ).length;
  }

  let councilMint = (await api.query.council.councilMint()) as MintId;
  let startCouncilMint = (await api.query.minting.mints.at(
    range.startBlockHash,
    councilMint
  )) as Mint;
  let endCouncilMint = (await api.query.minting.mints.at(
    range.endBlockHash,
    councilMint
  )) as Mint;

  councilRoundInfo.startMinted = Number(
    startCouncilMint.total_minted.toBigInt()
  );
  councilRoundInfo.endMinted = Number(endCouncilMint.total_minted.toBigInt());

  return councilRoundInfo;
}

async function getProposal(
  api: ApiPromise,
  range: BlockRange,
  id: number
): Promise<ProposalInfo | undefined> {
  const proposal = (await api.query.proposalsEngine.proposals.at(
    range.endBlockHash,
    id
  )) as ProposalOf;
  if (proposal.createdAt?.toBigInt() < range.startBlockHeight) {
    return null;
  }

  let proposalInfo = new ProposalInfo();
  proposalInfo.id = id;
  proposalInfo.name = proposal.title?.toString();
  try {
    const proposer = (await api.query.members.membershipById(
      proposal.proposerId
    )) as Membership;
    proposalInfo.creatorUsername = proposer.handle.toString();
  } catch (e) {
    proposalInfo.creatorUsername = ``;
    console.error(`Failed to fetch proposer: ${e.message}`);
  }

  if (proposal.status.isFinalized) {
    const finalizedData = proposal.status.asFinalized;

    if (finalizedData.proposalStatus.isCanceled) {
      proposalInfo.status = ProposalStatus.Cancelled;
    } else if (finalizedData.proposalStatus.isExpired) {
      proposalInfo.status = ProposalStatus.Expired;
    } else if (finalizedData.proposalStatus.isRejected) {
      proposalInfo.status = ProposalStatus.Rejected;
    } else if (finalizedData.proposalStatus.isApproved) {
      let approvedData = finalizedData.proposalStatus.asApproved;
      if (approvedData.isExecuted) {
        proposalInfo.status = ProposalStatus.Executed;
      } else if (approvedData.isPendingExecution) {
        proposalInfo.status = ProposalStatus.PendingExecution;
      } else if (approvedData.isExecutionFailed) {
        proposalInfo.status = ProposalStatus.ExecutionFailed;
        let executionFailedData = approvedData.asExecutionFailed;
        if (executionFailedData.error.toString() == "NotEnoughCapacity") {
          proposalInfo.failedReason = ProposalFailedReason.NotEnoughCapacity;
        } else {
          proposalInfo.failedReason = ProposalFailedReason.ExecutionFailed;
        }
      }
    } else if (finalizedData.proposalStatus.isSlashed) {
      proposalInfo.status = ProposalStatus.Slashed;
    }

    proposalInfo.blocksToFinalized =
      Number(proposal.status.asFinalized.finalizedAt.toBigInt()) -
      Number(proposal.createdAt.toBigInt());

    const proposalByVoters =
      await api.query.proposalsEngine.voteExistsByProposalByVoter.entries(id);

    for (let proposalByVoter of proposalByVoters) {
      let key = proposalByVoter[0] as StorageKey;
      let memberId = key.args[1] as MemberId;
      let member = (await api.query.members.membershipById(
        memberId
      )) as Membership;
      proposalInfo.votersUsernames.push(member.handle.toString());
    }
  }

  let proposalDetails =
    (await api.query.proposalsCodex.proposalDetailsByProposalId(
      id
    )) as ProposalDetailsOf;
  let typeString = proposalDetails.type as keyof typeof ProposalType;
  proposalInfo.type = ProposalType[typeString];

  if (proposalInfo.type == ProposalType.Spending) {
    let spendingData = proposalDetails.asSpending;
    let accountId = spendingData[1];
    proposalInfo.paymentAmount = Number(spendingData[0].toBigInt());
    let paymentDestinationMemberId =
      await api.query.members.memberIdsByControllerAccountId(accountId);
    if (!paymentDestinationMemberId.isEmpty) {
      let paymentDestinationMembership =
        (await api.query.members.membershipById(
          paymentDestinationMemberId
        )) as Membership;
      proposalInfo.paymentDestinationMemberUsername =
        paymentDestinationMembership.handle.toString();
    }
  }
  return proposalInfo;
}

async function getProposals(api: ApiPromise, range: BlockRange) {
  let startProposalCount = Number(
    (
      (await api.query.proposalsEngine.proposalCount.at(
        range.startBlockHash
      )) as U32
    ).toBigInt()
  );
  let endProposalCount = Number(
    (
      (await api.query.proposalsEngine.proposalCount.at(
        range.endBlockHash
      )) as U32
    ).toBigInt()
  );

  let proposals = new Array<ProposalInfo>();
  for (let i = startProposalCount - 1; i <= endProposalCount; i++) {
    try {
      const proposal = await getProposal(api, range, i);
      if (proposal) proposals.push(proposal);
    } catch (e) {
      console.error(`Failed to fetch proposal ${i}: ${e.message}`);
    }
  }

  return proposals;
}

function getCouncilSecretary(proposals: ProposalInfo[]) {
  let filteredProposals = proposals.filter((proposal) => {
    return (
      proposal.status == ProposalStatus.Executed &&
      proposal.name.toLowerCase().includes("council") &&
      proposal.name.toLowerCase().includes("secretary") &&
      !proposal.name.toLowerCase().includes("deputy")
    );
  });

  if (filteredProposals.length != 1) {
    return "";
  }

  return filteredProposals[0].creatorUsername;
}

function getCouncilSecretaryDeputy(proposals: ProposalInfo[]) {
  let filteredProposals = proposals.filter((proposal) => {
    return (
      proposal.status == ProposalStatus.Executed &&
      proposal.name.toLowerCase().includes("secretary") &&
      proposal.name.toLowerCase().includes("deputy")
    );
  });

  if (filteredProposals.length != 1) {
    return "";
  }

  return filteredProposals[0].creatorUsername;
}

function convertToPercentage(previousValue: number, newValue: number): number {
  if (previousValue == 0) {
    return newValue > 0 ? Infinity : 0;
  }
  return Number(((newValue * 100) / previousValue - 100).toFixed(2));
}

function convertBlocksToHours(
  nrBlocks: number,
  averageProductionBlockTime: number
): string {
  return ((nrBlocks * averageProductionBlockTime) / 60 / 60).toFixed(2);
}

async function computeAverageBlockProductionTime(
  api: ApiPromise,
  range: BlockRange
) {
  let startTimestamp = (await api.query.timestamp.now.at(
    range.startBlockHash
  )) as Moment;
  let endTimestamp = (await api.query.timestamp.now.at(
    range.endBlockHash
  )) as Moment;
  let newBlocks = range.endBlockHeight - range.startBlockHeight;
  return (
    (Number(endTimestamp.toBigInt()) - Number(startTimestamp.toBigInt())) /
    1000 /
    newBlocks
  );
}

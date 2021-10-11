import {
  connectApi,
  getBlockHash,
  getEvents,
  getIssuance,
  getBlock,
} from "./joystream-lib/api";
import {
  AccountId,
  EventRecord,
  BlockHash,
  SignedBlock,
  Balance,
} from "@polkadot/types/interfaces";
import path from "path";
import {
  MintingBlockData,
  MintingAndBurningData,
  StakingReward,
  WorkingGroupMint,
  BurningBlockData,
  MintingAndBurningReport,
  SpendingProposalMint,
  RecurringRewards,
} from "./types";
import { Vec } from "@polkadot/types";
import { ProposalDetails, ProposalOf } from "@joystream/types/augment/types";
import { RewardRelationship } from "@joystream/types/recurring-rewards";
import { ApiPromise } from "@polkadot/api";
import fs, { PathLike } from "fs";

const saveFile = (
  jsonString: string,
  path: PathLike
) => {
    try {
      fs.rmSync(path);
    } catch (err) {
      console.log("Error deleting file", err);
    }
  try {
    fs.writeFile(path, jsonString, (err) => {
      if (err) {
        console.log("Error writing file", err);
      } else {
        console.log("Successfully wrote file");
      }
    });
  } catch (err) {}
};

const appentToFile = (line: string, path: PathLike) => fs.appendFileSync(path, line)

const saveMinting = (minting: MintingAndBurningReport) =>
  saveFile(JSON.stringify(minting, undefined, 4), mintingJsonPath);

const saveToLog = (line: string) => {
  console.log(line);
  appentToFile(`${line}\n`, mintingLogPath);
};

const filterBlockExtrinsicsByMethod = (block: SignedBlock, name: string) =>
  block.block.extrinsics.filter(
    ({ method: { method, section } }) => `${section}.${method}` === name
  );

const filterByEvent = (eventName: string, events: Vec<EventRecord>) => {
  return events.filter((event) => {
    const { section, method } = event.event;
    return `${section}.${method}` === eventName;
  });
};

const filterByBurnAddressReceiver = (events: EventRecord[]) => {
  return events.filter((event) => {
    const { data } = event.event;
    const receiver = data[1] as AccountId;
    return receiver.toString() === BURN_ADDRESS;
  });
};

const filterBySection = (sectionName: string, events: Vec<EventRecord>) => {
  return events.filter((event) => {
    const { section } = event.event;
    return section === sectionName;
  });
};

const filterByMethod = (filterMethod: string, events: Vec<EventRecord>) => {
  return events.filter((event) => {
    const { method } = event.event;
    return method === filterMethod;
  });
};

const processSudoEvents = (
  mintEvents: EventRecord[],
  report: MintingAndBurningData
) => {
  const { minting } = report;
  if (mintEvents.length > 0) {
    mintEvents.forEach((event: EventRecord) => {
      const { data } = event.event;
      const amount = Number(data[1]);
      minting.sudoEvents.push({ amount });
      minting.totalSudoMint += amount;
    });
  }
};

const getSpendingProposalAmount = async (
  api: ApiPromise,
  hash: BlockHash,
  proposalId: number
): Promise<number | undefined> => {
  const proposalInfo = (await api.query.proposalsEngine.proposals.at(
    hash,
    proposalId
  )) as ProposalOf;
  const finalizedData = proposalInfo.status.asFinalized;
  const proposalDetail =
    (await api.query.proposalsCodex.proposalDetailsByProposalId.at(
      hash,
      proposalId
    )) as ProposalDetails;
  if (
    finalizedData.proposalStatus.isApproved &&
    finalizedData.proposalStatus.asApproved.isExecuted &&
    proposalDetail.isSpending
  ) {
    const spendingParams = proposalDetail.asSpending;
    // console.log(`Spending proposal: ${Number(spendingParams[0])}`);
    return Number(spendingParams[0]);
  }
  return undefined;
};

const processBurnTransfers = (
  burnEvents: EventRecord[],
  report: MintingAndBurningData
) => {
  const { burning } = report;
  if (burnEvents.length > 0) {
    let tokensBurned = 0;
    const burnTransfers = filterByBurnAddressReceiver(burnEvents);
    if (burnTransfers.length > 0) {
      for (const event of burnTransfers) {
        const { data } = event.event;
        const amount = data[2] as Balance;
        tokensBurned += Number(amount);
        burning.tokensBurned += tokensBurned;
      }
    }
  }
};

const processMembershipCreation = (
  membershipEvents: EventRecord[],
  report: MintingAndBurningData
) => {
  const { burning } = report;
  if (membershipEvents.length > 0) {
    const membershipCreationPrice = 100;
    membershipEvents.forEach((event) => {
      burning.totalMembershipCreation += membershipCreationPrice;
      const { data } = event.event;
      const dataJson = data.toJSON() as object[];
      const memberId = dataJson[0] as unknown as number;
      const accountId = dataJson[0] as unknown as string;
      burning.membershipCreation.push({ memberId, accountId });
    });
  }
};

const reloadRecurringRewards = async (
  api: ApiPromise,
  recurringRewards: RecurringRewards,
  hash: BlockHash
) => {
  const totalRewards = Number(
    await api.query.recurringRewards.rewardRelationshipsCreated.at(hash)
  );
  recurringRewards.rewards = {};
  for (let id = 0; id < totalRewards; ++id) {
    const reward = (
      await api.query.recurringRewards.rewardRelationships.at(hash, id)
    ).toJSON() as unknown as RewardRelationship;
    if (reward.next_payment_at_block && reward.amount_per_payout) {
      const paymentBlock = reward.next_payment_at_block as unknown as number;
      if (recurringRewards.rewards[paymentBlock] === undefined) {
        recurringRewards.rewards[paymentBlock] = [];
      }
      recurringRewards.rewards[paymentBlock].push(
        Number(reward.amount_per_payout)
      );
    }
  }
};

/**
 * Mint refill is not minting actually, recurring rewards themselves increase totalIssuance
 * @param mintEvents
 * @param report
 */
const processWorkingGroupMint = (
  mintEvents: EventRecord[],
  report: MintingAndBurningData
) => {
  const { minting } = report;
  if (mintEvents.length > 0) {
    mintEvents.forEach((event) => {
      const { section, method, data } = event.event;
      const dataJson = data.toJSON() as object[];
      const mintId = dataJson[0] as unknown as number;
      const mintAmount = dataJson[1] as unknown as number;
      minting.totalWorkingGroupsMint += mintAmount;
      minting.workingGroupsMints.push({
        event: `${section}.${method}`,
        mintId,
        amount: mintAmount,
      });
    });
  }
};

/**
 * Event `staking.Reward` means validator/nominator got rewarderd.
 */
const processStakingRewards = (
  stakingEvents: EventRecord[],
  report: MintingAndBurningData
) => {
  const { minting } = report;
  if (stakingEvents.length > 0) {
    stakingEvents.forEach((event) => {
      const { data } = event.event;
      const dataJson = data.toJSON() as object[];
      const reward = dataJson[1] as unknown as number;
      const accountId = dataJson[0] as AccountId;
      minting.stakingRewardsTotal += reward;
      minting.stakingRewards.push({
        address: accountId,
        reward,
      });
    });
  }
};

/**
 * Process event `proposalsEngine.ProposalStatusUpdated`
 * If proposal is cancelled, update the burning with cancellation fee.
 * If proposal is spendind and executed, update the minting with the spending amount.
 */
const processProposals = async (
  api: ApiPromise,
  events: EventRecord[],
  report: MintingAndBurningData,
  hash: BlockHash
) => {
  const { minting, burning } = report;
  if (events.length > 0) {
    for (const event of events) {
      const { data } = event.event;
      const dataJson = data.toJSON() as object[];
      const proposalId = dataJson[0] as unknown as number;
      const block = await getBlock(api, hash);
      const cancelledProposals = filterBlockExtrinsicsByMethod(
        block,
        "proposalsEngine.cancelProposal"
      );
      for (const item of cancelledProposals) {
        burning.totalProposalCancellationFee += 10000;
        burning.cancelledProposals.push(proposalId);
      }
      const spendingProposalAmount = await getSpendingProposalAmount(
        api,
        hash,
        proposalId
      );
      if (spendingProposalAmount) {
        minting.spendingProposals.push({
          proposalId,
          amount: spendingProposalAmount,
        });
      }
    }
  }
};
const mintingJsonPath = path.resolve(
  __dirname,
  "..",
  "report",
  "mintingAndBurning.json"
);
const mintingLogPath = path.resolve(
  __dirname,
  "..",
  "report",
  "mintingAndBurning.log"
);
const BURN_ADDRESS = "5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMaeKQu";
const args = process.argv.slice(2);
const startBlock = Number(args[0]) || 720370;
const endBlock = Number(args[1]) || 2091600;

export async function readMintingAndBurning() {
  // const api = await connectApi("wss://rome-rpc-endpoint.joystream.org:9944");
  const api = await connectApi("ws://localhost:9944");
  await api.isReady;
  const recurringRewards = {
    rewards: {},
  } as RecurringRewards;
  const mintingAndBurningReport = {
    blocks: [],
  } as unknown as MintingAndBurningReport;
  console.log(`Process events in a range [${startBlock} - ${endBlock}]`);
  // const head = await api.derive.chain.bestNumberFinalized();
  let prevIssuance: number = 0;
  // for (let blockNumber = startBlock; blockNumber < Number(head); blockNumber += 1) {
  // for (let blockNumber = Number(head); blockNumber > startBlock; blockNumber -= 1) {
  for (let blockNumber = startBlock; blockNumber < endBlock; blockNumber += 1) {
    if (blockNumber % 10 === 0) {
      console.log(`Block [${blockNumber}]`);
    }
    const hash = await getBlockHash(api, blockNumber);
    const issuance = await getIssuance(api, hash);
    const events = await getEvents(api, hash);
    const report = {
      block: Number(blockNumber),
      issuance: Number(issuance),
      minting: {
        sudoEvents: [],
        totalSudoMint: 0,
        totalWorkingGroupsMint: 0,
        workingGroupsMints: [] as WorkingGroupMint[],
        stakingRewardsTotal: 0,
        stakingRewards: [] as StakingReward[],
        spendingProposals: [] as SpendingProposalMint[],
        totalSpendingProposalsMint: 0,
      } as MintingBlockData,
      burning: {
        tokensBurned: 0,
        totalMembershipCreation: 0,
        totalProposalCancellationFee: 0,
        cancelledProposals: [],
        membershipCreation: [],
      } as BurningBlockData,
    } as MintingAndBurningData;

    const proposalEvents = filterByEvent(
      "proposalsEngine.ProposalStatusUpdated",
      events
    );
    await processProposals(api, proposalEvents, report, hash);
    processStakingRewards(filterByEvent("staking.Reward", events), report);
    processBurnTransfers(filterByEvent("balances.Transfer", events), report);
    processMembershipCreation(
      filterByEvent("members.MemberRegistered", events),
      report
    );
    const setBalanceEvents = filterBySection("balances.BalanceSet", events);
    processSudoEvents(setBalanceEvents, report);
    const recurringMinting = recurringRewards.rewards[blockNumber]
      ? recurringRewards.rewards[blockNumber].reduce((a, b) => a + b, 0)
      : 0;
    const totalMinted =
      report.minting.totalSudoMint +
      report.minting.totalSpendingProposalsMint +
      report.minting.stakingRewardsTotal +
      recurringMinting;
    const totalBurned =
      report.burning.tokensBurned +
      report.burning.totalProposalCancellationFee +
      report.burning.totalMembershipCreation;
    const calculatedDelta = totalMinted - totalBurned;
    if (
      report.burning.tokensBurned > 0 ||
      report.burning.totalProposalCancellationFee > 0 ||
      report.burning.totalMembershipCreation > 0 ||
      report.minting.totalSudoMint > 0 ||
      report.minting.totalWorkingGroupsMint > 0 ||
      report.minting.totalSpendingProposalsMint > 0 ||
      report.minting.stakingRewardsTotal > 0
    ) {
      mintingAndBurningReport.blocks.push(report);
    }
    const totalIssuance = report.issuance;
    const actualIssuanceDelta = totalIssuance - prevIssuance;
    if (prevIssuance !== totalIssuance) {
      const shouldWarn =
        totalIssuance !== actualIssuanceDelta &&
        prevIssuance !== actualIssuanceDelta &&
        calculatedDelta !== actualIssuanceDelta;
      const issuanceInfo = `Issuance: [${issuance}]. Previous issuance: [${prevIssuance}]. Delta: [${actualIssuanceDelta}]. Calculated Delta: [${calculatedDelta}].`;
      const mintBurnInfo = `Total Minted: [${totalMinted}]. Total Burned: [${totalBurned}]`;
      const blockInfo = `[${
        shouldWarn ? "WARN" : "INFO"
      }] Block: [${blockNumber}].`;
      saveToLog(`${blockInfo} ${issuanceInfo} ${mintBurnInfo}`);
      prevIssuance = totalIssuance;
    }
    await reloadRecurringRewards(api, recurringRewards, hash);
  }

  saveMinting(mintingAndBurningReport);
}

readMintingAndBurning().then((r) => console.log("Processing done."));

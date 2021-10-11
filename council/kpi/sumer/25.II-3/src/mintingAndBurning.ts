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
  BalanceTranfer,
} from "./types";
import { Vec } from "@polkadot/types";
import { ProposalDetails, ProposalOf } from "@joystream/types/augment/types";
import { RewardRelationship } from "@joystream/types/recurring-rewards";
import { ApiPromise } from "@polkadot/api";
import fs, { PathLike } from "fs";

const saveFile = (jsonString: string, path: PathLike) => {
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

const appentToFile = (line: string, path: PathLike) =>
  fs.appendFileSync(path, line);

const saveMinting = (report: MintingAndBurningReport) =>
  saveFile(JSON.stringify(report, undefined, 4), mintingJsonPath);

const addToMinting = (data: MintingAndBurningData) =>
  appentToFile(`${JSON.stringify(data, undefined, 4)},\n`, mintingJsonPath);

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

const filterBySection = (sectionName: string, events: Vec<EventRecord>) => {
  return events.filter((event) => {
    const { section } = event.event;
    return section === sectionName;
  });
};

/**
 * Every balances.BalanceSet event is minting new tokens.
 */
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

/**
 * When spending proposal is executed, the amount is minted from a council mint.
 */
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
    return Number(spendingParams[0]);
  }
  return undefined;
};

/**
 * When transfer occurs to a specific BURN_ADDRESS, transfer amount is burned.
 */
const processBurnTransfers = async (
  api: ApiPromise,
  blockNumber: number,
  burnEvents: EventRecord[],
  report: MintingAndBurningData
) => {
  const { burning } = report;
  if (burnEvents.length > 0) {
    const hash = await getBlockHash(api, blockNumber);
    const block = await getBlock(api, hash);
    const burnTransfers = filterBlockExtrinsicsByMethod(
      block,
      "balances.transfer"
    );
    for (const item of burnTransfers) {
      const tranfer = item.toHuman() as unknown as BalanceTranfer;
      if (tranfer.method.args[0] === BURN_ADDRESS) {
        const tip = tranfer.tip;
        let tokensBurned = 0;
        if (tip.indexOf("MJOY") > 0) {
          tokensBurned += Number(tip.replace("MJOY", "")) * 1000000;
        } else if (tip.indexOf("kJOY") > 0) {
          tokensBurned += Number(tip.replace("kJOY", "")) * 1000;
        } else {
          tokensBurned += Number(tip.replace("JOY", ""));
        }
        burning.tokensBurned += tokensBurned;
      }
    }
  }
};

/**
 * Every membership creation burns tokens, checking `members.MemberRegistered` events to detect such burnings.
 */
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

/**
 * Working Groups recurring reward payments do not emit event, so this is used to detect if there was a specific reward payment.
 */
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
const endpoint = "ws://localhost:9944"; // "wss://rome-rpc-endpoint.joystream.org:9944"
const BURN_ADDRESS = "5D5PhZQNJzcJXVBxwJxZcsutjKPqUPydrvpu6HeiBfMaeKQu";
const args = process.argv.slice(2);
const startBlock = Number(args[0]) || 720370;
const endBlock = Number(args[1]) || 2091600;

export async function readMintingAndBurning() {
  const api = await connectApi(endpoint);
  await api.isReady;
  const recurringRewards = {
    rewards: {},
  } as RecurringRewards;
  const mintingAndBurningReport = {
    blocks: [],
  } as unknown as MintingAndBurningReport;
  console.log(`Process events in a range [${startBlock} - ${endBlock}]`);
  let prevIssuance: number = 0;
  for (let blockNumber = startBlock; blockNumber < endBlock; blockNumber += 1) {
    if (blockNumber % 10 === 0) {
      console.log(
        `Block [${blockNumber}] Timestamp: [${new Date().toISOString()}]`
      );
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
        totalRecurringRewardsMint: 0
      } as MintingBlockData,
      burning: {
        tokensBurned: 0,
        totalMembershipCreation: 0,
        totalProposalCancellationFee: 0,
        cancelledProposals: [],
        membershipCreation: [],
      } as BurningBlockData,
    } as MintingAndBurningData;

    const totalIssuance = report.issuance;
    const actualIssuanceDelta = totalIssuance - prevIssuance;
    if (prevIssuance !== 0 && totalIssuance !== prevIssuance) {
      const proposalEvents = filterByEvent(
        "proposalsEngine.ProposalStatusUpdated",
        events
      );
      await processProposals(api, proposalEvents, report, hash);
      processStakingRewards(filterByEvent("staking.Reward", events), report);
      processMembershipCreation(
        filterByEvent("members.MemberRegistered", events),
        report
      );
      const setBalanceEvents = filterBySection("balances.BalanceSet", events);
      processSudoEvents(setBalanceEvents, report);
      await processBurnTransfers(api, blockNumber, events, report);
      report.minting.totalRecurringRewardsMint = recurringRewards.rewards[blockNumber]
        ? recurringRewards.rewards[blockNumber].reduce((a, b) => a + b, 0)
        : 0;
      const totalMinted =
        report.minting.totalSudoMint +
        report.minting.totalSpendingProposalsMint +
        report.minting.stakingRewardsTotal +
        report.minting.totalRecurringRewardsMint;
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
      addToMinting(report);
    }
    await reloadRecurringRewards(api, recurringRewards, hash);
    prevIssuance = totalIssuance;
  }

  saveMinting(mintingAndBurningReport);
}

readMintingAndBurning().then((r) => console.log("Processing done."));

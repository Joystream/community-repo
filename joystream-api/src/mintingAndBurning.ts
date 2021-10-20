import {
  connectApi,
  getBlockHash,
  getEvents,
  getIssuance,
  getBlock,
  getMint,
  getPaidMembershipTermsById,
  getWorker,
} from "./joystream-lib/api";
import {
  AccountId,
  EventRecord,
  BlockHash,
  SignedBlock,
} from "@polkadot/types/interfaces";
import { u128 } from "@polkadot/types/primitive";
import { Extrinsic } from "@polkadot/types/interfaces";
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
  ExtrinsicsData,
} from "./types";
import { Vec } from "@polkadot/types";
import { ProposalDetails, ProposalOf } from "@joystream/types/augment/types";
import { RewardRelationship } from "@joystream/types/recurring-rewards";
import { ApiPromise } from "@polkadot/api";
import fs, { PathLike } from "fs";
import { Mint } from "@joystream/types/mint";
import { FinalizationData, ProposalStatus } from "@joystream/types/proposals";
import { min } from "lodash";

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

const filterBlockExtrinsicsByMethods = (block: SignedBlock, names: string[]) =>
  block.block.extrinsics.filter(
    ({ method: { method, section } }) =>
      names.indexOf(`${section}.${method}`) >= 0
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
  events: Vec<EventRecord>,
  report: MintingAndBurningData
) => {
  const setBalanceEvents = filterByEvent("balances.BalanceSet", events);
  const { minting } = report;
  if (setBalanceEvents.length > 0) {
    setBalanceEvents.forEach((event: EventRecord) => {
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
 * When transfer occurs to a specific BURN_ADDRESS then in another transfer it converts to a tip and gets burned.
 */
const processBurnTransfers = async (
  api: ApiPromise,
  blockNumber: number,
  report: MintingAndBurningData
) => {
  const { burning } = report;
  const hash = await getBlockHash(api, blockNumber);
  const block = await getBlock(api, hash);
  const extrinsics = filterBlockExtrinsicsByMethods(block, [
    "balances.transfer",
  ]);
  for (const ext of extrinsics) {
    const extData = ext as unknown as Extrinsic;
    const args = extData.method.args;
    const tip = extData.tip.toNumber();
    if (tip > 0 && args[0].toString() === BURN_ADDRESS) {
      burning.tokensBurned += tip;
    }
  }
};

/**
 * When operationsWorkingGroup.updateRewardAmount happens at the block when worker is expected to be rewarded,
 * the reward is changed immidiately, so we need to update recurring rewards which we have generated on the previous block.
 */
const processWorkerRewardAmountUpdated = async (
  api: ApiPromise,
  blockNumber: number,
  recurringRewards: RecurringRewards
) => {
  const hash = await getBlockHash(api, blockNumber);
  const block = await getBlock(api, hash);
  const groups = [
    "operationsWorkingGroup",
    "contentDirectoryWorkingGroup",
    "storageWorkingGroup",
  ];
  for await (const group of groups) {
    const extrinsics = filterBlockExtrinsicsByMethods(block, [
      `${group}.updateRewardAmount`,
    ]);
    for (const ext of extrinsics) {
      const extData = ext as unknown as Extrinsic;
      const args = extData.method.args;
      const workerId = Number(args[0]);
      const newAmount = Number(args[1]);
      const worker = await getWorker(api, group, hash, workerId);
      const relationship = Number(worker.reward_relationship.unwrap());
      const previousBlockWorkerReward = recurringRewards.rewards[
        blockNumber
      ].filter((r) => Number(r.recipient) === relationship);
      if (previousBlockWorkerReward.length == 0) {
        const reward = (
          await api.query.recurringRewards.rewardRelationships.at(
            hash,
            relationship
          )
        ).toJSON() as unknown as RewardRelationship;
        recurringRewards.rewards[blockNumber].push(reward);
      } else {
        previousBlockWorkerReward.forEach(async (reward) => {
          const mint = (
            await getMint(api, hash, reward.mint_id)
          ).toJSON() as unknown as Mint;
          reward.amount_per_payout = newAmount as unknown as u128;
        });
      }
    }
  }
};

/**
 * Every membership creation burns tokens, checking `members.MemberRegistered` events to detect such burnings.
 */
const processMembershipCreation = async (
  api: ApiPromise,
  hash: BlockHash,
  events: Vec<EventRecord>,
  report: MintingAndBurningData
) => {
  const membershipEvents = filterByEvent("members.MemberRegistered", events);
  const { burning } = report;
  if (membershipEvents.length > 0) {
    const block = await getBlock(api, hash);
    // intentionally skipping `members.addScreenedMember` because there is no paid fee in this case
    const extrinsics = filterBlockExtrinsicsByMethods(block, [
      "members.buyMembership",
    ]);
    for await (const ext of extrinsics) {
      const data = ext.toHuman() as unknown as ExtrinsicsData;
      const paidTermId = Number(data.method.args[0]);
      const terms = await getPaidMembershipTermsById(api, hash, paidTermId);
      const membershipCreationFee = Number(terms.fee);
      burning.totalMembershipCreation += membershipCreationFee;
    }
    membershipEvents.forEach((event) => {
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
  blockNumber: number,
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
      if (paymentBlock == blockNumber + 1) {
        if (recurringRewards.rewards[paymentBlock] === undefined) {
          recurringRewards.rewards[paymentBlock] = [];
        }
        const mint = (
          await getMint(api, hash, reward.mint_id)
        ).toJSON() as unknown as Mint;

        const nextBlockPaymentFromCurrentMint = recurringRewards.rewards[
          paymentBlock
        ]
          .filter((r) => r.mint_id == reward.mint_id)
          .reduce((sum, current) => sum + Number(current.amount_per_payout), 0);
        if (
          nextBlockPaymentFromCurrentMint + Number(reward.amount_per_payout) <=
          Number(mint.capacity)
        ) {
          recurringRewards.rewards[paymentBlock].push(reward);
        }
      }
    }
  }
};

/**
 * Event `staking.Reward` means validator/nominator got rewarderd.
 */
const processStakingRewards = (
  events: Vec<EventRecord>,
  report: MintingAndBurningData
) => {
  const stakingEvents = filterByEvent("staking.Reward", events);
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
 * When some tip is added, it gets burned.
 */
const processTips = async (
  api: ApiPromise,
  events: EventRecord[],
  report: MintingAndBurningData,
  hash: BlockHash
) => {
  const { burning } = report;
  if (events.length > 0) {
    const block = await getBlock(api, hash);
    const burnExtrinsics = filterBlockExtrinsicsByMethods(block, [
      "utility.batch",
      "staking.bond",
      "session.setKeys",
      "staking.nominate",
      "members.buyMembership",
    ]);
    for (const item of burnExtrinsics) {
      const ext = item as unknown as Extrinsic;
      const tip = ext.tip.toNumber();
      burning.tokensBurned += tip;
    }
  }
};

const getTotalMinted = (report: MintingAndBurningData) => {
  return (
    report.minting.totalSudoMint +
    report.minting.totalSpendingProposalsMint +
    report.minting.stakingRewardsTotal +
    report.minting.totalRecurringRewardsMint
  );
};

const getTotalBurned = (report: MintingAndBurningData) => {
  return (
    report.burning.tokensBurned +
    report.burning.totalProposalCancellationFee +
    report.burning.totalMembershipCreation
  );
};

/**
 * Process event `proposalsEngine.ProposalStatusUpdated`
 * If proposal is cancelled, update the burning with cancellation fee.
 * If proposal is spendind and executed, update the minting with the spending amount.
 */
const processProposals = async (
  api: ApiPromise,
  events: Vec<EventRecord>,
  report: MintingAndBurningData,
  hash: BlockHash
) => {
  const proposalEvents = filterByEvent(
    "proposalsEngine.ProposalStatusUpdated",
    events
  );
  const { minting, burning } = report;
  if (proposalEvents.length > 0) {
    for (const event of proposalEvents) {
      const { data } = event.event;
      const dataJson = data.toJSON() as object[];
      const proposalId = dataJson[0] as unknown as number;
      const block = await getBlock(api, hash);
      const cancelledProposals = filterBlockExtrinsicsByMethod(
        block,
        "proposalsEngine.cancelProposal"
      );
      for (const {} of cancelledProposals) {
        burning.totalProposalCancellationFee += 10000; // TODO get proposal cancellation fee from chains
        burning.cancelledProposals.push(proposalId);
      }
      const proposalStatusWrapper = dataJson[1] as unknown as ProposalStatus;
      const finalizationData = (
        proposalStatusWrapper as unknown as {
          [key: string]: FinalizationData[];
        }
      )["finalized"] as unknown as FinalizationData;
      for await (const key of Object.keys(finalizationData.proposalStatus)) {
        if (key.toString() === "expired" || key.toString() === "rejected") {
          burning.totalProposalCancellationFee += 5000; // TODO get proposal rejected/expired fee from chains
        }
      }

      const spendingProposalAmount = await getSpendingProposalAmount(
        api,
        hash,
        proposalId
      );
      if (
        spendingProposalAmount &&
        minting.spendingProposals.filter(
          (p) =>
            p.proposalId === proposalId && p.amount === spendingProposalAmount
        ).length === 0
      ) {
        minting.spendingProposals.push({
          proposalId,
          amount: spendingProposalAmount,
        });
        minting.totalSpendingProposalsMint += spendingProposalAmount;
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
  await processBlockRange(api, startBlock, endBlock)
  // TODO uncommment and fill the array with specific blocks if you need to check some specific list of blocks
  // const specificBlocks = [1556265, 1606888];
  // for (const block of specificBlocks) {
  //   await processBlockRange(api, block - 1, block);
  // }
}

async function processBlockRange(api: ApiPromise, start: number, end: number) {
  console.log(`Process events in a range [${start} - ${end}]`);
  const recurringRewards = {
    rewards: {},
  } as RecurringRewards;
  const mintingAndBurningReport = {
    blocks: [],
  } as unknown as MintingAndBurningReport;
  let prevIssuance: number = 0;
  for (let blockNumber = start; blockNumber <= end; blockNumber += 1) {
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
        totalRecurringRewardsMint: 0,
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
      await processTips(api, events, report, hash);
      await processProposals(api, events, report, hash);
      processStakingRewards(events, report);
      processMembershipCreation(api, hash, events, report);
      processSudoEvents(events, report);
      await processWorkerRewardAmountUpdated(
        api,
        blockNumber,
        recurringRewards
      );
      await processBurnTransfers(api, blockNumber, report);
      if (recurringRewards.rewards[blockNumber]) {
        report.minting.totalRecurringRewardsMint = recurringRewards.rewards[
          blockNumber
        ].reduce((a, b) => a + Number(b.amount_per_payout), 0);
      }
      const totalMinted = getTotalMinted(report);
      const totalBurned = getTotalBurned(report);
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
      const issuanceInfo = `Issuance: [${issuance}] Previous issuance: [${prevIssuance}] Delta: [${actualIssuanceDelta}] Calculated Delta: [${calculatedDelta}]`;
      const mintBurnInfo = `Total Minted: [${totalMinted}] Total Burned: [${totalBurned}]`;
      const blockInfo = `[${
        shouldWarn ? "WARN" : "INFO"
      }] Block: [${blockNumber}].`;
      saveToLog(`${blockInfo} ${issuanceInfo} ${mintBurnInfo}`);
      addToMinting(report);
    }
    await reloadRecurringRewards(api, recurringRewards, blockNumber, hash);
    prevIssuance = totalIssuance;
  }
  // saveMinting(mintingAndBurningReport); // TODO Fix final write to make the json valid.
}

readMintingAndBurning();

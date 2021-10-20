import {
  connectApi,
  getBlockHash,
  getEvents,
  getIssuance,
  getBlock,
  getMint,
  getPaidMembershipTermsById,
} from "./joystream-lib/api";
import {
  AccountId,
  EventRecord,
  BlockHash,
  SignedBlock,
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
  ExtrinsicsData,
} from "./types";
import { Vec } from "@polkadot/types";
import { ProposalDetails, ProposalOf } from "@joystream/types/augment/types";
import { RewardRelationship } from "@joystream/types/recurring-rewards";
import { ApiPromise } from "@polkadot/api";
import fs, { PathLike } from "fs";
import { Mint } from "@joystream/types/mint";
import { FinalizationData, ProposalStatus } from "@joystream/types/proposals";

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
  events: EventRecord[],
  report: MintingAndBurningData,
  totalIssuance: number,
  prevIssuance: number
) => {
  const { burning } = report;
  const totalMinted =
    report.minting.totalSudoMint +
    report.minting.totalSpendingProposalsMint +
    report.minting.stakingRewardsTotal +
    report.minting.totalRecurringRewardsMint;
  const totalBurned =
    report.burning.tokensBurned +
    report.burning.totalProposalCancellationFee +
    report.burning.totalMembershipCreation;

  if (events.length > 0) {
    const hash = await getBlockHash(api, blockNumber);
    const block = await getBlock(api, hash);
    if (prevIssuance + totalMinted - totalBurned !== totalIssuance) {
      const parentHash = block.block.header.parentHash;
      const parentEvents = await getEvents(api, parentHash);
      const transferEvents = filterByEvent("balances.Transfer", parentEvents);
      if (transferEvents.length == 0) {
        const extrinsics = filterBlockExtrinsicsByMethods(block, [
          "balances.transfer",
        ]);
        for (const ext of extrinsics) {
          const data = ext.toHuman() as unknown as ExtrinsicsData;
          // console.log(data)
          let transferFound = false;
          // iterate down over last 5 blocks to find the block with balance.Transfer event
          for (let index = blockNumber; index >= blockNumber - 5; index--) {
            if (transferFound) {
              break;
            }
            const blockHash = await getBlockHash(api, index);
            const blockEvents = await getEvents(api, blockHash);
            const blockTransferEvents = filterByEvent(
              "balances.Transfer",
              blockEvents
            );
            for (const event of blockTransferEvents) {
              const { data } = event.event;
              if (`${data[1]}` === BURN_ADDRESS) {
                const burnTransferAmount = Number(data[2]);
                burning.tokensBurned += burnTransferAmount;
                transferFound = true;
                break;
              }
            }
          }
        }
      } else {
        transferEvents.forEach((event: EventRecord) => {
          const { data } = event.event;
          if (`${data[1]}` === BURN_ADDRESS) {
            const burnTransferAmount = Number(data[2]);
            burning.tokensBurned += burnTransferAmount;
          }
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
  membershipEvents: EventRecord[],
  report: MintingAndBurningData
) => {
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
 * When some tip is added, it gets burned.
 */
const processTips = async (
  api: ApiPromise,
  events: EventRecord[],
  report: MintingAndBurningData,
  hash: BlockHash
) => {
  const { minting, burning } = report;
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
      const tip = item.toHuman() as unknown as ExtrinsicsData;
      burning.tokensBurned += extractTipAmount(tip.tip);
    }
  }
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

const extractTipAmount = (tip: string) => {
  if (tip.indexOf("MJOY") > 0) {
    return Number(tip.replace("MJOY", "")) * 1000000;
  } else if (tip.indexOf("kJOY") > 0) {
    return Number(tip.replace("kJOY", "")) * 1000;
  }
  return Number(tip.replace("JOY", ""));
};

export async function readMintingAndBurning() {
  const api = await connectApi(endpoint);
  await api.isReady;
  await processBlockRange(api, startBlock, endBlock)
  // TODO uncommment and fill the array with specific blocks if you need to check some specific list of blocks
  // const specificBlocks = [1521860, 1565294, 1694973]; // balance.transfer
  // for (const block of specificBlocks) {
  //   await processBlockRange(api, block - 1, block);
  // }
}

async function processBlockRange(api: ApiPromise, start: number, end: number) {
  // console.log(`Process events in a range [${start} - ${end}]`);
  const recurringRewards = {
    rewards: {},
  } as RecurringRewards;
  const mintingAndBurningReport = {
    blocks: [],
  } as unknown as MintingAndBurningReport;
  let prevIssuance: number = 0;
  for (let blockNumber = start; blockNumber <= end; blockNumber += 1) {
    // if (blockNumber % 10 === 0) {
    //   console.log(`Block [${blockNumber}] Timestamp: [${new Date().toISOString()}]`);
    // }
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
      processStakingRewards(filterByEvent("staking.Reward", events), report);
      processMembershipCreation(
        api,
        hash,
        filterByEvent("members.MemberRegistered", events),
        report
      );
      processSudoEvents(filterByEvent("balances.BalanceSet", events), report);
      if (recurringRewards.rewards[blockNumber]) {
        report.minting.totalRecurringRewardsMint = recurringRewards.rewards[
          blockNumber
        ].reduce((a, b) => a + Number(b.amount_per_payout), 0);
      }
      await processBurnTransfers(
        api,
        blockNumber,
        events,
        report,
        totalIssuance,
        prevIssuance
      );
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
    await reloadRecurringRewards(api, recurringRewards, blockNumber, hash);
    prevIssuance = totalIssuance;
  }
  // saveMinting(mintingAndBurningReport); // TODO Fix final write to make the json valid.
}

readMintingAndBurning();
